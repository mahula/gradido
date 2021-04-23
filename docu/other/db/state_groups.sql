CREATE TABLE `state_groups` (
 `id` INT NOT NULL AUTO_INCREMENT,
 `index_id` VARBINARY(64) NOT NULL,
 `name` VARCHAR(50) NOT NULL,
 `root_public_key` BINARY(32) NOT NULL,
 `user_count` SMALLINT NOT NULL DEFAULT '0',
 PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin;