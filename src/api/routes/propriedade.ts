import { Router } from "express";
import { PropriedadeController } from "../controllers/PropriedadeController";

const routePropriedade = Router();
const propriedadeController = new PropriedadeController();

routePropriedade.post("/", async (req, res) => {
    await propriedadeController.cadastrarPropriedade(req, res);
});

routePropriedade.get("/:id", async (req, res) => {
    await propriedadeController.buscarPropriedadeCompletaPorId(req, res);
});

export default routePropriedade;