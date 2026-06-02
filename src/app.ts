import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

//prisma
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./shared/config/database";

// Rotas
import usuarioRotas from "./features/auth/auth.routes";
import proprietarioRotas from "./features/proprietarios/proprietario.routes";
import consultorTecnicoRotas from "./features/consultortecnico/consultor.routes";

dotenv.config(); // Carrega as variáveis de ambiente do .env

const app = express();

// --- Configuração do CORS ---
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

// Configura o middleware de sessão
const sessMiddleware = session({
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true, // Usa o código hash do cookie (sid) como chave primária (id) da tabela
    },
  ),
  secret: process.env.SESSION_SECRET!, // Segredo para assinar o cookie de sessão
  resave: false, // Evita salvar sessões que não foram modificadas
  saveUninitialized: false, // Evita salvar sessões novas que não foram inicializadas/modificadas
  proxy: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // TTL
    httpOnly: true, // Impede acesso ao cookie via JavaScript (segurança)
    secure: process.env.NODE_ENV === "production", // Cookie seguro (HTTPS) apenas em produção
    sameSite: 'lax',
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined, 
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