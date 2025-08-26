// DOM Elements
const productContainer = document.getElementById('product-container');
const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartCount = document.getElementById('cart-count');
const cartModal = document.querySelector('.cart-modal');
const checkoutModal = document.querySelector('.checkout-modal');
const checkoutBtn = document.getElementById('checkout-btn');
const closeButtons = document.querySelectorAll('.close');
const checkoutForm = document.getElementById('checkout-form');

// Cart state
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Fetch products from backend
async function fetchProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback data if API fails
        const fallbackProducts = [
            {
                id: 1,
                name: "Ear Pods",
                price: 999,
                description: "High-quality wireless headphones.",
                image: "https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/26979154/2024/1/22/bf61e27c-4632-4d07-a84b-6996aad7ace71705918420818-OnePlus-Unisex-Headphones-7001705918420624-1.jpg"
            },
            {
                id: 2,
                name: "Smart Watch",
                price: 1999,
                description: "Feature-rich smartwatch with health monitoring.",
                image: "https://m.media-amazon.com/images/I/51pipGoHHFL._SR290,290_.jpg"
            },
            {
                id: 3,
                name: "Bluetooth Speaker",
                price: 599,
                description: "Portable speaker with 20-hour battery life.",
                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQtq4xRg2NCxfEirXsxcfPA5NNjGGkjnNzEKA&s"
            },
            {
                id: 4,
                name: "Laptop Backpack",
                price: 1599,
                description: "Durable backpack with USB charging port.",
                image: "https://m.media-amazon.com/images/I/71mM5CQjEhL._UY1100_.jpg"
            }
        ];
        displayProducts(fallbackProducts);
    }
}

// Display products
function displayProducts(products) {
    productContainer.innerHTML = '';
    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="product-price">Rs${product.price.toFixed(2)}</p>
            <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
        `;
        productContainer.appendChild(productCard);
    });

    // Add event listeners to all "Add to Cart" buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Add to cart function
function addToCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    
    // In a real app, we would fetch the product details from the backend
    // For now, we'll use a simplified approach
    const productCard = e.target.closest('.product-card');
    const productName = productCard.querySelector('h3').textContent;
    const productPrice = parseFloat(productCard.querySelector('.product-price').textContent.replace('Rs', ''));
    const productImage = productCard.querySelector('img').src;

    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: productId,
            name: productName,
            price: productPrice,
            image: productImage,
            quantity: 1
        });
    }

    updateCart();
    showNotification(`${productName} added to cart!`);
}

// Update cart UI
function updateCart() {
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart items list
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div>
                <h4>${item.name}</h4>
                <p>Rs${item.price.toFixed(2)} x ${item.quantity}</p>
            </div>
            <div>
                <button class="remove-item" data-id="${item.id}">×</button>
            </div>
        `;
        cartItems.appendChild(cartItem);
        total += item.price * item.quantity;
    });
    
    // Update total
    cartTotal.textContent = total.toFixed(2);
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

// Remove from cart
function removeFromCart(e) {
    const productId = parseInt(e.target.getAttribute('data-id'));
    cart = cart.filter(item => item.id !== productId);
    updateCart();
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts();
    updateCart();
});

// Cart modal toggle
document.querySelector('a[href="#cart"]').addEventListener('click', (e) => {
    e.preventDefault();
    cartModal.style.display = 'block';
});

// Checkout button
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    cartModal.style.display = 'none';
    checkoutModal.style.display = 'block';
});

// Close modals
closeButtons.forEach(button => {
    button.addEventListener('click', () => {
        cartModal.style.display = 'none';
        checkoutModal.style.display = 'none';
    });
});

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.style.display = 'none';
    }
    if (e.target === checkoutModal) {
        checkoutModal.style.display = 'none';
    }
});

// Checkout form submission
checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderData = {
        customer: {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            address: document.getElementById('address').value
        },
        paymentMethod: document.getElementById('payment').value,
        items: cart,
        total: parseFloat(cartTotal.textContent)
    };
    
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (response.ok) {
            const result = await response.json();
            alert(`Order placed successfully! Order ID: ${result.orderId}`);
            // Clear cart
            cart = [];
            updateCart();
            checkoutModal.style.display = 'none';
            checkoutForm.reset();
        } else {
            throw new Error('Failed to place order');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('There was an error processing your order. Please try again.');
    }
});