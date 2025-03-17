// Check if user is logged in and is a worker
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    if (!currentUser || currentUser.type !== 'worker') {
        window.location.href = 'index.html';
        return;
    }
    
    // Display username
    document.getElementById('userDisplay').textContent = `Welcome, ${currentUser.username}`;
    
    // Set up tab navigation
    setupTabNavigation();
    
    // Set up deliveries tab
    setupDeliveriesTab();
    
    // Set up mileage tab
    setupMileageTab();
    
    // Set up map tab
    setupMapTab();
    
    // Set up logout button
    document.getElementById('logoutBtn').addEventListener('click', function() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    });
});

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

// Set up Deliveries tab
function setupDeliveriesTab() {
    const filterBtn = document.getElementById('filterDeliveriesBtn');
    const statusFilter = document.getElementById('statusFilter');
    
    // Handle filter button click
    filterBtn.addEventListener('click', function() {
        populateDeliveriesTable(statusFilter.value);
    });
    
    // Initial population of deliveries table
    populateDeliveriesTable('all');
}

// Populate deliveries table with data
function populateDeliveriesTable(statusFilter) {
    const deliveriesTable = document.getElementById('workerDeliveriesTable').getElementsByTagName('tbody')[0];
    const deliveries = getDeliveries();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter deliveries for current worker
    let workerDeliveries = deliveries.filter(delivery => delivery.worker === currentUser.username);
    
    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
        workerDeliveries = workerDeliveries.filter(delivery => delivery.status === statusFilter);
    }
    
    // Clear existing rows
    deliveriesTable.innerHTML = '';
    
    if (workerDeliveries.length === 0) {
        const row = deliveriesTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 6;
        cell.textContent = 'No deliveries found matching the selected criteria.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    workerDeliveries.forEach(delivery => {
        const row = deliveriesTable.insertRow();
        
        row.insertCell(0).textContent = delivery.id;
        row.insertCell(1).textContent = delivery.storeName;
        row.insertCell(2).textContent = delivery.address;
        
        const statusCell = row.insertCell(3);
        statusCell.textContent = delivery.status;
        if (delivery.status === 'Completed') {
            statusCell.style.color = 'green';
        } else if (delivery.status === 'In Progress') {
            statusCell.style.color = 'blue';
        }
        
        // Format date
        const date = new Date(delivery.date);
        row.insertCell(4).textContent = date.toLocaleString();
        
        const actionsCell = row.insertCell(5);

        // Update status button
        const statusBtn = document.createElement('button');
        statusBtn.textContent = 'Update Status';
        statusBtn.className = 'btn btn-small btn-update-status';
        statusBtn.onclick = function() {
            let newStatus;
    
            if (delivery.status === 'Assigned') {
                newStatus = 'In Progress';
            } else if (delivery.status === 'In Progress') {
                newStatus = 'Completed';
            } else {
                alert('This delivery is already completed.');
                 return;
             }
    
             if (confirm(`Update delivery status to ${newStatus}?`)) {
                updateDelivery(delivery.id, { status: newStatus });
                populateDeliveriesTable(statusFilter);
             }
        };

// View details button
const detailsBtn = document.createElement('button');
detailsBtn.textContent = 'View Details';
detailsBtn.className = 'btn btn-small';
detailsBtn.style.marginLeft = '5px';
detailsBtn.onclick = function() {
    alert(`Delivery Details:\n\nID: ${delivery.id}\nStore: ${delivery.storeName}\nAddress: ${delivery.address}\nStatus: ${delivery.status}\nDate: ${new Date(delivery.date).toLocaleString()}\nDetails: ${delivery.details || 'No additional details'}`);
};

actionsCell.appendChild(statusBtn);
actionsCell.appendChild(detailsBtn);
});

// Also update the navigation dropdown
updateNavigationDropdown();
}

// Set up Mileage tab
function setupMileageTab() {
    const addMileageBtn = document.getElementById('addWorkerMileageBtn');
    const mileageForm = document.getElementById('workerMileageForm');
    const newMileageForm = document.getElementById('newWorkerMileageForm');
    const cancelMileageBtn = document.getElementById('cancelWorkerMileageBtn');
    
    // Set default date to today
    document.getElementById('workerMileageDate').valueAsDate = new Date();
    
    // Show/hide mileage form
    addMileageBtn.addEventListener('click', function() {
        mileageForm.style.display = 'block';
        this.style.display = 'none';
    });
    
    cancelMileageBtn.addEventListener('click', function() {
        mileageForm.style.display = 'none';
        addMileageBtn.style.display = 'block';
        newMileageForm.reset();
        document.getElementById('workerMileageDate').valueAsDate = new Date();
    });
    
    // Handle mileage form submission
    newMileageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const currentUser = JSON.parse(localStorage.getItem('currentUser'));
        const startKm = parseInt(document.getElementById('workerStartKm').value);
        const endKm = parseInt(document.getElementById('workerEndKm').value);
        
        if (endKm <= startKm) {
            alert('Ending kilometers must be greater than starting kilometers.');
            return;
        }
        
        const entry = {
            worker: currentUser.username,
            date: document.getElementById('workerMileageDate').value,
            startKm: startKm,
            endKm: endKm
        };
        
        addMileageEntry(entry);
        
        // Reset form and update UI
        this.reset();
        document.getElementById('workerMileageDate').valueAsDate = new Date();
        mileageForm.style.display = 'none';
        addMileageBtn.style.display = 'block';
        
        // Refresh mileage table
        populateWorkerMileageTable();
    });
    
    // Initial population of mileage table
    populateWorkerMileageTable();
}

// Populate worker's mileage table with data
function populateWorkerMileageTable() {
    const mileageTable = document.getElementById('workerMileageTable').getElementsByTagName('tbody')[0];
    const entries = getMileageEntries();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter entries for current worker
    const workerEntries = entries.filter(entry => entry.worker === currentUser.username);
    
    // Clear existing rows
    mileageTable.innerHTML = '';
    
    if (workerEntries.length === 0) {
        const row = mileageTable.insertRow();
        const cell = row.insertCell(0);
        cell.colSpan = 4;
        cell.textContent = 'No mileage entries found. Add an entry to get started.';
        cell.style.textAlign = 'center';
        cell.style.padding = '20px';
        return;
    }
    
    workerEntries.forEach(entry => {
        const row = mileageTable.insertRow();
        
        row.insertCell(0).textContent = entry.date;
        row.insertCell(1).textContent = entry.startKm;
        row.insertCell(2).textContent = entry.endKm;
        row.insertCell(3).textContent = entry.totalKm;
    });
}

// Set up Map tab
function setupMapTab() {
    const navigateBtn = document.getElementById('navigateBtn');
    
    // Update navigation dropdown
    updateNavigationDropdown();
    
    // Handle navigate button click
    navigateBtn.addEventListener('click', function() {
        const deliveryId = document.getElementById('deliveryToNavigate').value;
        
        if (!deliveryId) {
            alert('Please select a delivery to navigate.');
            return;
        }
        
        // Get delivery details
        const deliveries = getDeliveries();
        const delivery = deliveries.find(d => d.id === deliveryId);
        
        if (!delivery) {
            alert('Delivery not found.');
            return;
        }
        
        // In a real app, this would integrate with a mapping API
        // For this demo, we'll just show a placeholder
        const mapDisplay = document.getElementById('mapDisplay');
        mapDisplay.innerHTML = `
            <div class="map-placeholder">
                <h3>Navigation to: ${delivery.address}</h3>
                <p>From: Your current location</p>
                <p>To: ${delivery.address}</p>
                <p>Store: ${delivery.storeName}</p>
                <p>Status: ${delivery.status}</p>
                <p class="note">In a real application, this would display an interactive map with directions.</p>
            </div>
        `;
    });
}

// Update navigation dropdown with assigned and in-progress deliveries
function updateNavigationDropdown() {
    const deliverySelect = document.getElementById('deliveryToNavigate');
    const deliveries = getDeliveries();
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    
    // Filter deliveries for current worker that are not completed
    const activeDeliveries = deliveries.filter(delivery => 
        delivery.worker === currentUser.username && 
        delivery.status !== 'Completed'
    );
    
    // Clear existing options
    deliverySelect.innerHTML = '';
    
    if (activeDeliveries.length === 0) {
        const option = document.createElement('option');
        option.text = 'No active deliveries';
        option.disabled = true;
        deliverySelect.add(option);
    } else {
        const defaultOption = document.createElement('option');
        defaultOption.text = 'Select a delivery';
        defaultOption.value = '';
        deliverySelect.add(defaultOption);
        
        activeDeliveries.forEach(delivery => {
            const option = document.createElement('option');
            option.value = delivery.id;
            option.text = `${delivery.storeName} - ${delivery.address}`;
            deliverySelect.add(option);
        });
    }
}
