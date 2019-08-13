// dependencies
var mysql = require("mysql");
var inq = require("inquirer");
var table = require("console.table");
var colors = require("colors");
var itemID = 0;
var itemQuantity = 0;
var selected;
var statement;

// creates the connection to the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",
  password: "Nh1nconc@c",
  database: "bamazonDB"
});

// connects to the mysql server and sql database
connection.connect(function(err) {
  if (err) throw err;
  // console.log("connected as id " + connection.threadId);
  start();
});

// starts the app and asks the user if they would like to browse the store
function start() {
  console.log("\nWELCOME TO THE BAMAZON STORE!\n".green);
  inq
    .prompt({
      name: "browse",
      type: "confirm",
      message: "Would you like to browse the available products?"
    })
    .then(function(answer) {
      if (answer.browse) {
        showItems();
        setTimeout(promptUser, 1000);
      } else {
        exit();
      }
    });
}

// function that makes a sql query to display all products to the user
function showItems() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("\nAll Products\n".cyan.underline);
    // console.log(res);
    var products = [];
    for (var i = 0; i < res.length; i++) {
      products.push([
        res[i].item_id,
        res[i].product_name,
        res[i].department_name,
        res[i].price,
        res[i].stock_quantity
      ]);
    }
    var headings = [
      "Item ID",
      "Product",
      "Department",
      "Price ($)",
      "Quantity in Stock"
    ];
    console.table(headings, products);
  });
}

// function that prompts the user for what action they would like to take
function promptUser() {
  inq
    .prompt([
      {
        name: "id",
        type: "input",
        message:
          "Please enter the ID number of the item you'd like to purchase.",
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
        message:
          "Please enter the quantity of the item you'd like to purchase.",
        validate: function(value) {
          if (isNaN(value)) {
            console.log("\nPlease enter a valid number.\n".red);
          } else {
            return true;
          }
        }
      }
    ])
    .then(function(answer) {
      itemID = answer.id;
      itemQuantity = answer.quantity;

      connection.query(
        "SELECT * FROM products WHERE item_id=" + itemID,
        function(err, res) {
          selected = res[0];

          if (
            itemQuantity > selected.stock_quantity &&
            selected.stock_quantity > 1
          ) {
            statement =
              "\nSorry, we only have " +
              selected.stock_quantity +
              " " +
              selected.product_name +
              "s available.\n";
            console.log(statement.red);
            promptUser();
          } else if (
            itemQuantity > selected.stock_quantity &&
            selected.stock_quantity === 1
          ) {
            statement =
              "\nSorry, we only have 1 " +
              selected.product_name +
              " available.\n";
            console.log(statement.red);
            promptUser();
          } else if (
            itemQuantity > selected.stock_quantity &&
            selected.stock_quantity < 1
          ) {
            statement =
              "\nSorry, " + selected.product_name + " is out of stock.\n";
            console.log(statement.red);
            promptUser();
          } else if (+itemQuantity === 1) {
            statement = "\nYou are purchasing 1 " + selected.product_name + ".";
            buyProduct();
          } else {
            statement =
              "\nYou are purchasing " +
              itemQuantity +
              " " +
              selected.product_name +
              "s.";
            buyProduct();
          }
        }
      );
    });
}

function buyProduct() {
  inq
    .prompt({
      name: "buy",
      type: "confirm",
      message: statement + " Would you like to check out?"
    })
    .then(function(answer) {
      if (answer.buy) {
        connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE item_id = ?",
          [itemQuantity, itemID],
          function(err, res) {
            if (err) throw err;
            var totalStatement =
              "\nYour total is $" + itemQuantity * selected.price + "\n";
            console.log(totalStatement.cyan);
            setTimeout(buyDifferent, 1500);
          }
        );
      } else {
        buyDifferent();
      }
    });
}

function buyDifferent() {
  inq
    .prompt({
      name: "differentItem",
      type: "confirm",
      message: "Would you like to purchase a different item?"
    })
    .then(function(answer) {
      if (answer.differentItem) {
        showItems();
        setTimeout(promptUser, 1000);
      } else {
        exit();
      }
    });
}

// function that exits the app
function exit() {
  console.log("\nThank you for visiting Bamazon! Have a great day!\n".cyan);
  connection.end();
}
