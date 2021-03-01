import express from "express";
import uploadImage from "../middleware/uploadImage.js";
import uploadCtrl from "../controllers/uploadCtrl.js";
import authHeader from "../middleware/authHeader.js";

const router = express.Router();

router.post("/upload_avatar", uploadImage, uploadCtrl.uploadAvatar);

export default router;
