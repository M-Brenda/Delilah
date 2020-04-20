CREATE database DelilahResto;
USE delilahresto;

CREATE TABLE products( 
prod_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, 
prod_name VARCHAR(25) NOT NULL, 
prod_price INT UNSIGNED NOT NULL);

CREATE TABLE rols(
rol_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
rol_name VARCHAR(25) NOT NULL);

CREATE TABLE users ( 
user_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, 
user_name VARCHAR(25) NOT NULL, 
full_name VARCHAR(25) NOT NULL, 
email VARCHAR (25) NOT NULL, 
telephone VARCHAR(25) NOT NULL, 
address VARCHAR(30) NOT NULL, 
pass_user VARCHAR(25) NOT NULL, 
rol_id INT NOT NULL,
FOREIGN KEY (rol_id) REFERENCES rols(rol_id));

CREATE TABLE status_order (
status_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
status_name VARCHAR(25) NOT NULL);
 
CREATE TABLE payment (
payment_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
payment_type VARCHAR(25) NOT NULL);

CREATE TABLE order_header (
order_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
order_date DATE NOT NULL,
user_id INT NOT NULL,
payment_id INT NOT NULL,
status_id INT NOT NULL,
order_total  INT UNSIGNED NOT NULL,
FOREIGN KEY (user_id) REFERENCES users(user_id),
FOREIGN KEY (payment_id) REFERENCES payment(payment_id),
FOREIGN KEY (status_id) REFERENCES status_order(status_id)
);

CREATE TABLE order_items(
  item_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
  order_id  INT NOT NULL,
  prod_id   INT NOT NULL,
  item_cant INT UNSIGNED NOT NULL,
  item_price INT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES order_header(order_id),
  FOREIGN KEY (prod_id) REFERENCES products(prod_id)
);

INSERT INTO rols (rol_name)
VALUES ('Admin'), ('User');

INSERT INTO users (user_name, full_name, email, telephone, address, pass_user, rol_id)
VALUES ('admin', 'Administrador', 'admin@example.com', '341123456', 'Av. Example 123', 'admin', 1);

INSERT INTO status_order (status_name)
VALUES ('Nuevo'), ('Confirmado'), ('Preparando'), ('Enviando'), ('Cancelado'), ('Entregado');

INSERT INTO payment (payment_type)
VALUES ('Efectivo'), ('Tarjeta');

INSERT INTO products (prod_name, prod_price)
VALUES ('Hamburguesa vegetariana', 280), ('Ensalada de garbanzos', 250), ('Papas fritas', 200), ('Tacos', 300), ('Tarta de verdura', 350), ('Nachos con queso', 320), ('Macarrones con queso', 325);



