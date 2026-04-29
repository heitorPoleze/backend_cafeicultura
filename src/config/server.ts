import express from "express";
import session from "express-session";
const MySQLStoreFactory = require("express-mysql-session");
import cors from "cors";
import dotenv from "dotenv";

// Rotas

import conexao from "./conexao"; // Pool de conexão MySQL
import usuarioRotas from "../rotas/usuarioRotas";
import proprietarioRotas from "../rotas/proprietarioRotas";
import consultorTecnicoRotas from "../rotas/consultorTecnicoRotas";

dotenv.config(); // Carrega as variáveis de ambiente do .env

const app = express();

// --- Configuração do CORS ---
// Define a origem permitida com base no ambiente (produção ou desenvolvimento)
const allowedOriginsString =
  process.env.NODE_ENV === "production"
    ? process.env.FRONTEND_URL_PROD
    : process.env.FRONTEND_URL_DEV;

const allowedOrigins = allowedOriginsString
  ? allowedOriginsString.split("|").map((url) => url.trim().replace(/\/$/, ""))
  : [];

const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin || allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Acesso não permitido por CORS"));
    }
  },
  methods: ["GET", "HEAD", "PATCH", "PUT", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Cache-Control"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

// --- Middlewares Essenciais ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const MySQLStore = MySQLStoreFactory(session);

// Configura o middleware de sessão
const sessMiddleware = session({
  store: new MySQLStore(
    {
      expiration: 1000 * 10 * 60 * 24 * 30, // TTL de 30 dias
      createDatabaseTable: true, // Cria a tabela de sessões automaticamente
    },
    conexao as any // Pool de conexão
  ),
  secret: process.env.SESSION_SECRET!, // Segredo para assinar o cookie de sessão (muito importante!)
  resave: false, // Evita salvar sessões que não foram modificadas
  saveUninitialized: false, // Evita salvar sessões novas que não foram inicializadas/modificadas
  proxy: true,
  cookie: {
    httpOnly: true, // Impede acesso ao cookie via JavaScript (segurança)
    secure: process.env.NODE_ENV === "production", // Cookie seguro (HTTPS) apenas em produção
    sameSite: 'lax',
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : "localhost",
    priority: 'high'
  },
});

app.use(sessMiddleware); // Aplica o middleware de sessão

// --- Registra as rotas da API ---
const API_VERSION = "/api/v1";
app.use(`${API_VERSION}/usuarios`, usuarioRotas);
app.use(`${API_VERSION}/proprietarios`, proprietarioRotas);
app.use(`${API_VERSION}/consultores-tecnicos`, consultorTecnicoRotas);

export default app;