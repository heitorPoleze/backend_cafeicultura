import express from "express";
import session from "express-session";
import cors from "cors";
import dotenv from "dotenv";

//prisma
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "./shared/config/database";

// Rotas
import pessoaRotas from "./features/pessoa/pessoa.routes";
import authRotas from "./features/auth/auth.routes";
import proprietarioRotas from "./features/proprietario/proprietario.routes";
// import usuarioRotas from "./features/usuario/usuario.routes";
// import consultorTecnicoRotas from "./features/consultortecnico/consultor.routes";
import propriedadeRotas from "./features/propriedade/propriedade.routes";
import talhoesRotas from "./features/talhao/talhao.routes";
import safraRotas from "./features/safra/safra.routes";
import tratosCulturaisRotas from "./features/tratocultural/tratocultural.routes";
import insumosRotas from "./features/insumo/insumo.routes";
import despesasRotas from "./features/despesa/despesa.routes";
import comprasinsumosRotas from "./features/comprainsumo/comprainsumo.routes";
import eventosRotas from "./features/evento/evento.routes";

// --- Configuração do servidor ---
import transacaoRotas from "./features/transacaofinanceira/transacaofinanceira.routes";
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
    if (!origin) {
      return callback(null, true);
    }

    if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
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
  secret: process.env.SESSION_SECRET || "seu-segredo-super-secreto-aqui",
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
app.use(`${API_VERSION}`, pessoaRotas);
app.use(`${API_VERSION}/auth`, authRotas);
app.use(`${API_VERSION}/proprietarios`, proprietarioRotas);
app.use(`${API_VERSION}/propriedades`, propriedadeRotas);
// app.use(`${API_VERSION}/usuarios`, usuarioRotas);
// app.use(`${API_VERSION}/consultores-tecnicos`, consultorTecnicoRotas);
app.use(`${API_VERSION}/talhoes`, talhoesRotas);
app.use(`${API_VERSION}/safras`, safraRotas);
app.use(`${API_VERSION}/tratosculturais`, tratosCulturaisRotas);
app.use(`${API_VERSION}/insumos`, insumosRotas);
app.use(`${API_VERSION}/despesas`, despesasRotas);
app.use(`${API_VERSION}/comprasinsumos`, comprasinsumosRotas);
app.use(`${API_VERSION}/eventos`, eventosRotas);
app.use(`${API_VERSION}/extratos`, transacaoRotas);

export default app;