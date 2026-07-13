# ☕ Backend - API Cafeicultura

Este repositório contém o código-fonte do backend do sistema de gestão de cafeicultura, construído com Node.js, Express, Prisma ORM e documentado nativamente com Swagger.

Siga as instruções abaixo para inicializar o ambiente de desenvolvimento local, configurar o banco de dados e rodar a aplicação.

## Pré-requisitos

Certifique-se de ter instalado em sua máquina:
* **Node.js** (versão 18 ou superior)
* **Gerenciador de pacotes** (npm, já incluso no Node)
* **Servidor Local** (XAMPP, WAMP, Laragon, etc.) rodando para o suporte do banco de dados
* **SGBD** (Sistema Gerenciador de Banco de Dados) compatível rodando localmente

---

## Passo a Passo para Inicialização

### 1. Clonar o Repositório
Faça o clone do projeto para a sua máquina local e acesse o diretório do backend:

```bash
git clone -b develop https://github.com/heitorPoleze/backend_cafeicultura.git
```

### 2. Configurar o Banco de Dados
A modelagem atual do banco de dados está armazenada em nosso sistema de armazenamento em nuvem.

1. Baixe o script de criação do banco de dados (arquivo `.sql`) no sistema de armazenamento utilizado pela equipe.
2. Abra o seu gerenciador de banco de dados preferido (ex: DBeaver, MySQL Workbench, pgAdmin).
3. Crie um banco de dados vazio para o projeto.
4. Importe e execute o script `.sql` baixado para criar todas as tabelas e relacionamentos necessários.

### 3. Configurar as Variáveis de Ambiente
As configurações e credenciais de acesso também estão centralizadas na nuvem.

1. Acesse o sistema de armazenamento em nuvem e localize o arquivo ou as chaves de variáveis de ambiente disponibilizadas.
2. Crie um arquivo vazio chamado `.env` na raiz do diretório do backend.
3. Insira as variáveis copiadas da nuvem dentro deste arquivo `.env`.

### 4. Instalar as Dependências
Com o terminal aberto na raiz do projeto, instale todas as bibliotecas necessárias:

```bash
npm install
```

### 5. Sincronizar o Prisma ORM a partir das alterações no Banco de Dados
Caso tenha feito alterações no seu Banco de Dados, use a Engenharia reversa (introspecção) do Prisma e gerar o Client para uso no código:

```bash
# Atualiza o arquivo schema.prisma com as tabelas do banco de dados
npx prisma db pull

# Gera o Prisma Client atualizado nos arquivos do projeto
npx prisma generate
```

### 6. Rodar o Servidor
Com todas as dependências instaladas e o banco conectado, inicie o servidor em modo de desenvolvimento:

```bash
# Envia as alterações do schema do prisma para o banco de dados
npx prisma db push

# Sincroniza as alterações
npx prisma generate

npx nodemon
```

---

## Documentação e Testes (Swagger)

Ao rodar o servidor com sucesso, a interface interativa da documentação da API estará disponível. Você pode visualizar todos os endpoints, schemas esperados e realizar testes diretamente pelo navegador acessando:

**http://localhost:3333/api-docs**
