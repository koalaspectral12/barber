-- AlterTable: adicionar role e password ao User
ALTER TABLE `User`
    ADD COLUMN `password` VARCHAR(191) NULL,
    ADD COLUMN `role` ENUM('CUSTOMER', 'BARBER', 'ADMIN', 'SUPERADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- CreateTable: BarbershopAdmin (relação 1-para-1 entre User ADMIN e Barbershop)
CREATE TABLE `BarbershopAdmin` (
    `id`           VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `assignedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `BarbershopAdmin_userId_key`(`userId`),
    UNIQUE INDEX `BarbershopAdmin_barbershopId_key`(`barbershopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable: Barber (perfil de barbeiro vinculado a User e Barbershop)
CREATE TABLE `Barber` (
    `id`           VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `bio`          TEXT         NULL,
    `avatarUrl`    TEXT         NULL,
    `specialty`    VARCHAR(191) NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL,

    UNIQUE INDEX `Barber_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: BarbershopAdmin → User
ALTER TABLE `BarbershopAdmin`
    ADD CONSTRAINT `BarbershopAdmin_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: BarbershopAdmin → Barbershop
ALTER TABLE `BarbershopAdmin`
    ADD CONSTRAINT `BarbershopAdmin_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Barber → User
ALTER TABLE `Barber`
    ADD CONSTRAINT `Barber_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey: Barber → Barbershop
ALTER TABLE `Barber`
    ADD CONSTRAINT `Barber_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;
