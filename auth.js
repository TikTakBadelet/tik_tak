// Sample user data (in a real app, this would come from a database)
const users = [
    { username: 'manager', password: 'manager123', type: 'manager' },
    { username: 'worker1', password: 'worker123', type: 'worker' }
];

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    const messageElement = document.getElementById('loginMessage');
    
    // Find user
    const user = users.find(u => u.username === username && u.password === password && u.type === userType);
    
    if (user) {
        // Store user info in localStorage (in a real app, use secure methods)
        localStorage.setItem('currentUser', JSON.stringify({
            username: user.username,
            type: user.type
        }));
        
        // Redirect based on user type
        if (user.type === 'manager') {
            window.location.href = 'manager.html';
        } else {
            window.location.href = 'worker.html';
        }
    } else {
        messageElement.textContent = 'Invalid username, password, or user type!';
        messageElement.className = 'message error';
    }
});
