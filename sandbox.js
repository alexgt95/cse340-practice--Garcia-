// Simulates getting menu data
function getMenu() {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve([
                'Burger',
                'Pizza',
                'Tacos',
                'Sushi'
            ]);
        }, 1500);
    });
}

// Simulates placing an order
function placeOrder(food) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (food) {
                resolve(`Your ${food} order has been placed!`);
            } else {
                reject('Please select a food item!');
            }
        }, 2000);
    });
}

// Simulates order preparation
function prepareOrder(order) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (order.includes('placed')) {
                resolve('Your food is ready for pickup! 🍔');
            } else {
                reject('Something went wrong with your order!');
            }
        }, 3000);
    });
}

// Using Promises (the traditional way)
function orderFoodWithPromises() {
    console.log('Starting your order (Promise version)...');

    getMenu()
        .then(menu => {
            console.log('Menu items:', menu);
            return placeOrder(menu[0]);
        })
        .then(orderMessage => {
            console.log(orderMessage);
            return prepareOrder(orderMessage);
        })
        .then(ready => {
            console.log(ready);
        })
        .catch(error => {
            console.log('Error:', error);
        })
        .finally(() => {
            console.log('Order process complete. (Simulation Competed)');
        });
}

// Using async/await (the modern way)
async function orderFoodWithAsync() {
    try {
        console.log('Starting your order (async/await version)...');

        const menu = await getMenu();
        console.log('Menu items:', menu);

        const orderMessage = await placeOrder(menu[0]);
        console.log(orderMessage);

        const ready = await prepareOrder(orderMessage);
        console.log(ready);

    } catch (error) {
        console.log('Error:', error);
    } finally {
        console.log('Order process complete. (Simulation Competed)');
    }
}

// Try both versions!
orderFoodWithPromises();
// orderFoodWithAsync();