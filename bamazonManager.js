// dependencies
var mysql = require("mysql");
var inq = require("inquirer");
var table = require("console.table");
var colors = require("colors");

// creates the connection to the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",
  password: "",
  database: "bamazonDB"
});

// connects to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
  start();
});

// starts the app and calls the prompt function
function start() {
  console.log("\nWELCOME TO THE MANAGERS PORTAL\n".green);
  prompt();
}

// function that prompts the manager for an action
function prompt() {
  inq
    .prompt({
      name: "managerMenu",
      type: "rawlist",
      message: "Please select a menu option:",
      choices: [
        "View Products for Sale",
        "View Low Inventory",
        "Add to Inventory",
        "Add New Product",
        "Exit"
      ]
    })
    .then(function(answer) {
      if (answer.managerMenu === "View Products for Sale") {
        showItems();
      } else if (answer.managerMenu === "View Low Inventory") {
        lowInv();
      } else if (answer.managerMenu === "Add to Inventory") {
        addInv();
      } else if (answer.managerMenu === "Add New Product") {
        newProduct();
      } else if (answer.managerMenu === "Exit") {
        exit();
      }
    });
}

// function that uses console.table to log the table to the terminal
function printTable(res) {
  var items = [];
  var headings = [
    "Item ID",
    "Product",
    "Department",
    "Price ($)",
    "Quantity in Stock"
  ];

  for (var i = 0; i < res.length; i++) {
    items.push([
      res[i].item_id,
      res[i].product_name,
      res[i].department_name,
      res[i].price,
      res[i].stock_quantity
    ]);
  }
  console.table(headings, items);
}

// function that makes a sql query to display all products to the manager
function showItems() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\nAll Products\n".cyan.underline);
    // console.log(res);
    printTable(res);
    setTimeout(menu, 1000);
  });
}

// function that prompts the manager to view the menu
function menu() {
  inq
    .prompt({
      name: "menu",
      type: "confirm",
      message: "Would you like to view the menu?"
    })
    .then(function(answer) {
      if (answer.menu) {
        prompt();
      } else {
        exit();
      }
    });
}

// function that makes a sql query to display low inventory items to the manager
function lowInv() {
  connection.query("SELECT * FROM products WHERE stock_quantity < 20", function(
    err,
    res
  ) {
    if (err) throw err;
    if (res.length === 0) {
      console.log("\nThere are no items low in stock.\n".cyan);
    } else {
      console.log("\nLow Inventory\n".cyan.underline);
      printTable(res);
      setTimeout(menu, 1000);
    }
  });
}

// function that makes a sql query to add additional inventory to the database
function addInv() {
  var selected;

  inq
    .prompt([
      {
        name: "itemID",
        type: "input",
        message: "Please enter the ID number of the item you'd like to update.",
        validate: function(value) {
          if (value <= 0 || isNaN(value)) {
            console.log("\nPlease enter a valid item ID.\n".red);
          } else {
            return true;
          }
        }
      },
      {
        name: "quantity",
        type: "input",
        message: "How many units of this item would you like to add?",
        validate: function(value) {
          if (value <= 0 || isNaN(value)) {
            console.log("\nPlease enter a valid number.\n".red);
          } else {
            return true;
          }
        }
      }
    ])
    .then(function(answer) {
      connection.query(
        "SELECT * FROM products WHERE item_id = ?",
        [answer.itemID],
        function(err, res) {
          if (err) throw err;
          selected = res[0];
        }
      );

      connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE item_id = ?",
        [answer.quantity, answer.itemID],
        function(err, res) {
          if (err) throw err;
          console.log("\nThe inventory has been successfully updated!\n".cyan);

          inq
            .prompt({
              name: "addAnother",
              type: "confirm",
              message: "Would you like to update another item?"
            })
            .then(function(answer) {
              if (answer.addAnother) {
                addInv();
              } else {
                menu();
              }
            });
        }
      );
    });
}

// function that makes a sql query to add a new product to the database
function newProduct() {
  inq
    .prompt([
      {
        name: "name",
        type: "input",
        message: "Please enter the product name:"
      },
      {
        name: "dept",
        type: "input",
        message: "Please enter the department name:"
      },
      {
        name: "price",
        type: "input",
        message: "Please enter the product's price:"
      },
      {
        name: "quantity",
        type: "input",
        message: "Please enter the quantity of the product:"
      }
    ])
    .then(function(answer) {
      connection.query(
        "INSERT INTO products SET ?",
        {
          product_name: answer.name,
          department_name: answer.dept,
          price: answer.price,
          stock_quantity: answer.quantity
        },
        function(err, res) {
          if (err) throw err;
          var message =
            "\n" + answer.name + " was successfully added to the inventory!\n";
          console.log(message.cyan);
          menu();
        }
      );
    });
}

// function that exits the app
function exit() {
  console.log("\nSession ended.\n".cyan);
  connection.end();
}
