import { Router } from "express";
import routeProprietario from "./proprietario"; 
import routePropriedade from "./propriedade";

const router = Router();

router.use("/proprietario", routeProprietario);
router.use("/propriedade", routePropriedade);

export default router;