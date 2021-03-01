import express from "express";
import userCtrl from "../controllers/userCtrl.js";
import authAdmin from "../middleware/authAdmin.js";
import authHeader from "../middleware/authHeader.js";

const router = express.Router();

router.post("/register", userCtrl.register);

router.post("/activation", userCtrl.activateEmail);

router.post("/login", userCtrl.login);

router.post("/refresh_token", userCtrl.getAccessToken);

router.post("/forgot_pass", userCtrl.forgotPassword);

router.post("/reset_pass", authHeader, userCtrl.resetPassword);

router.get("/user_info", authHeader, userCtrl.getUserInfor);

router.get("/all_info", authHeader, authAdmin, userCtrl.getUserAllInfo);

router.get("/logout", userCtrl.logOut);

router.patch("/update", authHeader, userCtrl.updateUser);

router.patch("/update_role/:id", authHeader, authAdmin, userCtrl.updateRole);

router.delete("/delete/:id", authHeader, authAdmin, userCtrl.deleteUser);

export default router;
