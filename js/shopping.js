const cartBtn = document.querySelector(".cart-btn"); //show modal
const cartModal = document.querySelector(".cart"); //modal
const backDrop = document.querySelector(".backdrop"); //backdrop
const closedModal = document.querySelector(".cart-confirm"); //close/confirm modal
const clearCart = document.querySelector(".cart-clear");
const productsDom = document.querySelector(".products-center");
const totalPrice = document.querySelector(".cart-total");
const cartItems = document.querySelector(".cart-items");
const modalContent = document.querySelector(".cart-content");

import { productsData } from "./products.js";

let cart = [];

let addToCartBtnArr = [];
// 1.get products

class ProductsClass {
  // میتونه get from api end point
  get products() {
    return productsData;
  }
}

// display products

class UI {
  displayProduct(products) {
    let result = "";
    products.forEach((element) => {
      result += `<div class="product">
        <div class="img-container">
          <img src=${element.imageUrl} class="product-img" />
        </div>
        <div class="product-desc">
          <p class="product-price">$ ${element.price}</p>
          <p class="product-title">${element.title}</p>
        </div>
        <button class="btn add-to-cart" data-id = ${element.id}>
          add to cart
        </button>
      </div>`;
    });
    productsDom.innerHTML = result;
  }
  getAddToCartBtn() {
    const addToCartBtn = document.querySelectorAll(".add-to-cart");
    addToCartBtnArr = [...addToCartBtn]; //convert nodelist to arr
    addToCartBtnArr.forEach((btn) => {
      const id = btn.dataset.id;
      // check if this product id is in cart exist
      const isInCart = cart.find((e) => e.id == id);
      // console.log(isInCart);
      if (isInCart) {
        btn.innerText = "In Cart";
        btn.disabled = true;
      }
      //   this code is for there are not in cart
      btn.addEventListener("click", (event) => {
        // console.log(btn.childNodes[1]);
        btn.innerText = "In Cart";
        btn.disabled = true;
        //  1.get product from products :
        const addedProduct = {
          ...Storage.getProduct(event.target.dataset.id),
          quantity: 1,
        };
        //  2.add to cart
        cart = [...cart, addedProduct];
        //  3. save cart to local storage
        Storage.saveCart(cart);
        //  4. update cart value
        this.setCartValue(cart);
        //  5. add to cart modal
        this.addCartItem(addedProduct);
      }); //   this code is for there are not in cart
    });
  }

  setCartValue(cart) {
    // 1.cart items:
    // 2. total price:
    let tempCartItems = 0;
    const total = cart.reduce((acc, curr) => {
      tempCartItems += curr.quantity;
      return acc + curr.price * curr.quantity;
    }, 0);
    totalPrice.innerText = `total price : ${total} $`;
    cartItems.innerText = tempCartItems;
  }

  addCartItem(product) {
    const div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `
    <img class="cart-item-img" src=${product.imageUrl} />
    <div class="cart-item-desc">
      <h4>${product.title}</h4>
      <h5>$ ${product.price}</h5>
    </div>
    <div class="cart-item-conteoller">
      <i class="fas fa-chevron-up" data-id = ${product.id}></i>
      <p>${product.quantity}</p>
      <i class="fas fa-chevron-down" data-id = ${product.id}></i>
    </div>
    <div class = "card-item-remove"><i class="fas fa-trash-alt" data-id = ${product.id}></i></div>
    `;
    modalContent.appendChild(div);
  }
  setUpApp() {
    //  1. get cart from storage
    cart = Storage.getCart() || [];
    //  2. add cart item
    cart.forEach((item) => this.addCartItem(item));
    this.setCartValue(cart);
  }
  cartLogic() {
    // clear cart
    clearCart.addEventListener("click", () => this.clearCart());
    // cart functionality
    modalContent.addEventListener("click", (event) => {
      if (event.target.classList.contains("fa-chevron-up")) {
        // 1.get item from cart
        const addedItem = cart.find(
          (item) => item.id == event.target.dataset.id
        );
        // 2.update quentity & UI
        addedItem.quantity++;
        event.target.nextElementSibling.innerText = addedItem.quantity;
        // 3. calculated total price
        this.setCartValue(cart);
        // 4.save cart in local storage
        Storage.saveCart(cart);
      } else if (event.target.classList.contains("fa-chevron-down")) {
        // 1.get item from cart
        const decreasedItem = cart.find(
          (item) => item.id == event.target.dataset.id
        );
        //  if == 1 delet item
        if (decreasedItem.quantity === 1) {
          this.removeItem(decreasedItem.id);
          modalContent.removeChild(event.target.parentElement.parentElement);
        } else { //deccrease item
          decreasedItem.quantity--;
          event.target.previousElementSibling.innerText = decreasedItem.quantity;
          this.setCartValue(cart);
          Storage.saveCart(cart);
        }
      } else if (event.target.classList.contains("fa-trash-alt")) {
        // 1. get id
        const removedItem = cart.find(
          (item) => item.id == event.target.dataset.id
        );
        // 2. remove item
        // console.log(event.target.parentElement.parentElement);
        this.removeItem(removedItem.id);
        // 3. remove from modal
        modalContent.removeChild(event.target.parentElement.parentElement);
      }
    });
  }
  clearCart() {
    // remove :
    cart.forEach((item) => this.removeItem(item.id));
    // remove cart content children
    while (modalContent.children.length) {
      modalContent.removeChild(modalContent.children[0]);
    }
    closeModalFunction();
  }
  removeItem(id) {
    cart = cart.filter((items) => items.id !== id);
    this.setCartValue(cart);
    Storage.saveCart(cart);
    // convert "in cart" to "add to cart" and inable
    const btn = addToCartBtnArr.find((btn) => btn.dataset.id == id);
    btn.innerText = "add to cart";
    btn.disabled = false;
  }
}
// storage
class Storage {
  static saveProducts(products) {
    //static do not need to new class.
    localStorage.setItem("products", JSON.stringify(products));
  }
  static getProduct(id) {
    const _products = JSON.parse(localStorage.getItem("products"));
    return _products.find((p) => p.id === parseInt(id));
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return JSON.parse(localStorage.getItem("cart"));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const products = new ProductsClass();
  const productsData = products.products; //return array of object
  const ui = new UI();
  ui.displayProduct(productsData);
  ui.setUpApp();
  ui.getAddToCartBtn();
  ui.cartLogic();
  Storage.saveProducts(productsData);
  // get cart
  // ui.setUpApp();
});

function showModalFunction() {
  backDrop.style.display = "block";
  cartModal.style.opacity = "1";
  cartModal.style.top = "20%";
}

function closeModalFunction() {
  backDrop.style.display = "none";
  cartModal.style.opacity = "0";
  cartModal.style.top = "-100%";
}

// function clearItemsFunction() {}

cartBtn.addEventListener("click", showModalFunction);
closedModal.addEventListener("click", closeModalFunction);
backDrop.addEventListener("click", closeModalFunction);
// clearItemsCart.addEventListener("click", clearItemsFunction);
