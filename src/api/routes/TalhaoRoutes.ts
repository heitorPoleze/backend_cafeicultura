import { Router } from "express";
import { TalhaoController } from "../controllers/TalhaoController";

const routeTalhao = Router();
const talhaoController = new TalhaoController();

routeTalhao.post("/", async (req, res) => {
    await talhaoController.cadastrarTalhao(req, res);
});

routeTalhao.get("/:id", async (req, res) => {
    await talhaoController.buscarTalhaoCompletoPorId(req, res);
});

routeTalhao.get("/propriedades/:id_propriedade", async (req, res) => {
    await talhaoController.listarPorPropriedade(req, res);
});

export default routeTalhao;