import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import { upload } from "../middleware/multer.middlewares.js";
import { verifyJwt } from "../middlewares/auth.middlewares.js";
import { registerUser, logoutUser } from "../controllers/user.controllers.js";
const router = Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
