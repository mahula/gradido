CREATE TABLE `node_servers` (
 `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
 `url` VARCHAR(255) NOT NULL,
 `port` INT UNSIGNED NOT NULL,
 `group_id` INT UNSIGNED NULL DEFAULT '0',
 `server_type` INT UNSIGNED NOT NULL DEFAULT '0',
 `node_hedera_id` INT UNSIGNED NULL DEFAULT '0',
 `last_live_sign` DATETIME NOT NULL DEFAULT '2000-01-01 00:00:00',
 PRIMARY KEY (`id`)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4;