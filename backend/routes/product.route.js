import express from "express";
import { creating, deleting, getting, gettingimage } from "../controllers/product.controller.js"  ;

 const router = express.Router()

router.get("/",getting);
router.post("/",creating);
router.delete("/:id",deleting);
router.get("/:id",gettingimage);

export default router;

 

