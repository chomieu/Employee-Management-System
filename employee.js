var mysql = require("mysql")
var inquirer = require("inquirer")
var ct = require("console.table")

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
    choices: ["Employee", "Role", "Department"],
    filter: ans => { return ans.toLowerCase() }
  }]).then(res => {
    console.log(res.table)
    switch (res.task) {
      // case "Add": add(chosen); break
      case "View": view(res.table); break
      // case "Update": update(chosen); break
      // case "Remove": remove(chosen); break
      case "Quit": connection.end()
    }
  })
}

// function add(table) {
//   inquirer.prompt([]).then(res => {
//     // create object
//     connection.query(`INSERT INTO ${table} SET`)
//   })
// }

function view(table) {
  connection.query(`SELECT employee.id, role.id FROM ${table} RIGHT JOIN role ON employee.role_id = role.id`, (err, res) => {
    if (err) throw err
    return console.table(res)
  })
}

// function update(table) {

// }

// function remove(table) {
//   connection.query(`DELETE FROM ${table} WHERE ?`, {})
// }