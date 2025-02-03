import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Dog } from "../types";
import logger from "../utils/logger";
import { validateInput, dogSchema } from "../utils/validators";

export const createDog = async (req: Request, res: Response) => {
  try {
    // Validate input
    validateInput(dogSchema, req.body);

    const dogData: Omit<Dog, "id"> = {
      ownerId: req.user.uid,
      name: req.body.name,
      breed: req.body.breed,
      age: req.body.age,
      gender: req.body.gender,
      photos: req.body.photos || [],
      description: req.body.description || "",
      location: req.body.location,
      createdAt: new Date()
    };

    const dogRef = await db.collection("dogs").add(dogData);

    res.status(201).json({
      id: dogRef.id,
      ...dogData
    });
  } catch (error) {
    logger.error("Create dog error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const getDog = async (req: Request, res: Response) => {
  try {
    const dogDoc = await db.collection("dogs").doc(req.params.id).get();

    if (!dogDoc.exists) {
      return res.status(404).json({ error: "Dog not found" });
    }

    res.json({
      id: dogDoc.id,
      ...dogDoc.data()
    });
  } catch (error) {
    logger.error("Get dog error:", error);
    res.status(500).json({ error: "Failed to get dog profile" });
  }
};

export const getMyDogs = async (req: Request, res: Response) => {
  try {
    const dogsSnapshot = await db
      .collection("dogs")
      .where("ownerId", "==", req.user.uid)
      .get();

    const dogs = dogsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(dogs);
  } catch (error) {
    logger.error("Get my dogs error:", error);
    res.status(500).json({ error: "Failed to get dogs" });
  }
};

export const updateDog = async (req: Request, res: Response) => {
  try {
    const dogRef = db.collection("dogs").doc(req.params.id);
    const dogDoc = await dogRef.get();

    if (!dogDoc.exists) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogDoc.data()?.ownerId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    // Validate input
    validateInput(dogSchema, req.body);

    await dogRef.update(req.body);

    const updatedDoc = await dogRef.get();

    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
    });
  } catch (error) {
    logger.error("Update dog error:", error);
    res.status(400).json({ error: error.message });
  }
};

export const deleteDog = async (req: Request, res: Response) => {
  try {
    const dogRef = db.collection("dogs").doc(req.params.id);
    const dogDoc = await dogRef.get();

    if (!dogDoc.exists) {
      return res.status(404).json({ error: "Dog not found" });
    }

    if (dogDoc.data()?.ownerId !== req.user.uid) {
      return res.status(403).json({ error: "Not authorized" });
    }

    await dogRef.delete();

    res.json({ message: "Dog profile deleted successfully" });
  } catch (error) {
    logger.error("Delete dog error:", error);
    res.status(500).json({ error: "Failed to delete dog profile" });
  }
};

export const getNearbyDogs = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    if (!latitude || !longitude) {
      return res
        .status(400)
        .json({ error: "Latitude and longitude are required" });
    }

    const dogsSnapshot = await db.collection("dogs").get();

    const nearbyDogs = dogsSnapshot.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data()
      }))
      .filter((dog) => {
        if (dog.ownerId === req.user.uid) return false;

        const distance = calculateDistance(
          Number(latitude),
          Number(longitude),
          dog.location.latitude,
          dog.location.longitude
        );

        return distance <= Number(radius);
      });

    res.json(nearbyDogs);
  } catch (error) {
    logger.error("Get nearby dogs error:", error);
    res.status(500).json({ error: "Failed to get nearby dogs" });
  }
};

// Helper function to calculate distance between two points using the Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
}
