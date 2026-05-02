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
    `duration`     VARCHAR(5)   NOT NULL DEFAULT '00:30',
    `barbershopId` VARCHAR(191) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `BarbershopService_barbershopId_fkey` (`barbershopId`),
    CONSTRAINT `BarbershopService_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Add duration to existing tables (safe, ignored if already exists)
ALTER TABLE `BarbershopService` ADD COLUMN IF NOT EXISTS `duration` VARCHAR(5) NOT NULL DEFAULT '00:30';

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

-- ── WaitlistNotify ────────────────────────────────────────────
-- Admin can flag a booking slot as "notify next client" when it opens up
CREATE TABLE IF NOT EXISTS `WaitlistNotify` (
    `id`           VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `serviceId`    VARCHAR(191) NOT NULL,
    `date`         DATETIME(3)  NOT NULL,
    `message`      TEXT         DEFAULT NULL,
    `sentAt`       DATETIME(3)  DEFAULT NULL,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `WaitlistNotify_barbershopId_fkey` (`barbershopId`),
    KEY `WaitlistNotify_serviceId_fkey`    (`serviceId`),
    CONSTRAINT `WaitlistNotify_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE,
    CONSTRAINT `WaitlistNotify_serviceId_fkey`    FOREIGN KEY (`serviceId`)    REFERENCES `BarbershopService`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Plan ──────────────────────────────────────────────────────
-- Superadmin defines plan tiers available for barbershops
CREATE TABLE IF NOT EXISTS `Plan` (
    `id`          VARCHAR(191) NOT NULL,
    `name`        VARCHAR(191) NOT NULL,          -- e.g. 'Mensal', 'Trimestral', 'Anual'
    `period`      ENUM('monthly','quarterly','yearly') NOT NULL DEFAULT 'monthly',
    `price`       DECIMAL(10,2) NOT NULL,
    `description` TEXT         DEFAULT NULL,
    `features`    TEXT         NOT NULL DEFAULT '[]', -- JSON array of feature strings
    `maxServices` INT          NOT NULL DEFAULT 10,
    `customPage`  TINYINT(1)   NOT NULL DEFAULT 0,    -- allows page builder
    `exclusiveApp`TINYINT(1)   NOT NULL DEFAULT 0,    -- standalone app mode
    `active`      TINYINT(1)   NOT NULL DEFAULT 1,
    `createdAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`   DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BarbershopPlan ────────────────────────────────────────────
-- Which plan a barbershop has subscribed to
CREATE TABLE IF NOT EXISTS `BarbershopPlan` (
    `id`           VARCHAR(191) NOT NULL,
    `barbershopId` VARCHAR(191) NOT NULL,
    `planId`       VARCHAR(191) NOT NULL,
    `status`       ENUM('active','expired','cancelled','pending') NOT NULL DEFAULT 'pending',
    `startDate`    DATETIME(3)  NOT NULL,
    `endDate`      DATETIME(3)  NOT NULL,
    `autoRenew`    TINYINT(1)   NOT NULL DEFAULT 0,
    `createdAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`    DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `BarbershopPlan_barbershopId_fkey` (`barbershopId`),
    KEY `BarbershopPlan_planId_fkey`       (`planId`),
    CONSTRAINT `BarbershopPlan_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE,
    CONSTRAINT `BarbershopPlan_planId_fkey`       FOREIGN KEY (`planId`)       REFERENCES `Plan`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── PlanPayment ───────────────────────────────────────────────
-- Payment transaction for a plan subscription
CREATE TABLE IF NOT EXISTS `PlanPayment` (
    `id`             VARCHAR(191) NOT NULL,
    `barbershopPlanId` VARCHAR(191) NOT NULL,
    `barbershopId`   VARCHAR(191) NOT NULL,
    `planId`         VARCHAR(191) NOT NULL,
    `amount`         DECIMAL(10,2) NOT NULL,
    `status`         ENUM('pending','approved','rejected','cancelled') NOT NULL DEFAULT 'pending',
    `mpPaymentId`    VARCHAR(191) DEFAULT NULL,
    `mpPreferenceId` VARCHAR(255) DEFAULT NULL,
    `checkoutUrl`    TEXT         DEFAULT NULL,
    `paidAt`         DATETIME(3)  DEFAULT NULL,
    `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    KEY `PlanPayment_barbershopPlanId_fkey` (`barbershopPlanId`),
    KEY `PlanPayment_barbershopId_fkey`     (`barbershopId`),
    CONSTRAINT `PlanPayment_barbershopPlanId_fkey` FOREIGN KEY (`barbershopPlanId`) REFERENCES `BarbershopPlan`(`id`) ON DELETE CASCADE,
    CONSTRAINT `PlanPayment_barbershopId_fkey`     FOREIGN KEY (`barbershopId`)     REFERENCES `Barbershop`(`id`)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── BarberPageConfig ──────────────────────────────────────────
-- Custom page builder configuration per barbershop
CREATE TABLE IF NOT EXISTS `BarberPageConfig` (
    `id`             VARCHAR(191) NOT NULL,
    `barbershopId`   VARCHAR(191) NOT NULL,
    `primaryColor`   VARCHAR(20)  NOT NULL DEFAULT '#f59e0b',
    `accentColor`    VARCHAR(20)  NOT NULL DEFAULT '#1a1a1a',
    `bgColor`        VARCHAR(20)  NOT NULL DEFAULT '#0f0f0f',
    `fontFamily`     VARCHAR(100) NOT NULL DEFAULT 'Inter',
    `heroTitle`      VARCHAR(255) DEFAULT NULL,
    `heroSubtitle`   VARCHAR(500) DEFAULT NULL,
    `heroImageUrl`   TEXT         DEFAULT NULL,
    `carouselImages` TEXT         NOT NULL DEFAULT '[]',  -- JSON array of image URLs
    `modules`        TEXT         NOT NULL DEFAULT '[]',  -- JSON array of enabled modules
    `customCss`      TEXT         DEFAULT NULL,
    `whatsappNumber` VARCHAR(30)  DEFAULT NULL,
    `instagramUrl`   TEXT         DEFAULT NULL,
    `appMode`        TINYINT(1)   NOT NULL DEFAULT 0,     -- exclusive app mode (hides Barberon branding)
    `appName`        VARCHAR(191) DEFAULT NULL,           -- custom name for exclusive app
    `appLogoUrl`     TEXT         DEFAULT NULL,
    `appIconUrl`     TEXT         DEFAULT NULL,
    `createdAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`      DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`),
    UNIQUE KEY `BarberPageConfig_barbershopId_key` (`barbershopId`),
    CONSTRAINT `BarberPageConfig_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ── Default plans seed ────────────────────────────────────────
INSERT IGNORE INTO `Plan` (id, name, period, price, description, features, maxServices, customPage, exclusiveApp, active, createdAt, updatedAt) VALUES
('plan_monthly',   'Mensal',     'monthly',   89.90,  'Plano básico com renovação mensal',     '["Agendamentos ilimitados","Painel admin completo","Horários personalizados","Suporte por e-mail"]',                                        20, 0, 0, 1, NOW(), NOW()),
('plan_quarterly', 'Trimestral', 'quarterly', 239.90, 'Plano intermediário — economize 11%',   '["Agendamentos ilimitados","Painel admin completo","Horários personalizados","Página personalizada","Carrossel de imagens","Suporte prioritário"]', 50, 1, 0, 1, NOW(), NOW()),
('plan_yearly',    'Anual',      'yearly',    799.90, 'Plano completo — economize 26%',        '["Agendamentos ilimitados","Painel admin completo","Horários personalizados","Página personalizada","App exclusivo","Domínio próprio","Suporte VIP"]', 999, 1, 1, 1, NOW(), NOW());

-- ── Default admin seed ────────────────────────────────────────
INSERT IGNORE INTO `AppSettings` (id, appName, banners, updatedAt)
VALUES ('singleton', 'Barberon', '[]', NOW());

-- ── MP Access Token for platform plans (superadmin) ───────────
-- Store your Mercado Pago credentials for platform-level plan sales
-- in AppSettings (extended columns added below)
ALTER TABLE `AppSettings` ADD COLUMN IF NOT EXISTS `mpAccessToken` TEXT DEFAULT NULL;
ALTER TABLE `AppSettings` ADD COLUMN IF NOT EXISTS `mpPublicKey`   TEXT DEFAULT NULL;
ALTER TABLE `AppSettings` ADD COLUMN IF NOT EXISTS `contactEmail`  VARCHAR(255) DEFAULT NULL;

-- ── Slug / friendly URL for barbershops ───────────────────────
-- Run once to add the slug column and unique index.
-- Admin can set a custom slug (e.g. "luiz") so the shop is
-- accessible at /b/luiz.html (static) or ?slug=luiz (API).
ALTER TABLE `Barbershop` ADD COLUMN IF NOT EXISTS
    `slug` VARCHAR(100) DEFAULT NULL COMMENT 'URL-friendly identifier, e.g. luiz';
ALTER TABLE `Barbershop` ADD UNIQUE IF NOT EXISTS `Barbershop_slug_key` (`slug`);

-- ── Custom domain for barbershops (informational) ─────────────
-- Stores the desired custom domain / subdomain set by the admin.
-- Actual DNS routing must be configured externally (Cloudflare / host).
ALTER TABLE `BarberPageConfig` ADD COLUMN IF NOT EXISTS
    `customDomain` VARCHAR(255) DEFAULT NULL COMMENT 'e.g. luiz.barberon.shop';

SET FOREIGN_KEY_CHECKS = 1;
