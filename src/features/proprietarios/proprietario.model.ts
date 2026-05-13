import { RowDataPacket } from "mysql2/promise";

type IProprietarioRow = RowDataPacket & {
  idProprietario_PFK: number;
  dataCadastro: Date;
  email: string;
  telefone: string;
  // Campos vindos dos LEFT JOINs
  nome?: string;
  cpf?: string;
  razaoSocial?: string;
  cnpj?: string;
  inscEstadual?: string;
}

export default IProprietarioRow;