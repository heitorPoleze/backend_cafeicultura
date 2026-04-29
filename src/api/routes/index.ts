import { Router } from "express";
import routeProprietario from "./ProprietarioRoutes"; 
import routePropriedade from "./PropriedadeRoutes";
import routeTalhao from "./TalhaoRoutes";

const router = Router();

router.use("/proprietario", routeProprietario);
router.use("/propriedade", routePropriedade);
router.use("/talhao", routeTalhao);

export default router;