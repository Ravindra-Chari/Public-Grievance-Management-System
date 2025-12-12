// ============================================
// MODULE 3: ADMIN MODULE
// ============================================

// Load Admin Dashboard
function loadAdminDashboard() {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) {
        showPage('auth');
        return;
    }
    
    const dept = currentAdmin.activeDepartment;
    const welcomeEl = document.getElementById('adminWelcome');
    const deptInfoEl = document.getElementById('adminDeptInfo');
    
    if (welcomeEl) welcomeEl.textContent = `${dept} Dashboard`;
    if (deptInfoEl) deptInfoEl.textContent = `Manage grievances assigned to ${dept}`;
    
    updateAdminStats();
    renderAdminProblems();
}

// Update Admin Statistics
function updateAdminStats() {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) return;
    
    const dept = currentAdmin.activeDepartment;
    const problems = getProblems();
    const deptProblems = problems.filter(p => p.authority === dept);
    
    const adminTotal = document.getElementById('adminTotal');
    const adminPending = document.getElementById('adminPending');
    const adminProgress = document.getElementById('adminProgress');
    const adminResolved = document.getElementById('adminResolved');
    
    if (adminTotal) adminTotal.textContent = deptProblems.length;
    if (adminPending) adminPending.textContent = deptProblems.filter(p => p.status === 'Pending').length;
    if (adminProgress) adminProgress.textContent = deptProblems.filter(p => p.status === 'In Progress').length;
    if (adminResolved) adminResolved.textContent = deptProblems.filter(p => p.status === 'Resolved').length;
}

// Render Admin Grievances
function renderAdminProblems() {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) return;
    
    const dept = currentAdmin.activeDepartment;
    const statusFilterEl = document.getElementById('adminStatusFilter');
    
    if (!statusFilterEl) return;
    
    const statusFilter = statusFilterEl.value;
    const problems = getProblems();
    
    let filtered = problems.filter(p => p.authority === dept);
    
    if (statusFilter !== 'all') {
        filtered = filtered.filter(p => p.status === statusFilter);
    }
    
    const container = document.getElementById('adminProblemsList');
    
    if (!container) return;
    
    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">No grievances match the selected filters.</div>';
        return;
    }
    
    container.innerHTML = filtered.map(problem => `
        <div class="problem-item">
            <div class="problem-header">
                <h3 class="problem-title">${problem.title}</h3>
                <span class="status-badge status-${problem.status.toLowerCase().replace(' ', '')}">${problem.status}</span>
            </div>
            <div class="problem-body">
                <div class="problem-meta">
                    <div><strong>Location:</strong> ${problem.location}</div>
                    <div><strong>Reported:</strong> ${problem.dateReported}</div>
                    <div><strong>Reporter:</strong> ${problem.reporterName}</div>
                    <div><strong>Contact:</strong> ${problem.reporterContact}</div>
                </div>
                <div class="problem-description">${problem.description}</div>
                <img src="${problem.photo}" class="problem-image" alt="Grievance photo">
                
                <div class="admin-note-section">
                    <h4 style="margin-bottom: 1rem; color: #495057;">Status Management</h4>
                    <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
                        <button class="btn btn-sm btn-warning" onclick="updateStatus(${problem.id}, 'In Progress')">Mark Under Review</button>
                        <button class="btn btn-sm btn-success" onclick="updateStatus(${problem.id}, 'Resolved')">Mark Resolved</button>
                        <button class="btn btn-sm btn-secondary" onclick="updateStatus(${problem.id}, 'Pending')">Mark Pending</button>
                    </div>
                    
                    <h4 style="margin-bottom: 0.5rem; color: #495057;">Add Progress Note</h4>
                    <div class="admin-note">
                        <textarea id="note-${problem.id}" placeholder="Add update or note about this grievance..."></textarea>
                        <button class="btn btn-sm btn-primary" onclick="addNote(${problem.id})">Add Note</button>
                    </div>
                    
                    ${problem.notes && problem.notes.length > 0 ? `
                        <div class="admin-notes-list">
                            <h4 style="margin-bottom: 0.5rem; color: #495057;">Progress History</h4>
                            ${problem.notes.map(note => `
                                <div class="admin-note-item">
                                    <div class="admin-note-header">${note.date} - ${note.author}</div>
                                    <div>${note.text}</div>
                                </div>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

// Update Grievance Status
function updateStatus(id, newStatus) {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) return;
    
    const problems = getProblems();
    const problem = problems.find(p => p.id === id);
    
    if (problem) {
        problem.status = newStatus;
        
        // Add automatic note
        if (!problem.notes) problem.notes = [];
        problem.notes.push({
            text: `Status changed to: ${newStatus}`,
            author: currentAdmin.activeDepartment,
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('problems', JSON.stringify(problems));
        updateAdminStats();
        renderAdminProblems();
        updateStats();
        renderProblems();
    }
}

// Add Note to Grievance
function addNote(id) {
    const currentAdmin = getCurrentAdmin();
    if (!currentAdmin) return;
    
    const textarea = document.getElementById(`note-${id}`);
    
    if (!textarea) return;
    
    const noteText = textarea.value.trim();
    
    if (!noteText) {
        alert('Please enter a note');
        return;
    }
    
    const problems = getProblems();
    const problem = problems.find(p => p.id === id);
    
    if (problem) {
        if (!problem.notes) problem.notes = [];
        
        problem.notes.push({
            text: noteText,
            author: currentAdmin.activeDepartment,
            date: new Date().toLocaleString()
        });
        
        localStorage.setItem('problems', JSON.stringify(problems));
        textarea.value = '';
        renderAdminProblems();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const adminStatusFilter = document.getElementById('adminStatusFilter');
    
    if (adminStatusFilter) {
        adminStatusFilter.addEventListener('change', renderAdminProblems);
    }
});