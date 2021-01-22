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
  mainMenu()
})

var display

function mainMenu() {
  inquirer.prompt([{
    type: "list",
    name: "task",
    message: "What would you like to do?",
    choices: ["Add", "View", "Update", "Remove", "Quit"]
  }, {
    type: "list",
    name: "param",
    when: ans => { return ans.task !== "Quit" },
    message: ans => { return `${ans.task.replace(/e$/, "")}ing:` },
    choices: ["Employee", "Role", "Department"],
    filter: ans => { return ans.toLowerCase() }
  }]).then(res => {
    select(res.param)
    switch (res.task) {
      case "Add": add(res.param); break
      case "View": print(display); break
      // case "Update": update(res.param); break
      // case "Remove": remove(res.param); break
      case "Quit": db.end()
    }
  })
}

const table = {
  employee: ["first_name", "last_name", "role"],
  role: ["title", "salary", "department"],
  department: ["department", "", "employee"]
}

function add(param) {
  inquirer.prompt([{
    type: "input",
    name: table[param][0],
    message: `Enter ${table[param][0]}:`
  }, {
    type: "input",
    name: table[param][1],
    when: param !== "department",
    message: `Enter ${table[param][1]}:`
  }, {
    type: "list",
    name: table[param][2].concat("_id"),
    when: param !== "department",
    message: `Select ${table[param][2]}:`,
    choices: makeList(table[param][2])
  }]).then(async res => {
    var id = Object.keys(res)[2]
    if (id !== null) {
      res[id] = await getID(table[param][2], res[id])
      db.query(`INSERT INTO ${param} SET ?`, { ...res }, (err, res) => {
        if (err) throw err
        print(display)
      })
    }
  })
}

function select(param) {
  const arr = ["e.id, e.first_name, e.last_name, r.title, d.department, r.salary",
    "e JOIN role r ON e.role_id = r.id JOIN department d ON r.department_id = d.id"]
  switch (param) {
    case "employee": display = `SELECT ${arr[0]} FROM ${param} ${arr[1]} ORDER BY e.id`; break
    default: display = `SELECT * FROM ${param} ORDER BY id`; break
  }
}

function print(display) {
  db.query(display, (err, res) => {
    if (err) throw err
    console.log(" ")
    console.table(res)
    console.log(" ")
    mainMenu()
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

function getID(param, input) {
  return new Promise((resolve, reject) => {
    db.query(`SELECT * FROM ${param} WHERE ${table[param][0]} = "${input.split(" ")[0]}"`, (err, res) => {
      if (err) throw err
      resolve(res[0].id)
    })
  })
}