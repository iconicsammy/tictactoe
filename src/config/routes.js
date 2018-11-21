const express = require("express");
import GameController from "../api/controller/game.controller";
const router = express.Router();

//build routes now

router.get("/play/", GameController.play);

export default router;
