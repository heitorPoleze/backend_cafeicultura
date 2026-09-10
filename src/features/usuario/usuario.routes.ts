// import { Router } from "express";

// import UsuarioRepository from "./usuario.repository";
// import UsuarioService from "./usuario.service";
// import UsuarioController from "./usuario.controller";
// import exigeLogin from "../../shared/middlewares/exigeLogin";
// import {prisma} from "../../shared/config/database";
// const router = Router();

// // Instanciação das dependências e injeção no Controller
// const usuarioRepo = new UsuarioRepository(prisma);
// const usuarioService = new UsuarioService(usuarioRepo);
// const usuarioController = new UsuarioController(usuarioService);

// /**
//  * GET /api/v1/usuarios/meu-perfil
//  */
// router.get("/meu-perfil", exigeLogin(), usuarioController.buscarMeuPerfil.bind(usuarioController));

// export default router;