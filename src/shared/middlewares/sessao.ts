import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { prisma } from "../config/database"; // Adjust path if necessary
import dotenv from "dotenv";

dotenv.config();

export const sessMiddleware = session({
  store: new PrismaSessionStore(
    prisma,
    {
      checkPeriod: 2 * 60 * 1000,
      dbRecordIdIsSessionId: true, 
    },
  ),
  secret: process.env.SESSION_SECRET || "seu-segredo-super-secreto-aqui",
  resave: false,
  saveUninitialized: false,
  proxy: true,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 30, // TTL
    httpOnly: true, 
    secure: process.env.NODE_ENV === "production", 
    sameSite: 'lax',
    domain: process.env.NODE_ENV === "production" ? process.env.DOMAIN : undefined,
    priority: 'high'
  },
});