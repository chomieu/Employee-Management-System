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
  main()
})

// Prompts user for task and table choice then calls a function accordingly
function main() {
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
      case "View": print(display); break
      case "Quit": db.end(); break
      default: list(res.task, res.chosen)
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
  chosen !== "employee" ?
    display = `SELECT * FROM ${chosen} ORDER BY id` :
    display = `SELECT ${query[0]} FROM ${chosen} ${query[1]} ORDER BY e.id`
}

function list(task, chosen, target) {
  var key, arr = []
  task === "Add" ? key = table[chosen][2] : key = chosen

  db.query(`SELECT * FROM ${key}`, async (err, res) => {
    if (err) throw err
    for await (i of res) {
      switch (key) {
        case "role": arr.push(i.title); break
        case "department": arr.push(i.department); break
        default: arr.push(`${i.first_name} ${i.last_name}`)
      }
    }
    task === "Add" ?
      add(chosen, arr, target) : update(task, chosen, arr)
  })
}

function add(chosen, arr, target) {
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
    choices: arr
  }]).then(async res => {
    var id = Object.keys(res)[2]
    if (id) {
      res[id] = await getID(table[chosen][2], res[id])
    }
    var query = `INSERT INTO ${chosen} SET ?`
    if (target) {
      query = `UPDATE ${chosen} SET ? WHERE ${table[chosen][0]} = "${target}"`
    }
    db.query(query, { ...res }, (err, res) => {
      if (err) throw err
      print(display)
    })
  })
}

function update(task, chosen, arr) {
  inquirer.prompt({
    type: "list",
    name: "item",
    message: `Select ${chosen}:`,
    choices: arr
  }).then(res => {
    if (task === "Update") {
      list("Add", chosen, res.item.split(" ")[0])
    } else {
      var query = `DELETE FROM ${chosen} WHERE ${table[chosen][0]} = "${res.item.split(" ")[0]}"`
      db.query(query, (err, res) => {
          if (err) throw err
          print(display)
        })
    }
  })
}

// Prints chosen table to the console
function print(display) {
  db.query(display, (err, res) => {
    if (err) throw err
    console.log(" ")
    console.table(res)
    console.log(" ")
    main()
  })
}

// Gets an ID that matches the input
function getID(chosen, input) {
  return new Promise((resolve, reject) => {
    var query = `SELECT * FROM ${chosen} WHERE ${table[chosen][0]} = "${input.split(" ")[0]}"`
    db.query(query, (err, res) => {
      if (err) throw err
      resolve(res[0].id)
    })
  })
}