// Navigation
const navLinks = document.querySelectorAll('.nav-link');
const pages = document.querySelectorAll('.page');

function navigateTo(pageName) {
    pages.forEach(page => page.classList.remove('active'));
    navLinks.forEach(link => link.classList.remove('active'));
    
    const targetPage = document.getElementById(pageName);
    if (targetPage) {
        targetPage.classList.add('active');
        
        const targetLink = Array.from(navLinks).find(link => 
            link.getAttribute('href') === `#${pageName}`
        );
        if (targetLink) {
            targetLink.classList.add('active');
        }
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Show home page on load
    document.getElementById('home').classList.add('active');
    document.querySelector('[href="#home"]').classList.add('active');
    
    // Load products
    loadProducts();
    
    // Contact form
    document.getElementById('contactForm')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = e.target.value;
        const message = e.target.value;
        const waLink = `https://wa.me/919328086676?text=Name: ${name}%0AMessage: ${message}`;
        window.open(waLink, '_blank');
    });
});

// Products
async function loadProducts() {
    try {
        const snapshot = await db.collection('products')
            .where('status', '==', 'active')
            .get();
        
        const products = [];
        snapshot.forEach(doc => {
            products.push({ id: doc.id, ...doc.data() });
        });
        
        // Load featured
        const featured = products.filter(p => p.featured).slice(0, 8);
        displayProducts(featured, 'featuredProducts');
        
        // Load all
        displayProducts(products, 'productsGrid');
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = products.length === 0 ? 
        '<p style="grid-column: 1/-1; text-align: center; color: #999;">No products available</p>' :
        products.map(product => `
            <div class="product-card">
                ${product.images && product.images ? 
                    `<img src="${product.images.url}" alt="${product.name}" class="product-image">` :
                    '<div class="product-image" style="background: #e0e0e0;"></div>'}
                <div class="product-info">
                    <span class="product-category">${product.category}</span>
                    <div class="product-name">${product.name}</div>
                    <div class="product-description">${product.description?.substring(0, 80)}...</div>
                    ${product.price ? `<div class="product-price">₹${product.price}</div>` : ''}
                    <div class="product-actions">
                        <button class="view-details" onclick="showProductDetails('${product.id}')">
                            View Details
                        </button>
                        <a href="https://wa.me/919328086676?text=Hi,%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}" 
                           target="_blank" class="btn order-whatsapp">
                            Order
                        </a>
                    </div>
                </div>
            </div>
        `).join('');
}

function showProductDetails(productId) {
    db.collection('products').doc(productId).get().then(doc => {
        if (doc.exists) {
            const product = doc.data();
            const modal = document.getElementById('productModal');
            const modalBody = document.getElementById('modalBody');
            
            modalBody.innerHTML = `
                <div style="padding: 20px;">
                    ${product.images && product.images ? 
                        `<img src="${product.images.url}" alt="${product.name}" style="width: 100%; max-height: 300px; object-fit: cover; border-radius: 8px; margin-bottom: 20px;">` :
                        ''}
                    <h2>${product.name}</h2>
                    <span class="product-category">${product.category}</span>
                    <p style="margin: 15px 0; line-height: 1.6;">${product.description}</p>
                    ${product.price ? `<p style="font-size: 20px; color: var(--primary-color); font-weight: bold; margin: 15px 0;">₹${product.price}</p>` : ''}
                    <a href="https://wa.me/919328086676?text=Hi,%20I%27m%20interested%20in%20${encodeURIComponent(product.name)}" 
                       target="_blank" class="btn btn-secondary" style="width: 100%; text-align: center; margin-top: 15px;">
                        Order on WhatsApp
                    </a>
                </div>
            `;
            
            modal.style.display = 'block';
        }
    });
}

// Modal close
document.querySelector('.close')?.addEventListener('click', () => {
    document.getElementById('productModal').style.display = 'none';
});

window.addEventListener('click', (event) => {
    const modal = document.getElementById('productModal');
    if (event.target == modal) {
        modal.style.display = 'none';
    }
});

// Navigation clicks
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const pageName = link.getAttribute('href').slice(1);
        navigateTo(pageName);
    });
});
