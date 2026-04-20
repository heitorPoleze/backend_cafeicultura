import { Endereco } from "./models/Endereco";
import { Login } from "./models/Login";
import { Propriedade } from "./models/Propriedade";
import { Proprietario } from "./models/Proprietario";
import { Tamanho } from "./models/Tamanho";

const loginProprietario = new Login("heitor@heitor.com", "123");
const proprietario = new Proprietario("heitor", "12345678901", "12345678901234", loginProprietario, 1);
const endereco = new Endereco("29650000", "Brasil", "RJ", "Rio de Janeiro", "Copacabana", "Avenida Atlântica", 1);
const tamanhoPropriedade = new Tamanho(100, "m²", 1);
const propriedade = new Propriedade("Sítio Zé Pilantra", proprietario, endereco, tamanhoPropriedade, 1)

console.log(propriedade.toString())