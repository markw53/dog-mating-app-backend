import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Match } from "../types";
import logger from "../utils/logger";
import { sendPushNotification } from "../services/notificationService";

export const createMatch = async (req: Request, res: Response) => {
  try {
    const { dog1Id, dog2Id } = req.body;

    // Verify dog1 belongs to the requesting user
    const dog1Doc = await db.collection("dogs").doc(dog1Id).get();
    if (!dog1Doc.exists || dog1Doc.data()?.ownerId !== req.user.uid) {
      return res
        .status(403)
        .json({ error: "Not authorized to create match for this dog" });
    }

    // Verify dog2 exists
    const dog2Doc = await db.collection("dogs").doc(dog2Id).get();
    if (!dog2Doc.exists) {
      return res.status(404).json({ error: "Second dog not found" });
    }

    // Check if match already exists
    const existingMatch = await db
      .collection("matches")
      .where("dog1Id", "in", [dog1Id, dog2Id])
      .where("dog2Id", "in", [dog1Id, dog2Id])
      .get();

    if (!existingMatch.empty) {
      return res.status(400).json({ error: "Match already exists" });
    }

    const matchData: Omit<Match, "id"> = {
      dog1Id,
      dog2Id,
      status: "pending",
      createdAt: new Date()
    };

    const matchRef = await db.collection("matches").add(matchData);

    // Send notification to dog2's owner
    const dog2Owner = dog2Doc.data()?.ownerId;
    if (dog2Owner) {
      const dog1Name = dog1Doc.data()?.name;
      await sendPushNotification(
        dog2Owner,
        "New Match Request!",
        `${dog1Name} wants to match with your dog!`
      );
    }

    res.status(201).json({
      id: matchRef.id,
      ...matchData
    });
  } catch (error) {
    logger.error("Create match error:", error);
    res.status(500).json({ error: "Failed to create match" });
  }
};

export const getMatch = async (req: Request, res: Response) => {
  try {
    const matchDoc = await db.collection("matches").doc(req.params.id).get();

    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    // Verify user owns one of the dogs in the match
    const matchData = matchDoc.data() as Match;
    const [dog1Doc, dog2Doc] = await Promise.all([
      db.collection("dogs").doc(matchData.dog1Id).get(),
      db.collection("dogs").doc(matchData.dog2Id).get()
    ]);

    if (
      dog1Doc.data()?.ownerId !== req.user.uid &&
      dog2Doc.data()?.ownerId !== req.user.uid
    ) {
      return res
        .status(403)
        .json({ error: "Not authorized to view this match" });
    }

    res.json({
      id: matchDoc.id,
      ...matchData
    });
  } catch (error) {
    logger.error("Get match error:", error);
    res.status(500).json({ error: "Failed to get match" });
  }
};

export const updateMatchStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const matchRef = db.collection("matches").doc(req.params.id);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const matchData = matchDoc.data() as Match;

    // Verify user owns dog2 (receiving dog)
    const dog2Doc = await db.collection("dogs").doc(matchData.dog2Id).get();
    if (dog2Doc.data()?.ownerId !== req.user.uid) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this match" });
    }

    await matchRef.update({ status });

    // Send notification to dog1's owner
    const dog1Doc = await db.collection("dogs").doc(matchData.dog1Id).get();
    const dog1Owner = dog1Doc.data()?.ownerId;
    const dog2Name = dog2Doc.data()?.name;

    if (dog1Owner) {
      await sendPushNotification(
        dog1Owner,
        "Match Update!",
        `${dog2Name} has ${status} your match request!`
      );
    }

    res.json({
      id: matchDoc.id,
      ...matchData,
      status
    });
  } catch (error) {
    logger.error("Update match status error:", error);
    res.status(500).json({ error: "Failed to update match status" });
  }
};

export const getMatches = async (req: Request, res: Response) => {
  try {
    // Get all dogs owned by the user
    const userDogs = await db
      .collection("dogs")
      .where("ownerId", "==", req.user.uid)
      .get();

    const dogIds = userDogs.docs.map((doc) => doc.id);

    // Get matches where user's dogs are involved
    const matches = await db
      .collection("matches")
      .where("dog1Id", "in", dogIds)
      .get();

    const matches2 = await db
      .collection("matches")
      .where("dog2Id", "in", dogIds)
      .get();

    const allMatches = [
      ...matches.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })),
      ...matches2.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
    ];

    res.json(allMatches);
  } catch (error) {
    logger.error("Get matches error:", error);
    res.status(500).json({ error: "Failed to get matches" });
  }
};
