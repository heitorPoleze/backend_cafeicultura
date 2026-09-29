import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import { sessMiddleware } from "./shared/middlewares/sessao";

import pessoaRotas from "./features/pessoa/pessoa.routes";
import authRotas from "./features/auth/auth.routes";
import proprietarioRotas from "./features/proprietario/proprietario.routes";
import propriedadeRotas from "./features/propriedade/propriedade.routes";
import talhoesRotas from "./features/talhao/talhao.routes";
import safraRotas from "./features/safra/safra.routes";
import tratosCulturaisRotas from "./features/tratocultural/tratocultural.routes";
import insumosRotas from "./features/insumo/insumo.routes";
import despesasRotas from "./features/despesa/despesa.routes";
import comprasinsumosRotas from "./features/comprainsumo/comprainsumo.routes";
import eventosRotas from "./features/evento/evento.routes";
import transacaoRotas from "./features/transacaofinanceira/transacaofinanceira.routes";
import notificacoesRotas from "./features/notificacao/notificacao.routes";

import exigeChaveApi from "./shared/middlewares/exigeChaveApi";
import setupSwagger from "./swagger";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

app.use(helmet());

const allowedOriginsString = process.env.NODE_ENV === "production"
  ? process.env.FRONTEND_URL_PROD
  : process.env.FRONTEND_URL_DEV;

const allowedOrigins = allowedOriginsString
  ? allowedOriginsString.split("|").map((url) => url.trim().replace(/\/$/, ""))
  : [];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV !== "production" && origin.includes("localhost")) return callback(null, true);
    if (allowedOrigins.includes(origin.replace(/\/$/, ""))) {
      callback(null, true);
    } else {
      callback(new Error("Acesso não permitido por CORS"));
    }
  },
  methods: ["GET", "HEAD", "PATCH", "PUT", "POST", "OPTIONS"],
  credentials: true,
  allowedHeaders: ["Content-Type", "Cache-Control", "x-api-key"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));

app.use(sessMiddleware);
setupSwagger(app);

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50, 
  message: { error: "Muitas requisições deste IP. Tente novamente em alguns minutos." },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(exigeChaveApi);

const API_VERSION = "/api/v1";

app.use(`${API_VERSION}`, apiLimiter);

app.use(`${API_VERSION}`, pessoaRotas);
app.use(`${API_VERSION}/auth`, authRotas);
app.use(`${API_VERSION}/notificacoes`, notificacoesRotas);
app.use(`${API_VERSION}/proprietarios`, proprietarioRotas);
app.use(`${API_VERSION}/propriedades`, propriedadeRotas);
app.use(`${API_VERSION}/talhoes`, talhoesRotas);
app.use(`${API_VERSION}/safras`, safraRotas);
app.use(`${API_VERSION}/tratosculturais`, tratosCulturaisRotas);
app.use(`${API_VERSION}/insumos`, insumosRotas);
app.use(`${API_VERSION}/despesas`, despesasRotas);
app.use(`${API_VERSION}/comprasinsumos`, comprasinsumosRotas);
app.use(`${API_VERSION}/eventos`, eventosRotas);
app.use(`${API_VERSION}/extratos`, transacaoRotas);

export default app;