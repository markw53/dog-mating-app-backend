import { db } from "../config/firebase";
import { Match } from "../types";

export const createMatch = async (
  dog1Id: string,
  dog2Id: string
): Promise<Match> => {
  const matchData: Omit<Match, "id"> = {
    dog1Id,
    dog2Id,
    status: "pending",
    createdAt: new Date()
  };

  const matchRef = await db.collection("matches").add(matchData);
  return { id: matchRef.id, ...matchData };
};

export const updateMatchStatus = async (
  matchId: string,
  status: "accepted" | "rejected"
): Promise<void> => {
  await db.collection("matches").doc(matchId).update({ status });
};

export const getMatches = async (dogId: string): Promise<Match[]> => {
  const matchesSnapshot = await db
    .collection("matches")
    .where("dog1Id", "==", dogId)
    .get();

  const matches = matchesSnapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data()
      } as Match)
  );

  return matches;
};
