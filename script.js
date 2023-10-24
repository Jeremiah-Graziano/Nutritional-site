// Quantity class manages quantities.
class Quantity {
  qty = 0;
  constructor(key) {
    this.key = key;
    if (this.key) {
      const initialValue = parseInt(localStorage.getItem(this.key) || "0");
      this.set(initialValue);
    }
  };

  increment(n) {
    n = parseInt(n);
    if (typeof n === "number") {
      this.set(this.qty + n);
    }
    return this.get();
  };

  decrement(n) {
    n = parseInt(n);
    if (typeof n === "number") {
      let newQty = this.qty - n;
      if (newQty < 0) {
        newQty = 0;
      }
      this.set(newQty);
    }
    return this.get();
  };

  set(n) {
    n = parseInt(n);
    if (typeof n === "number") {
      this.qty = n;
      if (this.key) {
        localStorage.setItem(this.key, this.qty);
      }
    }
    return this.get();
  };

  get() {
    return this.qty;
  }
};

class Controls {
  constructor(qty, node) {
    this.qty = qty;
    this.node = node;

    // Synchronize the counter and display to 1 during initialization.
    if (this.qty.get() === 0) {
      this.qty.set(1);
    };

    this.set(this.qty.get());
  };

  increment() {
    const v = this.qty.increment(1);
    this.node.value = v;
  };

  decrement() {
    const v = this.qty.decrement(1);
    this.node.value = v;
  };

  set(n) {
    const v = this.qty.set(n);
    this.node.value = v;
  };
};

class Cart {
  // the products held in the cart
  products = [];

  // array of render functions to render each time the cart changes.
  listeners = [];

  constructor() {
    // Load products from local storage
  };

  getProductQuantity(key) {
    const product = this.products.find((product) => key === product.key);
    if (product) {
      return product.qty.get()
    };
    return 0;
  };

  addProduct(key, name, qty) {
    const product = this.products.find((product) => key === product.key);
    if (product) {
      product.qty.increment(qty);
      this.notify();
      return;
    }

    const q = new Quantity;
    q.set(qty)
    this.products.push({
      key: key,
      qty: q,
      name: name,
    });
    this.notify();
  };

  removeProduct(key) {
    this.products = this.products.filter(product => product.key !== key)
    this.notify();
  };

  setProductQuantity(key, qty) {
    if (qty === 0) {
      return this.removeProduct(key);
    };
    
    const product = this.products.find((product) => key === product.key);
    if (product) {
      product.qty.set(qty);
      this.notify();
    };
  };

  // Returns the quantity of a product specified by it's key or 0 if the product
  // is not in the cart.

  // Empties the shopping cart
  empty() {
    this.products = [];
    this.notify();
  };

  // Returns the sum quantity of all products in the cart.
  getQuantity() {
    return Object.values(this.products).reduce(
      (acc, product) => acc + product.qty.get(), 0);
  };

  addEventListeners(...events) {
    events.map((event) => this.listeners.push(event));
  };

  notify() {
    this.listeners.map((event) => {
      if (typeof event === 'function') {
        event(this);
      }
    });
  };
};

// Renders the cart quantity
const renderCartQuantity = (cart) => {
  document.getElementById('cartQty').dataset.value = cart.getQuantity();
};

// Renders cart summary
const renderCartSummary = (cart) => {
  const summary = document.getElementById('cart-summary');
  summary.innerText = `You have ${cart.getQuantity()} item(s) in your cart. `;

  if (cart.getQuantity() > 0) {
    const emptyCart = document.createElement('a');
    emptyCart.innerText = 'Empty cart.';
    emptyCart.style.cursor = 'pointer';
    emptyCart.setAttribute('href', '#');
    emptyCart.addEventListener('click', (e) => {
      e.preventDefault();
      cart.empty();
    });
    summary.appendChild(emptyCart);
  }

  summary.style.display = 'block';
};

// Renders the shopping cart page.
const renderCart = (cart) => {
  const cartProducts = document.getElementById('cart-products');
  while (cartProducts.firstChild) {
    cartProducts.removeChild(cartProducts.firstChild);
  };

  const cartProductDetails = document.querySelector('.cartProductDetails');

  if (cart.getQuantity() === 0) {
    cartProductDetails.style.display = 'none';
    const li = document.createElement('li');
    li.innerText = 'You have no items in your cart.';
    cartProducts.appendChild(li);
  } else {
    cartProductDetails.style.display = 'block';
  };

  // Render the list for each product
  cart.products.forEach(product => {
    const li = document.createElement('li');
    li.classList.add('productType', 'row');
    
    const summary = document.createElement('div');
    summary.classList.add('col-sm-6', 'col-xs-6', 'col-lg-3');

    const imgDiv = document.createElement('div');
    imgDiv.style.backgroundColor = 'black';

    const nameDiv = document.createElement('div');
    const productName = document.createElement('p');
    productName.innerText = product.name;
    nameDiv.appendChild(productName);

    const identifier = document.createElement('p');
    identifier.innerText = 'product variant';
    nameDiv.appendChild(identifier);

    summary.appendChild(imgDiv);
    summary.appendChild(nameDiv);

    const priceValue = document.createElement('div');
    priceValue.classList.add('col-sm-6', 'col-xs-6', 'col-lg-3');
    priceValue.innerText = '7.00';

    const quantityBox = document.createElement('div');
    quantityBox.classList.add('quantity-buttons', 'col-sm-6', 'col-lg-3');
    const quantityInner = document.createElement('div');

    const dec = document.createElement('input');
    dec.setAttribute('value', '-')
    dec.setAttribute('type', 'button')
    const inputQty = document.createElement('input');
    inputQty.setAttribute('type', 'number')
    inputQty.style.textAlign = 'center'
    const inc = document.createElement('input');
    inc.setAttribute('value', '+')
    inc.setAttribute('type', 'button');
    quantityInner.appendChild(dec);
    quantityInner.appendChild(inputQty);
    quantityInner.appendChild(inc);
    const productTotalUpd = document.createElement('button');
    productTotalUpd.innerText = 'Update total';

    const controls = new Controls(new Quantity, inputQty);
    controls.set(product.qty.get());
    inc.addEventListener('click', () => controls.increment());
    dec.addEventListener('click', () => controls.decrement());

    productTotalUpd.addEventListener('click', () => { 
      cart.setProductQuantity(product.key, controls.qty.get());
    });
    quantityBox.appendChild(quantityInner);
    quantityBox.appendChild(productTotalUpd);

    const finalDiv = document.createElement('div');
    finalDiv.classList.add('col-sm-6', 'col-xs-6', 'col-lg-3');
    const totalPrice = document.createElement('p');
    totalPrice.innerText = `$${(7 * product.qty.get()).toFixed(2)}`;
    const span = document.createElement('span');
    span.classList.add('material-symbols-outlined');
    span.innerText = 'delete';
    span.style.cursor = 'pointer';
    span.addEventListener('click', () => cart.removeProduct(product.key));
    finalDiv.appendChild(totalPrice);
    finalDiv.appendChild(span);

    li.appendChild(summary);
    li.appendChild(priceValue);
    li.appendChild(quantityBox);
    li.appendChild(finalDiv);

    cartProducts.appendChild(li);
  });
};

//objective is to have the add to cart button add the product to the cart and take the value from the option dropdown selecting the flavor/product
// and take the quantity value and add combine them to show as one product in the cart with a quantity.

const cart = new Cart;
cart.addEventListeners(renderCart, renderCartQuantity, renderCartSummary);

const controls = new Controls(
  new Quantity,
  document.querySelector('.input-quantity')
);
document.querySelector('.plus').addEventListener('click', () => controls.increment());
document.querySelector('.minus').addEventListener('click', () => controls.decrement());

const cartAlert = document.getElementById('cartAlert');
const item = document.getElementById('productSelection');

document.getElementById('addToCart').addEventListener('click', () => {
  const key = item.options[item.selectedIndex].value;
  const name = item.options[item.selectedIndex].text;
  const quantity = controls.qty.get();

  if (key === '') {
    cartAlert.style.display = 'block';
    return;
  } 

  cartAlert.style.display = 'none';
  cart.addProduct(key, name, quantity);
});

// Render all of our cart views.
cart.notify();



// const cart = new Cart;
// const controls2 = new Controls(
//   new Quantity,
//   document.querySelector('input-quantity2')
// );

// document.querySelectorAll('[data-value]')[0].addEventListener('click', () => {
//   controls2.increment();
// });

// document.querySelectorAll('[data-value]')[2].addEventListener('click', () => {
//   controls2.decrement();
// });

const modal = {
  visible: false,
  show: () => { 
    document.getElementById('modal').style.display = 'block';
    visible = true;
  },
  hide: () => { 
    document.getElementById('modal').style.display = 'none';
    visible = false;
  }
};

// const modal = document.getElementById('modal');
document.getElementById('cartIcon').addEventListener('click', () => modal.show());
document.getElementById('closeModal').addEventListener('click', () => modal.hide());
document.querySelector('.heading p').addEventListener('click', () => modal.hide());

document.body.addEventListener('keydown', function(e) {
  if (e.key == 'Escape' || e.key == 'Esc') {
    modal.hide();
  } else if (e.key == 'Enter') {
    modal.show();
  };
});


