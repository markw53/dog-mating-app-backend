import { Request, Response } from "express";
import { db } from "../config/firebase";
import { Dog } from "../types";

export const createDog = async (req: Request, res: Response) => {
  try {
    const { name, breed, age, gender, photos, description, location } =
      req.body;
    const dogData: Omit<Dog, "id"> = {
      ownerId: req.user.uid,
      name,
      breed,
      age,
      gender,
      photos,
      description,
      location,
      createdAt: new Date()
    };

    const dogRef = await db.collection("dogs").add(dogData);
    res.status(201).json({ id: dogRef.id, ...dogData });
  } catch (error) {
    res.status(500).json({ error: "Failed to create dog profile" });
  }
};

export const getDog = async (req: Request, res: Response) => {
  try {
    const dogDoc = await db.collection("dogs").doc(req.params.id).get();
    if (!dogDoc.exists) {
      return res.status(404).json({ error: "Dog not found" });
    }
    res.json({ id: dogDoc.id, ...dogDoc.data() });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch dog profile" });
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
      return res.status(403).json({ error: "Unauthorized" });
    }

    await dogRef.update(req.body);
    res.json({ message: "Dog profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update dog profile" });
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
      return res.status(403).json({ error: "Unauthorized" });
    }

    await dogRef.delete();
    res.json({ message: "Dog profile deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete dog profile" });
  }
};

export const getNearbyDogs = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;

    // This is a simple implementation. For production, you'd want to use
    // geohashing or a more sophisticated geo-querying solution
    const dogsSnapshot = await db.collection("dogs").get();
    const nearbyDogs = dogsSnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((dog) => {
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
    res.status(500).json({ error: "Failed to fetch nearby dogs" });
  }
};

// Helper function to calculate distance between two points
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
