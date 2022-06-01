const express = require("express");


const router = express.Router();
const controller =require("../../controller/user.js");
const auth=require("../../middlewares/auth.js")


router.post("/signup", controller.signup)
router.post("/login", controller.login)
router.get("/logout",auth, controller.logout)
router.get("/current",auth, controller.current)
router.patch("/",auth,controller.updateSubscription)
router.patch("/avatars",auth,upload.single("avatar"), controller.updateAwatars)
router.post("/verify", controller.reVerificate)
router.get("/verify/:verificationToken", controller.verificait)

module.exports = router;
