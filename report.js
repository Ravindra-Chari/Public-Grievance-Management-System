// ============================================
// MODULE 4: REPORT & DATA MANAGEMENT MODULE (FIREBASE VERSION)
// ============================================

// Firebase references
let problemsRef;
let adminsRef;

// Initialize Firebase references after DOM loads
document.addEventListener('DOMContentLoaded', function() {
    if (typeof firebase !== 'undefined') {
        problemsRef = firebase.database().ref('problems');
        adminsRef = firebase.database().ref('admins');
        
        // Initialize default admin if not exists
        adminsRef.once('value').then(snapshot => {
            if (!snapshot.exists()) {
                const defaultAdmin = {
                    username: 'admin',
                    password: 'admin123',
                    department: 'All',
                    email: 'admin@gov.in'
                };
                adminsRef.push(defaultAdmin);
            }
        });
        
        // Listen for real-time updates
        problemsRef.on('value', (snapshot) => {
            updateStats();
            renderProblems();
            
            const currentAdmin = getCurrentAdmin();
            if (currentAdmin) {
                updateAdminStats();
                renderAdminProblems();
            }
        });
        
        initializeApp();
    }
});

// Data Storage Functions (Firebase version)
function getProblems() {
    return new Promise((resolve) => {
        if (!problemsRef) {
            resolve([]);
            return;
        }
        
        problemsRef.once('value').then((snapshot) => {
            const problems = [];
            snapshot.forEach((childSnapshot) => {
                const problem = childSnapshot.val();
                problem.firebaseId = childSnapshot.key;
                problems.push(problem);
            });
            resolve(problems);
        });
    });
}

function saveProblems(problems) {
    if (!problemsRef) return Promise.resolve();
    
    // Clear existing data
    return problemsRef.remove().then(() => {
        // Save all problems
        const updates = {};
        problems.forEach(problem => {
            const key = problem.firebaseId || problemsRef.push().key;
            updates[key] = problem;
        });
        return problemsRef.update(updates);
    });
}

function addProblem(problem) {
    if (!problemsRef) return Promise.resolve();
    
    return problemsRef.push(problem);
}

function updateProblem(firebaseId, updates) {
    if (!problemsRef) return Promise.resolve();
    
    return problemsRef.child(firebaseId).update(updates);
}

function getAdmins() {
    return new Promise((resolve) => {
        if (!adminsRef) {
            resolve([{ username: 'admin', password: 'admin123', department: 'All', email: 'admin@gov.in' }]);
            return;
        }
        
        adminsRef.once('value').then((snapshot) => {
            const admins = [];
            snapshot.forEach((childSnapshot) => {
                admins.push(childSnapshot.val());
            });
            
            if (admins.length === 0) {
                admins.push({ username: 'admin', password: 'admin123', department: 'All', email: 'admin@gov.in' });
            }
            
            resolve(admins);
        });
    });
}

function addAdmin(admin) {
    if (!adminsRef) return Promise.resolve();
    
    return adminsRef.push(admin);
}

function getCurrentAdmin() {
    return JSON.parse(sessionStorage.getItem('currentAdmin')) || null;
}

// Statistics Functions
async function updateStats() {
    const problems = await getProblems();
    
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
        renderProblems();
    } else if (page === 'admin') {
        const currentAdmin = getCurrentAdmin();
        if (!currentAdmin) {
            showPage('auth');
            return;
        }
        const adminPage = document.getElementById('adminPage');
        if (adminPage) adminPage.classList.add('active');
        loadAdminDashboard();
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
    renderProblems();
}

// Generate Reports
async function generateReport(type) {
    const problems = await getProblems();
    
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
async function exportToJSON() {
    const problems = await getProblems();
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

async function exportToCSV() {
    const problems = await getProblems();
    
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
            if (problemsRef) {
                problemsRef.remove().then(() => {
                    alert('All data has been cleared successfully.');
                    window.location.reload();
                });
            }
        }
    }
}