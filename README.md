# Bamazon

Bamazon-CLI is a node command line interface that interacts with the Bamazon SQL Database. It allows the users to view and purchase items from the inventory. It allows Managers to edit and manage the products in the Bamazon database. Lastly it allows Supervisors to view departments and sales data for reports.

### Customer View
The customer view of the app takes in orders from users and depletes stock from the store's inventory. It validates input and will let the customer know if they've entered an invalid item ID or if an item is out of stock. If the item is available in the quantity specified, the customer will be given the total price and the inventory will be updated on the backend.

![alt text](https://github.com/vienhong20/Bamazon-Prime/blob/master/assets/images/bamazonCustomer.png)


### Manager View
The manager view of the app presents the user with a list of set menu options. Depending on the command selected, the app will read and return data to the manager, or prompt the manager for input to update or insert new data into the database. Managers are able to perform the following functions:
* View Products for Sale
* View Low Inventory
* Add to Inventory
* Add New Product

![alt text](https://github.com/vienhong20/Bamazon-Prime/blob/master/assets/images/bamazonManager.png)

