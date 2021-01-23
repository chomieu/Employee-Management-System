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

INSERT INTO department (department) VALUE ("IT");

INSERT INTO `role` (title, salary, department_id)
VALUES 
("Developer", "100000", "1"),
("Engineer", "99999", "1");

INSERT INTO employee (first_name, last_name, role_id)
VALUES 
("Chomie", "Usaneerungrueng", "1"),
("Will", "Nguyen", "2");