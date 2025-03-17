// This file simulates a database with localStorage
// In a real application, this would be replaced with actual database calls

// Initialize database if it doesn't exist
function initDatabase() {
    if (!localStorage.getItem('stores')) {
        localStorage.setItem('stores', JSON.stringify([]));
    }
    if (!localStorage.getItem('deliveries')) {
        localStorage.setItem('deliveries', JSON.stringify([]));
    }
    if (!localStorage.getItem('mileage')) {
        localStorage.setItem('mileage', JSON.stringify([]));
    }
}

// Store operations
function getStores() {
    return JSON.parse(localStorage.getItem('stores')) || [];
}

function addStore(store) {
    const stores = getStores();
    store.id = Date.now().toString();
    stores.push(store);
    localStorage.setItem('stores', JSON.stringify(stores));
    return store;
}

function updateStore(storeId, updatedStore) {
    const stores = getStores();
    const index = stores.findIndex(store => store.id === storeId);
    if (index !== -1) {
        stores[index] = { ...stores[index], ...updatedStore };
        localStorage.setItem('stores', JSON.stringify(stores));
        return stores[index];
    }
    return null;
}

function deleteStore(storeId) {
    const stores = getStores();
    const filteredStores = stores.filter(store => store.id !== storeId);
    localStorage.setItem('stores', JSON.stringify(filteredStores));
}

// Delivery operations
function getDeliveries() {
    return JSON.parse(localStorage.getItem('deliveries')) || [];
}

function addDelivery(delivery) {
    const deliveries = getDeliveries();
    delivery.id = Date.now().toString();
    delivery.date = new Date().toISOString();
    delivery.status = 'Assigned';
    deliveries.push(delivery);
    localStorage.setItem('deliveries', JSON.stringify(deliveries));
    return delivery;
}

function updateDelivery(deliveryId, updatedDelivery) {
    const deliveries = getDeliveries();
    const index = deliveries.findIndex(delivery => delivery.id === deliveryId);
    if (index !== -1) {
        deliveries[index] = { ...deliveries[index], ...updatedDelivery };
        localStorage.setItem('deliveries', JSON.stringify(deliveries));
        return deliveries[index];
    }
    return null;
}

function deleteDelivery(deliveryId) {
    const deliveries = getDeliveries();
    const filteredDeliveries = deliveries.filter(delivery => delivery.id !== deliveryId);
    localStorage.setItem('deliveries', JSON.stringify(filteredDeliveries));
}

// Mileage operations
function getMileageEntries() {
    return JSON.parse(localStorage.getItem('mileage')) || [];
}

function addMileageEntry(entry) {
    const entries = getMileageEntries();
    entry.id = Date.now().toString();
    entry.totalKm = entry.endKm - entry.startKm;
    entries.push(entry);
    localStorage.setItem('mileage', JSON.stringify(entries));
    return entry;
}

function updateMileageEntry(entryId, updatedEntry) {
    const entries = getMileageEntries();
    const index = entries.findIndex(entry => entry.id === entryId);
    if (index !== -1) {
        updatedEntry.totalKm = updatedEntry.endKm - updatedEntry.startKm;
        entries[index] = { ...entries[index], ...updatedEntry };
        localStorage.setItem('mileage', JSON.stringify(entries));
        return entries[index];
    }
    return null;
}

function deleteMileageEntry(entryId) {
    const entries = getMileageEntries();
    const filteredEntries = entries.filter(entry => entry.id !== entryId);
    localStorage.setItem('mileage', JSON.stringify(filteredEntries));
}

// Statistics functions
function getDeliveriesByStore(period = 'week') {
    const deliveries = getDeliveries();
    const stores = getStores();
    const now = new Date();
    
    let startDate;
    if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const filteredDeliveries = deliveries.filter(delivery => {
        const deliveryDate = new Date(delivery.date);
        return deliveryDate >= startDate && deliveryDate <= now;
    });
    
    const result = {};
    stores.forEach(store => {
        result[store.name] = filteredDeliveries.filter(delivery => delivery.storeId === store.id).length;
    });
    
    return result;
}

function getDailyDeliveries(period = 'week') {
    const deliveries = getDeliveries();
    const now = new Date();
    
    let startDate;
    if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
    } else if (period === 'month') {
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const result = {};
    let currentDate = new Date(startDate);
    
    while (currentDate <= now) {
        const dateString = currentDate.toISOString().split('T')[0];
        result[dateString] = 0;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    deliveries.forEach(delivery => {
        const deliveryDate = new Date(delivery.date);
        if (deliveryDate >= startDate && deliveryDate <= now) {
            const dateString = deliveryDate.toISOString().split('T')[0];
            result[dateString] = (result[dateString] || 0) + 1;
        }
    });
    
    return result;
}

// Initialize database
initDatabase();
