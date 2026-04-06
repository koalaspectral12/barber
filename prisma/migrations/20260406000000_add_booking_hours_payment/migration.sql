-- ─── Add active flag to Barbershop ────────────────────────────────────────────
ALTER TABLE `Barbershop`
    ADD COLUMN IF NOT EXISTS `active` BOOLEAN NOT NULL DEFAULT TRUE;

-- ─── Add expiresAt and active to BarbershopAdmin ─────────────────────────────
ALTER TABLE `BarbershopAdmin`
    ADD COLUMN IF NOT EXISTS `expiresAt` DATETIME(3) NULL,
    ADD COLUMN IF NOT EXISTS `active`    BOOLEAN     NOT NULL DEFAULT TRUE;

-- ─── Add payment fields to Booking ────────────────────────────────────────────
ALTER TABLE `Booking`
    ADD COLUMN IF NOT EXISTS `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'local',
    ADD COLUMN IF NOT EXISTS `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    ADD COLUMN IF NOT EXISTS `mpPaymentId`   VARCHAR(191) NULL;

-- ─── CreateTable: PaymentConfig ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `PaymentConfig` (
    `id`              VARCHAR(191) NOT NULL,
    `barbershopId`    VARCHAR(191) NOT NULL,
    `mpAccessToken`   TEXT         NULL,
    `mpPublicKey`     TEXT         NULL,
    `mpWebhookSecret` TEXT         NULL,
    `active`          BOOLEAN      NOT NULL DEFAULT FALSE,
    `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `PaymentConfig_barbershopId_key`(`barbershopId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: PaymentConfig → Barbershop
ALTER TABLE `PaymentConfig`
    ADD CONSTRAINT `PaymentConfig_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── CreateTable: BarbershopHours ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `BarbershopHours` (
    `id`           VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `dayOfWeek`    INTEGER      NOT NULL,
    `openTime`     VARCHAR(191) NOT NULL,
    `closeTime`    VARCHAR(191) NOT NULL,
    `slotMinutes`  INTEGER      NOT NULL DEFAULT 30,

    UNIQUE INDEX `BarbershopHours_barbershopId_dayOfWeek_key`(`barbershopId`, `dayOfWeek`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey: BarbershopHours → Barbershop
ALTER TABLE `BarbershopHours`
    ADD CONSTRAINT `BarbershopHours_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── AppSettings: Add logoUrl column if missing ───────────────────────────────
ALTER TABLE `AppSettings`
    ADD COLUMN IF NOT EXISTS `logoUrl` TEXT NULL;
