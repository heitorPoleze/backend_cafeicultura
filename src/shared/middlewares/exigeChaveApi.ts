import { Request, Response, NextFunction } from 'express';

const exigeChaveApi = (req: Request, res: Response, next: NextFunction) => {
  const clientApiKey = req.headers['x-api-key'];
  const serverApiKey = process.env.API_KEY;
  if (!clientApiKey) {
    return res.status(401).json({ error: 'Acesso negado. Chave da API ausente.' });
  }
  if (clientApiKey !== serverApiKey) {
    return res.status(403).json({ error: 'Acesso proibido. Chave da API inválida.' });
  }
  next();
};

export default exigeChaveApi;