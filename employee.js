var mysql = require("mysql");
var inquirer = require("inquirer");
const { ADDRCONFIG } = require("dns");

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
    name: "table",
    when: ans => { return ans.task !== "Quit" },
    message: ans => { return `${ans.task.replace(/e$/, "")}ing:` },
    choices: ["Employee", "Role", "Department"]
  }]).then(res => {
    const chosen = res.table.toLowerCase()
    switch (res.task) {
      case "Add": add(chosen); break
      case "View": view(chosen); break
      case "Update": update(chosen); break
      case "Remove": remove(chosen); break
      case "Quit": connection.end()
    }
  })
}

function add() {

}

function view() {

}

function update() {

}

function remove() {
  
}

initialize()