-- ==========================================================================
--  BARBERON — Migration para banco de produção comu8166_barbershop
--  Execute este script no seu MySQL/MariaDB de produção ANTES do deploy
--  Comando: mysql -u SEU_USER -p comu8166_barbershop < migrate_production.sql
-- ==========================================================================

USE `comu8166_barbershop`;

-- ── 1. Tabela User: adicionar campo password e role se não existirem ──────────
ALTER TABLE `User`
  ADD COLUMN IF NOT EXISTS `password` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `role` ENUM('CUSTOMER','BARBER','ADMIN','SUPERADMIN') NOT NULL DEFAULT 'CUSTOMER';

-- ── 2. Tabela Barbershop: adicionar campo active ───────────────────────────────
ALTER TABLE `Barbershop`
  ADD COLUMN IF NOT EXISTS `active` BOOLEAN NOT NULL DEFAULT TRUE;

-- ── 3. Tabela BarbershopAdmin: adicionar expiresAt e active ───────────────────
ALTER TABLE `BarbershopAdmin`
  ADD COLUMN IF NOT EXISTS `expiresAt` DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS `active`    BOOLEAN NOT NULL DEFAULT TRUE;

-- ── 4. Tabela Booking: adicionar paymentMethod e paymentStatus ────────────────
ALTER TABLE `Booking`
  ADD COLUMN IF NOT EXISTS `paymentMethod` VARCHAR(191) NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS `paymentStatus` VARCHAR(191) NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS `mpPaymentId`   VARCHAR(191) NULL;

-- ── 5. Criar tabela PaymentConfig se não existir ──────────────────────────────
CREATE TABLE IF NOT EXISTS `PaymentConfig` (
  `id`              VARCHAR(191) NOT NULL,
  `barbershopId`    VARCHAR(191) NOT NULL,
  `mpAccessToken`   LONGTEXT     NULL,
  `mpPublicKey`     LONGTEXT     NULL,
  `mpWebhookSecret` LONGTEXT     NULL,
  `active`          BOOLEAN      NOT NULL DEFAULT FALSE,
  `createdAt`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3)  NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PaymentConfig_barbershopId_key` (`barbershopId`),
  CONSTRAINT `PaymentConfig_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 6. Criar tabela BarbershopHours se não existir ────────────────────────────
CREATE TABLE IF NOT EXISTS `BarbershopHours` (
  `id`           VARCHAR(191) NOT NULL,
  `barbershopId` VARCHAR(191) NOT NULL,
  `dayOfWeek`    INT          NOT NULL,
  `openTime`     VARCHAR(191) NOT NULL,
  `closeTime`    VARCHAR(191) NOT NULL,
  `slotMinutes`  INT          NOT NULL DEFAULT 30,
  PRIMARY KEY (`id`),
  UNIQUE KEY `BarbershopHours_barbershopId_dayOfWeek_key` (`barbershopId`, `dayOfWeek`),
  CONSTRAINT `BarbershopHours_barbershopId_fkey`
    FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ── 7. Criar tabela AppSettings se não existir ───────────────────────────────
CREATE TABLE IF NOT EXISTS `AppSettings` (
  `id`        VARCHAR(191) NOT NULL DEFAULT 'singleton',
  `appName`   VARCHAR(191) NOT NULL DEFAULT 'Barberon',
  `logoUrl`   LONGTEXT     NULL,
  `banners`   LONGTEXT     NOT NULL DEFAULT '[]',
  `updatedAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Inserir AppSettings padrão se não existir
INSERT IGNORE INTO `AppSettings` (`id`, `appName`, `banners`, `updatedAt`)
VALUES ('singleton', 'Barberon', '[]', NOW());

-- ── 8. Garantir que todas as barbearias estejam ativas ────────────────────────
UPDATE `Barbershop` SET `active` = TRUE WHERE `active` IS NULL OR `active` = FALSE;

-- ── 9. Inserir horários padrão para barbearias sem horário cadastrado ─────────
-- Seg a Sáb, 09:00 às 18:00, slots de 30 min
INSERT IGNORE INTO `BarbershopHours` (`id`, `barbershopId`, `dayOfWeek`, `openTime`, `closeTime`, `slotMinutes`)
SELECT 
  CONCAT(UUID(), '-', b.id, '-', d.day) as `id`,
  b.id as `barbershopId`,
  d.day as `dayOfWeek`,
  '09:00' as `openTime`,
  '18:00' as `closeTime`,
  30 as `slotMinutes`
FROM `Barbershop` b
CROSS JOIN (
  SELECT 1 as day UNION SELECT 2 UNION SELECT 3 
  UNION SELECT 4 UNION SELECT 5 UNION SELECT 6
) d
WHERE NOT EXISTS (
  SELECT 1 FROM `BarbershopHours` bh 
  WHERE bh.barbershopId = b.id AND bh.dayOfWeek = d.day
);

-- ── 10. Garantir superadmin com senha conhecida ───────────────────────────────
-- Senha: super123 (hash bcrypt)
INSERT INTO `User` (`id`, `email`, `name`, `role`, `password`, `createdAt`, `updatedAt`)
VALUES (
  'superadmin-fixed-id-001',
  'superadmin@fswbarber.com',
  'Super Admin',
  'SUPERADMIN',
  '$2b$10$ol3E9AYzF1xAlsulnspqvOtLCNGWtH6lGtSk.JFrq./FB5uiXEBxW',
  NOW(),
  NOW()
)
ON DUPLICATE KEY UPDATE
  `role` = 'SUPERADMIN',
  `password` = '$2b$10$ol3E9AYzF1xAlsulnspqvOtLCNGWtH6lGtSk.JFrq./FB5uiXEBxW',
  `updatedAt` = NOW();

-- Verificar resultado
SELECT 'Migration concluída!' as status;
SELECT id, name, email, role FROM `User` WHERE role IN ('ADMIN','SUPERADMIN') ORDER BY role DESC;
SELECT id, name, active FROM `Barbershop` LIMIT 10;
