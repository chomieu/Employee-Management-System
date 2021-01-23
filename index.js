// Dependencies
const mysql = require("mysql")
const inquirer = require("inquirer")
const ct = require("console.table");

// Defines a variable for database connection
var db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employeeDB"
});

// Connects to the database and initialize the app
db.connect(err => {
  if (err) throw err
  const logo = [
    " ____________________________________________________________",
    "|                                                            |",
    "|      ______                                                |",
    "|     |   ___|                 _                             |",
    "|     |  |__   _ __ ___  ____ | | ____  _   _  ___  ___      |",
    "|     |   __| | '_ ` _ \\|  _ \\| |/  _ \\| | | |/ _ \\/ _ \\     |",
    "|     |  |___ | | | | | | |_) | |  (_) | |_| |  __/  __/     |",
    "|     |______||_| |_| |_|  __/|_|\\____/ \\__, |\\___|\\___|     |",
    "|                       |_|              |___/               |",
    "|      ____  ____                                            |",
    "|     |    \\/    |  __ _ _ __   __ _  __ _  ___  _ __        |",
    "|     |  |\\  /|  | / _` | '_ \\ / _` |/ _` |/ _ \\| '__|       |",
    "|     |  | \\/ |  || (_| | | | | (_| | (_| |  __/| |          |",
    "|     |__|    |__| \\__,_|_| |_|\\__,_|\\__, |\\___||_|          |",
    "|                                     |___|                  |",
    "|                                                            |",
    "|____________________________________________________________|\n"
  ]
  console.log(logo.join("\n"))
  mainMenu()
})

// Prompts user for task and table choice then calls a function accordingly
function mainMenu() {
  inquirer.prompt([{
    type: "list",
    name: "task",
    message: "What would you like to do?",
    choices: ["Add", "View", "Update", "Remove", "Quit"]
  }, {
    type: "list",
    name: "chosen",
    message: ans => { return `${ans.task.replace(/e$/, "")}ing:` },
    choices: ["Employee", "Role", "Department"],
    when: ans => { return ans.task !== "Quit" },
    filter: ans => { return ans.toLowerCase() }
  }]).then(res => {
    select(res.chosen)
    switch (res.task) {
      case "Add": add(res.chosen, "INSERT INTO"); break
      case "View": print(display); break
      case "Update": update(res.chosen, "UPDATE"); break
      case "Remove": update(res.chosen, "DELETE"); break
      case "Quit": db.end()
    }
  })
}

var display // Global variable for viewing tables
const table = { // Global constant for chosen tables
  employee: ["first_name", "last_name", "role"],
  role: ["title", "salary", "department"],
  department: ["department", "", "employee"]
}

// Selects query and sets global variable "display" for viewing tables
function select(chosen) {
  const query = ["e.id, e.first_name, e.last_name, r.title, d.department, r.salary",
    "e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id"]
  if (chosen !== "employee") { display = `SELECT * FROM ${chosen} ORDER BY id` }
  else { display = `SELECT ${query[0]} FROM ${chosen} ${query[1]} ORDER BY e.id` }
}

// Adds an item to the chosen table 
function add(chosen, task, target) {
  inquirer.prompt([{
    type: "input",
    name: table[chosen][0],
    message: `Enter ${table[chosen][0]}:`
  }, {
    type: "input",
    name: table[chosen][1],
    when: chosen !== "department",
    message: `Enter ${table[chosen][1]}:`
  }, {
    type: "list",
    name: table[chosen][2].concat("_id"),
    when: chosen !== "department",
    message: `Select ${table[chosen][2]}:`,
    choices: makeList(table[chosen][2])
  }]).then(async res => {
    var id = Object.keys(res)[2] // keyword for ID is required for adding or updating employee/role
    var query = `${task} ${chosen} SET ?` // Basic query
    if (task === "UPDATE") { // If task is update, add extra variables to target the item
      query = query + " WHERE " + table[chosen][0] + ` = "${target}"`
    }
    if (id) { // if the keyword for ID is not null (chosen = employee/role) fetch the actual ID
      res[id] = await getID(table[chosen][2], res[id])
    }
    db.query(query, { ...res }, (err, res) => {
      if (err) throw err
      print(display)
    })
  })
}

// Updates or delete an item from the chosen table
function update(chosen, task) {
  var arr = []
  db.query(`SELECT * FROM ${chosen}`, (err, res) => {
    if (err) throw err
    for (i = 0; i < res.length; i++) {
      switch (chosen) {
        case "employee":
          arr.push(`${res[i].first_name} ${res[i].last_name}`)
          break
        case "role":
          arr.push(res[i].title)
          break
        case "department":
          arr.push(res[i].department)
          break
      }
    }
    inquirer.prompt({
      type: "list",
      name: "changes",
      message: `Select ${chosen}:`,
      choices: arr
    }).then(res => {
      if (task === "UPDATE") {
        add(chosen, task, res.changes.split(" ")[0])
      } else {
        db.query(`${task} FROM ${chosen} WHERE ` + table[chosen][0] + ` = "${res.changes.split(" ")[0]}"`, (err, res) => {
          if (err) throw err
          print(display)
        })
      }
    })
  })
}

// Prints chosen table to the console
function print(display) {
  db.query(display, (err, res) => {
    if (err) throw err
    console.log(" ")
    console.table(res)
    console.log(" ")
    mainMenu()
  })
}

// Creates a list based on the given input
function makeList(input) {
  var arr = []
  db.query(`SELECT * FROM ${input}`, (err, res) => {
    if (err) throw err
    for (i = 0; i < res.length; i++) {
      switch (input) {
        case "employee":
          arr.push(`${res[i].first_name} ${res[i].last_name}`)
          break
        case "role":
          arr.push(res[i].title)
          break
        case "department":
          arr.push(res[i].department)
          break
      }
    }
  })
  return arr
}

// Gets an ID that matches the input
function getID(chosen, input) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ${chosen} WHERE ${table[chosen][0]} = "${input.split(" ")[0]}"`, (err, res) => {
      if (err) throw err
      resolve(res[0].id)
    })
  })
}