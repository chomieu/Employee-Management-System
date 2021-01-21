var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employeeDB"
});

connection.connect(err => {
  if (err) throw err
  initialize()
})

function initialize() {
  inquirer.prompt([{
    type: "list",
    name: "task",
    message: "What would you like to do?",
    choices: ["Add", "View", "Update", "Remove", "Quit"]
  }, {
    type: "list",
    name: "db",
    when: res => { return res.task !== "Quit" },
    message: res => { return `${res.task.replace(/e$/, "")}ing:` },
    choices: ["Employee", "Role", "Department"]
  }]).then(response => {
    
  })
}

initialize()