CREATE database DelilahResto;
USE delilahresto;

CREATE TABLE products( 
prod_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT, 
prod_name VARCHAR(25) NOT NULL, 
prod_price INT UNSIGNED NOT NULL);

CREATE TABLE rols(
rol_id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
rol_name VARCHAR(25) NOT NULL);

INSERT INTO rols (rol_name)
VALUES ('Admin'), ('User');

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
