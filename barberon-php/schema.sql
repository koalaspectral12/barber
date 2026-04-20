-- ============================================================
-- Barberon — MySQL Schema
-- Run this in your HostGator / cPanel phpMyAdmin to create
-- or update the database for the PHP version of Barberon.
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';

-- ── User ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `User` (
    `id`            VARCHAR(191) NOT NULL,
    `name`          VARCHAR(191) DEFAULT NULL,
    `email`         VARCHAR(191) NOT NULL,
    `emailVerified` DATETIME(3)  DEFAULT NULL,
    `image`         TEXT         DEFAULT NULL,
    `password`      VARCHAR(255) DEFAULT NULL,
    `role`          ENUM('CUSTOMER','BARBER','ADMIN','SUPERADMIN') NOT NULL DEFAULT 'CUSTOMER',
    `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Account (OAuth) ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Account` (
    `userId`            VARCHAR(191) NOT NULL,
    `type`              VARCHAR(191) NOT NULL,
    `provider`          VARCHAR(191) NOT NULL,
    `providerAccountId` VARCHAR(191) NOT NULL,
    `refresh_token`     TEXT         DEFAULT NULL,
    `access_token`      TEXT         DEFAULT NULL,
    `expires_at`        INT          DEFAULT NULL,
    `token_type`        VARCHAR(191) DEFAULT NULL,
    `scope`             VARCHAR(191) DEFAULT NULL,
    `id_token`          TEXT         DEFAULT NULL,
    `session_state`     VARCHAR(191) DEFAULT NULL,
    `createdAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`         DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`provider`, `providerAccountId`),
    KEY `Account_userId_fkey` (`userId`),
    CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Session ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Session` (
    `sessionToken` VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `expires`      DATETIME(3)  NOT NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`sessionToken`),
    KEY `Session_userId_fkey` (`userId`),
    CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── VerificationToken ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `VerificationToken` (
    `identifier` VARCHAR(191) NOT NULL,
    `token`      VARCHAR(191) NOT NULL,
    `expires`    DATETIME(3)  NOT NULL,
    PRIMARY KEY (`identifier`, `token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Barbershop ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Barbershop` (
    `id`          VARCHAR(191) NOT NULL,
    `name`        VARCHAR(191) NOT NULL,
    `address`     VARCHAR(500) NOT NULL,
    `phones`      TEXT         NOT NULL DEFAULT '[]',
    `description` TEXT         NOT NULL,
    `imageUrl`    TEXT         NOT NULL,
    `active`      TINYINT(1)   NOT NULL DEFAULT 1,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BarbershopAdmin ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `BarbershopAdmin` (
    `id`           VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `assignedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt`    DATETIME(3)  DEFAULT NULL,
    `active`       TINYINT(1)   NOT NULL DEFAULT 1,
    PRIMARY KEY (`id`),
    UNIQUE KEY `BarbershopAdmin_userId_key` (`userId`),
    UNIQUE KEY `BarbershopAdmin_barbershopId_key` (`barbershopId`),
    CONSTRAINT `BarbershopAdmin_userId_fkey`       FOREIGN KEY (`userId`)       REFERENCES `User`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `BarbershopAdmin_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Barber ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Barber` (
    `id`           VARCHAR(191) NOT NULL,
    `userId`       VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `bio`          TEXT         DEFAULT NULL,
    `avatarUrl`    TEXT         DEFAULT NULL,
    `specialty`    VARCHAR(500) DEFAULT NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `Barber_userId_key` (`userId`),
    KEY `Barber_barbershopId_fkey` (`barbershopId`),
    CONSTRAINT `Barber_userId_fkey`       FOREIGN KEY (`userId`)       REFERENCES `User`      (`id`) ON DELETE CASCADE,
    CONSTRAINT `Barber_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BarbershopService ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `BarbershopService` (
    `id`           VARCHAR(191) NOT NULL,
    `name`         VARCHAR(191) NOT NULL,
    `description`  TEXT         NOT NULL,
    `imageUrl`     TEXT         NOT NULL,
    `price`        DECIMAL(10,2) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `BarbershopService_barbershopId_fkey` (`barbershopId`),
    CONSTRAINT `BarbershopService_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Booking ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `Booking` (
    `id`            VARCHAR(191) NOT NULL,
    `userId`        VARCHAR(191) NOT NULL,
    `serviceId`     VARCHAR(191) NOT NULL,
    `date`          DATETIME(3)  NOT NULL,
    `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'local',
    `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
    `mpPaymentId`   VARCHAR(191) DEFAULT NULL,
    `createdAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `Booking_userId_fkey`    (`userId`),
    KEY `Booking_serviceId_fkey` (`serviceId`),
    CONSTRAINT `Booking_userId_fkey`    FOREIGN KEY (`userId`)    REFERENCES `User`             (`id`),
    CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `BarbershopService`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── AppSettings ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `AppSettings` (
    `id`        VARCHAR(191) NOT NULL DEFAULT 'singleton',
    `appName`   VARCHAR(191) NOT NULL DEFAULT 'Barberon',
    `logoUrl`   TEXT         DEFAULT NULL,
    `banners`   TEXT         NOT NULL DEFAULT '[]',
    `updatedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PaymentConfig ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `PaymentConfig` (
    `id`              VARCHAR(191) NOT NULL,
    `barbershopId`    VARCHAR(191) NOT NULL,
    `mpAccessToken`   TEXT         DEFAULT NULL,
    `mpPublicKey`     TEXT         DEFAULT NULL,
    `mpWebhookSecret` TEXT         DEFAULT NULL,
    `active`          TINYINT(1)   NOT NULL DEFAULT 0,
    `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `PaymentConfig_barbershopId_key` (`barbershopId`),
    CONSTRAINT `PaymentConfig_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BarbershopHours ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `BarbershopHours` (
    `id`           VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `dayOfWeek`    INT          NOT NULL,
    `openTime`     VARCHAR(5)   NOT NULL,
    `closeTime`    VARCHAR(5)   NOT NULL,
    `slotMinutes`  INT          NOT NULL DEFAULT 30,
    PRIMARY KEY (`id`),
    UNIQUE KEY `BarbershopHours_barbershopId_dayOfWeek_key` (`barbershopId`, `dayOfWeek`),
    CONSTRAINT `BarbershopHours_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Default admin seed (password: admin123) ───────────────────
INSERT IGNORE INTO `AppSettings` (id, appName, banners, updatedAt)
VALUES ('singleton', 'Barberon', '[]', NOW());

SET FOREIGN_KEY_CHECKS = 1;
