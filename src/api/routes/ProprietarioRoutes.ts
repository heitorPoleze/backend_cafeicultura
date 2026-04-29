import { Router } from "express";
import { ProprietarioController } from "../controllers/ProprietarioController";

const routeProprietario = Router()
const proprietarioController = new ProprietarioController();

routeProprietario.get("/", (req, res) => {
    res.json({ message: "resposta da API da rota" });
});

routeProprietario.post("/", async (req, res) => {
    await proprietarioController.cadastrarProprietario(req, res);
});


export default routeProprietario;