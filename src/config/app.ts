import express from "express";
import cors from "cors";
import router from "../api/routes/index";

const app = express();

app.use(cors()); 
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/api", router);

export default app
