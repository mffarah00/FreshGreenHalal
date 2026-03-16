function getCart(){
    return JSON.parse(localStorage.getItem("cart") || "[]");
}

function saveCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

function addToCart(productCard){
    let cart = getCart();

    const id = productCard.dataset.id;
    const name = productCard.querySelector('h3').innerText;
    const price = parseFloat(productCard.querySelector('.price').innerText.replace('$',''));
    const quantity = parseInt(productCard.querySelector('input').value);
    const img = productCard.querySelector('img').src;

    const existingItem = cart.find(item => item.id === id);

    if(existingItem){
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id,
            name,
            price,
            quantity,
            img
        });
    }

    saveCart(cart);
    updateCartCount();
}

function updateCartCount(){
    let cart = getCart();
    const badge = document.getElementById('cart-count-badge');
    if(!badge) return;

    const total = cart.reduce((sum,item)=>sum+item.quantity,0);
    badge.innerText = total;
}

document.addEventListener("DOMContentLoaded", function(){
    document.querySelectorAll('.add-to-cart').forEach(button=>{
        button.addEventListener("click", function(){
            const productCard = this.closest('.product-card');
            addToCart(productCard);
        });
    });

    updateCartCount();
});