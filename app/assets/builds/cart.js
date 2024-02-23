fetch('/products_api', {    //faz a requisição fetch forçando o formato JSON
    headers: {
      'Accept': 'application/json'
    }
  })
  .then(response => response.json())
.then(function(data){
    localStorage.setItem("products", JSON.stringify(data));
    if(!localStorage.getItem("cart")){
        localStorage.getItem("cart", "[]");
    }
});

//GLOGALS

let products = JSON.parse(localStorage.getItem("products"));
let cart = JSON.parse(localStorage.getItem("cart"));

function addItemToCart(productID){
    let product = products.find(function(product){
        return product.id == productID
    });

    if(cart.length == 0){
        cart.push(product);
    }else{
        let res = cart.find(element => element.id == productID);
        if(res === undefined){
            cart.push(product);
        }
    }

    localStorage.setItem("cart", JSON.stringify(cart))

}

addItemToCart(1);


function removeItemToCart(productID){
    let temp = cart.filter(item => item.id != productID);
    localStorage.setItem("cart", JSON.stringify(temp));
}


removeItemToCart(1);


function updateQuantity(productId, quantity){
    for(let product of cart){
        if(product.id == productId){
            product.quantity = quantity;
        }
    }
    localStorage.setItem("cart", JSON.stringify(cart));
}

updateQuantity(2, 8);


function getTotal(){
    let temp = cart.map(function(item){
        return parseFloat(item.price);
    });

    let sum = temp.reduce(function(prev, next){
        return prev + next;
    }, 0);
}

getTotal();