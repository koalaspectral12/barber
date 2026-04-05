-- ============================================================
--  BARBERON — Dump completo do banco de dados
--  Gerado em: 2026-04-02
--  Banco:     fsw-barber  (MySQL / MariaDB 10.x)
--
--  INSTRUÇÕES DE IMPORTAÇÃO:
--    mysql -u SEU_USUARIO -p < barberon_database.sql
--  ou via phpMyAdmin / DBeaver / TablePlus
-- ============================================================

CREATE DATABASE IF NOT EXISTS `comu8166_barbershop`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `comu8166_barbershop`;

/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.14-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: fsw-barber
-- ------------------------------------------------------
-- Server version	10.11.14-MariaDB-0+deb12u2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Account`
--

DROP TABLE IF EXISTS `Account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Account` (
  `userId` varchar(191) NOT NULL,
  `type` varchar(191) NOT NULL,
  `provider` varchar(191) NOT NULL,
  `providerAccountId` varchar(191) NOT NULL,
  `refresh_token` text DEFAULT NULL,
  `access_token` text DEFAULT NULL,
  `expires_at` int(11) DEFAULT NULL,
  `token_type` varchar(191) DEFAULT NULL,
  `scope` varchar(191) DEFAULT NULL,
  `id_token` text DEFAULT NULL,
  `session_state` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`provider`,`providerAccountId`),
  KEY `Account_userId_fkey` (`userId`),
  CONSTRAINT `Account_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Account`
--

LOCK TABLES `Account` WRITE;
/*!40000 ALTER TABLE `Account` DISABLE KEYS */;
/*!40000 ALTER TABLE `Account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `AppSettings`
--

DROP TABLE IF EXISTS `AppSettings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `AppSettings` (
  `id` varchar(191) NOT NULL DEFAULT 'singleton',
  `appName` varchar(191) NOT NULL DEFAULT 'Barberon',
  `logoUrl` longtext DEFAULT NULL,
  `banners` longtext NOT NULL DEFAULT '[]',
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AppSettings`
--

LOCK TABLES `AppSettings` WRITE;
/*!40000 ALTER TABLE `AppSettings` DISABLE KEYS */;
INSERT INTO `AppSettings` (`id`, `appName`, `logoUrl`, `banners`, `updatedAt`) VALUES ('singleton','Barberon',NULL,'[]','2026-04-02 12:30:17.000');
/*!40000 ALTER TABLE `AppSettings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Barber`
--

DROP TABLE IF EXISTS `Barber`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Barber` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `barbershopId` varchar(191) NOT NULL,
  `bio` text DEFAULT NULL,
  `avatarUrl` text DEFAULT NULL,
  `specialty` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Barber_userId_key` (`userId`),
  KEY `Barber_barbershopId_fkey` (`barbershopId`),
  CONSTRAINT `Barber_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Barber_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Barber`
--

LOCK TABLES `Barber` WRITE;
/*!40000 ALTER TABLE `Barber` DISABLE KEYS */;
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9pm000ihw8vre82qe91','cmndnp9pm000ghw8vr9t022ez','a14ab693-3954-416b-af8c-a072952eeee6','15 anos de experiência em cortes tradicionais. Formado pela Escola de Barbearia de Lisboa.','https://api.dicebear.com/7.x/avataaars/svg?seed=Joao','Corte clássico, Navalha','2026-03-30 20:44:34.282','2026-03-30 20:44:34.282');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9po000lhw8vkou55inm','cmndnp9po000jhw8vbjt0ulir','a14ab693-3954-416b-af8c-a072952eeee6','Especialista em barba com técnicas italianas. Participante do campeonato nacional de barbearia 2023.','https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel','Barba artística, Coloração','2026-03-30 20:44:34.285','2026-03-30 20:44:34.285');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9pr000ohw8vrdamqmo5','cmndnp9pq000mhw8vjyyi8wrs','bd45ac45-705d-4aed-b16e-dcb3fc56d7bf','Referência em degradê no estado de SP. Mais de 5000 clientes satisfeitos.','https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael','Fade, Degradê','2026-03-30 20:44:34.287','2026-03-30 20:44:34.287');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9ps000rhw8vc51nkl9f','cmndnp9ps000phw8vyftz7z59','bd45ac45-705d-4aed-b16e-dcb3fc56d7bf','Colorista certificado. Trabalhou em salões de renome em Nova York e Paris.','https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas','Coloração, Mechas','2026-03-30 20:44:34.289','2026-03-30 20:44:34.289');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9pu000uhw8vh5mhsmgm','cmndnp9pu000shw8vgglzagdg','98327f1e-79ef-4da5-8b06-64bf40b851a6','Mestre navalha com técnicas portuguesas. O barbeiro mais premiado da região.','https://api.dicebear.com/7.x/avataaars/svg?seed=Andre','Navalha, Barboterapia','2026-03-30 20:44:34.291','2026-03-30 20:44:34.291');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9q1000xhw8vp1tgas2g','cmndnp9q1000vhw8vmoe5a8ra','98327f1e-79ef-4da5-8b06-64bf40b851a6','Precisão cirúrgica no acabamento. Especialista em linhas e contornos.','https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno','Acabamento, Pézinho','2026-03-30 20:44:34.297','2026-03-30 20:44:34.297');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9q30010hw8vm1lkyrzv','cmndnp9q3000yhw8vlraov0rg','efe3b7b4-2e86-4567-afd1-1c40bca6f4e6','Formado em Londres pela Academy of Barbering. Traz o verdadeiro estilo inglês para o Brasil.','https://api.dicebear.com/7.x/avataaars/svg?seed=William','Estilo britânico, Wet Shave','2026-03-30 20:44:34.299','2026-03-30 20:44:34.299');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9q50013hw8va3efekt4','cmndnp9q40011hw8vsergl4xq','efe3b7b4-2e86-4567-afd1-1c40bca6f4e6','Especialista em técnicas de relaxamento e massagem craniana. Experiência de 8 anos.','https://api.dicebear.com/7.x/avataaars/svg?seed=James','Massagem capilar, Relaxamento','2026-03-30 20:44:34.301','2026-03-30 20:44:34.301');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9q60016hw8v11kxuf43','cmndnp9q60014hw8v7u0bjsy3','aef37109-5da7-4524-903b-38aa1fa15087','Velocidade sem perder a qualidade. Recorde de 200 cortes em uma semana.','https://api.dicebear.com/7.x/avataaars/svg?seed=Diego','Express Cut, Hidratação','2026-03-30 20:44:34.303','2026-03-30 20:44:34.303');
INSERT INTO `Barber` (`id`, `userId`, `barbershopId`, `bio`, `avatarUrl`, `specialty`, `createdAt`, `updatedAt`) VALUES ('cmndnp9q80019hw8vfo2hxxps','cmndnp9q80017hw8v7xkd1yok','aef37109-5da7-4524-903b-38aa1fa15087','Pioneiro em estética masculina em SP. Especialista em sobrancelha e cuidados com a pele.','https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe','Sobrancelha, Estética masculina','2026-03-30 20:44:34.304','2026-03-30 20:44:34.304');
/*!40000 ALTER TABLE `Barber` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Barbershop`
--

DROP TABLE IF EXISTS `Barbershop`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Barbershop` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `address` varchar(191) NOT NULL,
  `phones` text NOT NULL,
  `description` text NOT NULL,
  `imageUrl` text NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Barbershop`
--

LOCK TABLES `Barbershop` WRITE;
/*!40000 ALTER TABLE `Barbershop` DISABLE KEYS */;
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('98327f1e-79ef-4da5-8b06-64bf40b851a6','Barba & Navalha','Rua Oscar Freire, 789 — Jardins, SP','[\"(11) 93333-3333\",\"(11) 3333-3333\"]','Especialistas em técnicas de navalha, somos o destino dos homens que prezam pelo cuidado com a barba. Utilizamos produtos artesanais importados e técnicas tradicionais portuguesas para um resultado impecável.','https://utfs.io/f/5832df58-cfd7-4b3f-b102-42b7e150ced2-16r.png','2026-03-30 20:44:34.228','2026-03-30 20:44:34.228');
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('a14ab693-3954-416b-af8c-a072952eeee6','Barbearia Vintage','Rua das Flores, 123 — Vila Madalena, SP','[\"(11) 91111-1111\",\"(11) 3111-1111\"]','Clássica e sofisticada, a Barbearia Vintage resgata o charme dos salões dos anos 50. Ambiente aconchegante com cadeiras de couro, música jazz e atendimento personalizado. Cada visita é uma viagem no tempo.','https://utfs.io/f/c97a2dc9-cf62-468b-a851-bfd2bdde775f-16p.png','2026-03-30 20:44:34.218','2026-03-30 20:44:34.218');
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('aef37109-5da7-4524-903b-38aa1fa15087','Estilo Urbano','Av. Brigadeiro Faria Lima, 202 — Itaim Bibi, SP','[\"(11) 95555-5555\",\"(11) 3555-5555\"]','Pensada para o homem moderno e agitado, a Estilo Urbano oferece atendimento rápido sem abrir mão da qualidade. Agendamento online, wifi liberado e serviço expresso para quem não tem tempo a perder.','https://utfs.io/f/178da6b6-6f9a-424a-be9d-a2feb476eb36-16t.png','2026-03-30 20:44:34.241','2026-03-30 20:44:34.241');
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('bd45ac45-705d-4aed-b16e-dcb3fc56d7bf','Corte & Estilo','Av. Paulista, 456 — Bela Vista, SP','[\"(11) 92222-2222\",\"(11) 3222-2222\"]','Moderna e conectada com as tendências mundiais, a Corte & Estilo é referência em cortes contemporâneos. Nossa equipe acompanha os últimos lançamentos das semanas de moda para trazer o que há de mais atual.','https://utfs.io/f/45331760-899c-4b4b-910e-e00babb6ed81-16q.png','2026-03-30 20:44:34.225','2026-03-30 20:44:34.225');
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('e873d3ba-f38b-4b4c-b496-4924eb290998','Barbarock','rua a n 123','[\"4499999999\"]','Uma barbearia','https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png','2026-04-02 12:13:58.891','2026-04-02 12:13:58.891');
INSERT INTO `Barbershop` (`id`, `name`, `address`, `phones`, `description`, `imageUrl`, `createdAt`, `updatedAt`) VALUES ('efe3b7b4-2e86-4567-afd1-1c40bca6f4e6','The Dapper Den','Rua Augusta, 101 — Consolação, SP','[\"(11) 94444-4444\",\"(11) 3444-4444\"]','Estilo britânico no coração de São Paulo. Whisky na entrada, música blues ao fundo e barbeiros certificados em Londres. Para o homem que leva sua aparência a sério e não abre mão do melhor.','https://utfs.io/f/7e309eaa-d722-465b-b8b6-76217404a3d3-16s.png','2026-03-30 20:44:34.232','2026-03-30 20:44:34.232');
/*!40000 ALTER TABLE `Barbershop` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BarbershopAdmin`
--

DROP TABLE IF EXISTS `BarbershopAdmin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BarbershopAdmin` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `barbershopId` varchar(191) NOT NULL,
  `assignedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `BarbershopAdmin_userId_key` (`userId`),
  UNIQUE KEY `BarbershopAdmin_barbershopId_key` (`barbershopId`),
  CONSTRAINT `BarbershopAdmin_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `BarbershopAdmin_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BarbershopAdmin`
--

LOCK TABLES `BarbershopAdmin` WRITE;
/*!40000 ALTER TABLE `BarbershopAdmin` DISABLE KEYS */;
INSERT INTO `BarbershopAdmin` (`id`, `userId`, `barbershopId`, `assignedAt`) VALUES ('cmndnp9oj0003hw8v46u4k4lk','cmndnp9oj0001hw8vkm5qbbug','a14ab693-3954-416b-af8c-a072952eeee6','2026-03-30 20:44:34.244');
INSERT INTO `BarbershopAdmin` (`id`, `userId`, `barbershopId`, `assignedAt`) VALUES ('cmndnp9ol0006hw8vk23iih38','cmndnp9ol0004hw8vuh4v2feq','bd45ac45-705d-4aed-b16e-dcb3fc56d7bf','2026-03-30 20:44:34.246');
INSERT INTO `BarbershopAdmin` (`id`, `userId`, `barbershopId`, `assignedAt`) VALUES ('cmndnp9ow0009hw8vig95634u','cmndnp9ow0007hw8vfpkxuzdw','98327f1e-79ef-4da5-8b06-64bf40b851a6','2026-03-30 20:44:34.256');
INSERT INTO `BarbershopAdmin` (`id`, `userId`, `barbershopId`, `assignedAt`) VALUES ('cmndnp9p9000chw8vm6igt85x','cmndnp9p9000ahw8vbk1l2o3e','efe3b7b4-2e86-4567-afd1-1c40bca6f4e6','2026-03-30 20:44:34.269');
INSERT INTO `BarbershopAdmin` (`id`, `userId`, `barbershopId`, `assignedAt`) VALUES ('cmndnp9pe000fhw8vzd8jdlwp','cmndnp9pe000dhw8vj0jgkf1b','aef37109-5da7-4524-903b-38aa1fa15087','2026-03-30 20:44:34.274');
/*!40000 ALTER TABLE `BarbershopAdmin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `BarbershopService`
--

DROP TABLE IF EXISTS `BarbershopService`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `BarbershopService` (
  `id` varchar(191) NOT NULL,
  `name` varchar(191) NOT NULL,
  `description` text NOT NULL,
  `imageUrl` text NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `barbershopId` varchar(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `BarbershopService_barbershopId_fkey` (`barbershopId`),
  CONSTRAINT `BarbershopService_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `BarbershopService`
--

LOCK TABLES `BarbershopService` WRITE;
/*!40000 ALTER TABLE `BarbershopService` DISABLE KEYS */;
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('072b2315-4ef7-436d-a5c3-d74d30ed4d9c','Corte Clássico','Corte tradicional com tesoura e pente, acabamento com navalha e loção pós-barba.','https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',65.00,'a14ab693-3954-416b-af8c-a072952eeee6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('0a182d1a-ea40-4f87-bf17-4b5954c4b870','Barba Completa','Modelagem de barba com navalha quente, toalha quente e balm hidratante.','https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',45.00,'a14ab693-3954-416b-af8c-a072952eeee6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('0eb6f393-5458-4bdd-97f8-23fa664c7ced','Design de Barba','Contorno artístico da barba com navalha, finalizando com óleo de argan premium.','https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',50.00,'bd45ac45-705d-4aed-b16e-dcb3fc56d7bf');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('1d66360e-c20b-4507-bbae-851a309117f0','Gentleman\'s Shave','Barbear à moda antiga: escuma em brocha, toalha quente dupla e loção Penhaligon\'s.','https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',110.00,'efe3b7b4-2e86-4567-afd1-1c40bca6f4e6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('2d9ef6cd-1d31-4858-b3f1-e4cd59a0d7aa','Corte Navalha','Corte inteiramente executado com navalha. Técnica rara para quem quer exclusividade.','https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',85.00,'98327f1e-79ef-4da5-8b06-64bf40b851a6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('334674a8-28c8-4808-8daa-2d4b0d5d5f2b','Barboterapia','Ritual completo: esfoliação, vapor quente, navalha e máscara hidratante para pele e barba.','https://utfs.io/f/e6bdffb6-24a9-455b-aba3-903c2c2b5bde-1jo6tu.png',90.00,'98327f1e-79ef-4da5-8b06-64bf40b851a6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('3685319c-c5a1-44ef-954a-a57b7a18d7f4','Express Cut','Corte rápido e preciso em até 20 minutos. Ideal para o profissional que tem hora marcada.','https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',55.00,'aef37109-5da7-4524-903b-38aa1fa15087');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('3b302bc0-c8c1-4fe0-accc-d5fdb4e5a364','Pézinho & Acabamento','Definição de linha do pescoço e contorno lateral com precisão de navalha.','https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png',35.00,'98327f1e-79ef-4da5-8b06-64bf40b851a6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('68b3973d-d53d-4b21-af03-d2c8cf217ff8','Sobrancelha Masculina','Design e aparagem de sobrancelha com pinça e navalha para um olhar definido.','https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png',25.00,'aef37109-5da7-4524-903b-38aa1fa15087');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('8a552d0c-7581-41b7-bc6e-f04828f54010','Combo Vintage','Corte + barba + sobrancelha + hidratação capilar. O pacote completo do gentleman.','https://utfs.io/f/2118f76e-89e4-43e6-87c9-8f157500c333-b0ps0b.png',120.00,'a14ab693-3954-416b-af8c-a072952eeee6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('8e5f82ea-c830-4640-8c38-8c82f11fe44b','Head Massage','Massagem craniana relaxante com óleos essenciais. 30 minutos de puro relaxamento.','https://utfs.io/f/c4919193-a675-4c47-9f21-ebd86d1c8e6a-4oen2a.png',75.00,'efe3b7b4-2e86-4567-afd1-1c40bca6f4e6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('963c545c-e7b4-45ee-9348-a6dcc738eff4','Platinado & Tintura','Coloração profissional, descoloração ou mechas. Transforme seu visual com segurança.','https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png',180.00,'bd45ac45-705d-4aed-b16e-dcb3fc56d7bf');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('99b4b662-47e3-4f06-a482-c73784becbed','The British Cut','Corte no estilo inglês side-part com cera natural e secagem com escova round.','https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',95.00,'efe3b7b4-2e86-4567-afd1-1c40bca6f4e6');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('c8c674c6-9647-4ffc-ad1f-2fe73c8cc38d','Hidratação Capilar','Tratamento intensivo com máscara nutritiva, vapor e finalização com leave-in.','https://utfs.io/f/8a457cda-f768-411d-a737-cdb23ca6b9b5-b3pegf.png',60.00,'aef37109-5da7-4524-903b-38aa1fa15087');
INSERT INTO `BarbershopService` (`id`, `name`, `description`, `imageUrl`, `price`, `barbershopId`) VALUES ('db66ed24-4afe-4af4-ad67-ac38c9bd7da3','Fade Moderno','Degradê perfeito com máquina, finalizado com pomada matte para looks contemporâneos.','https://utfs.io/f/0ddfbd26-a424-43a0-aaf3-c3f1dc6be6d1-1kgxo7.png',70.00,'bd45ac45-705d-4aed-b16e-dcb3fc56d7bf');
/*!40000 ALTER TABLE `BarbershopService` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Booking`
--

DROP TABLE IF EXISTS `Booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Booking` (
  `id` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `serviceId` varchar(191) NOT NULL,
  `date` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Booking_userId_fkey` (`userId`),
  KEY `Booking_serviceId_fkey` (`serviceId`),
  CONSTRAINT `Booking_serviceId_fkey` FOREIGN KEY (`serviceId`) REFERENCES `BarbershopService` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Booking_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Booking`
--

LOCK TABLES `Booking` WRITE;
/*!40000 ALTER TABLE `Booking` DISABLE KEYS */;
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('1e93857d-a5d0-421c-8ac3-f003f9dbe686','cmndnp9qc001chw8vyab7knpn','68b3973d-d53d-4b21-af03-d2c8cf217ff8','2026-04-09 16:30:00.000','2026-03-30 20:44:34.319','2026-03-30 20:44:34.319');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('5edf4f8c-3381-4228-973a-030379410aea','cmndnp9qb001bhw8vl96akt3k','db66ed24-4afe-4af4-ad67-ac38c9bd7da3','2026-03-23 17:30:00.000','2026-03-30 20:44:34.314','2026-03-30 20:44:34.314');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('7b29d2ec-4eb1-4db4-8c17-cfb33c20b685','cmndnp9qc001chw8vyab7knpn','334674a8-28c8-4808-8daa-2d4b0d5d5f2b','2026-03-23 15:00:00.000','2026-03-30 20:44:34.317','2026-03-30 20:44:34.317');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('8e1e0732-aaab-433f-8b96-ca43e84d2a80','cmndnp9qa001ahw8vxqltyyp3','072b2315-4ef7-436d-a5c3-d74d30ed4d9c','2026-03-23 10:30:00.000','2026-03-30 20:44:34.310','2026-03-30 20:44:34.310');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('aa2a04af-47c2-4b63-8227-b7a35905cea5','cmndnp9qb001bhw8vl96akt3k','334674a8-28c8-4808-8daa-2d4b0d5d5f2b','2026-04-02 10:00:00.000','2026-03-30 20:44:34.315','2026-03-30 20:44:34.315');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('ae19b20c-fc57-4225-b347-2cb06bcff3dd','cmndnp9qa001ahw8vxqltyyp3','3b302bc0-c8c1-4fe0-accc-d5fdb4e5a364','2026-04-09 09:00:00.000','2026-03-30 20:44:34.312','2026-03-30 20:44:34.312');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('c49532ee-0810-4e9f-a7a3-acf317279a63','cmndnp9qa001ahw8vxqltyyp3','0eb6f393-5458-4bdd-97f8-23fa664c7ced','2026-04-02 15:30:00.000','2026-03-30 20:44:34.311','2026-03-30 20:44:34.311');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('ef63c1a9-0c98-4a70-a88f-6f433ad25209','cmndnp9qc001chw8vyab7knpn','1d66360e-c20b-4507-bbae-851a309117f0','2026-04-02 17:30:00.000','2026-03-30 20:44:34.318','2026-03-30 20:44:34.318');
INSERT INTO `Booking` (`id`, `userId`, `serviceId`, `date`, `createdAt`, `updatedAt`) VALUES ('f22527e3-931c-4b58-aa4c-df680dcf12cd','cmndnp9qb001bhw8vl96akt3k','1d66360e-c20b-4507-bbae-851a309117f0','2026-04-09 16:00:00.000','2026-03-30 20:44:34.316','2026-03-30 20:44:34.316');
/*!40000 ALTER TABLE `Booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `PaymentConfig`
--

DROP TABLE IF EXISTS `PaymentConfig`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `PaymentConfig` (
  `id` varchar(191) NOT NULL,
  `barbershopId` varchar(191) NOT NULL,
  `mpAccessToken` longtext DEFAULT NULL,
  `mpPublicKey` longtext DEFAULT NULL,
  `mpWebhookSecret` longtext DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `PaymentConfig_barbershopId_key` (`barbershopId`),
  CONSTRAINT `PaymentConfig_barbershopId_fkey` FOREIGN KEY (`barbershopId`) REFERENCES `Barbershop` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `PaymentConfig`
--

LOCK TABLES `PaymentConfig` WRITE;
/*!40000 ALTER TABLE `PaymentConfig` DISABLE KEYS */;
/*!40000 ALTER TABLE `PaymentConfig` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Session`
--

DROP TABLE IF EXISTS `Session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Session` (
  `sessionToken` varchar(191) NOT NULL,
  `userId` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  UNIQUE KEY `Session_sessionToken_key` (`sessionToken`),
  KEY `Session_userId_fkey` (`userId`),
  CONSTRAINT `Session_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Session`
--

LOCK TABLES `Session` WRITE;
/*!40000 ALTER TABLE `Session` DISABLE KEYS */;
/*!40000 ALTER TABLE `Session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `name` varchar(191) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,
  `emailVerified` datetime(3) DEFAULT NULL,
  `image` text DEFAULT NULL,
  `password` varchar(191) DEFAULT NULL,
  `role` enum('CUSTOMER','BARBER','ADMIN','SUPERADMIN') NOT NULL DEFAULT 'CUSTOMER',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9no0000hw8vgpfvl2pf','superadmin@fswbarber.com','Super Admin','2026-03-30 20:44:34.212','2026-03-30 20:44:34.212','2026-03-30 20:44:34.210','https://api.dicebear.com/7.x/avataaars/svg?seed=SuperAdmin','$2b$10$ol3E9AYzF1xAlsulnspqvOtLCNGWtH6lGtSk.JFrq./FB5uiXEBxW','SUPERADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9oj0001hw8vkm5qbbug','admin.vintage@fswbarber.com','Carlos Mendonça','2026-03-30 20:44:34.244','2026-03-30 20:44:34.244','2026-03-30 20:44:34.243','https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos','$2b$10$iyoOX6K/rEDTxKpGyZOAaOyZpHmLAhjR5QBY3XVv8mIK/95q2RtEi','ADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9ol0004hw8vuh4v2feq','admin.corteeestilo@fswbarber.com','Fernanda Lima','2026-03-30 20:44:34.246','2026-03-30 20:44:34.246','2026-03-30 20:44:34.245','https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda','$2b$10$iyoOX6K/rEDTxKpGyZOAaOyZpHmLAhjR5QBY3XVv8mIK/95q2RtEi','ADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9ow0007hw8vfpkxuzdw','admin.barbaenavalha@fswbarber.com','Roberto Souza','2026-03-30 20:44:34.256','2026-03-30 20:44:34.256','2026-03-30 20:44:34.255','https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto','$2b$10$iyoOX6K/rEDTxKpGyZOAaOyZpHmLAhjR5QBY3XVv8mIK/95q2RtEi','ADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9p9000ahw8vbk1l2o3e','admin.dapperde@fswbarber.com','Patricia Alves','2026-03-30 20:44:34.269','2026-03-30 20:44:34.269','2026-03-30 20:44:34.268','https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia','$2b$10$iyoOX6K/rEDTxKpGyZOAaOyZpHmLAhjR5QBY3XVv8mIK/95q2RtEi','ADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9pe000dhw8vj0jgkf1b','admin.estilourbano@fswbarber.com','Marcos Oliveira','2026-03-30 20:44:34.274','2026-03-30 20:44:34.274','2026-03-30 20:44:34.273','https://api.dicebear.com/7.x/avataaars/svg?seed=Marcos','$2b$10$iyoOX6K/rEDTxKpGyZOAaOyZpHmLAhjR5QBY3XVv8mIK/95q2RtEi','ADMIN');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9pm000ghw8vr9t022ez','joao.navarro@fswbarber.com','João Navarro','2026-03-30 20:44:34.282','2026-03-30 20:44:34.282','2026-03-30 20:44:34.281','https://api.dicebear.com/7.x/avataaars/svg?seed=Joao','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9po000jhw8vbjt0ulir','miguel.santos@fswbarber.com','Miguel Santos','2026-03-30 20:44:34.285','2026-03-30 20:44:34.285','2026-03-30 20:44:34.284','https://api.dicebear.com/7.x/avataaars/svg?seed=Miguel','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9pq000mhw8vjyyi8wrs','rafael.costa@fswbarber.com','Rafael Costa','2026-03-30 20:44:34.287','2026-03-30 20:44:34.287','2026-03-30 20:44:34.286','https://api.dicebear.com/7.x/avataaars/svg?seed=Rafael','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9ps000phw8vyftz7z59','lucas.ferreira@fswbarber.com','Lucas Ferreira','2026-03-30 20:44:34.289','2026-03-30 20:44:34.289','2026-03-30 20:44:34.288','https://api.dicebear.com/7.x/avataaars/svg?seed=Lucas','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9pu000shw8vgglzagdg','andre.rocha@fswbarber.com','André Rocha','2026-03-30 20:44:34.291','2026-03-30 20:44:34.291','2026-03-30 20:44:34.290','https://api.dicebear.com/7.x/avataaars/svg?seed=Andre','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9q1000vhw8vmoe5a8ra','bruno.carvalho@fswbarber.com','Bruno Carvalho','2026-03-30 20:44:34.297','2026-03-30 20:44:34.297','2026-03-30 20:44:34.296','https://api.dicebear.com/7.x/avataaars/svg?seed=Bruno','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9q3000yhw8vlraov0rg','william.clarke@fswbarber.com','William Clarke','2026-03-30 20:44:34.299','2026-03-30 20:44:34.299','2026-03-30 20:44:34.298','https://api.dicebear.com/7.x/avataaars/svg?seed=William','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9q40011hw8vsergl4xq','james.hunter@fswbarber.com','James Hunter','2026-03-30 20:44:34.301','2026-03-30 20:44:34.301','2026-03-30 20:44:34.300','https://api.dicebear.com/7.x/avataaars/svg?seed=James','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9q60014hw8v7u0bjsy3','diego.martins@fswbarber.com','Diego Martins','2026-03-30 20:44:34.303','2026-03-30 20:44:34.303','2026-03-30 20:44:34.302','https://api.dicebear.com/7.x/avataaars/svg?seed=Diego','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9q80017hw8v7xkd1yok','felipe.nunes@fswbarber.com','Felipe Nunes','2026-03-30 20:44:34.304','2026-03-30 20:44:34.304','2026-03-30 20:44:34.304','https://api.dicebear.com/7.x/avataaars/svg?seed=Felipe','$2b$10$eR9P5kP0SPuDNTvpUSxpye1aSt1juBvE9xIrPeNQ5wDYQZLV0heZG','BARBER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9qa001ahw8vxqltyyp3','pedro.henrique@gmail.com','Pedro Henrique','2026-03-30 20:44:34.306','2026-03-30 20:44:34.306','2026-03-30 20:44:34.305','https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro',NULL,'CUSTOMER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9qb001bhw8vl96akt3k','gabriel.teixeira@gmail.com','Gabriel Teixeira','2026-03-30 20:44:34.307','2026-03-30 20:44:34.307','2026-03-30 20:44:34.307','https://api.dicebear.com/7.x/avataaars/svg?seed=Gabriel',NULL,'CUSTOMER');
INSERT INTO `User` (`id`, `email`, `name`, `createdAt`, `updatedAt`, `emailVerified`, `image`, `password`, `role`) VALUES ('cmndnp9qc001chw8vyab7knpn','thiago.barbosa@gmail.com','Thiago Barbosa','2026-03-30 20:44:34.309','2026-03-30 20:44:34.309','2026-03-30 20:44:34.308','https://api.dicebear.com/7.x/avataaars/svg?seed=Thiago',NULL,'CUSTOMER');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `VerificationToken`
--

DROP TABLE IF EXISTS `VerificationToken`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `VerificationToken` (
  `identifier` varchar(191) NOT NULL,
  `token` varchar(191) NOT NULL,
  `expires` datetime(3) NOT NULL,
  PRIMARY KEY (`identifier`,`token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `VerificationToken`
--

LOCK TABLES `VerificationToken` WRITE;
/*!40000 ALTER TABLE `VerificationToken` DISABLE KEYS */;
/*!40000 ALTER TABLE `VerificationToken` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('be72884f-ddc8-4f59-a0ec-887a936b408f','e3ac7604ae0f78a5847de4707fd09bff8510ab72f45deda1fa87b55b7c8aaa27','2026-03-30 20:44:24.653','20260330000000_add_roles_barbers_admins',NULL,NULL,'2026-03-30 20:44:24.630',1);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('c4d7daef-2c87-11f1-b99c-02fc00000005','manual_app_settings_payment','2026-04-02 12:30:17.000','20260402000000_add_app_settings_payment',NULL,NULL,'2026-04-02 12:30:17.000',1);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('e014245a-d806-4702-a3c4-3c9bf5063144','63ed6c3d7f675b2ebec3873a68595efbae3ef312e63a2b79a5de485a46f60ff2','2026-03-30 20:44:24.614','20240722004016_init_db',NULL,NULL,'2026-03-30 20:44:24.595',1);
INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES ('ed41af94-200a-4064-b714-e807e1d23974','fdaca4d225c74c069386b1afa4c3646492d5c9ee1780ba1d209847ab1c7a781b','2026-03-30 20:44:24.629','20240807232531_add_auth_tables',NULL,NULL,'2026-03-30 20:44:24.614',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-04-02 13:23:58
