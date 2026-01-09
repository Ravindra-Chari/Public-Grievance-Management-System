// ============================================
// MODULE 1: LOGIN MODULE
// ============================================

// Authentication Functions
function showAuthTab(tab) {
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const authTabs = document.querySelectorAll('.auth-tab');

    if (!loginTab || !registerTab) return;

    authTabs.forEach(t => t.classList.remove('active'));

    if (tab === 'login') {
        loginTab.style.display = 'block';
        registerTab.style.display = 'none';
        if (authTabs[0]) authTabs[0].classList.add('active');
    } else {
        loginTab.style.display = 'none';
        registerTab.style.display = 'block';
        if (authTabs[1]) authTabs[1].classList.add('active');
    }
}

function selectLoginDepartment(dept) {
    document.querySelectorAll('#loginDepartmentCards .dept-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Find the clicked card
    const clickedCard = event.target.closest('.dept-card');
    if (clickedCard) {
        clickedCard.classList.add('selected');
    }
    
    const deptInput = document.getElementById('loginDepartment');
    if (deptInput) {
        deptInput.value = dept;
    }
}

function selectRegisterDepartment(dept) {
    document.querySelectorAll('#registerDepartmentCards .dept-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Find the clicked card
    const clickedCard = event.target.closest('.dept-card');
    if (clickedCard) {
        clickedCard.classList.add('selected');
    }
    
    const deptInput = document.getElementById('registerDepartment');
    if (deptInput) {
        deptInput.value = dept;
    }
}

// Login Form Handler
function handleLogin(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('loginUsername');
    const passwordInput = document.getElementById('loginPassword');
    const departmentInput = document.getElementById('loginDepartment');
    const errorDiv = document.getElementById('loginError');
    
    if (!usernameInput || !passwordInput || !departmentInput || !errorDiv) {
        alert('Form elements not found. Please refresh the page.');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const department = departmentInput.value;

    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Validate inputs
    if (!username) {
        errorDiv.textContent = 'Please enter a username';
        errorDiv.style.display = 'block';
        usernameInput.focus();
        return;
    }

    if (!password) {
        errorDiv.textContent = 'Please enter a password';
        errorDiv.style.display = 'block';
        passwordInput.focus();
        return;
    }

    if (!department) {
        errorDiv.textContent = 'Please select a department first';
        errorDiv.style.display = 'block';
        return;
    }

    // Get registered admins
    const admins = getAdmins();
    
    // Check credentials
    const admin = admins.find(a => 
        a.username === username && 
        a.password === password && 
        a.department === department
    );
    
    if (!admin) {
        // For demo: allow default admin credentials with any department
        if (username === 'admin' && password === 'admin123') {
            const currentAdmin = { 
                username: username, 
                password: password,
                department: department, 
                activeDepartment: department,
                email: `admin@${department.toLowerCase().replace(/\s+/g, '')}.gov`
            };
            
            sessionStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
            
            updateNavForLoggedInAdmin(currentAdmin);
            showPage('admin');
            loadAdminDashboard();
            
            // Reset form
            e.target.reset();
            document.querySelectorAll('#loginDepartmentCards .dept-card').forEach(c => c.classList.remove('selected'));
            errorDiv.style.display = 'none';
            
            return;
        }
        
        errorDiv.textContent = 'Invalid username, password, or department';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Login successful
    const currentAdmin = { 
        username: admin.username, 
        password: admin.password,
        department: admin.department, 
        activeDepartment: admin.department,
        email: admin.email
    };
    
    sessionStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
    
    updateNavForLoggedInAdmin(currentAdmin);
    showPage('admin');
    loadAdminDashboard();
    
    // Reset form
    e.target.reset();
    document.querySelectorAll('#loginDepartmentCards .dept-card').forEach(c => c.classList.remove('selected'));
    errorDiv.style.display = 'none';
}

// Register Form Handler
function handleRegister(e) {
    e.preventDefault();
    
    const usernameInput = document.getElementById('registerUsername');
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('registerConfirmPassword');
    const emailInput = document.getElementById('registerEmail');
    const departmentInput = document.getElementById('registerDepartment');
    
    const successDiv = document.getElementById('registerSuccess');
    const errorDiv = document.getElementById('registerError');
    
    if (!usernameInput || !passwordInput || !confirmPasswordInput || !emailInput || !departmentInput || !successDiv || !errorDiv) {
        alert('Form elements not found. Please refresh the page.');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const confirmPassword = confirmPasswordInput.value.trim();
    const email = emailInput.value.trim();
    const department = departmentInput.value;
    
    // Clear previous messages
    successDiv.style.display = 'none';
    errorDiv.style.display = 'none';
    successDiv.textContent = '';
    errorDiv.textContent = '';

    // Validate inputs
    if (!username) {
        errorDiv.textContent = 'Please enter a username';
        errorDiv.style.display = 'block';
        usernameInput.focus();
        return;
    }

    if (username.length < 4) {
        errorDiv.textContent = 'Username must be at least 4 characters long';
        errorDiv.style.display = 'block';
        usernameInput.focus();
        return;
    }

    if (!password) {
        errorDiv.textContent = 'Please enter a password';
        errorDiv.style.display = 'block';
        passwordInput.focus();
        return;
    }

    if (password.length < 6) {
        errorDiv.textContent = 'Password must be at least 6 characters long';
        errorDiv.style.display = 'block';
        passwordInput.focus();
        return;
    }

    if (!confirmPassword) {
        errorDiv.textContent = 'Please confirm your password';
        errorDiv.style.display = 'block';
        confirmPasswordInput.focus();
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match';
        errorDiv.style.display = 'block';
        confirmPasswordInput.focus();
        return;
    }

    if (!email) {
        errorDiv.textContent = 'Please enter an email address';
        errorDiv.style.display = 'block';
        emailInput.focus();
        return;
    }

    if (!department) {
        errorDiv.textContent = 'Please select a department';
        errorDiv.style.display = 'block';
        return;
    }

    // Check if username already exists
    const admins = getAdmins();
    if (admins.find(a => a.username === username)) {
        errorDiv.textContent = 'Username already exists. Please choose a different username.';
        errorDiv.style.display = 'block';
        usernameInput.focus();
        return;
    }

    // Register new admin
    const newAdmin = { username, password, department, email };
    addAdmin(newAdmin);

    successDiv.textContent = 'Registration successful! You can now login with your credentials.';
    successDiv.style.display = 'block';
    
    // Reset form
    e.target.reset();
    document.querySelectorAll('#registerDepartmentCards .dept-card').forEach(c => c.classList.remove('selected'));
    
    // Switch to login tab after 2 seconds
    setTimeout(() => {
        showAuthTab('login');
        successDiv.style.display = 'none';
    }, 2000);
}

// Update Nav for Logged In Admin
function updateNavForLoggedInAdmin(admin) {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminInfo = document.getElementById('adminInfo');
    
    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'inline-block';
    if (adminInfo) {
        adminInfo.style.display = 'inline-block';
        adminInfo.textContent = `Logged in: ${admin.activeDepartment}`;
    }
}

// Logout Function
function logout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    sessionStorage.removeItem('currentAdmin');
    
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const adminInfo = document.getElementById('adminInfo');
    
    if (loginBtn) loginBtn.style.display = 'inline-block';
    if (logoutBtn) logoutBtn.style.display = 'none';
    if (adminInfo) adminInfo.style.display = 'none';
    
    showPage('public');
    
    alert('You have been logged out successfully.');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Check if user is already logged in
    const currentAdmin = getCurrentAdmin();
    if (currentAdmin) {
        updateNavForLoggedInAdmin(currentAdmin);
    }
});