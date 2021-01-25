USE employeeDB;

INSERT INTO department (department)
VALUES 
("Executive"),
("IT"),
("Human Resources");

INSERT INTO `role` (title, salary, department_id)
VALUES 
("CEO", "500000", "1"),
("CTO", "250000", "1"),
("Engineer", "100000", "2"),
("Developer", "100000", "2"),
("Recruiter", "70000", "3");

INSERT INTO employee (first_name, last_name, role_id)
VALUES 
("Chomie", "Usaneerungrueng", "1"),
("Will", "Nguyen", "2"),
("Isaac", "Tian", "3"),
("Irene", "Wachirawutthichai", "3");