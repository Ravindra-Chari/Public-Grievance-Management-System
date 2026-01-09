// ============================================
// MODULE 4: REPORT & DATA MANAGEMENT MODULE
// ============================================

// Data Storage Functions (LocalStorage version - Firebase optional)
function getProblems() {
    const problems = localStorage.getItem('problems');
    return problems ? JSON.parse(problems) : [];
}

function saveProblems(problems) {
    localStorage.setItem('problems', JSON.stringify(problems));
}

function addProblem(problem) {
    const problems = getProblems();
    problems.push(problem);
    saveProblems(problems);
}

function updateProblem(id, updates) {
    const problems = getProblems();
    const index = problems.findIndex(p => p.id === id);
    if (index !== -1) {
        problems[index] = { ...problems[index], ...updates };
        saveProblems(problems);
    }
}

function getAdmins() {
    const admins = localStorage.getItem('admins');
    return admins ? JSON.parse(admins) : [
        { username: 'admin', password: 'admin123', department: 'All', email: 'admin@gov.in' }
    ];
}

function addAdmin(admin) {
    const admins = getAdmins();
    admins.push(admin);
    localStorage.setItem('admins', JSON.stringify(admins));
}

function getCurrentAdmin() {
    return JSON.parse(sessionStorage.getItem('currentAdmin')) || null;
}

// Statistics Functions
function updateStats() {
    const problems = getProblems();
    
    const totalEl = document.getElementById('totalProblems');
    const pendingEl = document.getElementById('pendingProblems');
    const progressEl = document.getElementById('progressProblems');
    const resolvedEl = document.getElementById('resolvedProblems');
    
    if (totalEl) totalEl.textContent = problems.length;
    if (pendingEl) pendingEl.textContent = problems.filter(p => p.status === 'Pending').length;
    if (progressEl) progressEl.textContent = problems.filter(p => p.status === 'In Progress').length;
    if (resolvedEl) resolvedEl.textContent = problems.filter(p => p.status === 'Resolved').length;
}

// Page Navigation
function showPage(page) {
    const pages = ['public', 'admin', 'auth'];
    const navBtns = document.querySelectorAll('.nav-btn');
    
    pages.forEach(p => {
        const pageEl = document.getElementById(`${p}Page`);
        if (pageEl) pageEl.classList.remove('active');
    });
    
    navBtns.forEach(btn => btn.classList.remove('active'));
    
    if (page === 'public') {
        const publicPage = document.getElementById('publicPage');
        if (publicPage) publicPage.classList.add('active');
        if (navBtns[0]) navBtns[0].classList.add('active');
        updateStats();
        if (typeof renderProblems === 'function') renderProblems();
    } else if (page === 'admin') {
        const currentAdmin = getCurrentAdmin();
        if (!currentAdmin) {
            showPage('auth');
            return;
        }
        const adminPage = document.getElementById('adminPage');
        if (adminPage) adminPage.classList.add('active');
        if (typeof loadAdminDashboard === 'function') loadAdminDashboard();
    } else if (page === 'auth') {
        const authPage = document.getElementById('authPage');
        if (authPage) authPage.classList.add('active');
        if (navBtns[1]) navBtns[1].classList.add('active');
    }
}

// Initialize Application
function initializeApp() {
    const currentAdmin = getCurrentAdmin();
    
    if (currentAdmin) {
        updateNavForLoggedInAdmin(currentAdmin);
    }
    
    updateStats();
    if (typeof renderProblems === 'function') renderProblems();
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

// Generate Reports
function generateReport(type) {
    const problems = getProblems();
    
    let reportData = {
        generatedOn: new Date().toLocaleString(),
        totalGrievances: problems.length,
        pending: problems.filter(p => p.status === 'Pending').length,
        inProgress: problems.filter(p => p.status === 'In Progress').length,
        resolved: problems.filter(p => p.status === 'Resolved').length,
        byDepartment: {}
    };
    
    problems.forEach(p => {
        if (!reportData.byDepartment[p.authority]) {
            reportData.byDepartment[p.authority] = {
                total: 0,
                pending: 0,
                inProgress: 0,
                resolved: 0
            };
        }
        reportData.byDepartment[p.authority].total++;
        if (p.status === 'Pending') reportData.byDepartment[p.authority].pending++;
        if (p.status === 'In Progress') reportData.byDepartment[p.authority].inProgress++;
        if (p.status === 'Resolved') reportData.byDepartment[p.authority].resolved++;
    });
    
    return reportData;
}

// Export Functions
function exportToJSON() {
    const problems = getProblems();
    const data = {
        problems: problems,
        exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `grievance_report_${Date.now()}.json`;
    link.click();
}

function exportToCSV() {
    const problems = getProblems();
    
    const headers = ['ID', 'Title', 'Description', 'Location', 'Department', 'Status', 'Reporter', 'Contact', 'Date', 'Votes'];
    const rows = problems.map(p => [
        p.id,
        `"${p.title}"`,
        `"${p.description}"`,
        `"${p.location}"`,
        p.authority,
        p.status,
        p.reporterName,
        p.reporterContact,
        p.dateReported,
        p.votes
    ]);
    
    const csvContent = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `grievance_report_${Date.now()}.csv`;
    link.click();
}

// Clear All Data
function clearAllData() {
    if (confirm('Are you sure you want to clear ALL data? This cannot be undone.')) {
        if (confirm('This will delete all grievances. Continue?')) {
            localStorage.removeItem('problems');
            alert('All data has been cleared successfully.');
            window.location.reload();
        }
    }
}

// Initialize on DOM Load
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});