/*
  Warnings:

  - Added the required column `idProprietario_FK` to the `insumos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `especie` to the `variedades` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `insumos` ADD COLUMN `idProprietario_FK` INTEGER UNSIGNED NOT NULL;

-- AlterTable
ALTER TABLE `variedades` ADD COLUMN `especie` TINYINT NOT NULL;

-- AddForeignKey
ALTER TABLE `clientes` ADD CONSTRAINT `clientes_idCliente_PFK_fkey` FOREIGN KEY (`idCliente_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `fornecedores` ADD CONSTRAINT `fornecedores_idFornecedor_PFK_fkey` FOREIGN KEY (`idFornecedor_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `funcionarios` ADD CONSTRAINT `funcionarios_idPeFisica_PFK_fkey` FOREIGN KEY (`idPeFisica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `meeiros` ADD CONSTRAINT `meeiros_idPeFisica_PFK_fkey` FOREIGN KEY (`idPeFisica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `prestadoresdeservico` ADD CONSTRAINT `prestadoresdeservico_idPeFisica_PFK_fkey` FOREIGN KEY (`idPeFisica_PFK`) REFERENCES `pessoas`(`idPessoa_PK`) ON DELETE RESTRICT ON UPDATE CASCADE;
