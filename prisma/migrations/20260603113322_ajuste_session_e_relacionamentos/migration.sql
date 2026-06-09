-- CreateTable
CREATE TABLE `consultorestecnicos` (
    `idConsultor_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idConsultor_PFK_UNIQUE`(`idConsultor_PFK`),
    PRIMARY KEY (`idConsultor_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `enderecos` (
    `idEndereco_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `logradouro` VARCHAR(50) NOT NULL,
    `bairro` VARCHAR(50) NOT NULL,
    `cidade` VARCHAR(50) NOT NULL,
    `uf` CHAR(2) NOT NULL,
    `pais` VARCHAR(20) NOT NULL,
    `cep` CHAR(9) NOT NULL,

    UNIQUE INDEX `idEndereco_PK_UNIQUE`(`idEndereco_PK`),
    PRIMARY KEY (`idEndereco_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoas` (
    `idPessoa_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `dataCadastro` DATETIME(0) NOT NULL,
    `idEndereco_FK` INTEGER UNSIGNED NULL,

    UNIQUE INDEX `idPessoa_PK_UNIQUE`(`idPessoa_PK`),
    UNIQUE INDEX `pessoas_idEndereco_FK_key`(`idEndereco_FK`),
    PRIMARY KEY (`idPessoa_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoasfisicas` (
    `idPeFisica_PFK` INTEGER UNSIGNED NOT NULL,
    `nome` VARCHAR(100) NOT NULL,
    `cpf` CHAR(14) NOT NULL,

    UNIQUE INDEX `idPeFisica_PFK_UNIQUE`(`idPeFisica_PFK`),
    UNIQUE INDEX `cpf_UNIQUE`(`cpf`),
    PRIMARY KEY (`idPeFisica_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoasjuridicas` (
    `idPeJuridica_PFK` INTEGER UNSIGNED NOT NULL,
    `razaoSocial` VARCHAR(100) NOT NULL,
    `cnpj` CHAR(18) NOT NULL,
    `inscEstadual` VARCHAR(45) NULL,

    UNIQUE INDEX `idPeJuridica_PFK_UNIQUE`(`idPeJuridica_PFK`),
    UNIQUE INDEX `cnpj_UNIQUE`(`cnpj`),
    UNIQUE INDEX `inscEstadual_UNIQUE`(`inscEstadual`),
    PRIMARY KEY (`idPeJuridica_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `propriedades` (
    `idPropriedade_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idEndereco_FK` INTEGER UNSIGNED NOT NULL,
    `idProprietario_FK` INTEGER UNSIGNED NOT NULL,
    `idTamanho_FK` INTEGER UNSIGNED NOT NULL,
    `nome` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `idPropriedade_PK_UNIQUE`(`idPropriedade_PK`),
    INDEX `propriedade_endereco_idx`(`idEndereco_FK`),
    INDEX `propriedade_proprietario_idx`(`idProprietario_FK`),
    INDEX `propriedade_tamanho_idx`(`idTamanho_FK`),
    PRIMARY KEY (`idPropriedade_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `proprietarios` (
    `idProprietario_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idProprietario_PFK_UNIQUE`(`idProprietario_PFK`),
    PRIMARY KEY (`idProprietario_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tamanhos` (
    `idTamanho_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `valor` FLOAT NOT NULL,
    `medida` VARCHAR(7) NOT NULL,

    UNIQUE INDEX `idTamanho_PK_UNIQUE`(`idTamanho_PK`),
    PRIMARY KEY (`idTamanho_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `usuarios` (
    `idUsuario_PFK` INTEGER UNSIGNED NOT NULL,
    `email` VARCHAR(50) NOT NULL,
    `telefone` CHAR(15) NOT NULL,
    `senha` VARCHAR(500) NOT NULL,

    UNIQUE INDEX `idUsuario_PFK_UNIQUE`(`idUsuario_PFK`),
    UNIQUE INDEX `email_UNIQUE`(`email`),
    UNIQUE INDEX `telefone_UNIQUE`(`telefone`),
    PRIMARY KEY (`idUsuario_PFK`, `telefone`, `email`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Session` (
    `sessionid` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expires` DATETIME(3) NOT NULL,

    PRIMARY KEY (`sessionid`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoas_idEndereco_FK_fkey` FOREIGN KEY (`idEndereco_FK`) REFERENCES `enderecos`(`idEndereco_PK`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pessoasfisicas` ADD CONSTRAINT `PessoaFisica_Pessoa` FOREIGN KEY (`idPeFisica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoasjuridicas` ADD CONSTRAINT `pessoasjuridicas_idPeJuridica_PFK_fkey` FOREIGN KEY (`idPeJuridica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedades_idEndereco_FK_fkey` FOREIGN KEY (`idEndereco_FK`) REFERENCES `enderecos`(`idEndereco_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedades_idProprietario_FK_fkey` FOREIGN KEY (`idProprietario_FK`) REFERENCES `proprietarios`(`idProprietario_PFK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedades_idTamanho_FK_fkey` FOREIGN KEY (`idTamanho_FK`) REFERENCES `tamanhos`(`idTamanho_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `proprietarios` ADD CONSTRAINT `proprietarios_idProprietario_PFK_fkey` FOREIGN KEY (`idProprietario_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuarios_idUsuario_PFK_fkey` FOREIGN KEY (`idUsuario_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;
