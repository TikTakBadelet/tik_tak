// Check if user is logged in and is a manager
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.type !== 'manager') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    document.getElementById('userDisplay').textContent = `Welcome, ${currentUser.username}`;
    
    // Initialize the dashboard
    initializeDashboard();
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up forms and tables
    setupStoresTab();
    setupDeliveriesTab();
    setupMileageTab();
    setupStatisticsTab();
    
    // Set up logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});

// Initialize dashboard with summary data
function initializeDashboard() {
    const stores = getStores();
    const deliveries = getDeliveries();
    const mileageEntries = getMileageEntries();
    
    document.getElementById('totalStores').textContent = stores.length;
    document.getElementById('totalDeliveries').textContent = deliveries.length;
    document.getElementById('activeWorkers').textContent = '1'; // Hardcoded for demo
    
    // Count today's deliveries
    const today = new Date().toISOString().split('T')[0];
    const todayDeliveries = deliveries.filter(delivery => 
        delivery.date.startsWith(today)
    ).length;
    
    document.getElementById('todayDeliveries').textContent = todayDeliveries;
}

// Set up tab navigation
function setupTabNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            navItems.forEach(navItem => navItem.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked item
            this.classList.add('active');
            
            // Show corresponding tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Set up Stores tab
function setupStoresTab() {
    const addStoreBtn = document.getElementById('addStoreBtn');
    const storeForm = document.getElementById('storeForm');
    const newStoreForm = document.getElementById('newStoreForm');
    const cancelStoreBtn = document.getElementById('cancelStoreBtn');
    
    // Show/hide store form
    addStoreBtn.addEventListener('click', function() {
        storeForm.style.display = 'block';
        this.style.display = 'none';
    });
    
    cancelStoreBtn.addEventListener('click', function() {
        storeForm.style.display = 'none';
        addStoreBtn.style.display = 'block';
        newStoreForm.reset();
    });
    
    // Handle store form submission
    newStoreForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const store = {
            name: document.getElementById('storeName').value,
            address: document.getElementById('storeAddress').value,
            phone: document.getElementById('storePhone').value,
            coordinates: document.getElementById('storeCoordinates').value
        };
        
        addStore(store);
        
        // Reset form and update UI
        this.reset();
        storeForm.style.display = 'none';
        addStoreBtn.style.display = 'block';
        
        // Refresh stores table
        populateStoresTable();
        
        // Update dashboard
        initializeDashboard();
    });
    
    // Initial population of stores table
    populateStoresTable();
}

// Populate stores table with data
function populateStoresTable() {
    const storesTable = document.getElementById('storesTable').getElementsByTagName('tbody')[0];
    const stores = getStores();
    
    // Clear existing rows
    storesTable.innerHTML = '';
    
    if (stores.length === 0) {
        const row = storesTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 5;
        cell.textContent = 'No stores found. Add a store to get started.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    stores.forEach(store => {
        const row = storesTable.insertRow();
        
        row.insertCell(0).textContent = store.id;
        row.insertCell(1).textContent = store.name;
        row.insertCell(2).textContent = store.address;
        row.insertCell(3).textContent = store.phone;
        
        const actionsCell = row.insertCell(4);
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-small';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = function() {
            // Populate form with store data for editing
            document.getElementById('storeName').value = store.name;
            document.getElementById('storeAddress').value = store.address;
            document.getElementById('storePhone').value = store.phone;
            document.getElementById('storeCoordinates').value = store.coordinates || '';
            
            // Show form
            document.getElementById('storeForm').style.display = 'block';
            document.getElementById('addStoreBtn').style.display = 'none';
            
            // Change form submission to update instead of add
            const form = document.getElementById('newStoreForm');
            form.onsubmit = function(e) {
                e.preventDefault();
                
                const updatedStore = {
                    name: document.getElementById('storeName').value,
                    address: document.getElementById('storeAddress').value,
                    phone: document.getElementById('storePhone').value,
                    coordinates: document.getElementById('storeCoordinates').value
                };
                
                updateStore(store.id, updatedStore);
                
                // Reset form and update UI
                form.reset();
                document.getElementById('storeForm').style.display = 'none';
                document.getElementById('addStoreBtn').style.display = 'block';
                
                // Reset form submission to add
                form.onsubmit = null;
                
                // Refresh stores table
                populateStoresTable();
            };
        };
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn btn-small btn-danger';
        deleteBtn.onclick = function() {
            if (confirm('Are you sure you want to delete this store?')) {
                deleteStore(store.id);
                populateStoresTable();
                initializeDashboard();
            }
        };
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

// Set up Deliveries tab
function setupDeliveriesTab() {
    const assignDeliveryBtn = document.getElementById('assignDeliveryBtn');
    const deliveryForm = document.getElementById('deliveryForm');
    const newDeliveryForm = document.getElementById('newDeliveryForm');
    const cancelDeliveryBtn = document.getElementById('cancelDeliveryBtn');
    const deliveryStoreSelect = document.getElementById('deliveryStore');
    
    // Show/hide delivery form
    assignDeliveryBtn.addEventListener('click', function() {
        deliveryForm.style.display = 'block';
        this.style.display = 'none';
        
        // Populate store dropdown
        populateStoreDropdown();
    });
    
    cancelDeliveryBtn.addEventListener('click', function() {
        deliveryForm.style.display = 'none';
        assignDeliveryBtn.style.display = 'block';
        newDeliveryForm.reset();
    });
    
    // Handle delivery form submission
    newDeliveryForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const delivery = {
            storeId: document.getElementById('deliveryStore').value,
            storeName: document.getElementById('deliveryStore').options[document.getElementById('deliveryStore').selectedIndex].text,
            worker: document.getElementById('deliveryWorker').value,
            address: document.getElementById('deliveryAddress').value,
            details: document.getElementById('deliveryDetails').value
        };
        
        addDelivery(delivery);
        
        // Reset form and update UI
        this.reset();
        deliveryForm.style.display = 'none';
        assignDeliveryBtn.style.display = 'block';
        
        // Refresh deliveries table
        populateDeliveriesTable();
        
        // Update dashboard
        initializeDashboard();
    });
    
    // Initial population of deliveries table
    populateDeliveriesTable();
}

// Populate store dropdown for delivery assignment
function populateStoreDropdown() {
    const storeSelect = document.getElementById('deliveryStore');
    const stores = getStores();
    
    // Clear existing options
    storeSelect.innerHTML = '';
    
    if (stores.length === 0) {
        const option = document.createElement('option');
        option.text = 'No stores available';
        option.disabled = true;
        storeSelect.add(option);
    } else {
        stores.forEach(store => {
            const option = document.createElement('option');
            option.value = store.id;
            option.text = store.name;
            storeSelect.add(option);
        });
    }
}

// Populate deliveries table with data
function populateDeliveriesTable() {
    const deliveriesTable = document.getElementById('deliveriesTable').getElementsByTagName('tbody')[0];
    const deliveries = getDeliveries();
    
    // Clear existing rows
    deliveriesTable.innerHTML = '';
    
    if (deliveries.length === 0) {
        const row = deliveriesTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.textContent = 'No deliveries found. Assign a delivery to get started.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    deliveries.forEach(delivery => {
        const row = deliveriesTable.insertRow();
        
        row.insertCell(0).textContent = delivery.id;
        row.insertCell(1).textContent = delivery.storeName;
        row.insertCell(2).textContent = delivery.worker;
        row.insertCell(3).textContent = delivery.address;
        
        const statusCell = row.insertCell(4);
        statusCell.textContent = delivery.status;
        if (delivery.status === 'Completed') {
            statusCell.style.color = 'green';
        } else if (delivery.status === 'In Progress') {
            statusCell.style.color = 'blue';
        }
        
        // Format date
        const date = new Date(delivery.date);
        row.insertCell(5).textContent = date.toLocaleString();
        
        const actionsCell = row.insertCell(6);
        
        // Update status button
        const statusBtn = document.createElement('button');
        statusBtn.textContent = 'Update Status';
        statusBtn.className = 'btn btn-small';
        statusBtn.style.marginRight = '5px';
        statusBtn.onclick = function() {
            const newStatus = prompt('Update delivery status (Assigned, In Progress, Completed):', delivery.status);
            if (newStatus && ['Assigned', 'In Progress', 'Completed'].includes(newStatus)) {
                updateDelivery(delivery.id, { status: newStatus });
                populateDeliveriesTable();
            }
        };
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn btn-small btn-danger';
        deleteBtn.onclick = function() {
            if (confirm('Are you sure you want to delete this delivery?')) {
                deleteDelivery(delivery.id);
                populateDeliveriesTable();
                initializeDashboard();
            }
        };
        
        actionsCell.appendChild(statusBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

// Set up Mileage tab
function setupMileageTab() {
    const addMileageBtn = document.getElementById('addMileageBtn');
    const mileageForm = document.getElementById('mileageForm');
    const newMileageForm = document.getElementById('newMileageForm');
    const cancelMileageBtn = document.getElementById('cancelMileageBtn');
    
    // Set default date to today
    document.getElementById('mileageDate').valueAsDate = new Date();
    
    // Show/hide mileage form
    addMileageBtn.addEventListener('click', function() {
        mileageForm.style.display = 'block';
        this.style.display = 'none';
    });
    
    cancelMileageBtn.addEventListener('click', function() {
        mileageForm.style.display = 'none';
        addMileageBtn.style.display = 'block';
        newMileageForm.reset();
        document.getElementById('mileageDate').valueAsDate = new Date();
    });
    
    // Handle mileage form submission
    newMileageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const startKm = parseInt(document.getElementById('startKm').value);
        const endKm = parseInt(document.getElementById('endKm').value);
        
        if (endKm <= startKm) {
            alert('Ending kilometers must be greater than starting kilometers.');
            return;
        }
        
        const entry = {
            worker: document.getElementById('mileageWorker').value,
            date: document.getElementById('mileageDate').value,
            startKm: startKm,
            endKm: endKm
        };
        
        addMileageEntry(entry);
        
        // Reset form and update UI
        this.reset();
        document.getElementById('mileageDate').valueAsDate = new Date();
        mileageForm.style.display = 'none';
        addMileageBtn.style.display = 'block';
        
        // Refresh mileage table
        populateMileageTable();
    });
    
    // Initial population of mileage table
    populateMileageTable();
}

// Populate mileage table with data
function populateMileageTable() {
    const mileageTable = document.getElementById('mileageTable').getElementsByTagName('tbody')[0];
    const entries = getMileageEntries();
    
    // Clear existing rows
    mileageTable.innerHTML = '';
    
    if (entries.length === 0) {
        const row = mileageTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 7;
        cell.textContent = 'No mileage entries found. Add an entry to get started.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    entries.forEach(entry => {
        const row = mileageTable.insertRow();
        
        row.insertCell(0).textContent = entry.id;
        row.insertCell(1).textContent = entry.worker;
        row.insertCell(2).textContent = entry.date;
        row.insertCell(3).textContent = entry.startKm;
        row.insertCell(4).textContent = entry.endKm;
        row.insertCell(5).textContent = entry.totalKm;
        
        const actionsCell = row.insertCell(6);
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'btn btn-small';
        editBtn.style.marginRight = '5px';
        editBtn.onclick = function() {
            // Populate form with entry data for editing
            document.getElementById('mileageWorker').value = entry.worker;
            document.getElementById('mileageDate').value = entry.date;
            document.getElementById('startKm').value = entry.startKm;
            document.getElementById('endKm').value = entry.endKm;
            
            // Show form
            document.getElementById('mileageForm').style.display = 'block';
            document.getElementById('addMileageBtn').style.display = 'none';
            
            // Change form submission to update instead of add
            const form = document.getElementById('newMileageForm');
            form.onsubmit = function(e) {
                e.preventDefault();
                
                const startKm = parseInt(document.getElementById('startKm').value);
                const endKm = parseInt(document.getElementById('endKm').value);
                
                if (endKm <= startKm) {
                    alert('Ending kilometers must be greater than starting kilometers.');
                    return;
                }
                
                const updatedEntry = {
                    worker: document.getElementById('mileageWorker').value,
                    date: document.getElementById('mileageDate').value,
                    startKm: startKm,
                    endKm: endKm
                };
                
                updateMileageEntry(entry.id, updatedEntry);
                
                // Reset form and update UI
                form.reset();
                document.getElementById('mileageDate').valueAsDate = new Date();
                document.getElementById('mileageForm').style.display = 'none';
                document.getElementById('addMileageBtn').style.display = 'block';
                
                // Reset form submission to add
                form.onsubmit = null;
                
                // Refresh mileage table
                populateMileageTable();
            };
        };
        
        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'btn btn-small btn-danger';
        deleteBtn.onclick = function() {
            if (confirm('Are you sure you want to delete this mileage entry?')) {
                deleteMileageEntry(entry.id);
                populateMileageTable();
            }
        };
        
        actionsCell.appendChild(editBtn);
        actionsCell.appendChild(deleteBtn);
    });
}

// Set up Statistics tab
function setupStatisticsTab() {
    document.getElementById('generateStatsBtn').addEventListener('click', function() {
        const period = document.getElementById('statsPeriod').value;
        generateStatistics(period);
    });
    
    // Generate initial statistics
    generateStatistics('week');
}

// Generate statistics based on selected period
function generateStatistics(period) {
    // Get data
    const storeDeliveries = getDeliveriesByStore(period);
    const dailyDeliveries = getDailyDeliveries(period);
    
    // Populate store performance table
    populateStoreStatsTable(storeDeliveries);
    
    // For a real implementation, you would use a charting library like Chart.js
    // Here we'll just display the data in text format
    const storeChart = document.getElementById('storeDeliveriesChart');
    storeChart.innerHTML = '<div style="padding: 20px; background-color: #f5f5f5; border-radius: 4px;">';
    
    for (const store in storeDeliveries) {
        storeChart.innerHTML += `<div>${store}: ${storeDeliveries[store]} deliveries</div>`;
    }
    
    storeChart.innerHTML += '</div>';
    
    const dailyChart = document.getElementById('dailyDeliveriesChart');
    dailyChart.innerHTML = '<div style="padding: 20px; background-color: #f5f5f5; border-radius: 4px;">';
    
    for (const date in dailyDeliveries) {
        dailyChart.innerHTML += `<div>${date}: ${dailyDeliveries[date]} deliveries</div>`;
    }
    
    dailyChart.innerHTML += '</div>';
}

// Populate store statistics table
function populateStoreStatsTable(storeDeliveries) {
    const storeStatsTable = document.getElementById('storeStatsTable').getElementsByTagName('tbody')[0];
    
    // Clear existing rows
    storeStatsTable.innerHTML = '';
    
    if (Object.keys(storeDeliveries).length === 0) {
        const row = storeStatsTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 3;
        cell.textContent = 'No data available for the selected period.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    for (const store in storeDeliveries) {
        const row = storeStatsTable.insertRow();
        
        row.insertCell(0).textContent = store;
        row.insertCell(1).textContent = storeDeliveries[store];
        row.insertCell(2).textContent = '30 min'; // Placeholder for average delivery time
    }
}
