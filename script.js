// Login //
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById('message').innerText = data.message;
}

// Create User //
async function createUser() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/createUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    const data = await response.json();
    document.getElementById('message').innerText = data.message;
}

// Register Page //
async function register() {
    const name = document.getElementById('name').value;
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const type = document.getElementById('type').value;

    const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, username, password, type })
    });

    const data = await response.json();
    document.getElementById('message').innerText = data.message;

    if (data.success) {
        setTimeout(() => {
            window.location.href = 'login.html'; // Redirects to login screen
        }, 1000); // Wait 1 second before redirecting (optional)
    }
}

// Redirection Login //
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
    });

    if (response.status === 200) {
        window.location.href = 'dashboard.html'; // Redirects to the dashboard
    } else {
        document.getElementById('message').innerText = 'Invalid username or password.';
    }
}

// Logout //
async function logout() {
    const response = await fetch('/api/logout', {
        method: 'GET',
    });

    // Redirect to login page after logoff
    window.location.href = '/login.html';
}

// Employeer //
const employeeForm = document.getElementById('employeeForm');
const employeeList = document.getElementById('employeeList');

// Add Employeer //
employeeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const position = document.getElementById('position').value;
    const department = document.getElementById('department').value;

    await fetch('/api/employees', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, phone, position, department })
    });

    displayEmployees();
    employeeForm.reset();
});

// Display Employeer //
async function displayEmployees() {
    const response = await fetch('/api/employees');
    const employees = await response.json();

    employeeList.innerHTML = `
        <table>
            <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Position</th>
                <th>Department</th>
                <th>Actions</th>
            </tr>
            ${employees.map(employee => `
                <tr>
                    <td>${employee.name}</td>
                    <td>${employee.email}</td>
                    <td>${employee.phone}</td>
                    <td>${employee.position}</td>
                    <td>${employee.department}</td>
                    <td>
                        <button onclick="updateEmployee('${employee._id}')">Update</button>
                        <button onclick="deleteEmployee('${employee._id}')">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </table>
    `;
}

// Update Employeer //
async function updateEmployee(id) {
    const newName = prompt('Enter new name:');
    if (newName) {
        await fetch(`/api/employees/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        displayEmployees();
    }
}

// Delete Employeer //
async function deleteEmployee(id) {
    await fetch(`/api/employees/${id}`, { method: 'DELETE' });
    displayEmployees();
}

displayEmployees();