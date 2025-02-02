import { Router } from "express";
import { authenticateUser } from "../middleware/auth";
import {
  createDog,
  getDog,
  updateDog,
  deleteDog,
  getNearbyDogs
} from "../controllers/dogController";

const router = Router();

router.use(authenticateUser);

router.post("/", createDog);
router.get("/:id", getDog);
router.put("/:id", updateDog);
router.delete("/:id", deleteDog);
router.get("/nearby", getNearbyDogs);

export default router;
