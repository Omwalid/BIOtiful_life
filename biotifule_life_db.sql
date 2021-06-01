-- phpMyAdmin SQL Dump
-- version 5.0.2
-- https://www.phpmyadmin.net/
--
-- Host: 192.168.1.7:3306
-- Generation Time: Jun 01, 2021 at 10:26 AM
-- Server version: 5.7.34-0ubuntu0.18.04.1
-- PHP Version: 7.4.11

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `biotifule_life_db`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`omw`@`%` PROCEDURE `p_add_image` (IN `image_to_add` JSON)  NO SQL
BEGIN

DECLARE var_inserted_image INT;
DECLARE var_previous_image INT;
DECLARE var_previous_image_path VARCHAR(50);
DECLARE product_id INT;

SET product_id = JSON_UNQUOTE(JSON_EXTRACT(image_to_add,'$.product_id'));

INSERT INTO products_image (type, name, path)
VALUES (
JSON_UNQUOTE(JSON_EXTRACT(image_to_add,'$.type')),
JSON_UNQUOTE(JSON_EXTRACT(image_to_add,'$.name')),
JSON_UNQUOTE(JSON_EXTRACT(image_to_add,'$.path'))
);

SELECT LAST_INSERT_ID() into var_inserted_image;

SELECT image_id INTO var_previous_image 
FROM product 
WHERE id = product_id;

UPDATE product 
SET image_id = var_inserted_image 
WHERE id = product_id;

IF var_previous_image != 1 THEN

SELECT path INTO var_previous_image_path 
FROM products_image 
WHERE id = var_previous_image;

DELETE 
FROM products_image
WHERE id = var_previous_image;
SELECT true AS delete_previous, var_previous_image_path AS previous_image_path  ;
END IF;

SELECT false AS delete_previous;


END$$

CREATE DEFINER=`omw`@`%` PROCEDURE `p_add_order` (IN `order_to_add` JSON)  NO SQL
BEGIN

DECLARE var_product_id varchar(255);
DECLARE var_product_price float;
DECLARE var_product_quantity float;
DECLARE var_order_quantity float;
DECLARE var_order_cost float;


SET var_product_id = JSON_UNQUOTE(JSON_EXTRACT(order_to_add,'$.product_id'));

SET var_order_quantity = JSON_UNQUOTE(JSON_EXTRACT(order_to_add,'$.order_quantity'));

SELECT p.price INTO var_product_price
FROM product p WHERE p.id = var_product_id; 

SELECT p.quantity INTO var_product_quantity
FROM product p WHERE p.id = var_product_id;

IF var_product_quantity < var_order_quantity THEN
 SELECT false as added;
ELSE 
 SET var_order_cost = var_product_price * var_order_quantity;
 
 SET var_product_quantity = var_product_quantity - var_order_quantity;
 
 UPDATE product
 SET quantity = var_product_quantity WHERE id = var_product_id;
 
 INSERT INTO orders (user_id, product_id, quantity, cost, address,order_status_id)
VALUES (JSON_UNQUOTE(JSON_EXTRACT(order_to_add,'$.user_id')), var_product_id, var_order_quantity, var_order_cost, JSON_UNQUOTE(JSON_EXTRACT(order_to_add,'$.user_address')),   JSON_UNQUOTE(JSON_EXTRACT(order_to_add,'$.order_status_id'))); 

SELECT true as added, LAST_INSERT_ID() AS order_added_id;
END IF;
END$$

CREATE DEFINER=`omw`@`%` PROCEDURE `p_add_product` (IN `product_to_add` JSON)  NO SQL
BEGIN

DECLARE var_product_type varchar(255);
DECLARE var_type_id int;

SET var_product_type = JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.product_type'));

CASE var_product_type
WHEN 'fruits' THEN SET var_type_id = 1;
WHEN 'vegetables' THEN SET var_type_id = 2;
ELSE SET var_type_id = 3;
END CASE;

INSERT INTO product (name, type_id, unit_of_measure, quantity, price, description, image_id)
VALUES (JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.product_name')), var_type_id, JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.unit_of_measure')), JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.product_quantity')), JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.product_price')), JSON_UNQUOTE(JSON_EXTRACT(product_to_add,'$.product_description')), 1); 

SELECT LAST_INSERT_ID() AS product_added_id;
END$$

CREATE DEFINER=`omw`@`%` PROCEDURE `p_delete_product` (IN `product_to_delete` JSON)  NO SQL
BEGIN

DELETE FROM product WHERE id = JSON_UNQUOTE(JSON_EXTRACT(product_to_delete,'$.product_id')) AND name = JSON_UNQUOTE(JSON_EXTRACT(product_to_delete,'$.product_name')) ;

END$$

CREATE DEFINER=`omw`@`%` PROCEDURE `p_update_order_status` (IN `order_to_update` JSON)  NO SQL
BEGIN

UPDATE orders 

SET order_status_id = JSON_UNQUOTE(JSON_EXTRACT(order_to_update,'$.order_order_status_id'))
WHERE id = JSON_UNQUOTE(JSON_EXTRACT(order_to_update,'$.order_id'));
END$$

CREATE DEFINER=`omw`@`%` PROCEDURE `p_update_product` (IN `product_to_update` JSON)  NO SQL
BEGIN

UPDATE product

SET quantity=JSON_UNQUOTE(JSON_EXTRACT(product_to_update,'$.product_quantity')),
price= JSON_UNQUOTE(JSON_EXTRACT(product_to_update,'$.product_price')),
description=JSON_UNQUOTE(JSON_EXTRACT(product_to_update,'$.product_description'))

WHERE id= JSON_UNQUOTE(JSON_EXTRACT(product_to_update,'$.product_id')) AND name = JSON_UNQUOTE(JSON_EXTRACT(product_to_update,'$.product_name'));
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` float NOT NULL,
  `cost` float NOT NULL,
  `address` varchar(100) NOT NULL,
  `order_status_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `product_id`, `quantity`, `cost`, `address`, `order_status_id`) VALUES
(13, 3, 1, 1, 50, 'local', 2);

-- --------------------------------------------------------

--
-- Table structure for table `order_status`
--

CREATE TABLE `order_status` (
  `id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `order_status`
--

INSERT INTO `order_status` (`id`, `status`) VALUES
(1, 'not yet'),
(2, 'in progress'),
(3, 'delivered');

-- --------------------------------------------------------

--
-- Table structure for table `product`
--

CREATE TABLE `product` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `type_id` int(11) NOT NULL,
  `unit_of_measure` varchar(50) NOT NULL,
  `quantity` float NOT NULL,
  `price` float NOT NULL,
  `description` varchar(1000) NOT NULL,
  `image_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `product`
--

INSERT INTO `product` (`id`, `name`, `type_id`, `unit_of_measure`, `quantity`, `price`, `description`, `image_id`) VALUES
(1, 'orange', 1, 'kg', 55, 50, 'A local orange from misserghine _ Oran', 1),
(2, 'Tomato', 2, 'kg', 28, 40, 'Tomato of Kristel', 1),
(3, 'Green Salad', 2, 'kg', 0, 25, 'Green Salad of Kristel', 1),
(8, 'eggs', 3, 'pack of 6', 9, 100, 'eggs of arabs', 1);

-- --------------------------------------------------------

--
-- Table structure for table `products_image`
--

CREATE TABLE `products_image` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `name` varchar(50) NOT NULL,
  `path` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `products_image`
--

INSERT INTO `products_image` (`id`, `type`, `name`, `path`) VALUES
(1, 'image/png', 'noprdImage.png', '1621592160674-product-noprdImage.png');

-- --------------------------------------------------------

--
-- Table structure for table `product_type`
--

CREATE TABLE `product_type` (
  `id` int(11) NOT NULL,
  `product_type` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `product_type`
--

INSERT INTO `product_type` (`id`, `product_type`) VALUES
(1, 'fruits'),
(2, 'vegetables'),
(3, 'others');

-- --------------------------------------------------------

--
-- Table structure for table `role`
--

CREATE TABLE `role` (
  `role_id` int(11) NOT NULL,
  `role_name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `role`
--

INSERT INTO `role` (`role_id`, `role_name`) VALUES
(1, 'admin'),
(2, 'distributor'),
(3, 'customer');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `fullName` varchar(50) NOT NULL,
  `userName` varchar(50) NOT NULL,
  `email` varchar(50) NOT NULL,
  `password` varchar(100) NOT NULL,
  `role_id` int(11) NOT NULL,
  `phone_number` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `fullName`, `userName`, `email`, `password`, `role_id`, `phone_number`) VALUES
(3, 'walid', 'omw', 'test@omw.com', '$2a$10$lene4NhOTryvYq0ck.Au4OiJ6sydInkixN2vmRJ4Z59Q9YDOVQBbS', 3, 41403131),
(8, 'admin', 'admin', 'admin@omw.com', '$2a$10$/ykfGDd5aVi4wrSs0thzOOqYKThokdlwTu.QqpRZ1bpgm63Oo8Wb.', 1, 0);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_get_orders_for_admin`
-- (See below for the actual view)
--
CREATE TABLE `v_get_orders_for_admin` (
`id` int(11)
,`userName` varchar(50)
,`name` varchar(50)
,`quantity` float
,`unit_of_measure` varchar(50)
,`cost` float
,`address` varchar(100)
,`phone_number` int(11)
,`order_status` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_get_orders_for_user`
-- (See below for the actual view)
--
CREATE TABLE `v_get_orders_for_user` (
`id` int(11)
,`user_id` int(11)
,`product_name` varchar(50)
,`quantity` float
,`unit_of_measure` varchar(50)
,`cost` float
,`order_status` varchar(50)
,`image_path` varchar(50)
);

-- --------------------------------------------------------

--
-- Stand-in structure for view `v_get_stock`
-- (See below for the actual view)
--
CREATE TABLE `v_get_stock` (
`id` int(11)
,`name` varchar(50)
,`product_type` varchar(50)
,`quantity` float
,`unit_of_measure` varchar(50)
,`price` float
,`description` varchar(1000)
,`image_name` varchar(50)
,`image_path` varchar(50)
);

-- --------------------------------------------------------

--
-- Structure for view `v_get_orders_for_admin`
--
DROP TABLE IF EXISTS `v_get_orders_for_admin`;

CREATE ALGORITHM=UNDEFINED DEFINER=`omw`@`%` SQL SECURITY DEFINER VIEW `v_get_orders_for_admin`  AS  select `o`.`id` AS `id`,`u`.`userName` AS `userName`,`p`.`name` AS `name`,`o`.`quantity` AS `quantity`,`p`.`unit_of_measure` AS `unit_of_measure`,`o`.`cost` AS `cost`,`o`.`address` AS `address`,`u`.`phone_number` AS `phone_number`,`si`.`status` AS `order_status` from (((`orders` `o` join `product` `p`) join `users` `u`) join `order_status` `si`) where ((`o`.`product_id` = `p`.`id`) and (`o`.`user_id` = `u`.`id`) and (`o`.`order_status_id` = `si`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `v_get_orders_for_user`
--
DROP TABLE IF EXISTS `v_get_orders_for_user`;

CREATE ALGORITHM=UNDEFINED DEFINER=`omw`@`%` SQL SECURITY DEFINER VIEW `v_get_orders_for_user`  AS  select `o`.`id` AS `id`,`o`.`user_id` AS `user_id`,`p`.`name` AS `product_name`,`o`.`quantity` AS `quantity`,`p`.`unit_of_measure` AS `unit_of_measure`,`o`.`cost` AS `cost`,`si`.`status` AS `order_status`,`pi`.`path` AS `image_path` from (((`orders` `o` join `product` `p`) join `order_status` `si`) join `products_image` `pi`) where ((`o`.`product_id` = `p`.`id`) and (`o`.`order_status_id` = `si`.`id`) and (`p`.`image_id` = `pi`.`id`)) ;

-- --------------------------------------------------------

--
-- Structure for view `v_get_stock`
--
DROP TABLE IF EXISTS `v_get_stock`;

CREATE ALGORITHM=UNDEFINED DEFINER=`omw`@`%` SQL SECURITY DEFINER VIEW `v_get_stock`  AS  select `p`.`id` AS `id`,`p`.`name` AS `name`,`pt`.`product_type` AS `product_type`,`p`.`quantity` AS `quantity`,`p`.`unit_of_measure` AS `unit_of_measure`,`p`.`price` AS `price`,`p`.`description` AS `description`,`pi`.`name` AS `image_name`,`pi`.`path` AS `image_path` from ((`product` `p` join `product_type` `pt`) join `products_image` `pi`) where ((`p`.`type_id` = `pt`.`id`) and (`p`.`image_id` = `pi`.`id`)) ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `c_order_product` (`product_id`),
  ADD KEY `c_order_user` (`user_id`),
  ADD KEY `c_order_statusid` (`order_status_id`);

--
-- Indexes for table `order_status`
--
ALTER TABLE `order_status`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product`
--
ALTER TABLE `product`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD KEY `type_id` (`type_id`),
  ADD KEY `c_product_image` (`image_id`);

--
-- Indexes for table `products_image`
--
ALTER TABLE `products_image`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_type`
--
ALTER TABLE `product_type`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `role`
--
ALTER TABLE `role`
  ADD PRIMARY KEY (`role_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `user_role` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `order_status`
--
ALTER TABLE `order_status`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product`
--
ALTER TABLE `product`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `products_image`
--
ALTER TABLE `products_image`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `product_type`
--
ALTER TABLE `product_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `role`
--
ALTER TABLE `role`
  MODIFY `role_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `c_order_product` FOREIGN KEY (`product_id`) REFERENCES `product` (`id`),
  ADD CONSTRAINT `c_order_statusid` FOREIGN KEY (`order_status_id`) REFERENCES `order_status` (`id`),
  ADD CONSTRAINT `c_order_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `product`
--
ALTER TABLE `product`
  ADD CONSTRAINT `c_product_image` FOREIGN KEY (`image_id`) REFERENCES `products_image` (`id`),
  ADD CONSTRAINT `c_product_type` FOREIGN KEY (`type_id`) REFERENCES `product_type` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `user_role` FOREIGN KEY (`role_id`) REFERENCES `role` (`role_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
