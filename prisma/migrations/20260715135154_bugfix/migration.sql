-- CreateTable
CREATE TABLE `armazenagens` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idPilagem_PFK` INTEGER UNSIGNED NOT NULL,
    `idArmazem_FK` INTEGER UNSIGNED NOT NULL,
    `lote` VARCHAR(10) NOT NULL,
    `qtdArmazenada` FLOAT NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    UNIQUE INDEX `lote_UNIQUE`(`lote`),
    INDEX `armazenagem_armazem_idx`(`idArmazem_FK`),
    INDEX `armazenagem_pilagem_idx`(`idPilagem_PFK`),
    PRIMARY KEY (`idEventoAgricola_PFK`, `idPilagem_PFK`, `lote`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `armazens` (
    `idArmazem_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idEndereco_FK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idArmazem_PK_UNIQUE`(`idArmazem_PK`),
    INDEX `armazem_endereco_idx`(`idEndereco_FK`),
    PRIMARY KEY (`idArmazem_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `clientes` (
    `idCliente_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idCliente_PFK_UNIQUE`(`idCliente_PFK`),
    PRIMARY KEY (`idCliente_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `colheitas` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `qtdSacosInNatura` INTEGER UNSIGNED NOT NULL,
    `isMeeiro` TINYINT NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `comprasinsumos` (
    `idCompra_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idInsumo_FK` INTEGER UNSIGNED NOT NULL,
    `idDespesa_FK` INTEGER UNSIGNED NOT NULL,
    `qtdComprada` FLOAT NOT NULL,

    UNIQUE INDEX `idCompra_PK_UNIQUE`(`idCompra_PK`),
    INDEX `compra_despesa_idx`(`idDespesa_FK`),
    INDEX `compra_insumo_idx`(`idInsumo_FK`),
    PRIMARY KEY (`idCompra_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultorespropriedades` (
    `idConsultor_PFK` INTEGER UNSIGNED NOT NULL,
    `idPropriedade_PFK` INTEGER UNSIGNED NOT NULL,

    INDEX `propriedade_propriedade_idx`(`idPropriedade_PFK`),
    PRIMARY KEY (`idConsultor_PFK`, `idPropriedade_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `consultorestecnicos` (
    `idConsultor_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idConsultor_PFK_UNIQUE`(`idConsultor_PFK`),
    PRIMARY KEY (`idConsultor_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despesas` (
    `idTransacaoFinanceira_PFK` INTEGER UNSIGNED NOT NULL,
    `descricao` VARCHAR(50) NOT NULL,

    UNIQUE INDEX `idTransacaoFinanceira_PFK_UNIQUE`(`idTransacaoFinanceira_PFK`),
    PRIMARY KEY (`idTransacaoFinanceira_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `despolpas` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentos` (
    `idDocumento_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idPropriedade_FK` INTEGER UNSIGNED NOT NULL,
    `idPessoa_FK` INTEGER UNSIGNED NULL,
    `idTalhao_FK` INTEGER UNSIGNED NULL,
    `dataCadastro` DATETIME(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `referenciaArquivo` VARCHAR(100) NOT NULL,

    UNIQUE INDEX `idDocumento_PK_UNIQUE`(`idDocumento_PK`),
    INDEX `documento_pessoa_idx`(`idPessoa_FK`),
    INDEX `documento_propriedade_idx`(`idPropriedade_FK`),
    INDEX `documento_talhao_idx`(`idTalhao_FK`),
    PRIMARY KEY (`idDocumento_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `documentosetiquetas` (
    `idDocumento_PFK` INTEGER UNSIGNED NOT NULL,
    `idEtiqueta_PFK` INTEGER UNSIGNED NOT NULL,

    INDEX `etiqueta_etiqueta_idx`(`idEtiqueta_PFK`),
    PRIMARY KEY (`idDocumento_PFK`, `idEtiqueta_PFK`)
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
CREATE TABLE `estoque` (
    `idEstoque_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idEventogricola` INTEGER UNSIGNED NOT NULL,
    `idPropriedade` INTEGER UNSIGNED NOT NULL,
    `idTalhao` INTEGER UNSIGNED NOT NULL,
    `idSafra` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe` INTEGER UNSIGNED NOT NULL,
    `quantidade` FLOAT NOT NULL,

    UNIQUE INDEX `idEstoque_PK_UNIQUE`(`idEstoque_PK`),
    PRIMARY KEY (`idEstoque_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `etiquetas` (
    `idEtiqueta_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `nome` VARCHAR(25) NOT NULL,

    UNIQUE INDEX `idEtiqueta_PK_UNIQUE`(`idEtiqueta_PK`),
    PRIMARY KEY (`idEtiqueta_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventos` (
    `idEvento_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idSafra_FK` INTEGER UNSIGNED NOT NULL,
    `dataCadastro` DATETIME(0) NOT NULL,
    `dataInicio` DATETIME(0) NOT NULL,
    `dataFim` DATETIME(0) NULL,
    `descricao` VARCHAR(50) NOT NULL,
    `confirmado` TINYINT NOT NULL,

    UNIQUE INDEX `idEvento_PK_UNIQUE`(`idEvento_PK`),
    INDEX `evento_safra_idx`(`idSafra_FK`),
    PRIMARY KEY (`idEvento_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `eventosagricolas` (
    `idEvento_PFK` INTEGER UNSIGNED NOT NULL,
    `idTalhao_FK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEvento_PFK_UNIQUE`(`idEvento_PFK`),
    INDEX `eventoagricola_talhao_idx`(`idTalhao_FK`),
    PRIMARY KEY (`idEvento_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fermentacoes` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idMetFermentacao_FK` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe_FK` INTEGER UNSIGNED NOT NULL,
    `qtdSacaDespolpada` INTEGER UNSIGNED NOT NULL,
    `qtdSacaFermentada` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    INDEX `fermentacao_metodo_idx`(`idMetFermentacao_FK`),
    INDEX `fermentacao_tipocafe_idx`(`idTipoCafe_FK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `formaspgto` (
    `idFormaPgto_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(17) NOT NULL,

    UNIQUE INDEX `idFormaPgto_PK_UNIQUE`(`idFormaPgto_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idFormaPgto_PK`, `descricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `fornecedores` (
    `idFornecedor_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idFornecedor_PFK_UNIQUE`(`idFornecedor_PFK`),
    PRIMARY KEY (`idFornecedor_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `funcionarios` (
    `idPeFisica_PFK` INTEGER UNSIGNED NOT NULL,
    `ctps` VARCHAR(14) NOT NULL,
    `salario` DECIMAL(10, 2) NOT NULL,

    UNIQUE INDEX `idPeFisica_PFK_UNIQUE`(`idPeFisica_PFK`),
    UNIQUE INDEX `ctps_UNIQUE`(`ctps`),
    PRIMARY KEY (`idPeFisica_PFK`, `ctps`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `geolocalizacoes` (
    `idTalhao_PFK` INTEGER UNSIGNED NOT NULL,
    `coordenada` point NOT NULL,

    UNIQUE INDEX `idTalhao_PFK_UNIQUE`(`idTalhao_PFK`),
    PRIMARY KEY (`idTalhao_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumos` (
    `idInsumo_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(25) NOT NULL,
    `medida` VARCHAR(3) NOT NULL,

    UNIQUE INDEX `idInsumo_PK_UNIQUE`(`idInsumo_PK`),
    PRIMARY KEY (`idInsumo_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `insumosfermentacoes` (
    `idInsumo_PFK` INTEGER UNSIGNED NOT NULL,
    `idFermentacao_PFK` INTEGER UNSIGNED NOT NULL,
    `qtdUsada` FLOAT NOT NULL,

    INDEX `fermentacao_fermentacao_idx`(`idFermentacao_PFK`),
    PRIMARY KEY (`idInsumo_PFK`, `idFermentacao_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `itenstipos` (
    `idDespolpa_PFK` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe_PFK` INTEGER UNSIGNED NOT NULL,
    `quantidade` FLOAT NOT NULL,

    INDEX `itemtipo_tipocafe_idx`(`idTipoCafe_PFK`),
    PRIMARY KEY (`idDespolpa_PFK`, `idTipoCafe_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `meeiros` (
    `idPeFisica_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idPessoaFisica_PFK_UNIQUE`(`idPeFisica_PFK`),
    PRIMARY KEY (`idPeFisica_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodosfermentacoes` (
    `idMetFermentacao_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(24) NOT NULL,

    UNIQUE INDEX `idMetFermentacao_PK_UNIQUE`(`idMetFermentacao_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idMetFermentacao_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodospresecagens` (
    `idMetPreSecagem_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(15) NOT NULL,

    UNIQUE INDEX `idMetPreSecagem_PK_UNIQUE`(`idMetPreSecagem_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idMetPreSecagem_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `metodossecagens` (
    `idMetSecagem_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `idMetSecagem_PK_UNIQUE`(`idMetSecagem_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idMetSecagem_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoas` (
    `idPessoa_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idAdministrador_FK` INTEGER UNSIGNED NULL,
    `idEndereco_FK` INTEGER UNSIGNED NULL,
    `dataCadastro` DATETIME(0) NOT NULL,

    UNIQUE INDEX `idPessoa_PK_UNIQUE`(`idPessoa_PK`),
    UNIQUE INDEX `dataCadastro_UNIQUE`(`dataCadastro`),
    INDEX `pessoa_endereco_idx`(`idEndereco_FK`),
    INDEX `pessoa_administrador_idx`(`idAdministrador_FK`),
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
CREATE TABLE `pilagens` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe_FK` INTEGER UNSIGNED NOT NULL,
    `grauQualidade` INTEGER UNSIGNED NOT NULL,
    `qtdSacasSecadas` INTEGER UNSIGNED NOT NULL,
    `qtdSacasPiladas` INTEGER UNSIGNED NOT NULL,
    `qtdRepasseMeeiro` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    INDEX `pilagem_tipocafe_idx`(`idTipoCafe_FK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `presecagens` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idMetPreSecagem_FK` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe_FK` INTEGER UNSIGNED NOT NULL,
    `qtdSacosEntrada` INTEGER UNSIGNED NOT NULL,
    `qtdSacosPreSecos` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    INDEX `presecagem_metodo_idx`(`idMetPreSecagem_FK`),
    INDEX `presecagem_tipocafe_idx`(`idTipoCafe_FK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestadoresdeservico` (
    `idPeFisica_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idPeFisica_PFK_UNIQUE`(`idPeFisica_PFK`),
    PRIMARY KEY (`idPeFisica_PFK`)
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
CREATE TABLE `receitas` (
    `idTransacaoFinanceira_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idTransacaoFinanceira_PFK_UNIQUE`(`idTransacaoFinanceira_PFK`),
    PRIMARY KEY (`idTransacaoFinanceira_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `renovacoesplantios` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `qtdMudasPlantadas` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `safras` (
    `idSafra_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idPropriedade_FK` INTEGER UNSIGNED NOT NULL,
    `dataInicio` DATE NOT NULL,
    `dataFim` DATE NULL,
    `arquivada` BOOLEAN NOT NULL,

    UNIQUE INDEX `idSafra_PK_UNIQUE`(`idSafra_PK`),
    INDEX `safra_propriedade_idx`(`idPropriedade_FK`),
    PRIMARY KEY (`idSafra_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `secagens` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idMetSecagem_FK` INTEGER UNSIGNED NOT NULL,
    `idTipoCafe_FK` INTEGER UNSIGNED NOT NULL,
    `idSubtipoCafe_FK` INTEGER UNSIGNED NOT NULL,
    `qtdSacosEntrada` INTEGER UNSIGNED NOT NULL,
    `qtdSacasSecadas` INTEGER UNSIGNED NOT NULL,
    `qtdRepasseMeeiro` INTEGER UNSIGNED NOT NULL DEFAULT 0,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    INDEX `secagem_metodo_idx`(`idMetSecagem_FK`),
    INDEX `secagem_tipocafe_idx`(`idTipoCafe_FK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `talhoes` (
    `idTalhao_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idPropriedade_FK` INTEGER UNSIGNED NOT NULL,
    `idTamanho_FK` INTEGER UNSIGNED NOT NULL,
    `nome` VARCHAR(25) NOT NULL,
    `qtdPeCafe` INTEGER UNSIGNED NOT NULL,
    `especie` CHAR(7) NOT NULL,
    `dataInicio` DATE NOT NULL,
    `dataFim` DATE NULL,
    `arquivado` TINYINT NOT NULL,

    UNIQUE INDEX `idTalhao_PK_UNIQUE`(`idTalhao_PK`),
    INDEX `talhao_propriedade_idx`(`idPropriedade_FK`),
    INDEX `talhao_tamanho_idx`(`idTamanho_FK`),
    PRIMARY KEY (`idTalhao_PK`)
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
CREATE TABLE `tiposcafes` (
    `idTipoCafe_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `idTipoCafe_PK_UNIQUE`(`idTipoCafe_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idTipoCafe_PK`, `descricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tipostratos` (
    `idTipoTrato_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(9) NOT NULL,

    UNIQUE INDEX `idTipoTrato_PK_UNIQUE`(`idTipoTrato_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idTipoTrato_PK`, `descricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transacoesfinanceiras` (
    `idTransacaoFinanceira_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `idEvento_FK` INTEGER UNSIGNED NULL,
    `idPropriedade_FK` INTEGER UNSIGNED NOT NULL,
    `idFormaPgto_FK` INTEGER UNSIGNED NOT NULL,
    `idPessoa_FK` INTEGER UNSIGNED NOT NULL,
    `dataHora` DATETIME(0) NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,
    `tipoOperacao` VARCHAR(9) NOT NULL,

    UNIQUE INDEX `idTransacaoFinanceira_PK_UNIQUE`(`idTransacaoFinanceira_PK`),
    UNIQUE INDEX `dataHora_UNIQUE`(`dataHora`),
    INDEX `transacao_evento_idx`(`idEvento_FK`),
    INDEX `transacao_pessoa_idx`(`idFormaPgto_FK`),
    INDEX `transacao_pessoa_idx1`(`idPessoa_FK`),
    INDEX `transacao_propriedade_idx`(`idPropriedade_FK`),
    PRIMARY KEY (`idTransacaoFinanceira_PK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tratosculturais` (
    `idEventoAgricola_PFK` INTEGER UNSIGNED NOT NULL,
    `idTipoTrato_FK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEventoAgricola_PFK_UNIQUE`(`idEventoAgricola_PFK`),
    INDEX `tratocultural_tipotrato_idx`(`idTipoTrato_FK`),
    PRIMARY KEY (`idEventoAgricola_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `tratosinsumos` (
    `idTrato_PFK` INTEGER UNSIGNED NOT NULL,
    `idInsumo_PFK` INTEGER UNSIGNED NOT NULL,
    `qtdUsada` FLOAT NOT NULL,

    INDEX `insumo_insumo_idx`(`idInsumo_PFK`),
    PRIMARY KEY (`idTrato_PFK`, `idInsumo_PFK`)
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
CREATE TABLE `variedades` (
    `idVariedade_PK` INTEGER UNSIGNED NOT NULL AUTO_INCREMENT,
    `descricao` VARCHAR(10) NOT NULL,

    UNIQUE INDEX `idVariedade_PK_UNIQUE`(`idVariedade_PK`),
    UNIQUE INDEX `descricao_UNIQUE`(`descricao`),
    PRIMARY KEY (`idVariedade_PK`, `descricao`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `variedadestalhoes` (
    `idTalhao_PFK` INTEGER UNSIGNED NOT NULL,
    `idVariedade_PFK` INTEGER UNSIGNED NOT NULL,

    INDEX `variedade_variedade_idx`(`idVariedade_PFK`),
    PRIMARY KEY (`idTalhao_PFK`, `idVariedade_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendas` (
    `idEvento_PFK` INTEGER UNSIGNED NOT NULL,

    UNIQUE INDEX `idEvento_PFK_UNIQUE`(`idEvento_PFK`),
    PRIMARY KEY (`idEvento_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `vendasarmazenagens` (
    `idArmazenagem_PFK` INTEGER UNSIGNED NOT NULL,
    `idVenda_PFK` INTEGER UNSIGNED NOT NULL,
    `quantidade` FLOAT NOT NULL,
    `valor` DECIMAL(10, 2) NOT NULL,

    INDEX `armazenagens_vendas_idx`(`idVenda_PFK`),
    PRIMARY KEY (`idArmazenagem_PFK`, `idVenda_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `session` (
    `id` VARCHAR(191) NOT NULL,
    `sid` VARCHAR(191) NOT NULL,
    `data` TEXT NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `sid_UNIQUE`(`sid`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pessoaseventos` (
    `idPessoa_PFK` INTEGER UNSIGNED NOT NULL,
    `idEvento_PFK` INTEGER UNSIGNED NOT NULL,

    INDEX `evento_evento_idx`(`idEvento_PFK`),
    PRIMARY KEY (`idPessoa_PFK`, `idEvento_PFK`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `armazenagens` ADD CONSTRAINT `armazenagem_armazem` FOREIGN KEY (`idArmazem_FK`) REFERENCES `armazens`(`idArmazem_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `armazenagens` ADD CONSTRAINT `armazenagem_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `armazenagens` ADD CONSTRAINT `armazenagem_pilagem` FOREIGN KEY (`idPilagem_PFK`) REFERENCES `pilagens`(`idEventoAgricola_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `armazens` ADD CONSTRAINT `armazem_endereco` FOREIGN KEY (`idEndereco_FK`) REFERENCES `enderecos`(`idEndereco_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `colheitas` ADD CONSTRAINT `colheitas_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comprasinsumos` ADD CONSTRAINT `compra_despesa` FOREIGN KEY (`idDespesa_FK`) REFERENCES `despesas`(`idTransacaoFinanceira_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `comprasinsumos` ADD CONSTRAINT `compra_insumo` FOREIGN KEY (`idInsumo_FK`) REFERENCES `insumos`(`idInsumo_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `consultorestecnicos` ADD CONSTRAINT `consultor_usuario` FOREIGN KEY (`idConsultor_PFK`) REFERENCES `usuarios`(`idUsuario_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `despesas` ADD CONSTRAINT `despesa_transacao` FOREIGN KEY (`idTransacaoFinanceira_PFK`) REFERENCES `transacoesfinanceiras`(`idTransacaoFinanceira_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `despolpas` ADD CONSTRAINT `despolpa_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documentosetiquetas` ADD CONSTRAINT `documento_documento` FOREIGN KEY (`idDocumento_PFK`) REFERENCES `documentos`(`idDocumento_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `documentosetiquetas` ADD CONSTRAINT `etiqueta_etiqueta` FOREIGN KEY (`idEtiqueta_PFK`) REFERENCES `etiquetas`(`idEtiqueta_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `eventos` ADD CONSTRAINT `evento_safra` FOREIGN KEY (`idSafra_FK`) REFERENCES `safras`(`idSafra_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `eventosagricolas` ADD CONSTRAINT `eventoagricola_evento` FOREIGN KEY (`idEvento_PFK`) REFERENCES `eventos`(`idEvento_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `eventosagricolas` ADD CONSTRAINT `eventoagricola_talhao` FOREIGN KEY (`idTalhao_FK`) REFERENCES `talhoes`(`idTalhao_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fermentacoes` ADD CONSTRAINT `fermentacao_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fermentacoes` ADD CONSTRAINT `fermentacao_metodo` FOREIGN KEY (`idMetFermentacao_FK`) REFERENCES `metodosfermentacoes`(`idMetFermentacao_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `fermentacoes` ADD CONSTRAINT `fermentacao_tipocafe` FOREIGN KEY (`idTipoCafe_FK`) REFERENCES `tiposcafes`(`idTipoCafe_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `insumosfermentacoes` ADD CONSTRAINT `insumofermentacao_fermentacao` FOREIGN KEY (`idFermentacao_PFK`) REFERENCES `fermentacoes`(`idEventoAgricola_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `insumosfermentacoes` ADD CONSTRAINT `insumofermentacao_insumo` FOREIGN KEY (`idInsumo_PFK`) REFERENCES `insumos`(`idInsumo_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itenstipos` ADD CONSTRAINT `itemtipo_despolpa` FOREIGN KEY (`idDespolpa_PFK`) REFERENCES `despolpas`(`idEventoAgricola_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `itenstipos` ADD CONSTRAINT `itemtipo_tipocafe` FOREIGN KEY (`idTipoCafe_PFK`) REFERENCES `tiposcafes`(`idTipoCafe_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoa_administrador` FOREIGN KEY (`idAdministrador_FK`) REFERENCES `proprietarios`(`idProprietario_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoas` ADD CONSTRAINT `pessoa_endereco` FOREIGN KEY (`idEndereco_FK`) REFERENCES `enderecos`(`idEndereco_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoasfisicas` ADD CONSTRAINT `PessoaFisica_Pessoa` FOREIGN KEY (`idPeFisica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoasjuridicas` ADD CONSTRAINT `pessoaJuridica_pessoa` FOREIGN KEY (`idPeJuridica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pilagens` ADD CONSTRAINT `pilagem_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pilagens` ADD CONSTRAINT `pilagem_tipocafe` FOREIGN KEY (`idTipoCafe_FK`) REFERENCES `tiposcafes`(`idTipoCafe_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `presecagens` ADD CONSTRAINT `presecagem_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `presecagens` ADD CONSTRAINT `presecagem_metodo` FOREIGN KEY (`idMetPreSecagem_FK`) REFERENCES `metodospresecagens`(`idMetPreSecagem_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `presecagens` ADD CONSTRAINT `presecagem_tipocafe` FOREIGN KEY (`idTipoCafe_FK`) REFERENCES `tiposcafes`(`idTipoCafe_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedade_endereco` FOREIGN KEY (`idEndereco_FK`) REFERENCES `enderecos`(`idEndereco_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedade_proprietario` FOREIGN KEY (`idProprietario_FK`) REFERENCES `proprietarios`(`idProprietario_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `propriedades` ADD CONSTRAINT `propriedade_tamanho` FOREIGN KEY (`idTamanho_FK`) REFERENCES `tamanhos`(`idTamanho_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `proprietarios` ADD CONSTRAINT `proprietario_usuario` FOREIGN KEY (`idProprietario_PFK`) REFERENCES `usuarios`(`idUsuario_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `receitas` ADD CONSTRAINT `receita_transacao` FOREIGN KEY (`idTransacaoFinanceira_PFK`) REFERENCES `transacoesfinanceiras`(`idTransacaoFinanceira_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `renovacoesplantios` ADD CONSTRAINT `renovacaoplantio_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `safras` ADD CONSTRAINT `safra_propriedade` FOREIGN KEY (`idPropriedade_FK`) REFERENCES `propriedades`(`idPropriedade_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `secagens` ADD CONSTRAINT `secagem_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `secagens` ADD CONSTRAINT `secagem_metodo` FOREIGN KEY (`idMetSecagem_FK`) REFERENCES `metodossecagens`(`idMetSecagem_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `secagens` ADD CONSTRAINT `secagem_tipocafe` FOREIGN KEY (`idTipoCafe_FK`) REFERENCES `tiposcafes`(`idTipoCafe_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `talhoes` ADD CONSTRAINT `talhao_propriedade` FOREIGN KEY (`idPropriedade_FK`) REFERENCES `propriedades`(`idPropriedade_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `talhoes` ADD CONSTRAINT `talhao_tamanho` FOREIGN KEY (`idTamanho_FK`) REFERENCES `tamanhos`(`idTamanho_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacoesfinanceiras` ADD CONSTRAINT `transacao_evento` FOREIGN KEY (`idEvento_FK`) REFERENCES `eventos`(`idEvento_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacoesfinanceiras` ADD CONSTRAINT `transacao_forma` FOREIGN KEY (`idFormaPgto_FK`) REFERENCES `formaspgto`(`idFormaPgto_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacoesfinanceiras` ADD CONSTRAINT `transacao_pessoa` FOREIGN KEY (`idPessoa_FK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `transacoesfinanceiras` ADD CONSTRAINT `transacao_propriedade` FOREIGN KEY (`idPropriedade_FK`) REFERENCES `propriedades`(`idPropriedade_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tratosculturais` ADD CONSTRAINT `tratocultural_eventoagricola` FOREIGN KEY (`idEventoAgricola_PFK`) REFERENCES `eventosagricolas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tratosculturais` ADD CONSTRAINT `tratocultural_tipotrato` FOREIGN KEY (`idTipoTrato_FK`) REFERENCES `tipostratos`(`idTipoTrato_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tratosinsumos` ADD CONSTRAINT `insumo_insumo` FOREIGN KEY (`idInsumo_PFK`) REFERENCES `insumos`(`idInsumo_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `tratosinsumos` ADD CONSTRAINT `tratocultural_tratocultural` FOREIGN KEY (`idTrato_PFK`) REFERENCES `tratosculturais`(`idEventoAgricola_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `usuarios` ADD CONSTRAINT `usuario_pessoa` FOREIGN KEY (`idUsuario_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `variedadestalhoes` ADD CONSTRAINT `talhao_talhao` FOREIGN KEY (`idTalhao_PFK`) REFERENCES `talhoes`(`idTalhao_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `variedadestalhoes` ADD CONSTRAINT `variedade_variedade` FOREIGN KEY (`idVariedade_PFK`) REFERENCES `variedades`(`idVariedade_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendas` ADD CONSTRAINT `venda_evento` FOREIGN KEY (`idEvento_PFK`) REFERENCES `eventos`(`idEvento_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendasarmazenagens` ADD CONSTRAINT `armazegem_armazenagem` FOREIGN KEY (`idArmazenagem_PFK`) REFERENCES `armazenagens`(`idEventoAgricola_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `vendasarmazenagens` ADD CONSTRAINT `vendas_vendas` FOREIGN KEY (`idVenda_PFK`) REFERENCES `vendas`(`idEvento_PFK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoaseventos` ADD CONSTRAINT `evento_evento` FOREIGN KEY (`idEvento_PFK`) REFERENCES `eventos`(`idEvento_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `pessoaseventos` ADD CONSTRAINT `pessoa_pessoa` FOREIGN KEY (`idPessoa_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE NO ACTION ON UPDATE NO ACTION;
