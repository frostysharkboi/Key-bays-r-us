-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Apr 20, 2026 at 04:37 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `keybay`
--

DROP DATABASE IF EXISTS keybay;
CREATE DATABASE keybay;
USE keybay;

-- --------------------------------------------------------

--
-- Table structure for table `applications`
--

CREATE TABLE `applications` (
  `id` int(11) NOT NULL,
  `sender_id` int(11) NOT NULL,
  `request` mediumtext NOT NULL,
  `status` enum('awaiting','accepted','dismissed','') NOT NULL DEFAULT 'awaiting',
  `handler_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `games`
--

CREATE TABLE `games` (
  `id` int(10) NOT NULL,
  `title` VARCHAR(100) NOT NULL,
  `developer` VARCHAR(100) NOT NULL,
  `publisher` VARCHAR(100) NOT NULL,
  `about` mediumtext DEFAULT NULL,
  `steam_rating` enum('5','4','3','2','1') NOT NULL,
  `release_date` date NOT NULL DEFAULT current_timestamp(),
  `cover_img` varchar(100) DEFAULT NULL,
  `icon` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `games`
--
/** /
INSERT INTO `games` (`id`, `title`, `developer`, `publisher`, `about`, `release_date`, `cover_img`, `icon`) VALUES
(1, 'The Witcher 3: Wild Hunt', 'CD Projekt Red', 'CD Projekt', 'Open world RPG following monster hunter Geralt.', '2015-05-18', 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/292030/capsule_184x69.jpg'),
(2, 'Cyberpunk 2077', 'CD Projekt Red', 'CD Projekt', 'Futuristic RPG set in Night City.', '2020-12-10', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/capsule_184x69.jpg'),
(3, 'DOOM Eternal', 'id Software', 'Bethesda', 'Fast paced demon slaying FPS.', '2020-03-20', 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/782330/capsule_184x69.jpg'),
(4, 'Stardew Valley', 'ConcernedApe', 'ConcernedApe', 'Farming life simulator RPG.', '2016-02-26', 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/413150/capsule_184x69.jpg'),
(5, 'Terraria', 'Re-Logic', 'Re-Logic', '2D sandbox adventure game.', '2011-05-16', 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/105600/capsule_184x69.jpg'),
(6, 'Red Dead Redemption 2', 'Rockstar', 'Rockstar', 'Open world western adventure.', '2019-12-05', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1174180/capsule_184x69.jpg'),
(7, 'Elden Ring', 'FromSoftware', 'Bandai Namco', 'Dark fantasy action RPG.', '2022-02-25', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/capsule_184x69.jpg'),
(8, 'Valheim', 'Iron Gate', 'Coffee Stain', 'Viking survival sandbox.', '2021-02-02', 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/892970/capsule_184x69.jpg'),
(9, 'Phasmophobia', 'Kinetic Games', 'Kinetic Games', 'Multiplayer ghost hunting horror.', '2020-09-18', 'https://cdn.cloudflare.steamstatic.com/steam/apps/739630/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/739630/capsule_184x69.jpg'),
(10, 'Cities Skylines', 'Colossal Order', 'Paradox', 'City building simulation.', '2015-03-10', 'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/255710/capsule_184x69.jpg'),
(11, 'Factorio', 'Wube Software', 'Wube Software', 'Automation and factory building game.', '2020-08-14', 'https://cdn.cloudflare.steamstatic.com/steam/apps/427520/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/427520/capsule_184x69.jpg'),
(12, 'Hades', 'Supergiant Games', 'Supergiant', 'Roguelike action dungeon crawler.', '2020-09-17', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/1145360/capsule_184x69.jpg'),
(13, 'Subnautica', 'Unknown Worlds', 'Unknown Worlds', 'Underwater survival exploration.', '2018-01-23', 'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/264710/capsule_184x69.jpg'),
(14, 'Rust', 'Facepunch', 'Facepunch', 'Online survival sandbox.', '2018-02-08', 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/252490/capsule_184x69.jpg'),
(15, 'Portal 2', 'Valve', 'Valve', 'Puzzle platformer with portals.', '2011-04-19', 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/620/capsule_184x69.jpg'),
(16, 'Half-Life 2', 'Valve', 'Valve', 'Classic story driven FPS.', '2004-11-16', 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/220/capsule_184x69.jpg'),
(17, 'Counter Strike 2', 'Valve', 'Valve', 'Competitive tactical FPS.', '2023-09-27', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/730/capsule_184x69.jpg'),
(18, 'No Mans Sky', 'Hello Games', 'Hello Games', 'Space exploration sandbox.', '2016-08-12', 'https://cdn.cloudflare.steamstatic.com/steam/apps/275850/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/275850/capsule_184x69.jpg'),
(19, 'Dark Souls III', 'FromSoftware', 'Bandai Namco', 'Challenging action RPG.', '2016-04-12', 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/374320/capsule_184x69.jpg'),
(20, 'Among Us', 'Innersloth', 'Innersloth', 'Social deduction multiplayer.', '2018-11-16', 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/header.jpg', 'https://cdn.cloudflare.steamstatic.com/steam/apps/945360/capsule_184x69.jpg');
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `game_tags`
--

CREATE TABLE `game_tags` (
  `game_id` int(11) NOT NULL,
  `tag_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `game_tags`
--
/** /
INSERT INTO `game_tags` (`game_id`, `tag_id`) VALUES
(1, 1),
(1, 3),
(1, 5),
(2, 1),
(2, 2),
(2, 3),
(3, 2),
(3, 4),
(4, 8),
(4, 10),
(5, 10),
(5, 12),
(6, 2),
(6, 3),
(6, 5),
(7, 1),
(7, 2),
(8, 11),
(8, 12),
(9, 6),
(9, 9),
(10, 7),
(10, 8),
(11, 7),
(11, 12),
(12, 2),
(12, 10),
(13, 5),
(13, 11),
(14, 6),
(14, 11),
(15, 5),
(16, 4),
(16, 5),
(17, 4),
(17, 6),
(18, 3),
(18, 12),
(19, 1),
(19, 2),
(20, 6);
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `key_offers`
--

CREATE TABLE `key_offers` (
  `id` int(10) NOT NULL,
  `seller_id` int(10) NOT NULL,
  `game_id` int(10) NOT NULL,
  `game_key` varchar(64) NOT NULL,
  `other` varchar(100) DEFAULT NULL,
  `status` set('Active','Closed','Other') NOT NULL DEFAULT 'Active',
  `suggested_price` decimal(60,0) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `key_offers`
--
/** /
INSERT INTO `key_offers` (`id`, `seller_id`, `game_id`, `game_key`, `other`, `status`, `suggested_price`) VALUES
(1, 2, 1, 'WITCHER3-A1B2C-D3E4F', NULL, 'Active', 25),
(2, 2, 2, 'CYBERPUNK-A1B2C-D3E4F', NULL, 'Active', 40),
(3, 2, 7, 'ELDEN-A1B2C-D3E4F', NULL, 'Active', 45),
(4, 3, 3, 'DOOM-A1B2C-D3E4F', NULL, 'Active', 30),
(5, 3, 5, 'TERRARIA-A1B2C-D3E4F', NULL, 'Active', 10),
(6, 3, 6, 'RDR2-A1B2C-D3E4F', NULL, 'Active', 50),
(7, 2, 10, 'CITY-A1B2C-D3E4F', NULL, 'Active', 15),
(8, 3, 12, 'HADES-A1B2C-D3E4F', NULL, 'Active', 18),
(9, 2, 13, 'SUBNAUTICA-A1B2C', NULL, 'Active', 20),
(10, 3, 15, 'PORTAL2-A1B2C', NULL, 'Active', 8);
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `media`
--

CREATE TABLE `media` (
  `id` int(10) NOT NULL,
  `game_id` int(10) NOT NULL,
  `source` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `min_req`
--

CREATE TABLE `min_req` (
  `game_id` int(11) NOT NULL,
  `gpu` varchar(50) DEFAULT NULL,
  `cpu` varchar(50) DEFAULT NULL,
  `ram` int(11) DEFAULT NULL,
  `size` decimal(3,2) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `other` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `min_req`
--
/** /
INSERT INTO `min_req` (`game_id`, `gpu`, `cpu`, `ram`, `size`, `os`, `other`) VALUES
(1, 'GTX 660', 'i5-2500K', 6, 9.99, 'Windows 7 64-bit', NULL),
(2, 'GTX 780', 'i5-3570K', 8, 9.99, 'Windows 10 64-bit', NULL),
(3, 'GTX 970', 'i5-2500K', 8, 9.99, 'Windows 7 64-bit', NULL),
(4, 'Intel HD 4000', 'i3', 4, 1.00, 'Windows 7', NULL),
(5, 'Intel HD', 'Dual Core 2.0 GHz', 2, 0.50, 'Windows XP', NULL),
(6, 'GTX 770', 'i5-2500K', 8, 9.99, 'Windows 10 64-bit', NULL),
(7, 'GTX 1060', 'i5-8400', 12, 9.99, 'Windows 10', NULL),
(8, 'GTX 950', 'i5-2400', 8, 1.00, 'Windows 7', NULL),
(9, 'GTX 970', 'i5-4590', 8, 9.99, 'Windows 10', NULL),
(10, 'GTX 260', 'i5-750', 4, 4.00, 'Windows 7', NULL),
(11, 'GTX 750 Ti', 'i5-2300', 4, 3.00, 'Windows 7 64-bit', NULL),
(12, 'GTX 650', 'i5-2300', 4, 9.99, 'Windows 7', NULL),
(13, 'GTX 550 Ti', 'i5-2400', 8, 9.99, 'Windows 7 64-bit', NULL),
(14, 'GTX 670', 'i7-3770', 10, 9.99, 'Windows 8.1 64-bit', NULL),
(15, 'GTX 680', 'i3', 4, 8.00, 'Windows 7', NULL),
(16, 'DirectX 9 GPU', '1.7 GHz CPU', 1, 6.50, 'Windows XP', NULL),
(17, 'GTX 1060', 'i5-7500', 8, 9.99, 'Windows 10', NULL),
(18, 'GTX 480', 'i3', 8, 9.99, 'Windows 7', NULL),
(19, 'GTX 750 Ti', 'i3-2100', 4, 9.99, 'Windows 7 SP1', NULL),
(20, 'Intel HD', 'Dual Core', 4, 1.00, 'Windows 7', NULL);
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `opt_req`
--

CREATE TABLE `opt_req` (
  `game_id` int(11) NOT NULL,
  `gpu` varchar(50) DEFAULT NULL,
  `cpu` varchar(50) DEFAULT NULL,
  `ram` int(11) DEFAULT NULL,
  `size` decimal(3,2) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `other` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `opt_req`
--
/** /
INSERT INTO `opt_req` (`game_id`, `gpu`, `cpu`, `ram`, `size`, `os`, `other`) VALUES
(1, 'GTX 1060', 'i7-3770', 8, 9.99, 'Windows 10 64-bit', NULL),
(2, 'RTX 2060', 'i7-4790', 12, 9.99, 'Windows 10 64-bit', 'SSD recommended'),
(3, 'RTX 2060', 'i7-6700K', 16, 9.99, 'Windows 10', NULL),
(4, 'GTX 750', 'i5', 8, 1.00, 'Windows 10', NULL),
(5, 'GTX 560', 'Dual Core 3.0 GHz', 4, 0.50, 'Windows 7', NULL),
(6, 'RTX 2060', 'i7-4770K', 12, 9.99, 'Windows 10', NULL),
(7, 'RTX 3070', 'i7-8700K', 16, 9.99, 'Windows 10/11', NULL),
(8, 'GTX 1060', 'i7-4770', 16, 1.00, 'Windows 10', NULL),
(9, 'RTX 2060', 'i7-8700', 16, 9.99, 'Windows 10', NULL),
(10, 'GTX 660', 'i5-3470', 6, 4.00, 'Windows 10', NULL),
(11, 'GTX 1060', 'i7-3770', 8, 3.00, 'Windows 10', NULL),
(12, 'GTX 950', 'i5-3570K', 8, 9.99, 'Windows 10', NULL),
(13, 'GTX 1060', 'i7-7700K', 16, 9.99, 'Windows 10', NULL),
(14, 'RTX 2070', 'i7-4790K', 16, 9.99, 'Windows 10', NULL),
(15, 'GTX 1060', 'i5', 8, 8.00, 'Windows 10', NULL),
(16, 'DirectX 9 GPU', 'Pentium 4', 2, 6.50, 'Windows 7', NULL),
(17, 'RTX 3060', 'i7-9700K', 16, 9.99, 'Windows 11', NULL),
(18, 'GTX 1060', 'i5-8400', 16, 9.99, 'Windows 10', NULL),
(19, 'GTX 1060', 'i5-4690K', 8, 9.99, 'Windows 10', NULL),
(20, 'GTX 660', 'i5', 8, 1.00, 'Windows 10', NULL);
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `ratings`
--

CREATE TABLE `ratings` (
  `game_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` enum('5','4','3','2','1') NOT NULL,
  `other` mediumtext DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `ratings`
--
/** /
INSERT INTO `ratings` (`game_id`, `user_id`, `rating`, `other`) VALUES
(1, 4, '5', 'Masterpiece'),
(2, 4, '4', 'Good but buggy'),
(5, 6, '4', 'Very fun sandbox'),
(7, 5, '5', 'Incredible world'),
(12, 7, '5', 'Great gameplay'),
(15, 8, '5', 'Classic puzzle game');
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `tag` varchar(30) NOT NULL,
  `icon` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tags`
--

INSERT INTO `tags` (`id`, `tag`, `icon`) VALUES
(1, 'RPG', NULL),
(2, 'Action', NULL),
(3, 'Open World', NULL),
(4, 'FPS', NULL),
(5, 'Adventure', NULL),
(6, 'Multiplayer', NULL),
(7, 'Strategy', NULL),
(8, 'Simulation', NULL),
(9, 'Horror', NULL),
(10, 'Indie', NULL),
(11, 'Survival', NULL),
(12, 'Sandbox', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(10) NOT NULL,
  `offer_id` int(10) NOT NULL,
  `buyer_id` int(10) NOT NULL,
  `reciever-id` int(10) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `transactions`
--
/** /
INSERT INTO `transactions` (`id`, `offer_id`, `buyer_id`, `reciever-id`) VALUES
(1, 1, 4, 4),
(2, 3, 5, 5),
(3, 5, 6, 6),
(4, 8, 7, 7),
(5, 9, 8, 8);
/ **/
-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) NOT NULL,
  `login` varchar(20) NOT NULL,
  `pass` varchar(30) NOT NULL,
  `phone` varchar(12) DEFAULT NULL,
  `email` varchar(50) NOT NULL,
  `discord_tag` varchar(32) DEFAULT NULL,
  `other` mediumtext DEFAULT NULL,
  `type` enum('normal','seller','admin','banned','deleted') NOT NULL DEFAULT 'normal'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `login`, `pass`, `phone`, `email`, `discord_tag`, `other`, `type`) VALUES
(1, 'admin', 'admin123', NULL, 'admin@keybay.com', 'admin#0001', NULL, 'admin'),
(2, 'seller01', 'pass', NULL, 'seller01@mail.com', 'seller01#1001', NULL, 'seller'),
(3, 'seller02', 'pass', NULL, 'seller02@mail.com', 'seller02#1002', NULL, 'seller'),
(4, 'player01', 'pass', NULL, 'p1@mail.com', 'p1#2001', NULL, 'normal'),
(5, 'player02', 'pass', NULL, 'p2@mail.com', 'p2#2002', NULL, 'normal'),
(6, 'player03', 'pass', NULL, 'p3@mail.com', 'p3#2003', NULL, 'normal'),
(7, 'player04', 'pass', NULL, 'p4@mail.com', 'p4#2004', NULL, 'normal'),
(8, 'player05', 'pass', NULL, 'p5@mail.com', 'p5#2005', NULL, 'normal'),
(9, 'player06', 'pass', NULL, 'p6@mail.com', 'p6#2006', NULL, 'normal'),
(10, 'player07', 'pass', NULL, 'p7@mail.com', 'p7#2007', NULL, 'normal');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist`
--

CREATE TABLE `wishlist` (
  `user_id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `wishlist`
--
/** /
INSERT INTO `wishlist` (`user_id`, `game_id`) VALUES
(4, 7),
(4, 8),
(5, 1),
(5, 6),
(6, 3),
(7, 2),
(8, 10),
(9, 19),
(10, 18);
/ **/
--
-- Indexes for dumped tables
--

--
-- Indexes for table `applications`
--
ALTER TABLE `applications`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`) USING BTREE,
  ADD UNIQUE KEY `UNIQUE` (`id`);

--
-- Indexes for table `game_tags`
--
ALTER TABLE `game_tags`
  ADD PRIMARY KEY (`game_id`,`tag_id`),
  ADD KEY `id_gatunku` (`tag_id`);

--
-- Indexes for table `key_offers`
--
ALTER TABLE `key_offers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQUE` (`id`),
  ADD KEY `key_offers_ibfk_1` (`seller_id`),
  ADD KEY `key_offers_ibfk_2` (`game_id`);

--
-- Indexes for table `media`
--
ALTER TABLE `media`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`),
  ADD KEY `id_gry` (`game_id`);

--
-- Indexes for table `min_req`
--
ALTER TABLE `min_req`
  ADD PRIMARY KEY (`game_id`),
  ADD UNIQUE KEY `id_gry` (`game_id`);

--
-- Indexes for table `opt_req`
--
ALTER TABLE `opt_req`
  ADD PRIMARY KEY (`game_id`),
  ADD UNIQUE KEY `id_gry` (`game_id`);

--
-- Indexes for table `ratings`
--
ALTER TABLE `ratings`
  ADD PRIMARY KEY (`game_id`,`user_id`),
  ADD KEY `id_uzytkownika` (`user_id`);

--
-- Indexes for table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQUE` (`id`),
  ADD UNIQUE KEY `zewnętrzny1` (`offer_id`),
  ADD UNIQUE KEY `zewnętrzny2` (`buyer_id`),
  ADD KEY `id_otrzymujący` (`reciever-id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `UNIQUE` (`id`),
  ADD KEY `type_id` (`type`);

--
-- Indexes for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`user_id`,`game_id`),
  ADD KEY `wishlist_ibfk_2` (`game_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `applications`
--
ALTER TABLE `applications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `games`
--
ALTER TABLE `games`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `key_offers`
--
ALTER TABLE `key_offers`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `media`
--
ALTER TABLE `media`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `game_tags`
--
ALTER TABLE `game_tags`
  ADD CONSTRAINT `game_tags_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`),
  ADD CONSTRAINT `game_tags_ibfk_2` FOREIGN KEY (`tag_id`) REFERENCES `tags` (`id`);

--
-- Constraints for table `key_offers`
--
ALTER TABLE `key_offers`
  ADD CONSTRAINT `key_offers_ibfk_1` FOREIGN KEY (`seller_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `key_offers_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `media`
--
ALTER TABLE `media`
  ADD CONSTRAINT `media_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `min_req`
--
ALTER TABLE `min_req`
  ADD CONSTRAINT `min_req_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `opt_req`
--
ALTER TABLE `opt_req`
  ADD CONSTRAINT `opt_req_ibfk_1` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `ratings`
--
ALTER TABLE `ratings`
  ADD CONSTRAINT `ratings_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `ratings_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `transactions`
--
ALTER TABLE `transactions`
  ADD CONSTRAINT `transactions_ibfk_1` FOREIGN KEY (`offer_id`) REFERENCES `key_offers` (`id`),
  ADD CONSTRAINT `transactions_ibfk_2` FOREIGN KEY (`buyer_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `transactions_ibfk_3` FOREIGN KEY (`reciever-id`) REFERENCES `users` (`id`);

--
-- Constraints for table `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `wishlist_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `wishlist_ibfk_2` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`);

--
-- Constraints for table `media`
--
ALTER TABLE `applications`
  ADD CONSTRAINT `applications_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`),
  ADD CONSTRAINT `applications_ibfk_2` FOREIGN KEY (`handler_id`) REFERENCES `users` (`id`);

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;