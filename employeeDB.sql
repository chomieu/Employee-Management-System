DROP DATABASE IF EXISTS employeeDB;

CREATE DATABASE employeeDB;

USE employeeDB;

CREATE TABLE department (
  id int NOT NULL AUTO_INCREMENT,
  department varchar(30) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE `role` (
  id int NOT NULL AUTO_INCREMENT,
  title varchar(30) NOT NULL,
  salary dec NOT NULL,
  department_id int,
  PRIMARY KEY (id),
  FOREIGN KEY (department_id) REFERENCES department(id)
);

CREATE TABLE employee (
  id int NOT NULL AUTO_INCREMENT,
  first_name varchar(30) NOT NULL,
  last_name varchar(30) NOT NULL,
  role_id int,
  manager_id int DEFAULT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (role_id) REFERENCES `role`(id)
);