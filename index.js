const mysql = require("mysql")
const inquirer = require("inquirer")
const ct = require("console.table");

var db = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "password",
  database: "employeeDB"
});

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
  initialize()
})

var query

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
    select(res.table)
    switch (res.task) {
      case "Add": add(res.table); break
      case "View": print(query); break
      // case "Update": update(res.table); break
      // case "Remove": remove(res.table); break
      case "Quit": db.end()
    }
  })
}

const questions = {
  employee: ["first_name", "last_name", "role"],
  role: ["title", "salary", "department"],
  department: ["department", "", "employee"]
}


function add(table) {
  inquirer.prompt([{
    type: "input",
    name: questions[table][0],
    message: `Enter ${questions[table][0]}:`
  }, {
    type: "input",
    name: questions[table][1],
    when: table !== "department",
    message: `Enter ${questions[table][1]}:`
  }, {
    type: "list",
    name: questions[table][2].concat("_id"),
    when: table !== "department",
    message: `Select ${questions[table][2]}:`,
    choices: makeList(questions[table][2]),
    filter: ans => getID(questions[table][2], ans)
  }]).then(res => {
    console.log(res)
    db.query(`INSERT INTO ${table} SET ?`, {...res}, (err, res) => {})
    print(query)
  })
}

function select(table) {
  const arr = ["e.id, e.first_name, e.last_name, r.title, d.department, r.salary",
    "e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id"]
  switch (table) {
    case "employee": query = `SELECT ${arr[0]} FROM ${table} ${arr[1]}`; break
    default: query = `SELECT * FROM ${table}`; break
  }
}

function print(query) {
  db.query(query, (err, res) => {
    if (err) throw err
    console.log(" ")
    console.table(res)
    console.log(" ")
    initialize()
  })
}

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

async function getID(table, input) {
  const promise = new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ${table} WHERE ${questions[table][0]} = "${input}"`, (err, res) => {
      if (err) throw err
      resolve(res[0].id)
    })
  })
  return await promise
}

// function remove(table) {
//   db.query(`DELETE FROM ${ table } WHERE ?`, {})
// }