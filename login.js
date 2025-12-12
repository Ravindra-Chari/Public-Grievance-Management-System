// ============================================
// MODULE 1: LOGIN MODULE
// ============================================

// Authentication Functions
function showAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const authTabs = document.querySelectorAll('.auth-tab');

    authTabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginTab.style.display = 'block';
        registerTab.style.display = 'none';
        authTabs[0].classList.add('active');
    } else {
        loginTab.style.display = 'none';
        registerTab.style.display = 'block';
        authTabs[1].classList.add('active');
    }
}

function selectLoginDepartment(dept) {
    document.querySelectorAll('#loginDepartmentCards .dept-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.dept-card').classList.add('selected');
    document.getElementById('loginDepartment').value = dept;
}

function selectRegisterDepartment(dept) {
    document.querySelectorAll('#registerDepartmentCards .dept-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.target.closest('.dept-card').classList.add('selected');
    document.getElementById('registerDepartment').value = dept;
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const department = document.getElementById('loginDepartment').value;
        const errorDiv = document.getElementById('loginError');

        if (!department) {
            errorDiv.textContent = 'Please select a department first';
            errorDiv.style.display = 'block';
            return;
        }

        // ALLOW ANY LOGIN - No validation check
        const currentAdmin = { 
            username: username, 
            password: password,
            department: department, 
            activeDepartment: department,
            email: `${username}@${department.toLowerCase().replace(' ', '')}.gov`
        };
        
        sessionStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        
        updateNavForLoggedInAdmin(currentAdmin);
        showPage('admin');
        loadAdminDashboard();
        
        this.reset();
        document.querySelectorAll('#loginDepartmentCards .dept-card').forEach(c => c.classList.remove('selected'));
        errorDiv.style.display = 'none';
    });

    // Register Form Handler
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const email = document.getElementById('registerEmail').value;
        const department = document.getElementById('registerDepartment').value;
        
        const successDiv = document.getElementById('registerSuccess');
        const errorDiv = document.getElementById('registerError');
        
        successDiv.style.display = 'none';
        errorDiv.style.display = 'none';

        if (!department) {
            errorDiv.textContent = 'Please select a department';
            errorDiv.style.display = 'block';
            return;
        }

        if (password !== confirmPassword) {
            errorDiv.textContent = 'Passwords do not match';
            errorDiv.style.display = 'block';
            return;
        }

        const admins = getAdmins();
        if (admins.find(a => a.username === username)) {
            errorDiv.textContent = 'Username already exists';
            errorDiv.style.display = 'block';
            return;
        }

        admins.push({ username, password, department, email });
        localStorage.setItem('admins', JSON.stringify(admins));

        successDiv.textContent = 'Registration successful! You can now login.';
        successDiv.style.display = 'block';
        
        this.reset();
        document.querySelectorAll('#registerDepartmentCards .dept-card').forEach(c => c.classList.remove('selected'));
        
        setTimeout(() => showAuthTab('login'), 2000);
    });
});

function updateNavForLoggedInAdmin(admin) {
    document.getElementById('loginBtn').style.display = 'none';
    document.getElementById('logoutBtn').style.display = 'inline-block';
    document.getElementById('adminInfo').style.display = 'inline-block';
    document.getElementById('adminInfo').textContent = `Logged in: ${admin.activeDepartment}`;
}

function logout() {
    sessionStorage.removeItem('currentAdmin');
    
    document.getElementById('loginBtn').style.display = 'inline-block';
    document.getElementById('logoutBtn').style.display = 'none';
    document.getElementById('adminInfo').style.display = 'none';
    
    showPage('public');
}