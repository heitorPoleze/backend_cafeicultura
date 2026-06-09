/*
  Warnings:

  - A unique constraint covering the columns `[sid]` on the table `Session` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sid` to the `Session` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `session` ADD COLUMN `sid` VARCHAR(255) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `sid_UNIQUE` ON `Session`(`sid`);
