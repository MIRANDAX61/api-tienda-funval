import { Router } from "express";
import { listUsers,
         createUser,
         getUserById,
         updateUser,
         deleteUser
 } from "../controllers/users.controllers";

const router = Router();

router.get("/", listUsers);
router.post("/", createUser);
router.get("/:id", getUserById);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

export default router;