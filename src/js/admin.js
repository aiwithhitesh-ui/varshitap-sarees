// Admin Authentication
let currentAdmin = null;

document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Check credentials
    if (username === 'aiwithhitesh' && password === 'mantra@108') {
        currentAdmin = { username, name: 'Admin' };
        localStorage.setItem('admin', JSON.stringify(currentAdmin));
        showAdminPanel();
        loadDashboardData();
    } else {
        document.getElementById('loginError').textContent = 'Invalid credentials';
    }
});

function showAdminPanel() {
    document.getElementById('authContainer').style.display = 'none';
    document.getElementById('adminContainer').style.display = 'block';
    document.getElementById('userName').textContent = currentAdmin.name;
}

function logout() {
    currentAdmin = null;
    localStorage.removeItem('admin');
    location.reload();
}

// Check if already logged in
window.addEventListener('DOMContentLoaded', () => {
    const savedAdmin = localStorage.getItem('admin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        showAdminPanel();
        loadDashboardData();
    } else {
        document.getElementById('authContainer').style.display = 'flex';
    }
    
    setupMenuItems();
    setupProductForm();
});

// Menu Navigation
function setupMenuItems() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageId = item.getAttribute('href').slice(1);
            showAdminPage(pageId);
        });
    });
}

function showAdminPage(pageId) {
    document.querySelectorAll('.admin-page').forEach(page => {
        page.classList.remove('active');
    });
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    
    document.getElementById(pageId).classList.add('active');
    document.querySelector(`[href="#${pageId}"]`).classList.add('active');
    
    if (pageId === 'products') {
        loadProductsTable();
    }
}

// Dashboard
async function loadDashboardData() {
    try {
        const snapshot = await db.collection('products').get();
        const products = [];
        snapshot.forEach(doc => {
            products.push(doc.data());
        });
        
        const total = products.length;
        const designer = products.filter(p => p.category === 'Designer Saree Range').length;
        const daily = products.filter(p => p.category === 'Daily Wear Collection').length;
        
        document.getElementById('totalProducts').textContent = total;
        document.getElementById('designerCount').textContent = designer;
        document.getElementById('dailyWearCount').textContent = daily;
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// Products Table
async function loadProductsTable() {
    try {
        const snapshot = await db.collection('products').get();
        const tbody = document.getElementById('productsTableBody');
        tbody.innerHTML = '';
        
        snapshot.forEach(doc => {
            const product = doc.data();
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.price ? '₹' + product.price : 'N/A'}</td>
                <td>${product.status || 'active'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="editProduct('${doc.id}')">Edit</button>
                        <button class="delete-btn" onclick="deleteProduct('${doc.id}')">Delete</button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

function editProduct(productId) {
    alert('Edit functionality - Product ID: ' + productId);
}

function deleteProduct(productId) {
    if (confirm('Are you sure?')) {
        db.collection('products').doc(productId).delete()
            .then(() => {
                alert('Product deleted');
                loadProductsTable();
                loadDashboardData();
            })
            .catch(error => console.error('Error:', error));
    }
}

// Product Form
function setupProductForm() {
    document.getElementById('productForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const product = {
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            description: document.getElementById('prodDescription').value,
            price: parseFloat(document.getElementById('prodPrice').value) || null,
            featured: document.getElementById('prodFeatured').checked,
            inStock: document.getElementById('prodInStock').checked,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            images: []
        };
        
        // Upload images
        const fileInput = document.getElementById('prodImages');
        if (fileInput.files.length > 0) {
            for (let file of fileInput.files) {
                if (product.images.length >= 5) break;
                
                const storageRef = storage.ref(`products/${Date.now()}_${file.name}`);
                const uploadTask = await storageRef.put(file);
                const url = await uploadTask.ref.getDownloadURL();
                
                product.images.push({
                    url: url,
                    alt: product.name,
                    order: product.images.length
                });
            }
        }
        
        // Save to database
        db.collection('products').add(product)
            .then(() => {
                alert('Product saved successfully!');
                document.getElementById('productForm').reset();
                document.getElementById('imagePreview').innerHTML = '';
                loadDashboardData();
            })
            .catch(error => console.error('Error:', error));
    });
    
    // Image preview
    document.getElementById('prodImages')?.addEventListener('change', (e) => {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = '';
        
        for (let file of e.target.files) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const div = document.createElement('div');
                div.className = 'image-preview-item';
                div.innerHTML = `<img src="${event.target.result}" alt="preview">`;
                preview.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    });
}
