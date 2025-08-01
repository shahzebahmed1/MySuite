// Mock data replacements for removed database
const mockData = {
    // Placeholder data
    announcements: [
        {
            id: 1,
            title: "Welcome to Point on the Bow",
            content: "We're excited to have you as part of our community. Please explore all the features available in your resident portal.",
            createdAt: new Date().toISOString(),
            status: 'published'
        },
        {
            id: 2,
            title: "Amenity Booking System",
            content: "Book our amenities easily through the portal. Check availability and make reservations for the gym, party room, and more.",
            createdAt: new Date(Date.now() - 86400000).toISOString(),
            status: 'published'
        }
    ],
    boardMembers: [
        { name: "John Smith", position: "President", email: "president@pointonthebow.ca", phone: "403-555-0001" },
        { name: "Jane Doe", position: "Vice President", email: "vp@pointonthebow.ca", phone: "403-555-0002" }
    ],
    boardMeetings: [],
    documents: [],
    absences: [],
    tasks: [],
    milestones: [],
    services: [],
    taxiRequests: [],
    tips: [],
    newsletters: []
};

// Mock database replacement functions
const mockDB = {
    getAnnouncements: () => Promise.resolve({ success: true, announcements: mockData.announcements }),
    createAnnouncement: () => Promise.resolve({ success: true, message: "Feature disabled - Supabase integration pending" }),
    deleteAnnouncement: () => Promise.resolve({ success: true }),
    getBoardMembers: () => Promise.resolve({ success: true, members: mockData.boardMembers }),
    getBoardMeetings: () => Promise.resolve({ success: true, meetings: mockData.boardMeetings }),
    createBoardMeeting: () => Promise.resolve({ success: true }),
    getDocuments: () => Promise.resolve(mockData.documents),
    getDocumentFolders: () => Promise.resolve([]),
    uploadDocument: () => Promise.resolve({ success: true }),
    getExtendedAbsences: () => Promise.resolve(mockData.absences),
    createExtendedAbsence: () => Promise.resolve({ success: true }),
    cancelExtendedAbsence: () => Promise.resolve({ success: true }),
    deleteExtendedAbsence: () => Promise.resolve({ success: true }),
    getTasks: () => Promise.resolve(mockData.tasks),
    createTask: () => Promise.resolve({ success: true }),
    deleteTask: () => Promise.resolve({ success: true }),
    getMilestones: () => Promise.resolve(mockData.milestones),
    createMilestone: () => Promise.resolve({ success: true }),
    getSponsoredServices: () => Promise.resolve(mockData.services),
    getTaxiRequests: () => Promise.resolve(mockData.taxiRequests),
    createTaxiRequest: () => Promise.resolve({ success: true }),
    updateTaxiRequest: () => Promise.resolve({ success: true }),
    getAnonymousTips: () => Promise.resolve(mockData.tips),
    createAnonymousTip: () => Promise.resolve({ success: true }),
    updateAnonymousTip: () => Promise.resolve({ success: true }),
    getNewsletters: () => Promise.resolve(mockData.newsletters),
    createNewsletter: () => Promise.resolve({ success: true }),
    sendNewsletter: () => Promise.resolve({ success: true }),
    hasPermission: () => true, // All users have all permissions now
    getUserById: () => ({ firstName: "Manager", lastName: "User", unitNumber: "Office" })
};

// Role constants for compatibility
const ROLES = {
    PROPERTY_MANAGER: 'user',
    BOARD_MEMBER: 'user',
    LEAD_CONCIERGE: 'user',
    CONCIERGE: 'user',
    RESIDENT: 'user'
};

// Check authentication on page load
window.addEventListener('DOMContentLoaded', () => {
    const isAuthenticated = sessionStorage.getItem('isAuthenticated') || localStorage.getItem('isAuthenticated');
    
    if (!isAuthenticated) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
    }
    
    // Get user data from session storage
    const userData = {
        email: sessionStorage.getItem('email') || 'manager@pointonthebow.ca',
        firstName: sessionStorage.getItem('firstName') || 'Manager',
        lastName: sessionStorage.getItem('lastName') || 'User',
        role: 'user',
        unitNumber: sessionStorage.getItem('unitNumber') || 'Office'
    };
    
    const isNewUser = sessionStorage.getItem('isNewUser');
    
    // Update user info in the UI
    const userNameEl = document.getElementById('userName');
    const userRoleEl = document.getElementById('userRole');
    
    if (userNameEl) {
        userNameEl.textContent = `${userData.firstName} ${userData.lastName}`;
    }
    
    if (userRoleEl) {
        userRoleEl.textContent = 'User';
    }
    
    // Update user email elements
    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => {
        el.textContent = userData.email;
    });
    
    // All users have the same access now
    
    // Enhanced loading screen with progress animation
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        startLoadingSequence();
    }
    
    // Show welcome message for new users
    if (isNewUser) {
        showNotification('Welcome to Point on the Bow! Your account has been created successfully.', 'success');
        sessionStorage.removeItem('isNewUser');
    }
    
    // Initialize dashboard
    initializeDashboard(userData);
});

// Logout functionality
function handleLogout() {
    // Clear all session storage
    sessionStorage.clear();
    
    // Clear authentication flag from local storage
    localStorage.removeItem('isAuthenticated');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// Add logout event listeners to all logout links/buttons
document.addEventListener('DOMContentLoaded', () => {
    // Specific logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Sidebar logout button
    const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
    if (sidebarLogoutBtn) {
        sidebarLogoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
        });
    }
    
    // Handle back to home links
    const homeLinks = document.querySelectorAll('a[href="index.html"]');
    homeLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Allow normal navigation to home page
            // This doesn't need to log out the user
        });
    });
});

// Notification system
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Add styles if not already present
    if (!document.querySelector('#notificationStyles')) {
        const styles = document.createElement('style');
        styles.id = 'notificationStyles';
        styles.innerHTML = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                max-width: 400px;
                padding: 16px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                background: white;
                border-left: 4px solid;
                z-index: 9999;
                animation: slideIn 0.3s ease-out;
            }
            
            .notification-success {
                border-left-color: #10b981;
            }
            
            .notification-error {
                border-left-color: #ef4444;
            }
            
            .notification-info {
                border-left-color: #3b82f6;
            }
            
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .notification-content i:first-child {
                font-size: 20px;
            }
            
            .notification-success i:first-child {
                color: #10b981;
            }
            
            .notification-error i:first-child {
                color: #ef4444;
            }
            
            .notification-info i:first-child {
                color: #3b82f6;
            }
            
            .notification-close {
                margin-left: auto;
                background: none;
                border: none;
                cursor: pointer;
                color: #6b7280;
                padding: 4px;
                transition: color 0.2s;
            }
            
            .notification-close:hover {
                color: #374151;
            }
            
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(styles);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// Handle navigation menu active states
const currentPage = window.location.pathname.split('/').pop();
const navLinks = document.querySelectorAll('.nav-link, .sidebar-link');

navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === 'portal.html' && href === '#')) {
        link.classList.add('active');
    }
});

// All users now have the same access - no role-based restrictions

// Initialize dashboard
function initializeDashboard(userData) {
    // Update stats for all users
    const statsGrid = document.getElementById('statsGrid');
    if (statsGrid) {
        let statsHTML = `
            <div class="stat-item">
                <i class="fas fa-home"></i>
                <div class="stat-value">Unit ${userData.unitNumber}</div>
                <div class="stat-label">Your Unit</div>
            </div>
            <div class="stat-item">
                <i class="fas fa-wrench"></i>
                <div class="stat-value">3</div>
                <div class="stat-label">Service Requests</div>
            </div>
            <div class="stat-item">
                <i class="fas fa-calendar-check"></i>
                <div class="stat-value">2</div>
                <div class="stat-label">Active Bookings</div>
            </div>
            <div class="stat-item">
                <i class="fas fa-box"></i>
                <div class="stat-value">12</div>
                <div class="stat-label">Packages Today</div>
            </div>
        `;
        
        statsGrid.innerHTML = statsHTML;
    }
    
    // Load recent announcements
    loadRecentAnnouncements();
    
    // Load upcoming events
    loadUpcomingEvents();
    
    // Load dashboard updates for all users
    loadDashboardUpdates();
    
    // Load board data when board section is accessed
    loadBoardData();
}

// Load recent announcements for dashboard
function loadRecentAnnouncements() {
    const announcementsEl = document.getElementById('recentAnnouncements');
    if (announcementsEl) {
        // Display placeholder announcements
        const placeholderAnnouncements = [
            {
                title: "Welcome to Point on the Bow",
                content: "We're excited to have you as part of our community. Please explore all the features available in your resident portal.",
                createdAt: new Date().toISOString()
            },
            {
                title: "Amenity Booking System",
                content: "Book our amenities easily through the portal. Check availability and make reservations for the gym, party room, and more.",
                createdAt: new Date(Date.now() - 86400000).toISOString()
            },
            {
                title: "Service Requests",
                content: "Submit maintenance requests directly through the portal. Our team will address your concerns promptly.",
                createdAt: new Date(Date.now() - 172800000).toISOString()
            }
        ];
        
        announcementsEl.innerHTML = placeholderAnnouncements.map(announcement => {
            const date = new Date(announcement.createdAt);
            return `
                <div class="announcement-item">
                    <div class="announcement-date">${date.toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric', 
                        year: 'numeric' 
                    })}</div>
                    <div class="announcement-title">${announcement.title}</div>
                    <div class="announcement-preview">${announcement.content.substring(0, 100)}...</div>
                </div>
            `;
        }).join('');
    }
}

// Load all announcements for announcements section
// Global variables for announcements
let allAnnouncements = [];
let currentAnnouncementTab = 'recent';
let currentAnnouncementPage = 1;
const ANNOUNCEMENTS_PER_PAGE = 9;

// Initialize announcements section
function initializeAnnouncementsSection() {
    // Set up add announcement button
    const addBtn = document.getElementById('addAnnouncementBtn');
    if (addBtn) {
        addBtn.addEventListener('click', () => showAnnouncementModal());
    }
    
    // Set up tab listeners
    const tabBtns = document.querySelectorAll('.announcement-tabs .tab-btn');
    const tabsContainer = document.querySelector('.announcement-tabs');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            currentAnnouncementTab = btn.getAttribute('data-tab');
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update the data-active attribute for the sliding effect
            if (tabsContainer) {
                tabsContainer.setAttribute('data-active', currentAnnouncementTab);
            }
            
            displayAnnouncementsByTab();
        });
    });
}

async function loadAllAnnouncements() {
    const announcementsContainer = document.getElementById('announcementsContainer');
    if (!announcementsContainer) return;
    
    // Initialize the section if not already done
    initializeAnnouncementsSection();

    try {
        const result = await mockDB.getAnnouncements();
        if (result.success) {
            allAnnouncements = result.announcements;
            updateAllAnnouncementCounts();
            displayAnnouncementsByTab();
        } else {
            announcementsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exclamation-circle"></i>
                    <h3>Error Loading Announcements</h3>
                    <p>Unable to load announcements at this time.</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error loading announcements:', error);
        announcementsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-exclamation-circle"></i>
                <h3>Error Loading Announcements</h3>
                <p>Unable to load announcements at this time.</p>
            </div>
        `;
    }
}

// Display announcements by tab
function displayAnnouncementsByTab() {
    let filteredAnnouncements = [...allAnnouncements];
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Filter by tab
    if (currentAnnouncementTab === 'recent') {
        filteredAnnouncements = filteredAnnouncements.filter(a => 
            new Date(a.createdAt) >= thirtyDaysAgo && !a.archived && !a.draft && !a.scheduled
        );
    } else if (currentAnnouncementTab === 'older') {
        filteredAnnouncements = filteredAnnouncements.filter(a => 
            (new Date(a.createdAt) < thirtyDaysAgo || a.archived) && !a.draft && !a.scheduled
        );
    } else if (currentAnnouncementTab === 'scheduled') {
        filteredAnnouncements = filteredAnnouncements.filter(a => 
            a.scheduled && new Date(a.scheduledFor) > now
        );
    } else if (currentAnnouncementTab === 'drafts') {
        filteredAnnouncements = filteredAnnouncements.filter(a => a.draft);
    }

    // Sort by appropriate date field
    if (currentAnnouncementTab === 'scheduled') {
        filteredAnnouncements.sort((a, b) => new Date(a.scheduledFor) - new Date(b.scheduledFor));
    } else {
        filteredAnnouncements.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Reset to page 1 when switching tabs
    currentAnnouncementPage = 1;
    
    // Store filtered announcements globally for pagination
    window.currentFilteredAnnouncements = filteredAnnouncements;

    displayAnnouncements(filteredAnnouncements);
    updateAnnouncementCounts(filteredAnnouncements.length);
}

// Display announcements with pagination
function displayAnnouncements(announcements) {
    const announcementsContainer = document.getElementById('announcementsContainer');
    if (!announcementsContainer) return;

    if (announcements.length === 0) {
        let emptyMessage = '';
        let emptyIcon = 'fa-bullhorn';
        
        switch(currentAnnouncementTab) {
            case 'recent':
                emptyMessage = 'No recent announcements in the last 30 days.';
                break;
            case 'older':
                emptyMessage = 'No older announcements found.';
                break;
            case 'scheduled':
                emptyMessage = 'No scheduled announcements.';
                emptyIcon = 'fa-calendar-check';
                break;
            case 'drafts':
                emptyMessage = 'No draft announcements.';
                emptyIcon = 'fa-file-alt';
                break;
            default:
                emptyMessage = 'No announcements found.';
        }
        
        announcementsContainer.innerHTML = `
            <div class="empty-state">
                <i class="fas ${emptyIcon}"></i>
                <h3>No Announcements Found</h3>
                <p>${emptyMessage}</p>
            </div>
        `;
        return;
    }

    // Calculate pagination
    const totalPages = Math.ceil(announcements.length / ANNOUNCEMENTS_PER_PAGE);
    const startIndex = (currentAnnouncementPage - 1) * ANNOUNCEMENTS_PER_PAGE;
    const endIndex = startIndex + ANNOUNCEMENTS_PER_PAGE;
    const paginatedAnnouncements = announcements.slice(startIndex, endIndex);

    const userRole = sessionStorage.getItem('role') || localStorage.getItem('role');
    const canEdit = mockDB.hasPermission(userRole, ROLES.PROPERTY_MANAGER);

    // Build announcements HTML
    const announcementsHTML = paginatedAnnouncements.map(announcement => {
        const date = new Date(announcement.createdAt);
        const scheduledDate = announcement.scheduledFor ? new Date(announcement.scheduledFor) : null;
        
        // Determine which date to show based on tab
        let displayDate = date;
        let dateIcon = 'fa-calendar';
        let dateLabel = '';
        
        if (currentAnnouncementTab === 'scheduled' && scheduledDate) {
            displayDate = scheduledDate;
            dateIcon = 'fa-calendar-check';
            dateLabel = 'Scheduled for: ';
        } else if (announcement.draft) {
            dateLabel = 'Draft created: ';
            dateIcon = 'fa-file-alt';
        }
        
        return `
            <div class="announcement-card ${announcement.draft ? 'draft-card' : ''} ${announcement.scheduled ? 'scheduled-card' : ''}">
                <div class="announcement-header">
                    <div class="announcement-meta">
                        ${announcement.draft ? '<span class="badge badge-draft"><i class="fas fa-file-alt"></i> Draft</span>' : ''}
                        ${announcement.scheduled && currentAnnouncementTab === 'scheduled' ? '<span class="badge badge-scheduled"><i class="fas fa-clock"></i> Scheduled</span>' : ''}
                        <span class="announcement-date">
                            <i class="fas ${dateIcon}"></i>
                            ${dateLabel}${displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            ${currentAnnouncementTab === 'scheduled' ? ' at ' + displayDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
                        </span>
                    </div>
                    ${canEdit ? `
                        <div class="announcement-actions">
                            <button class="btn-icon" onclick="editAnnouncement(${announcement.id})" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon" onclick="deleteAnnouncement(${announcement.id})" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    ` : ''}
                </div>
                <h3 class="announcement-title">${announcement.title}</h3>
                <div class="announcement-content">${announcement.content}</div>
            </div>
        `;
    }).join('');

    // Wrap announcements in grid container
    const gridHTML = `<div class="announcements-grid">${announcementsHTML}</div>`;

    // Build pagination HTML
    const paginationHTML = totalPages > 1 ? `
        <div class="announcements-pagination">
            <button class="pagination-btn" onclick="changeAnnouncementPage('prev')" ${currentAnnouncementPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i> Previous
            </button>
            
            ${generatePageNumbers(currentAnnouncementPage, totalPages)}
            
            <button class="pagination-btn" onclick="changeAnnouncementPage('next')" ${currentAnnouncementPage === totalPages ? 'disabled' : ''}>
                Next <i class="fas fa-chevron-right"></i>
            </button>
            
            <span class="pagination-info">
                Showing ${startIndex + 1}-${Math.min(endIndex, announcements.length)} of ${announcements.length}
            </span>
        </div>
    ` : '';

    // Combine grid and pagination
    announcementsContainer.innerHTML = gridHTML + paginationHTML;

    // Store current filtered announcements for pagination
    window.currentFilteredAnnouncements = announcements;
}

// Generate page numbers for pagination
function generatePageNumbers(currentPage, totalPages) {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
        // Show all pages if total is less than max
        for (let i = 1; i <= totalPages; i++) {
            pageNumbers.push(i);
        }
    } else {
        // Always show first page
        pageNumbers.push(1);
        
        // Calculate range around current page
        let start = Math.max(2, currentPage - 1);
        let end = Math.min(totalPages - 1, currentPage + 1);
        
        // Add ellipsis if needed
        if (start > 2) {
            pageNumbers.push('...');
        }
        
        // Add middle pages
        for (let i = start; i <= end; i++) {
            pageNumbers.push(i);
        }
        
        // Add ellipsis if needed
        if (end < totalPages - 1) {
            pageNumbers.push('...');
        }
        
        // Always show last page
        pageNumbers.push(totalPages);
    }
    
    return pageNumbers.map(page => {
        if (page === '...') {
            return '<span class="pagination-ellipsis">...</span>';
        }
        return `
            <button class="pagination-btn page-number ${page === currentPage ? 'active' : ''}" 
                    onclick="goToAnnouncementPage(${page})">
                ${page}
            </button>
        `;
    }).join('');
}

// Change announcement page
function changeAnnouncementPage(direction) {
    const totalPages = Math.ceil(window.currentFilteredAnnouncements.length / ANNOUNCEMENTS_PER_PAGE);
    
    if (direction === 'prev' && currentAnnouncementPage > 1) {
        currentAnnouncementPage--;
    } else if (direction === 'next' && currentAnnouncementPage < totalPages) {
        currentAnnouncementPage++;
    }
    
    displayAnnouncements(window.currentFilteredAnnouncements);
    
    // Scroll to top of announcements section
    document.getElementById('announcements-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Go to specific announcement page
function goToAnnouncementPage(page) {
    currentAnnouncementPage = page;
    displayAnnouncements(window.currentFilteredAnnouncements);
    
    // Scroll to top of announcements section
    document.getElementById('announcements-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Update announcement counts in tabs
function updateAnnouncementCounts(currentTabCount) {
    // Update the current tab count
    const currentTabElement = document.querySelector(`.tab-btn[data-tab="${currentAnnouncementTab}"] .tab-badge`);
    if (currentTabElement) {
        currentTabElement.textContent = currentTabCount;
    }
}

// Update all announcement tab counts
function updateAllAnnouncementCounts() {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    // Count recent announcements
    const recentCount = allAnnouncements.filter(a => 
        new Date(a.createdAt) >= thirtyDaysAgo && !a.archived && !a.draft && !a.scheduled
    ).length;
    
    // Count older announcements
    const olderCount = allAnnouncements.filter(a => 
        (new Date(a.createdAt) < thirtyDaysAgo || a.archived) && !a.draft && !a.scheduled
    ).length;
    
    // Count scheduled announcements
    const scheduledCount = allAnnouncements.filter(a => 
        a.scheduled && new Date(a.scheduledFor) > now
    ).length;
    
    // Count draft announcements
    const draftsCount = allAnnouncements.filter(a => a.draft).length;
    
    // Update counts in UI
    const recentCountEl = document.getElementById('recentCount');
    const olderCountEl = document.getElementById('olderCount');
    const scheduledCountEl = document.getElementById('scheduledCount');
    const draftsCountEl = document.getElementById('draftsCount');
    
    if (recentCountEl) recentCountEl.textContent = recentCount;
    if (olderCountEl) olderCountEl.textContent = olderCount;
    if (scheduledCountEl) scheduledCountEl.textContent = scheduledCount;
    if (draftsCountEl) draftsCountEl.textContent = draftsCount;
}

// Load upcoming events
function loadUpcomingEvents() {
    const eventsEl = document.getElementById('upcomingEvents');
    if (eventsEl) {
        eventsEl.innerHTML = `
            <div class="event-item">
                <div class="event-date">
                    <div class="event-day">18</div>
                    <div class="event-month">DEC</div>
                </div>
                <div class="event-details">
                    <div class="event-title">Holiday Social</div>
                    <div class="event-time">6:00 PM - 9:00 PM</div>
                    <div class="event-location">Party Room</div>
                </div>
            </div>
            <div class="event-item">
                <div class="event-date">
                    <div class="event-day">22</div>
                    <div class="event-month">DEC</div>
                </div>
                <div class="event-details">
                    <div class="event-title">Board Meeting</div>
                    <div class="event-time">7:00 PM - 8:30 PM</div>
                    <div class="event-location">Meeting Room</div>
                </div>
            </div>
        `;
    }
}

// Load dashboard updates for admin users
function loadDashboardUpdates() {
    const updatesEl = document.getElementById('dashboardUpdates');
    if (updatesEl) {
        updatesEl.innerHTML = `
            <div class="update-item unread">
                <div class="update-icon"><i class="fas fa-wrench"></i></div>
                <div class="update-content">
                    <div class="update-title">New service request from Unit 1205</div>
                    <div class="update-time">5 minutes ago</div>
                </div>
            </div>
            <div class="update-item unread">
                <div class="update-icon"><i class="fas fa-box"></i></div>
                <div class="update-content">
                    <div class="update-title">3 packages delivered to concierge desk</div>
                    <div class="update-time">15 minutes ago</div>
                </div>
            </div>
            <div class="update-item">
                <div class="update-icon"><i class="fas fa-user-plus"></i></div>
                <div class="update-content">
                    <div class="update-title">New resident registration pending approval</div>
                    <div class="update-time">1 hour ago</div>
                </div>
            </div>
        `;
        
        // Update badge
        const updateBadge = document.getElementById('updateBadge');
        if (updateBadge) {
            updateBadge.textContent = '2';
            updateBadge.style.display = 'inline-block';
        }
    }
}

// Initialize any portal-specific features
console.log('Portal loaded successfully');

// Demo: Handle form submissions in portal
const forms = document.querySelectorAll('form');
forms.forEach(form => {
    form.addEventListener('submit', (e) => {
        if (!form.classList.contains('no-prevent')) {
            e.preventDefault();
            showNotification('Feature coming soon! This is a demo version.', 'info');
        }
    });
});

// Handle navigation between sections
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const sections = document.querySelectorAll('.content-section');
    const sidebar = document.getElementById('portalSidebar');
    
    // Category dropdown functionality
    const categoryHeaders = document.querySelectorAll('.category-header');
    
    categoryHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const category = header.getAttribute('data-category');
            const dropdown = document.getElementById(`${category}-dropdown`);
            const isExpanded = header.classList.contains('expanded');
            
            // Close all other dropdowns first
            categoryHeaders.forEach(otherHeader => {
                if (otherHeader !== header) {
                    const otherCategory = otherHeader.getAttribute('data-category');
                    const otherDropdown = document.getElementById(`${otherCategory}-dropdown`);
                    otherHeader.classList.remove('expanded');
                    otherDropdown.classList.remove('expanded');
                    localStorage.setItem(`category-${otherCategory}`, false);
                }
            });
            
            // Toggle current dropdown
            if (!isExpanded) {
                header.classList.add('expanded');
                dropdown.classList.add('expanded');
                localStorage.setItem(`category-${category}`, true);
            } else {
                header.classList.remove('expanded');
                dropdown.classList.remove('expanded');
                localStorage.setItem(`category-${category}`, false);
            }
        });
    });
    
    // Restore category states from localStorage (only one at a time)
    let expandedCategory = null;
    categoryHeaders.forEach(header => {
        const category = header.getAttribute('data-category');
        const isExpanded = localStorage.getItem(`category-${category}`) === 'true';
        
        if (isExpanded && !expandedCategory) {
            expandedCategory = category;
            header.classList.add('expanded');
            document.getElementById(`${category}-dropdown`).classList.add('expanded');
        } else {
            // Ensure all others are closed
            header.classList.remove('expanded');
            document.getElementById(`${category}-dropdown`).classList.remove('expanded');
            localStorage.setItem(`category-${category}`, false);
        }
    });
    
    // If no category is expanded, expand Building Services by default
    if (!expandedCategory) {
        const buildingServicesHeader = document.querySelector('[data-category="building-services"]');
        const buildingServicesDropdown = document.getElementById('building-services-dropdown');
        if (buildingServicesHeader && buildingServicesDropdown) {
            buildingServicesHeader.classList.add('expanded');
            buildingServicesDropdown.classList.add('expanded');
            localStorage.setItem('category-building-services', true);
        }
    }
    
    // Navigation functionality
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(link.getAttribute('data-section'));
        });
    });
    
    // Function to navigate to a section
    function navigateToSection(targetSection) {
        // Update active nav
        document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
        const targetNavLink = document.querySelector(`.nav-link[data-section="${targetSection}"]`);
        if (targetNavLink) {
            targetNavLink.parentElement.classList.add('active');
            
            // Expand parent category if collapsed
            const parentDropdown = targetNavLink.closest('.category-dropdown');
            if (parentDropdown && !parentDropdown.classList.contains('expanded')) {
                parentDropdown.classList.add('expanded');
                const categoryId = parentDropdown.id.replace('-dropdown', '');
                const categoryHeader = document.querySelector(`[data-category="${categoryId}"]`);
                if (categoryHeader) {
                    categoryHeader.classList.add('expanded');
                    localStorage.setItem(`category-${categoryId}`, 'true');
                }
            }
        }
        
        // Show target section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === `${targetSection}-section`) {
                section.classList.add('active');
                
                // Load section-specific data
                if (targetSection === 'announcements') {
                    loadAllAnnouncements();
                } else if (targetSection === 'board-directors') {
                    loadBoardData();
                } else if (targetSection === 'service-requests') {
                    initializeServiceRequests();
                } else if (targetSection === 'amenity-bookings') {
                    initializeAmenityBookings();
                }
            }
        });
        
        // Close sidebar on mobile
        if (window.innerWidth < 768) {
            sidebar.classList.remove('active');
        }
    }
    
    // Quick action buttons
    const actionButtons = document.querySelectorAll('.action-btn[data-section]');
    actionButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSection = btn.getAttribute('data-section');
            const targetLink = document.querySelector(`.nav-link[data-section="${targetSection}"]`);
            if (targetLink) {
                targetLink.click();
            }
        });
    });
    
    
    // Dropdown menu functionality
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const parentItem = toggle.closest('.nav-item');
            const isExpanded = parentItem.classList.contains('expanded');
            
            // Close all other dropdowns
            document.querySelectorAll('.nav-item.has-dropdown').forEach(item => {
                if (item !== parentItem) {
                    item.classList.remove('expanded');
                }
            });
            
            // Toggle current dropdown
            parentItem.classList.toggle('expanded');
            
            // Save expanded state to localStorage
            const dropdownStates = JSON.parse(localStorage.getItem('dropdownStates') || '{}');
            const dropdownId = toggle.querySelector('span').textContent;
            dropdownStates[dropdownId] = !isExpanded;
            localStorage.setItem('dropdownStates', JSON.stringify(dropdownStates));
        });
    });
    
    // Restore dropdown states from localStorage
    const savedDropdownStates = JSON.parse(localStorage.getItem('dropdownStates') || '{}');
    dropdownToggles.forEach(toggle => {
        const dropdownId = toggle.querySelector('span').textContent;
        if (savedDropdownStates[dropdownId]) {
            toggle.closest('.nav-item').classList.add('expanded');
        }
    });
    
    // Handle clicks on dropdown menu items
    const dropdownMenuLinks = document.querySelectorAll('.dropdown-menu .nav-link');
    dropdownMenuLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Navigate to the section
            const section = link.getAttribute('data-section');
            if (section) {
                navigateToSection(section);
            }
            
            // Update active state
            document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
            link.closest('.nav-item').classList.add('active');
            
            // Keep parent dropdown expanded
            const parentDropdown = link.closest('.nav-item.has-dropdown');
            if (parentDropdown) {
                parentDropdown.classList.add('active');
            }
        });
    });
    
    // Update date and time
    updateDateTime();
    setInterval(updateDateTime, 1000);
    
    // Handle "View All" links
    const viewAllLinks = document.querySelectorAll('a[data-section]');
    viewAllLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection(link.getAttribute('data-section'));
        });
    });
});

// Update date and time display
function updateDateTime() {
    const dateEl = document.getElementById('currentDate');
    const timeEl = document.getElementById('currentTime');
    
    if (dateEl && timeEl) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateEl.textContent = now.toLocaleDateString('en-US', options);
        timeEl.textContent = now.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            second: '2-digit'
        });
    }
}

// Load board of directors data
async function loadBoardData() {
    try {
        // Load board members
        const boardResult = await mockDB.getBoardMembers();
        if (boardResult.success) {
            displayBoardMembers(boardResult.boardMembers);
        }
        
        // Load upcoming meetings
        const upcomingResult = await mockDB.getBoardMeetings('scheduled');
        if (upcomingResult.success) {
            displayUpcomingMeetings(upcomingResult.meetings);
        }
        
        // Load previous meetings
        const completedResult = await mockDB.getBoardMeetings('completed');
        if (completedResult.success) {
            displayPreviousMeetings(completedResult.meetings);
        }
    } catch (error) {
        console.error('Error loading board data:', error);
    }
}

// Display board members
function displayBoardMembers(boardMembers) {
    const boardMembersGrid = document.getElementById('boardMembersGrid');
    if (!boardMembersGrid) return;
    
    if (boardMembers.length === 0) {
        boardMembersGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3>No Board Members</h3>
                <p>Board member information will appear here.</p>
            </div>
        `;
        return;
    }
    
    const membersHTML = boardMembers.map(member => {
        const termEndDate = new Date(member.termEnd);
        const isTermExpiring = termEndDate < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days
        
        return `
            <div class="board-member-card">
                <div class="member-header">
                    <div class="member-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="member-info">
                        <h3>${member.user.firstName} ${member.user.lastName}</h3>
                        <div class="member-position">${member.position}</div>
                        <div class="member-unit">Unit ${member.user.unitNumber}</div>
                    </div>
                    ${isTermExpiring ? '<div class="term-warning"><i class="fas fa-exclamation-triangle"></i> Term Expiring Soon</div>' : ''}
                </div>
                
                <div class="member-details">
                    <div class="member-term">
                        <strong>Term:</strong> ${new Date(member.termStart).getFullYear()} - ${new Date(member.termEnd).getFullYear()}
                    </div>
                    
                    <div class="member-contact">
                        <strong>Contact:</strong> 
                        <a href="mailto:${member.contactEmail}">${member.contactEmail}</a>
                    </div>
                    
                    <div class="member-bio">
                        <strong>Biography:</strong>
                        <p>${member.biography}</p>
                    </div>
                    
                    <div class="member-responsibilities">
                        <strong>Key Responsibilities:</strong>
                        <ul>
                            ${member.responsibilities.map(resp => `<li>${resp}</li>`).join('')}
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    boardMembersGrid.innerHTML = membersHTML;
}

// Display upcoming meetings
function displayUpcomingMeetings(meetings) {
    const upcomingMeetingsList = document.getElementById('upcomingMeetingsList');
    if (!upcomingMeetingsList) return;
    
    if (meetings.length === 0) {
        upcomingMeetingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar-plus" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h4>No Upcoming Meetings</h4>
                <p>Future board meetings will appear here.</p>
            </div>
        `;
        return;
    }
    
    const meetingsHTML = meetings.map(meeting => {
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        const isUpcoming = meetingDate > new Date();
        
        return `
            <div class="meeting-card ${isUpcoming ? 'upcoming' : 'past'}">
                <div class="meeting-header">
                    <div class="meeting-date">
                        <div class="meeting-day">${meetingDate.getDate()}</div>
                        <div class="meeting-month">${meetingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                    </div>
                    <div class="meeting-info">
                        <h4>${meeting.title}</h4>
                        <div class="meeting-details">
                            <span><i class="fas fa-clock"></i> ${meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${meeting.location}</span>
                        </div>
                    </div>
                    <div class="meeting-status">
                        <span class="status-badge status-${meeting.status}">${meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}</span>
                    </div>
                </div>
                
                <div class="meeting-agenda">
                    <strong>Agenda:</strong>
                    <ul>
                        ${meeting.agenda.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="meeting-actions">
                    <button class="btn btn-secondary btn-small" onclick="editMeeting(${meeting.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="viewMeetingDetails(${meeting.id})">
                        <i class="fas fa-eye"></i> View Details
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    upcomingMeetingsList.innerHTML = meetingsHTML;
}

// Display previous meetings
function displayPreviousMeetings(meetings) {
    const previousMeetingsList = document.getElementById('previousMeetingsList');
    if (!previousMeetingsList) return;
    
    if (meetings.length === 0) {
        previousMeetingsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history" style="font-size: 2rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h4>No Previous Meetings</h4>
                <p>Past board meetings and minutes will appear here.</p>
            </div>
        `;
        return;
    }
    
    const meetingsHTML = meetings.map(meeting => {
        const meetingDate = new Date(meeting.date + 'T' + meeting.time);
        
        return `
            <div class="meeting-card completed">
                <div class="meeting-header">
                    <div class="meeting-date">
                        <div class="meeting-day">${meetingDate.getDate()}</div>
                        <div class="meeting-month">${meetingDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}</div>
                    </div>
                    <div class="meeting-info">
                        <h4>${meeting.title}</h4>
                        <div class="meeting-details">
                            <span><i class="fas fa-clock"></i> ${meetingDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}</span>
                            <span><i class="fas fa-map-marker-alt"></i> ${meeting.location}</span>
                        </div>
                    </div>
                    <div class="meeting-status">
                        <span class="status-badge status-completed">Completed</span>
                    </div>
                </div>
                
                ${meeting.minutes ? `
                    <div class="meeting-minutes">
                        <strong>Meeting Minutes:</strong>
                        <p>${meeting.minutes}</p>
                    </div>
                ` : ''}
                
                <div class="meeting-actions">
                    <button class="btn btn-secondary btn-small" onclick="viewMeetingDetails(${meeting.id})">
                        <i class="fas fa-file-alt"></i> View Minutes
                    </button>
                    <button class="btn btn-secondary btn-small" onclick="downloadMinutes(${meeting.id})">
                        <i class="fas fa-download"></i> Download
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    previousMeetingsList.innerHTML = meetingsHTML;
}

// Meeting action functions
function editMeeting(meetingId) {
    showNotification('Edit meeting functionality coming soon!', 'info');
}

function viewMeetingDetails(meetingId) {
    showNotification('Meeting details view coming soon!', 'info');
}

function downloadMinutes(meetingId) {
    showNotification('Download minutes functionality coming soon!', 'info');
}

// Add board meeting functionality
document.addEventListener('DOMContentLoaded', () => {
    const addBoardMeetingBtn = document.getElementById('addBoardMeetingBtn');
    if (addBoardMeetingBtn) {
        addBoardMeetingBtn.addEventListener('click', () => {
            showCreateMeetingModal();
        });
    }
});

function showCreateMeetingModal() {
    const modalHTML = `
        <div class="modal-overlay" onclick="closeModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-calendar-plus"></i> Schedule Board Meeting</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createMeetingForm" class="modal-form">
                    <div class="form-group">
                        <label for="meetingTitle">Meeting Title *</label>
                        <input type="text" id="meetingTitle" name="title" required 
                               placeholder="e.g., Monthly Board Meeting - January 2025">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="meetingDate">Date *</label>
                            <input type="date" id="meetingDate" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="meetingTime">Time *</label>
                            <input type="time" id="meetingTime" name="time" required>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="meetingLocation">Location *</label>
                        <input type="text" id="meetingLocation" name="location" required 
                               placeholder="e.g., Meeting Room A, Party Room">
                    </div>
                    
                    <div class="form-group">
                        <label for="meetingAgenda">Agenda Items</label>
                        <textarea id="meetingAgenda" name="agenda" rows="4" 
                                  placeholder="Enter agenda items (one per line)"></textarea>
                        <small>Enter each agenda item on a new line</small>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-calendar-plus"></i> Schedule Meeting
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.innerHTML = modalHTML;
    modalContainer.style.display = 'flex';
    
    // Handle form submission
    document.getElementById('createMeetingForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateMeeting(e);
    });
}

async function handleCreateMeeting(e) {
    const formData = new FormData(e.target);
    const agendaText = formData.get('agenda');
    const agenda = agendaText ? agendaText.split('\n').filter(item => item.trim()) : [];
    
    const meetingData = {
        title: formData.get('title'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        agenda: agenda,
        createdBy: parseInt(sessionStorage.getItem('id'))
    };
    
    try {
        const result = await mockDB.createBoardMeeting(meetingData);
        if (result.success) {
            showNotification('Board meeting scheduled successfully!', 'success');
            closeModal();
            // Reload upcoming meetings
            const upcomingResult = await mockDB.getBoardMeetings('scheduled');
            if (upcomingResult.success) {
                displayUpcomingMeetings(upcomingResult.meetings);
            }
        } else {
            showNotification('Failed to schedule meeting. Please try again.', 'error');
        }
    } catch (error) {
        console.error('Error creating meeting:', error);
        showNotification('An error occurred. Please try again.', 'error');
    }
}

function closeModal() {
    const modalContainer = document.getElementById('modalContainer');
    modalContainer.style.display = 'none';
    modalContainer.innerHTML = '';
}

// Enhanced loading screen sequence
function startLoadingSequence() {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingStatus = document.getElementById('loadingStatus');
    const progressFill = document.getElementById('progressFill');
    
    if (!loadingScreen || !loadingStatus || !progressFill) return;
    
    const loadingSteps = [
        { text: 'Initializing portal...', progress: 0, duration: 500 },
        { text: 'Authenticating user...', progress: 33, duration: 550 },
        { text: 'Loading dashboard...', progress: 66, duration: 650 },
        { text: 'Finalizing setup...', progress: 100, duration: 400 }
    ];
    
    let currentStep = 0;
    
    function executeStep() {
        if (currentStep >= loadingSteps.length) {
            // Final step - hide loading screen
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 800);
            }, 400);
            return;
        }
        
        const step = loadingSteps[currentStep];
        
        // Update text with fade effect
        loadingStatus.style.opacity = '0';
        setTimeout(() => {
            loadingStatus.textContent = step.text;
            loadingStatus.style.opacity = '1';
        }, 100);
        
        // Update progress bar
        progressFill.style.width = step.progress + '%';
        
        // Move to next step
        currentStep++;
        setTimeout(executeStep, step.duration);
    }
    
    // Start the sequence
    executeStep();
}

// Add announcement functionality
document.addEventListener('DOMContentLoaded', () => {
    const addAnnouncementBtn = document.getElementById('addAnnouncementBtn');
    if (addAnnouncementBtn) {
        addAnnouncementBtn.addEventListener('click', () => {
            showCreateAnnouncementModal();
        });
    }
});

// Show create announcement modal
function showCreateAnnouncementModal() {
    const modalHTML = `
        <div class="modal-overlay" onclick="closeAnnouncementModal()">
            <div class="modal-content" onclick="event.stopPropagation()">
                <div class="modal-header">
                    <h3><i class="fas fa-bullhorn"></i> Create New Announcement</h3>
                    <button class="modal-close" onclick="closeAnnouncementModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="createAnnouncementForm" class="modal-form">
                    <div class="form-group">
                        <label for="announcementTitle">Title *</label>
                        <input type="text" id="announcementTitle" name="title" required 
                               placeholder="Enter announcement title">
                    </div>
                    
                    <div class="form-group">
                        <label for="announcementContent">Content *</label>
                        <textarea id="announcementContent" name="content" rows="6" required 
                                  placeholder="Enter the full announcement content"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>Notification Options</label>
                        <div class="checkbox-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="emailAllResidents" name="emailAll">
                                <span><i class="fas fa-envelope"></i> Email ALL Residents</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="textAllResidents" name="textAll">
                                <span><i class="fas fa-sms"></i> Text ALL Residents</span>
                            </label>
                        </div>
                        <p class="form-help">Note: Email and text functionality will be implemented in a future update.</p>
                    </div>
                    
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeAnnouncementModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-bullhorn"></i> Create Announcement
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    const modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        // Create modal container if it doesn't exist
        const container = document.createElement('div');
        container.id = 'modalContainer';
        container.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 10000;';
        document.body.appendChild(container);
    }
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    document.getElementById('modalContainer').style.display = 'flex';
    
    // Handle form submission
    document.getElementById('createAnnouncementForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleCreateAnnouncement(e);
    });
}

// Handle create announcement
async function handleCreateAnnouncement(e) {
    const formData = new FormData(e.target);
    const userId = parseInt(sessionStorage.getItem('id'));
    
    const announcementData = {
        title: formData.get('title'),
        content: formData.get('content')
    };
    
    // Get notification options (for future implementation)
    const emailAll = formData.get('emailAll') === 'on';
    const textAll = formData.get('textAll') === 'on';
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    submitBtn.disabled = true;
    
    try {
        const result = await mockDB.createAnnouncement(announcementData, userId);
        
        if (result.success) {
            showNotification('Announcement created successfully!', 'success');
            closeAnnouncementModal();
            loadAllAnnouncements(); // Refresh the announcements list
            loadRecentAnnouncements(); // Refresh dashboard announcements
        } else {
            showNotification(result.error || 'Failed to create announcement', 'error');
        }
    } catch (error) {
        console.error('Error creating announcement:', error);
        showNotification('An error occurred while creating the announcement', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Delete announcement
async function deleteAnnouncement(announcementId) {
    if (!confirm('Are you sure you want to delete this announcement? This action cannot be undone.')) {
        return;
    }
    
    const userId = parseInt(sessionStorage.getItem('id'));
    
    try {
        const result = await mockDB.deleteAnnouncement(announcementId, userId);
        
        if (result.success) {
            showNotification('Announcement deleted successfully!', 'success');
            loadAllAnnouncements(); // Refresh the announcements list
            loadRecentAnnouncements(); // Refresh dashboard announcements
        } else {
            showNotification(result.error || 'Failed to delete announcement', 'error');
        }
    } catch (error) {
        console.error('Error deleting announcement:', error);
        showNotification('An error occurred while deleting the announcement', 'error');
    }
}

// Close announcement modal
function closeAnnouncementModal() {
    const modalContainer = document.getElementById('modalContainer');
    if (modalContainer) {
        const overlay = modalContainer.querySelector('.modal-overlay');
        const modal = modalContainer.querySelector('.modal');
        
        if (overlay && modal) {
            overlay.classList.add('modal-hide');
            modal.classList.add('modal-hide');
            
            setTimeout(() => {
                modalContainer.style.display = 'none';
                modalContainer.innerHTML = '';
            }, 300);
        } else {
            modalContainer.style.display = 'none';
            modalContainer.innerHTML = '';
        }
    }
}

// Show announcement modal
function showAnnouncementModal(announcementData = {}) {
    let modalContainer = document.getElementById('modalContainer');
    if (!modalContainer) {
        modalContainer = document.createElement('div');
        modalContainer.id = 'modalContainer';
        document.body.appendChild(modalContainer);
    }

    const isEdit = announcementData.id !== undefined;
    const modalTitle = isEdit ? 'Edit Announcement' : 'Create Announcement';

    // Initialize wizard data
    window.announcementWizardData = {
        currentStep: 1,
        totalSteps: 4,
        data: announcementData,
        isEdit: isEdit
    };

    modalContainer.innerHTML = `
        <div class="modal-overlay modern-overlay" onclick="closeAnnouncementModal()">
            <div class="modal modern-modal wizard-modal" onclick="event.stopPropagation()">
                <div class="modal-header modern-header compact-header">
                    <div class="wizard-progress inline-progress centered-progress">
                        <div class="progress-step active" data-step="1">
                            <div class="step-number">1</div>
                            <div class="step-label">Content</div>
                        </div>
                        <div class="progress-step" data-step="2">
                            <div class="step-number">2</div>
                            <div class="step-label">Schedule</div>
                        </div>
                        <div class="progress-step" data-step="3">
                            <div class="step-number">3</div>
                            <div class="step-label">Notify</div>
                        </div>
                        <div class="progress-step" data-step="4">
                            <div class="step-number">4</div>
                            <div class="step-label">Preview</div>
                        </div>
                    </div>
                    <button class="modal-close modern-close" onclick="closeAnnouncementModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <form id="announcementForm" class="modal-form modern-form wizard-form">
                    ${isEdit ? `<input type="hidden" id="announcementId" value="${announcementData.id}">` : ''}
                    
                    <!-- Step 1: Content -->
                    <div class="wizard-step active" data-step="1">
                        <div class="step-content">
                            <h3 class="step-title">Create Your Announcement</h3>
                            <p class="step-description">Start by writing a clear title and message for your residents.</p>
                            
                            <div class="form-group modern-input-group">
                                <label for="announcementTitle" class="modern-label">
                                    Announcement Title
                                </label>
                                <input type="text" 
                                       id="announcementTitle" 
                                       name="title" 
                                       required 
                                       value="${announcementData.title || ''}" 
                                       placeholder="Enter a clear, descriptive title"
                                       class="modern-input">
                                <span class="input-hint">Make it easy for residents to understand the topic at a glance</span>
                            </div>
                            
                            <div class="form-group modern-input-group">
                                <label for="announcementContent" class="modern-label">
                                    Message Content
                                </label>
                                <textarea id="announcementContent" 
                                          name="content" 
                                          rows="10" 
                                          required 
                                          placeholder="Write your announcement here. Be clear and include all necessary details..."
                                          class="modern-textarea">${announcementData.content || ''}</textarea>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 2: Schedule -->
                    <div class="wizard-step" data-step="2">
                        <div class="step-content">
                            <h3 class="step-title">Schedule Your Announcement</h3>
                            <p class="step-description">Choose when to publish your announcement.</p>
                            
                            <div class="schedule-options">
                                <label class="schedule-option">
                                    <input type="radio" name="scheduleOption" value="now" checked onchange="updateScheduleOption()">
                                    <div class="option-card">
                                        <div class="option-icon">
                                            <i class="fas fa-bolt"></i>
                                        </div>
                                        <div class="option-content">
                                            <h4>Publish Immediately</h4>
                                            <p>Send the announcement right away</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="schedule-option">
                                    <input type="radio" name="scheduleOption" value="later" onchange="updateScheduleOption()">
                                    <div class="option-card">
                                        <div class="option-icon">
                                            <i class="fas fa-calendar-alt"></i>
                                        </div>
                                        <div class="option-content">
                                            <h4>Schedule for Later</h4>
                                            <p>Choose a specific date and time</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                            
                            <div id="scheduleFields" class="schedule-fields" style="display: none;">
                                <div class="schedule-row">
                                    <div class="schedule-input">
                                        <label for="scheduleDate" class="modern-label">Date</label>
                                        <input type="date" 
                                               id="scheduleDate" 
                                               class="modern-input"
                                               min="${new Date().toISOString().split('T')[0]}"
                                               value="${announcementData.scheduleDate || ''}">
                                    </div>
                                    <div class="schedule-input">
                                        <label for="scheduleTime" class="modern-label">Time</label>
                                        <input type="time" 
                                               id="scheduleTime" 
                                               class="modern-input"
                                               value="${announcementData.scheduleTime || ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 3: Notifications -->
                    <div class="wizard-step" data-step="3">
                        <div class="step-content">
                            <h3 class="step-title">Choose Notification Methods</h3>
                            <p class="step-description">Select how residents will be notified about this announcement.</p>
                            
                            <div class="notification-options">
                                <label class="checkbox-label modern-checkbox notification-card always-checked">
                                    <input type="checkbox" 
                                           id="sendPortal" 
                                           checked
                                           disabled>
                                    <span class="checkbox-custom"></span>
                                    <div class="notification-content">
                                        <div class="notification-icon">
                                            <i class="fas fa-home"></i>
                                        </div>
                                        <div class="notification-text">
                                            <h4>Portal Notification</h4>
                                            <p>Display on the resident portal dashboard (always enabled)</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label modern-checkbox notification-card">
                                    <input type="checkbox" 
                                           id="sendEmail" 
                                           ${announcementData.sendEmail !== false ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <div class="notification-content">
                                        <div class="notification-icon">
                                            <i class="fas fa-envelope"></i>
                                        </div>
                                        <div class="notification-text">
                                            <h4>Email Notification</h4>
                                            <p>Send to all residents with registered email addresses</p>
                                        </div>
                                    </div>
                                </label>
                                
                                <label class="checkbox-label modern-checkbox notification-card">
                                    <input type="checkbox" 
                                           id="sendText" 
                                           ${announcementData.sendText ? 'checked' : ''}>
                                    <span class="checkbox-custom"></span>
                                    <div class="notification-content">
                                        <div class="notification-icon">
                                            <i class="fas fa-sms"></i>
                                        </div>
                                        <div class="notification-text">
                                            <h4>Text Message</h4>
                                            <p>Send SMS to residents who have opted in for text alerts</p>
                                        </div>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Step 4: Preview -->
                    <div class="wizard-step" data-step="4">
                        <div class="step-content">
                            <h3 class="step-title">Review Your Announcement</h3>
                            <p class="step-description">Please review all details before publishing.</p>
                            
                            <div class="preview-container">
                                <div class="preview-section">
                                    <h4 class="preview-label">Announcement Preview</h4>
                                    <div class="preview-card">
                                        <h3 id="previewTitle" class="preview-title"></h3>
                                        <p id="previewContent" class="preview-content"></p>
                                        <div class="preview-meta">
                                            <span id="previewAuthor" class="preview-author">
                                                <i class="fas fa-user"></i>
                                                ${sessionStorage.getItem('firstName')} ${sessionStorage.getItem('lastName')}
                                            </span>
                                            <span id="previewDate" class="preview-date">
                                                <i class="fas fa-clock"></i>
                                                <span id="previewDateText"></span>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div class="preview-details">
                                    <div class="detail-item">
                                        <i class="fas fa-bell"></i>
                                        <span>Notifications: <strong id="previewNotifications"></strong></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="form-actions wizard-actions">
                        <button type="button" class="btn btn-ghost" id="wizardBack" onclick="previousStep()" style="display: none;">
                            <i class="fas fa-arrow-left"></i>
                            Back
                        </button>
                        <div class="action-right">
                            <button type="button" class="btn btn-ghost" onclick="closeAnnouncementModal()">
                                Cancel
                            </button>
                            <button type="button" class="btn btn-primary modern-primary" id="wizardNext" onclick="nextStep()">
                                Next
                                <i class="fas fa-arrow-right"></i>
                            </button>
                            <button type="submit" class="btn btn-primary modern-primary" id="wizardSubmit" style="display: none;">
                                <i class="fas fa-paper-plane"></i>
                                ${isEdit ? 'Update Announcement' : 'Publish Announcement'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    `;

    modalContainer.style.display = 'block';
    
    // Add smooth animation
    requestAnimationFrame(() => {
        modalContainer.querySelector('.modal-overlay').classList.add('modal-show');
        modalContainer.querySelector('.modal').classList.add('modal-show');
    });
    

    // Add form submit handler
    const form = document.getElementById('announcementForm');
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            title: document.getElementById('announcementTitle').value,
            content: document.getElementById('announcementContent').value,
            sendEmail: document.getElementById('sendEmail').checked,
            sendText: document.getElementById('sendText').checked
        };
        
        // Add scheduling data if enabled
        if (document.getElementById('scheduleAnnouncement').checked) {
            const scheduleDate = document.getElementById('scheduleDate').value;
            const scheduleTime = document.getElementById('scheduleTime').value;
            
            if (scheduleDate && scheduleTime) {
                formData.scheduled = true;
                formData.scheduledFor = `${scheduleDate}T${scheduleTime}`;
            }
        }

        if (isEdit) {
            await updateAnnouncement(announcementData.id, formData);
        } else {
            await createAnnouncement(formData);
        }
    });
}

// Toggle scheduling fields
function toggleScheduling() {
    const checkbox = document.getElementById('scheduleAnnouncement');
    const scheduleFields = document.getElementById('scheduleFields');
    
    if (checkbox && scheduleFields) {
        if (checkbox.checked) {
            scheduleFields.style.display = 'block';
            // Add smooth animation
            requestAnimationFrame(() => {
                scheduleFields.classList.add('show');
            });
        } else {
            scheduleFields.classList.remove('show');
            setTimeout(() => {
                scheduleFields.style.display = 'none';
            }, 300);
        }
    }
}


// Update announcement
async function updateAnnouncement(announcementId, formData) {
    const submitBtn = document.getElementById('announcementSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    submitBtn.disabled = true;

    try {
        // In production, this would be an API call
        const announcement = allAnnouncements.find(a => a.id === announcementId);
        if (announcement) {
            Object.assign(announcement, formData);
            announcement.updatedAt = new Date().toISOString();
        }

        showNotification('Announcement updated successfully!', 'success');
        closeAnnouncementModal();
        loadAllAnnouncements();
        loadRecentAnnouncements();
    } catch (error) {
        console.error('Error updating announcement:', error);
        showNotification('Failed to update announcement', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// Create announcement
async function createAnnouncement(formData) {
    const submitBtn = document.getElementById('announcementSubmitBtn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    submitBtn.disabled = true;

    const userId = parseInt(sessionStorage.getItem('id') || localStorage.getItem('id'));
    const userRole = sessionStorage.getItem('role') || localStorage.getItem('role');
    const userName = `${sessionStorage.getItem('firstName')} ${sessionStorage.getItem('lastName')}` || 
                     `${localStorage.getItem('firstName')} ${localStorage.getItem('lastName')}`;

    try {
        const result = await mockDB.createAnnouncement({
            ...formData,
            createdBy: userName,
            createdById: userId
        }, userId);

        if (result.success) {
            showNotification('Announcement published successfully!', 'success');
            closeAnnouncementModal();
            loadAllAnnouncements();
            loadRecentAnnouncements();
        } else {
            showNotification(result.error || 'Failed to create announcement', 'error');
        }
    } catch (error) {
        console.error('Error creating announcement:', error);
        showNotification('Failed to create announcement', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}


// Edit announcement
function editAnnouncement(announcementId) {
    const announcement = allAnnouncements.find(a => a.id === announcementId);
    if (announcement) {
        showAnnouncementModal(announcement);
    }
}

// Wizard navigation functions
function nextStep() {
    const wizardData = window.announcementWizardData;
    if (!wizardData) return;
    
    // Validate current step before proceeding
    if (!validateStep(wizardData.currentStep)) {
        return;
    }
    
    // Update preview on step 3
    if (wizardData.currentStep === 3) {
        updatePreview();
    }
    
    if (wizardData.currentStep < wizardData.totalSteps) {
        wizardData.currentStep++;
        updateWizardUI();
    }
}

function previousStep() {
    const wizardData = window.announcementWizardData;
    if (!wizardData) return;
    
    if (wizardData.currentStep > 1) {
        wizardData.currentStep--;
        updateWizardUI();
    }
}

function validateStep(step) {
    switch(step) {
        case 1:
            const title = document.getElementById('announcementTitle').value.trim();
            const content = document.getElementById('announcementContent').value.trim();
            
            if (!title) {
                showNotification('Please enter an announcement title', 'error');
                document.getElementById('announcementTitle').focus();
                return false;
            }
            
            if (!content) {
                showNotification('Please enter announcement content', 'error');
                document.getElementById('announcementContent').focus();
                return false;
            }
            
            return true;
            
        case 2:
            const scheduleOption = document.querySelector('input[name="scheduleOption"]:checked').value;
            if (scheduleOption === 'later') {
                const scheduleDate = document.getElementById('scheduleDate').value;
                const scheduleTime = document.getElementById('scheduleTime').value;
                
                if (!scheduleDate || !scheduleTime) {
                    showNotification('Please select both date and time for scheduling', 'error');
                    return false;
                }
                
                // Validate future date/time
                const scheduledDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
                if (scheduledDateTime <= new Date()) {
                    showNotification('Please select a future date and time', 'error');
                    return false;
                }
            }
            return true;
            
        case 3:
            // No validation needed for notifications
            return true;
            
        default:
            return true;
    }
}

function updateWizardUI() {
    const wizardData = window.announcementWizardData;
    if (!wizardData) return;
    
    // Update progress steps
    document.querySelectorAll('.progress-step').forEach((step, index) => {
        const stepNum = index + 1;
        const stepNumber = step.querySelector('.step-number');
        
        if (stepNum < wizardData.currentStep) {
            step.classList.add('completed');
            step.classList.remove('active');
            // Add checkmark for completed steps
            stepNumber.innerHTML = '<i class="fas fa-check"></i>';
        } else if (stepNum === wizardData.currentStep) {
            step.classList.add('active');
            step.classList.remove('completed');
            // Show step number for active step
            stepNumber.innerHTML = stepNum;
        } else {
            step.classList.remove('active', 'completed');
            // Show step number for future steps
            stepNumber.innerHTML = stepNum;
        }
    });
    
    
    // Update step content visibility
    document.querySelectorAll('.wizard-step').forEach((step, index) => {
        const stepNum = index + 1;
        if (stepNum === wizardData.currentStep) {
            step.classList.add('active');
        } else {
            step.classList.remove('active');
        }
    });
    
    // Update buttons
    const backBtn = document.getElementById('wizardBack');
    const nextBtn = document.getElementById('wizardNext');
    const submitBtn = document.getElementById('wizardSubmit');
    
    // Show/hide back button
    if (wizardData.currentStep === 1) {
        backBtn.style.display = 'none';
    } else {
        backBtn.style.display = 'inline-flex';
    }
    
    // Show/hide next/submit buttons
    if (wizardData.currentStep === wizardData.totalSteps) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'inline-flex';
    } else {
        nextBtn.style.display = 'inline-flex';
        submitBtn.style.display = 'none';
    }
}

function updatePreview() {
    // Update title and content
    const title = document.getElementById('announcementTitle').value;
    const content = document.getElementById('announcementContent').value;
    
    document.getElementById('previewTitle').textContent = title;
    document.getElementById('previewContent').textContent = content;
    
    // Update date/time
    const scheduleOption = document.querySelector('input[name="scheduleOption"]:checked').value;
    const previewDateText = document.getElementById('previewDateText');
    
    if (scheduleOption === 'now') {
        previewDateText.textContent = 'Will be published immediately';
    } else {
        const scheduleDate = document.getElementById('scheduleDate').value;
        const scheduleTime = document.getElementById('scheduleTime').value;
        if (scheduleDate && scheduleTime) {
            const date = new Date(`${scheduleDate}T${scheduleTime}`);
            previewDateText.textContent = `Scheduled for ${date.toLocaleString()}`;
        }
    }
    
    // Update notifications
    const emailChecked = document.getElementById('sendEmail').checked;
    const textChecked = document.getElementById('sendText').checked;
    const notificationMethods = ['Portal']; // Portal is always included
    
    if (emailChecked) notificationMethods.push('Email');
    if (textChecked) notificationMethods.push('Text Message');
    
    const previewNotifications = document.getElementById('previewNotifications');
    previewNotifications.textContent = notificationMethods.join(', ');
}

function updateScheduleOption() {
    const scheduleOption = document.querySelector('input[name="scheduleOption"]:checked').value;
    const scheduleFields = document.getElementById('scheduleFields');
    
    if (scheduleOption === 'later') {
        scheduleFields.style.display = 'block';
    } else {
        scheduleFields.style.display = 'none';
    }
}

// Document Vault Functionality
function initializeDocumentVault() {
    // Add event listeners for document vault interactions
    const documentSearch = document.getElementById('documentSearch');
    const fileTypeFilter = document.getElementById('fileTypeFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchBtn = document.getElementById('searchBtn');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');
    const uploadDocumentBtn = document.getElementById('uploadDocumentBtn');

    if (documentSearch) {
        documentSearch.addEventListener('input', () => {
            filterDocuments();
        });
    }

    if (fileTypeFilter) {
        fileTypeFilter.addEventListener('change', () => {
            filterDocuments();
        });
    }

    if (dateFilter) {
        dateFilter.addEventListener('change', () => {
            filterDocuments();
        });
    }

    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            filterDocuments();
        });
    }

    if (gridViewBtn) {
        gridViewBtn.addEventListener('click', () => {
            switchDocumentView('grid');
        });
    }

    if (listViewBtn) {
        listViewBtn.addEventListener('click', () => {
            switchDocumentView('list');
        });
    }

    if (uploadDocumentBtn) {
        uploadDocumentBtn.addEventListener('click', () => {
            showUploadModal();
        });
    }

    // Load initial document vault data
    loadDocumentVault();
}

async function loadDocumentVault() {
    try {
        // Load folders
        const folders = await mockDB.getDocumentFolders();
        displayFolders(folders);

        // Load documents
        const documents = await mockDB.getDocuments();
        displayDocuments(documents);

    } catch (error) {
        console.error('Error loading document vault:', error);
        showNotification('Error loading document vault', 'error');
    }
}

function displayFolders(folders) {
    const foldersGrid = document.getElementById('foldersGrid');
    if (!foldersGrid) return;

    foldersGrid.innerHTML = folders.map(folder => `
        <div class="folder-item" onclick="openFolder('${folder.id}')">
            <i class="fas fa-folder"></i>
            <div class="folder-name">${folder.name}</div>
            <div class="folder-description">${folder.description}</div>
        </div>
    `).join('');
}

function displayDocuments(documents) {
    const documentsGrid = document.getElementById('documentsGrid');
    if (!documentsGrid) return;

    if (documents.length === 0) {
        documentsGrid.innerHTML = `
            <div class="empty-documents">
                <i class="fas fa-file-alt"></i>
                <h3>No Documents Found</h3>
                <p>No documents have been uploaded yet.</p>
            </div>
        `;
        return;
    }

    documentsGrid.innerHTML = documents.map(doc => `
        <div class="document-item" onclick="openDocument('${doc.id}')">
            <i class="document-icon fas fa-file-${getDocumentIconType(doc.type)} ${doc.type}"></i>
            <div class="document-info">
                <div class="document-name">${doc.name}</div>
                <div class="document-meta">
                    <span class="document-size">${doc.size}</span>
                    <span class="document-date">${new Date(doc.uploadDate).toLocaleDateString()}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getDocumentIconType(fileType) {
    switch (fileType) {
        case 'pdf': return 'pdf';
        case 'doc': case 'docx': return 'word';
        case 'excel': case 'xlsx': return 'excel';
        case 'image': case 'jpg': case 'png': case 'gif': return 'image';
        default: return 'alt';
    }
}

function filterDocuments() {
    const searchTerm = document.getElementById('documentSearch')?.value.toLowerCase() || '';
    const fileType = document.getElementById('fileTypeFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || '';

    mockDB.getDocuments().then(documents => {
        let filteredDocuments = documents;

        // Filter by search term
        if (searchTerm) {
            filteredDocuments = filteredDocuments.filter(doc =>
                doc.name.toLowerCase().includes(searchTerm) ||
                doc.description?.toLowerCase().includes(searchTerm)
            );
        }

        // Filter by file type
        if (fileType) {
            filteredDocuments = filteredDocuments.filter(doc => doc.type === fileType);
        }

        // Filter by date
        if (dateFilter) {
            const now = new Date();
            let startDate;

            switch (dateFilter) {
                case 'today':
                    startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                    break;
                case 'week':
                    startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case 'month':
                    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                    break;
                case 'year':
                    startDate = new Date(now.getFullYear(), 0, 1);
                    break;
            }

            if (startDate) {
                filteredDocuments = filteredDocuments.filter(doc =>
                    new Date(doc.uploadDate) >= startDate
                );
            }
        }

        displayDocuments(filteredDocuments);
    });
}

function switchDocumentView(viewType) {
    const documentsGrid = document.getElementById('documentsGrid');
    const gridViewBtn = document.getElementById('gridViewBtn');
    const listViewBtn = document.getElementById('listViewBtn');

    if (!documentsGrid || !gridViewBtn || !listViewBtn) return;

    if (viewType === 'list') {
        documentsGrid.classList.add('list-view');
        gridViewBtn.classList.remove('active');
        listViewBtn.classList.add('active');
    } else {
        documentsGrid.classList.remove('list-view');
        gridViewBtn.classList.add('active');
        listViewBtn.classList.remove('active');
    }
}

function openFolder(folderId) {
    // Filter documents by folder
    mockDB.getDocuments().then(documents => {
        const folderDocuments = documents.filter(doc => doc.folderId === folderId);
        displayDocuments(folderDocuments);
    });
}

function openDocument(documentId) {
    // In a real app, this would download or open the document
    showNotification('Document would be opened/downloaded in a real implementation', 'info');
}

function showUploadModal() {
    // Create upload modal
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal upload-modal">
            <div class="modal-header">
                <h3><i class="fas fa-upload"></i> Upload Documents</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <div class="upload-zone" onclick="document.getElementById('fileInput').click()">
                    <i class="fas fa-cloud-upload-alt"></i>
                    <h3>Click to upload or drag files here</h3>
                    <p>Supports PDF, Word, Excel, and image files</p>
                </div>
                <input type="file" id="fileInput" class="file-input" multiple accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png,.gif">
                <div class="selected-files" id="selectedFiles"></div>
                
                <form class="modal-form" id="uploadForm">
                    <div class="form-group">
                        <label for="documentFolder">Folder</label>
                        <select id="documentFolder" required>
                            <option value="">Select a folder</option>
                            <option value="agm">AGM Materials</option>
                            <option value="activation">Activation Files</option>
                            <option value="architecture">Architecture Change Request Forms</option>
                            <option value="board">Board & Committee Members Listing</option>
                            <option value="construction">Construction/Appliance Service Manual</option>
                            <option value="covid">COVID-19</option>
                            <option value="declaration">Declaration, Bylaws and Rules</option>
                            <option value="emergency">Emergency Contacts/Vendor List</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="documentDescription">Description (Optional)</label>
                        <textarea id="documentDescription" placeholder="Brief description of the document(s)"></textarea>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="handleDocumentUpload()">Upload Documents</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle file selection
    const fileInput = document.getElementById('fileInput');
    fileInput.addEventListener('change', handleFileSelection);

    // Handle drag and drop
    const uploadZone = modal.querySelector('.upload-zone');
    uploadZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('dragover');
    });

    uploadZone.addEventListener('dragleave', () => {
        uploadZone.classList.remove('dragover');
    });

    uploadZone.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('dragover');
        fileInput.files = e.dataTransfer.files;
        handleFileSelection();
    });
}

function handleFileSelection() {
    const fileInput = document.getElementById('fileInput');
    const selectedFiles = document.getElementById('selectedFiles');
    
    if (!fileInput.files.length) {
        selectedFiles.innerHTML = '';
        return;
    }

    selectedFiles.innerHTML = Array.from(fileInput.files).map((file, index) => `
        <div class="selected-file">
            <div class="file-info">
                <i class="fas fa-file-${getDocumentIconType(file.type)}"></i>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button type="button" class="remove-file" onclick="removeFile(${index})">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

function removeFile(index) {
    const fileInput = document.getElementById('fileInput');
    const dt = new DataTransfer();
    
    Array.from(fileInput.files).forEach((file, i) => {
        if (i !== index) {
            dt.items.add(file);
        }
    });
    
    fileInput.files = dt.files;
    handleFileSelection();
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function handleDocumentUpload() {
    const fileInput = document.getElementById('fileInput');
    const folder = document.getElementById('documentFolder').value;
    const description = document.getElementById('documentDescription').value;

    if (!fileInput.files.length) {
        showNotification('Please select at least one file to upload', 'error');
        return;
    }

    if (!folder) {
        showNotification('Please select a folder', 'error');
        return;
    }

    try {
        // In a real implementation, this would upload the files to the server
        const uploadPromises = Array.from(fileInput.files).map(file => {
            return mockDB.uploadDocument({
                name: file.name,
                type: file.type,
                size: formatFileSize(file.size),
                folderId: folder,
                description: description,
                uploadDate: new Date().toISOString()
            });
        });

        await Promise.all(uploadPromises);
        
        showNotification(`Successfully uploaded ${fileInput.files.length} document(s)`, 'success');
        
        // Close modal and reload documents
        document.querySelector('.modal-overlay').remove();
        loadDocumentVault();
        
    } catch (error) {
        console.error('Error uploading documents:', error);
        showNotification('Error uploading documents', 'error');
    }
}

// Initialize document vault when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check if we're on the portal page before initializing
    if (document.getElementById('documentsGrid')) {
        initializeDocumentVault();
    }
});

// Extended Absence Functionality
function initializeExtendedAbsence() {
    // All users have access to Extended Absence feature

    const newAbsenceBtn = document.getElementById('newAbsenceBtn');
    const tabBtns = document.querySelectorAll('.absence-tabs .tab-btn');

    if (newAbsenceBtn) {
        newAbsenceBtn.addEventListener('click', showAbsenceModal);
    }

    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchAbsenceTab(targetTab);
        });
    });

    // Load initial data
    loadExtendedAbsenceData();
}

function switchAbsenceTab(targetTab) {
    // Update tab buttons
    document.querySelectorAll('.absence-tabs .tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${targetTab}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.absence-tabs .tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${targetTab}-tab`).classList.add('active');

    // Load appropriate data
    switch (targetTab) {
        case 'current':
            loadCurrentAbsences();
            break;
        case 'active':
            loadActiveAbsences();
            break;
        case 'upcoming':
            loadUpcomingAbsences();
            break;
        case 'history':
            loadAbsenceHistory();
            break;
    }
}

async function loadExtendedAbsenceData() {
    try {
        let absences = await mockDB.getExtendedAbsences();
        
        updateAbsenceStats(absences);
        
        // Load current absences by default
        loadCurrentAbsences();
    } catch (error) {
        console.error('Error loading absence data:', error);
        showNotification('Error loading absence data', 'error');
    }
}

function updateAbsenceStats(absences) {
    const now = new Date();
    const currentAbsences = absences.filter(a => 
        new Date(a.startDate) <= now && new Date(a.endDate) >= now
    );
    const upcomingAbsences = absences.filter(a => 
        new Date(a.startDate) > now
    );
    const monitoredUnits = absences.filter(a => 
        a.monitoringRequested && new Date(a.endDate) >= now
    );

    document.getElementById('activeAbsences').textContent = currentAbsences.length;
    document.getElementById('upcomingAbsences').textContent = upcomingAbsences.length;
    document.getElementById('monitoredUnits').textContent = monitoredUnits.length;
}

async function loadCurrentAbsences() {
    try {
        let absences = await mockDB.getExtendedAbsences();
        
        const now = new Date();
        const currentAbsences = absences.filter(a => 
            new Date(a.startDate) <= now && new Date(a.endDate) >= now && a.status !== 'cancelled'
        );
        displayAbsences(currentAbsences, 'currentAbsenceList', 'current', true);
    } catch (error) {
        console.error('Error loading current absences:', error);
    }
}

async function loadActiveAbsences() {
    try {
        const userId = sessionStorage.getItem('id') || localStorage.getItem('id');
        let absences = await mockDB.getExtendedAbsences();
        
        // For residents and board members - show their active (current + upcoming) absences
        absences = absences.filter(a => a.userId === parseInt(userId));
        
        const now = new Date();
        const activeAbsences = absences.filter(a => 
            new Date(a.endDate) >= now && a.status !== 'cancelled'
        );
        displayAbsences(activeAbsences, 'activeAbsenceList', 'active', false);
    } catch (error) {
        console.error('Error loading active absences:', error);
    }
}

async function loadUpcomingAbsences() {
    try {
        let absences = await mockDB.getExtendedAbsences();
        
        const now = new Date();
        const upcomingAbsences = absences.filter(a => 
            new Date(a.startDate) > now && a.status !== 'cancelled'
        );
        displayAbsences(upcomingAbsences, 'upcomingAbsenceList', 'upcoming', true);
    } catch (error) {
        console.error('Error loading upcoming absences:', error);
    }
}

async function loadAbsenceHistory() {
    try {
        let absences = await mockDB.getExtendedAbsences();
        
        const now = new Date();
        const pastAbsences = absences.filter(a => 
            new Date(a.endDate) < now || a.status === 'cancelled'
        );
        displayAbsences(pastAbsences, 'historyAbsenceList', 'past', true);
    } catch (error) {
        console.error('Error loading absence history:', error);
    }
}

function displayAbsences(absences, containerId, type, isStaff = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (absences.length === 0) {
        const typeText = type === 'current' ? 'Current' : 
                        type === 'upcoming' ? 'Upcoming' : 
                        type === 'active' ? 'Active' : 'Past';
        container.innerHTML = `
            <div class="empty-absence">
                <i class="fas fa-calendar-times"></i>
                <h3>No ${typeText} Absences</h3>
                <p>No extended absence requests found for this period.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = absences.map(absence => createAbsenceCard(absence, type, isStaff)).join('');
}

function createAbsenceCard(absence, type, isStaff = false) {
    const statusClass = type === 'current' || type === 'active' ? 'active' : 
                       type === 'upcoming' ? 'upcoming' : 'completed';
    const statusText = type === 'current' ? 'Currently Away' : 
                      type === 'upcoming' ? 'Upcoming' : 
                      type === 'active' ? 'Active' : 
                      absence.status === 'cancelled' ? 'Cancelled' : 'Completed';

    // Get resident info if staff view
    let residentInfo = '';
    if (isStaff) {
        const user = mockDB.getUserById(absence.userId);
        if (user) {
            residentInfo = `
                <div class="resident-info-badge">
                    <i class="fas fa-user"></i>
                    <span>${user.firstName} ${user.lastName} - Unit ${user.unitNumber}</span>
                </div>
            `;
        }
    }

    return `
        <div class="absence-card ${type}">
            <div class="absence-header">
                <div class="absence-title">
                    <i class="fas fa-plane-departure"></i>
                    <h3>${absence.title}</h3>
                    ${residentInfo}
                </div>
                <span class="absence-status ${statusClass}">${statusText}</span>
            </div>

            <div class="absence-dates">
                <div class="date-info">
                    <i class="fas fa-calendar-minus"></i>
                    <span><strong>Departure:</strong> ${new Date(absence.startDate).toLocaleDateString()}</span>
                </div>
                <div class="date-info">
                    <i class="fas fa-calendar-plus"></i>
                    <span><strong>Return:</strong> ${new Date(absence.endDate).toLocaleDateString()}</span>
                </div>
            </div>

            <div class="absence-details">
                <div class="detail-item">
                    <label>Emergency Contact</label>
                    <span>${absence.emergencyContact}</span>
                </div>
                <div class="detail-item">
                    <label>Contact Phone</label>
                    <span>${absence.emergencyPhone}</span>
                </div>
                <div class="detail-item">
                    <label>Duration</label>
                    <span>${calculateDuration(absence.startDate, absence.endDate)} days</span>
                </div>
                <div class="detail-item">
                    <label>Reason</label>
                    <span>${absence.reason}</span>
                </div>
            </div>

            ${absence.monitoringRequested ? `
                <div class="absence-monitoring">
                    <div class="monitoring-header">
                        <i class="fas fa-shield-alt"></i>
                        <h4>Unit Monitoring Active</h4>
                    </div>
                    <div class="monitoring-details">
                        <div class="monitoring-item">
                            <i class="fas fa-clock"></i>
                            <span>Frequency: ${absence.monitoringFrequency}</span>
                        </div>
                        <div class="monitoring-item">
                            <i class="fas fa-key"></i>
                            <span>Key Access: ${absence.keyAccess ? 'Authorized' : 'Not Required'}</span>
                        </div>
                        ${absence.specialInstructions ? `
                            <div class="monitoring-item">
                                <i class="fas fa-sticky-note"></i>
                                <span>Special Instructions: ${absence.specialInstructions}</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
            ` : ''}

            <div class="absence-actions">
                ${!isStaff && (type === 'upcoming' || type === 'active') && absence.status !== 'cancelled' ? `
                    <button class="btn btn-secondary btn-sm" onclick="editAbsence('${absence.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                ` : ''}
                <button class="btn btn-secondary btn-sm" onclick="viewAbsenceDetails('${absence.id}')">
                    <i class="fas fa-eye"></i> View Details
                </button>
                ${isStaff && absence.status !== 'cancelled' ? `
                    <button class="btn btn-danger btn-sm" onclick="deleteAbsence('${absence.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                ` : ''}
                ${!isStaff && type !== 'past' && absence.status !== 'cancelled' ? `
                    <button class="btn btn-danger btn-sm" onclick="cancelAbsence('${absence.id}')">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

function calculateDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function showAbsenceModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay absence-modal';
    modal.innerHTML = `
        <div class="modal">
            <div class="modal-header">
                <h3><i class="fas fa-plane-departure"></i> New Extended Absence Request</h3>
                <button class="modal-close" onclick="this.closest('.modal-overlay').remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <form id="absenceForm">
                    <!-- Basic Information -->
                    <div class="form-section">
                        <h3><i class="fas fa-info-circle"></i> Basic Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="absenceTitle">Absence Title</label>
                                <input type="text" id="absenceTitle" required placeholder="e.g., Winter Vacation, Business Trip">
                            </div>
                            <div class="form-group">
                                <label for="absenceReason">Reason</label>
                                <select id="absenceReason" required>
                                    <option value="">Select reason</option>
                                    <option value="Vacation">Vacation</option>
                                    <option value="Business Travel">Business Travel</option>
                                    <option value="Family Visit">Family Visit</option>
                                    <option value="Medical Leave">Medical Leave</option>
                                    <option value="Temporary Relocation">Temporary Relocation</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="startDate">Departure Date</label>
                                <input type="date" id="startDate" required>
                            </div>
                            <div class="form-group">
                                <label for="endDate">Return Date</label>
                                <input type="date" id="endDate" required>
                            </div>
                        </div>
                    </div>

                    <!-- Emergency Contact -->
                    <div class="form-section">
                        <h3><i class="fas fa-phone"></i> Emergency Contact</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="emergencyContact">Contact Name</label>
                                <input type="text" id="emergencyContact" required placeholder="Full name of emergency contact">
                            </div>
                            <div class="form-group">
                                <label for="emergencyPhone">Phone Number</label>
                                <input type="tel" id="emergencyPhone" required placeholder="(555) 123-4567">
                            </div>
                        </div>
                        <div class="form-row single">
                            <div class="form-group">
                                <label for="emergencyRelation">Relationship</label>
                                <input type="text" id="emergencyRelation" placeholder="e.g., Spouse, Family Member, Friend">
                            </div>
                        </div>
                    </div>

                    <!-- Safety Checklist -->
                    <div class="form-section">
                        <h3><i class="fas fa-shield-alt"></i> Safety Checklist</h3>
                        <p>Please confirm the following safety measures have been taken:</p>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="checkbox" id="waterTaps" required>
                                <label for="waterTaps">All water taps have been turned off</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="appliances" required>
                                <label for="appliances">Non-essential appliances have been unplugged</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="hvacAdjusted">
                                <label for="hvacAdjusted">HVAC system has been adjusted for extended absence</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="securityCheck">
                                <label for="securityCheck">All windows and doors are secure</label>
                            </div>
                            <div class="checkbox-item">
                                <input type="checkbox" id="mailHold">
                                <label for="mailHold">Mail and package delivery arrangements made</label>
                            </div>
                        </div>
                    </div>

                    <!-- Unit Monitoring -->
                    <div class="form-section">
                        <h3><i class="fas fa-eye"></i> Unit Monitoring Service</h3>
                        <div class="checkbox-group">
                            <div class="checkbox-item">
                                <input type="checkbox" id="requestMonitoring">
                                <label for="requestMonitoring">Request unit monitoring while away</label>
                            </div>
                        </div>

                        <div id="monitoringOptions" style="display: none;">
                            <h4 style="margin: 1rem 0 0.5rem 0;">Monitoring Frequency:</h4>
                            <div class="monitoring-frequency">
                                <div class="frequency-option">
                                    <input type="radio" id="daily" name="frequency" value="Daily">
                                    <label for="daily">Daily</label>
                                </div>
                                <div class="frequency-option">
                                    <input type="radio" id="weekly" name="frequency" value="Weekly" checked>
                                    <label for="weekly">Weekly</label>
                                </div>
                                <div class="frequency-option">
                                    <input type="radio" id="biweekly" name="frequency" value="Bi-weekly">
                                    <label for="biweekly">Bi-weekly</label>
                                </div>
                            </div>

                            <div class="form-row single" style="margin-top: 1rem;">
                                <div class="checkbox-item">
                                    <input type="checkbox" id="keyAccess">
                                    <label for="keyAccess">Authorize key access for interior checks</label>
                                </div>
                            </div>

                            <div class="form-row single">
                                <div class="form-group">
                                    <label for="specialInstructions">Special Instructions (Optional)</label>
                                    <textarea id="specialInstructions" rows="3" placeholder="Any special instructions for monitoring staff..."></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <div class="modal-actions">
                <button type="button" class="btn btn-secondary" onclick="this.closest('.modal-overlay').remove()">Cancel</button>
                <button type="button" class="btn btn-primary" onclick="handleAbsenceSubmission()">Submit Request</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    document.getElementById('requestMonitoring').addEventListener('change', function() {
        const options = document.getElementById('monitoringOptions');
        options.style.display = this.checked ? 'block' : 'none';
    });

    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('startDate').min = today;
    document.getElementById('endDate').min = today;

    // Update end date minimum when start date changes
    document.getElementById('startDate').addEventListener('change', function() {
        document.getElementById('endDate').min = this.value;
    });
}

async function handleAbsenceSubmission() {
    const form = document.getElementById('absenceForm');
    const formData = new FormData(form);
    
    // Validate required fields
    const requiredFields = ['absenceTitle', 'absenceReason', 'startDate', 'endDate', 'emergencyContact', 'emergencyPhone'];
    for (const field of requiredFields) {
        if (!document.getElementById(field).value) {
            showNotification(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`, 'error');
            return;
        }
    }

    // Validate safety checklist
    const requiredChecks = ['waterTaps', 'appliances'];
    for (const check of requiredChecks) {
        if (!document.getElementById(check).checked) {
            showNotification('Please confirm all required safety measures', 'error');
            return;
        }
    }

    // Validate dates
    const startDate = new Date(document.getElementById('startDate').value);
    const endDate = new Date(document.getElementById('endDate').value);
    if (endDate <= startDate) {
        showNotification('Return date must be after departure date', 'error');
        return;
    }

    try {
        const absenceData = {
            title: document.getElementById('absenceTitle').value,
            reason: document.getElementById('absenceReason').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            emergencyContact: document.getElementById('emergencyContact').value,
            emergencyPhone: document.getElementById('emergencyPhone').value,
            emergencyRelation: document.getElementById('emergencyRelation').value,
            monitoringRequested: document.getElementById('requestMonitoring').checked,
            monitoringFrequency: document.querySelector('input[name="frequency"]:checked')?.value || 'Weekly',
            keyAccess: document.getElementById('keyAccess')?.checked || false,
            specialInstructions: document.getElementById('specialInstructions').value,
            safetyChecklist: {
                waterTaps: document.getElementById('waterTaps').checked,
                appliances: document.getElementById('appliances').checked,
                hvacAdjusted: document.getElementById('hvacAdjusted').checked,
                securityCheck: document.getElementById('securityCheck').checked,
                mailHold: document.getElementById('mailHold').checked
            }
        };

        await mockDB.createExtendedAbsence(absenceData);
        showNotification('Extended absence request submitted successfully', 'success');
        
        // Close modal and reload data
        document.querySelector('.modal-overlay').remove();
        loadExtendedAbsenceData();
        
    } catch (error) {
        console.error('Error submitting absence request:', error);
        showNotification('Error submitting absence request', 'error');
    }
}

function editAbsence(absenceId) {
    showNotification('Edit functionality would be implemented here', 'info');
}

function viewAbsenceDetails(absenceId) {
    showNotification('Detailed view would be implemented here', 'info');
}

function cancelAbsence(absenceId) {
    if (confirm('Are you sure you want to cancel this absence request?')) {
        mockDB.cancelExtendedAbsence(absenceId).then(() => {
            showNotification('Absence request cancelled', 'success');
            loadExtendedAbsenceData();
        });
    }
}

function deleteAbsence(absenceId) {
    if (confirm('Are you sure you want to delete this absence request?')) {
        mockDB.deleteExtendedAbsence(absenceId).then(() => {
            showNotification('Absence request deleted', 'success');
            loadExtendedAbsenceData();
        });
    }
}

// Initialize extended absence when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('extended-absence-section')) {
        initializeExtendedAbsence();
    }
});

// ===== TASKS & MILESTONES SECTION =====
function initializeTasksMilestones() {
    // Add event listeners for tab switching
    const tabButtons = document.querySelectorAll('.tasks-milestones-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTasksMilestonesTab(targetTab);
        });
    });

    // Add event listeners for action buttons
    const addTaskBtn = document.getElementById('addTaskBtn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', showCreateTaskModal);
    }

    const addMilestoneBtn = document.getElementById('addMilestoneBtn');
    if (addMilestoneBtn) {
        addMilestoneBtn.addEventListener('click', showCreateMilestoneModal);
    }

    // Load initial data
    loadTasksMilestonesData();
}

function switchTasksMilestonesTab(targetTab) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tasks-milestones-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === targetTab) {
            btn.classList.add('active');
        }
    });

    // Update active tab content
    const tabContents = document.querySelectorAll('.tasks-milestones-tabs .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
            content.classList.add('active');
        }
    });

    // Load specific data based on tab
    switch (targetTab) {
        case 'tasks':
            loadTasks();
            break;
        case 'milestones':
            loadMilestones();
            break;
        case 'calendar':
            loadCalendar();
            break;
    }
}

async function loadTasksMilestonesData() {
    await loadTasks();
    await loadMilestones();
    loadCalendar();
}

async function loadTasks() {
    try {
        const tasks = await mockDB.getTasks();
        displayTasks(tasks);
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Failed to load tasks', 'error');
    }
}

function displayTasks(tasks) {
    const tasksGrid = document.getElementById('tasksGrid');
    if (!tasksGrid) return;

    if (tasks.length === 0) {
        tasksGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <h3>No Tasks Found</h3>
                <p>No tasks have been created yet.</p>
            </div>
        `;
        return;
    }

    tasksGrid.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

function createTaskCard(task) {
    const priorityClass = `priority-${task.priority}`;
    const statusClass = `status-${task.status.replace('-', '-')}`;
    
    return `
        <div class="task-card">
            <div class="task-header">
                <div class="task-title">
                    <h4>${task.title}</h4>
                    <span class="task-priority ${priorityClass}">${task.priority}</span>
                </div>
                <span class="task-status ${statusClass}">${task.status}</span>
            </div>
            <div class="task-description">${task.description}</div>
            <div class="task-meta">
                <div class="task-assignee">
                    <i class="fas fa-user"></i>
                    <span>${task.assignee}</span>
                </div>
                <div class="task-due-date">
                    <i class="fas fa-calendar"></i>
                    <span>${formatDate(task.dueDate)}</span>
                </div>
            </div>
            <div class="task-actions">
                <button class="btn btn-secondary btn-sm" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="deleteTask(${task.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

async function loadMilestones() {
    try {
        const milestones = await mockDB.getMilestones();
        displayMilestones(milestones);
    } catch (error) {
        console.error('Error loading milestones:', error);
        showNotification('Failed to load milestones', 'error');
    }
}

function displayMilestones(milestones) {
    const milestonesGrid = document.getElementById('milestonesGrid');
    if (!milestonesGrid) return;

    if (milestones.length === 0) {
        milestonesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-flag"></i>
                <h3>No Milestones Found</h3>
                <p>No milestones have been created yet.</p>
            </div>
        `;
        return;
    }

    milestonesGrid.innerHTML = milestones.map(milestone => createMilestoneCard(milestone)).join('');
}

function createMilestoneCard(milestone) {
    return `
        <div class="milestone-card">
            <div class="milestone-header">
                <div class="milestone-icon">
                    <i class="fas fa-flag"></i>
                </div>
                <div class="milestone-title">
                    <h4>${milestone.title}</h4>
                    <div class="milestone-date">${formatDate(milestone.date)}</div>
                </div>
            </div>
            <div class="milestone-description">${milestone.description}</div>
            <div class="milestone-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${milestone.progress}%"></div>
                </div>
                <div class="progress-text">${milestone.progress}% Complete</div>
            </div>
        </div>
    `;
}

function loadCalendar() {
    const calendarGrid = document.getElementById('calendarGrid');
    if (!calendarGrid) return;

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Update month/year display
    const monthYearEl = document.getElementById('currentMonthYear');
    if (monthYearEl) {
        monthYearEl.textContent = `${getMonthName(currentMonth)} ${currentYear}`;
    }

    // Generate calendar
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    let calendarHTML = '';
    
    // Add day headers
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    days.forEach(day => {
        calendarHTML += `<div class="calendar-day header">${day}</div>`;
    });

    // Add calendar days
    for (let i = 0; i < 42; i++) {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        
        const isCurrentMonth = date.getMonth() === currentMonth;
        const isToday = date.toDateString() === currentDate.toDateString();
        const hasEvents = Math.random() > 0.8; // Mock events for demo
        
        let dayClass = 'calendar-day';
        if (!isCurrentMonth) dayClass += ' other-month';
        if (isToday) dayClass += ' today';
        if (hasEvents) dayClass += ' has-events';
        
        calendarHTML += `<div class="${dayClass}">${date.getDate()}</div>`;
    }

    calendarGrid.innerHTML = calendarHTML;
}

function getMonthName(month) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[month];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
    });
}

// ===== SPONSORED SERVICES SECTION =====
function initializeSponsoredServices() {
    loadSponsoredServices();
}

async function loadSponsoredServices() {
    try {
        const services = await mockDB.getSponsoredServices();
        displaySponsoredServices(services);
    } catch (error) {
        console.error('Error loading sponsored services:', error);
        showNotification('Failed to load sponsored services', 'error');
    }
}

function displaySponsoredServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    if (!servicesGrid) return;

    if (services.length === 0) {
        servicesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-handshake"></i>
                <h3>No Services Available</h3>
                <p>No sponsored services are currently available.</p>
            </div>
        `;
        return;
    }

    servicesGrid.innerHTML = services.map(service => createServiceCard(service)).join('');
}

function createServiceCard(service) {
    const featuresHTML = service.features.map(feature => 
        `<li><i class="fas fa-check"></i>${feature}</li>`
    ).join('');

    return `
        <div class="service-card">
            <div class="service-icon">
                <i class="${service.icon}"></i>
            </div>
            <div class="service-title">${service.name}</div>
            <div class="service-description">${service.description}</div>
            <div class="service-contact">
                <p><strong>Contact:</strong> ${service.contact}</p>
            </div>
            <ul class="service-features">
                ${featuresHTML}
            </ul>
        </div>
    `;
}

// ===== TAXI REQUEST SECTION =====
function initializeTaxiRequest() {
    // Add event listeners for tab switching
    const tabButtons = document.querySelectorAll('.requests-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchTaxiRequestTab(targetTab);
        });
    });

    // Add event listener for new request button
    const newTaxiRequestBtn = document.getElementById('newTaxiRequestBtn');
    if (newTaxiRequestBtn) {
        newTaxiRequestBtn.addEventListener('click', showCreateTaxiRequestModal);
    }

    // Load initial data
    loadTaxiRequests();
}

function switchTaxiRequestTab(targetTab) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.requests-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === targetTab) {
            btn.classList.add('active');
        }
    });

    // Update active tab content
    const tabContents = document.querySelectorAll('.requests-tabs .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
            content.classList.add('active');
        }
    });

    // Load specific data based on tab
    switch (targetTab) {
        case 'active-requests':
            loadActiveTaxiRequests();
            break;
        case 'completed-requests':
            loadCompletedTaxiRequests();
            break;
    }
}

async function loadTaxiRequests() {
    await loadActiveTaxiRequests();
    await loadCompletedTaxiRequests();
}

async function loadActiveTaxiRequests() {
    try {
        const requests = await mockDB.getTaxiRequests();
        const activeRequests = requests.filter(r => r.status !== 'completed');
        displayTaxiRequests(activeRequests, 'activeTaxiRequests');
    } catch (error) {
        console.error('Error loading active taxi requests:', error);
        showNotification('Failed to load taxi requests', 'error');
    }
}

async function loadCompletedTaxiRequests() {
    try {
        const requests = await mockDB.getTaxiRequests();
        const completedRequests = requests.filter(r => r.status === 'completed');
        displayTaxiRequests(completedRequests, 'completedTaxiRequests');
    } catch (error) {
        console.error('Error loading completed taxi requests:', error);
        showNotification('Failed to load completed taxi requests', 'error');
    }
}

function displayTaxiRequests(requests, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (requests.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-taxi"></i>
                <h3>No Taxi Requests</h3>
                <p>No ${containerId.includes('active') ? 'active' : 'completed'} taxi requests found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = requests.map(request => createTaxiRequestCard(request)).join('');
}

function createTaxiRequestCard(request) {
    const statusClass = `status-${request.status}`;
    
    return `
        <div class="taxi-request-card">
            <div class="taxi-request-header">
                <div class="taxi-request-title">
                    <h4>Taxi Request #${request.id}</h4>
                    <p>${request.destination}</p>
                </div>
                <span class="taxi-request-status ${statusClass}">${request.status}</span>
            </div>
            <div class="taxi-request-details">
                <div class="taxi-detail-item">
                    <div class="taxi-detail-label">Pickup Date</div>
                    <div class="taxi-detail-value">${formatDate(request.pickupDate)}</div>
                </div>
                <div class="taxi-detail-item">
                    <div class="taxi-detail-label">Pickup Time</div>
                    <div class="taxi-detail-value">${request.pickupTime}</div>
                </div>
                <div class="taxi-detail-item">
                    <div class="taxi-detail-label">Destination</div>
                    <div class="taxi-detail-value">${request.destination}</div>
                </div>
                ${request.specialRequirements ? `
                <div class="taxi-detail-item">
                    <div class="taxi-detail-label">Special Requirements</div>
                    <div class="taxi-detail-value">${request.specialRequirements}</div>
                </div>
                ` : ''}
            </div>
            <div class="taxi-request-actions">
                <button class="btn btn-secondary btn-sm" onclick="editTaxiRequest(${request.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-danger btn-sm" onclick="cancelTaxiRequest(${request.id})">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
}

// ===== ANONYMOUS TIPS SECTION =====
function initializeAnonymousTips() {
    // Add event listeners for tab switching
    const tabButtons = document.querySelectorAll('.tips-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchAnonymousTipsTab(targetTab);
        });
    });

    // Add event listener for submit button
    const submitAnonymousTipBtn = document.getElementById('submitAnonymousTipBtn');
    if (submitAnonymousTipBtn) {
        submitAnonymousTipBtn.addEventListener('click', showSubmitAnonymousTipModal);
    }

    // Load initial data
    loadAnonymousTips();
}

function switchAnonymousTipsTab(targetTab) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.tips-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === targetTab) {
            btn.classList.add('active');
        }
    });

    // Update active tab content
    const tabContents = document.querySelectorAll('.tips-tabs .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
            content.classList.add('active');
        }
    });

    // Load specific data based on tab
    switch (targetTab) {
        case 'recent-tips':
            loadRecentAnonymousTips();
            break;
        case 'resolved-tips':
            loadResolvedAnonymousTips();
            break;
    }
}

async function loadAnonymousTips() {
    await loadRecentAnonymousTips();
    await loadResolvedAnonymousTips();
}

async function loadRecentAnonymousTips() {
    try {
        const tips = await mockDB.getAnonymousTips();
        const recentTips = tips.filter(t => t.status !== 'resolved');
        displayAnonymousTips(recentTips, 'recentAnonymousTips');
    } catch (error) {
        console.error('Error loading recent anonymous tips:', error);
        showNotification('Failed to load anonymous tips', 'error');
    }
}

async function loadResolvedAnonymousTips() {
    try {
        const tips = await mockDB.getAnonymousTips();
        const resolvedTips = tips.filter(t => t.status === 'resolved');
        displayAnonymousTips(resolvedTips, 'resolvedAnonymousTips');
    } catch (error) {
        console.error('Error loading resolved anonymous tips:', error);
        showNotification('Failed to load resolved anonymous tips', 'error');
    }
}

function displayAnonymousTips(tips, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tips.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-user-secret"></i>
                <h3>No Anonymous Tips</h3>
                <p>No ${containerId.includes('recent') ? 'recent' : 'resolved'} anonymous tips found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = tips.map(tip => createAnonymousTipCard(tip)).join('');
}

function createAnonymousTipCard(tip) {
    const typeClass = `tip-type-${tip.type}`;
    
    return `
        <div class="anonymous-tip-card">
            <div class="anonymous-tip-header">
                <div class="anonymous-tip-title">
                    <h4>${tip.title}</h4>
                </div>
                <span class="anonymous-tip-type ${typeClass}">${tip.type}</span>
            </div>
            <div class="anonymous-tip-content">${tip.content}</div>
            <div class="anonymous-tip-meta">
                <span>Submitted: ${formatDate(tip.createdAt)}</span>
                <span>Status: ${tip.status}</span>
            </div>
            <div class="anonymous-tip-actions">
                <button class="btn btn-secondary btn-sm" onclick="viewAnonymousTip(${tip.id})">
                    <i class="fas fa-eye"></i> View
                </button>
                <button class="btn btn-primary btn-sm" onclick="resolveAnonymousTip(${tip.id})">
                    <i class="fas fa-check"></i> Resolve
                </button>
            </div>
        </div>
    `;
}

// ===== NEWSLETTER SECTION =====
function initializeNewsletter() {
    // Add event listeners for tab switching
    const tabButtons = document.querySelectorAll('.newsletter-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.getAttribute('data-tab');
            switchNewsletterTab(targetTab);
        });
    });

    // Add event listener for create button
    const createNewsletterBtn = document.getElementById('createNewsletterBtn');
    if (createNewsletterBtn) {
        createNewsletterBtn.addEventListener('click', showCreateNewsletterModal);
    }

    // Load initial data
    loadNewsletters();
}

function switchNewsletterTab(targetTab) {
    // Update active tab button
    const tabButtons = document.querySelectorAll('.newsletter-tabs .tab-btn');
    tabButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-tab') === targetTab) {
            btn.classList.add('active');
        }
    });

    // Update active tab content
    const tabContents = document.querySelectorAll('.newsletter-tabs .tab-content');
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${targetTab}-tab`) {
            content.classList.add('active');
        }
    });

    // Load specific data based on tab
    switch (targetTab) {
        case 'draft-newsletters':
            loadDraftNewsletters();
            break;
        case 'sent-newsletters':
            loadSentNewsletters();
            break;
        case 'newsletter-templates':
            loadNewsletterTemplates();
            break;
    }
}

async function loadNewsletters() {
    await loadDraftNewsletters();
    await loadSentNewsletters();
    loadNewsletterTemplates();
}

async function loadDraftNewsletters() {
    try {
        const newsletters = await mockDB.getNewsletters();
        const draftNewsletters = newsletters.filter(n => n.status === 'draft');
        displayNewsletters(draftNewsletters, 'draftNewsletters');
    } catch (error) {
        console.error('Error loading draft newsletters:', error);
        showNotification('Failed to load draft newsletters', 'error');
    }
}

async function loadSentNewsletters() {
    try {
        const newsletters = await mockDB.getNewsletters();
        const sentNewsletters = newsletters.filter(n => n.status === 'sent');
        displayNewsletters(sentNewsletters, 'sentNewsletters');
    } catch (error) {
        console.error('Error loading sent newsletters:', error);
        showNotification('Failed to load sent newsletters', 'error');
    }
}

function loadNewsletterTemplates() {
    const templatesContainer = document.getElementById('newsletterTemplates');
    if (!templatesContainer) return;

    const templates = [
        {
            id: 1,
            name: 'Monthly Newsletter',
            description: 'Standard monthly newsletter template with sections for events, updates, and announcements'
        },
        {
            id: 2,
            name: 'Emergency Notice',
            description: 'Template for urgent building-wide notifications and emergency information'
        },
        {
            id: 3,
            name: 'Event Announcement',
            description: 'Template for announcing community events and social gatherings'
        }
    ];

    templatesContainer.innerHTML = templates.map(template => `
        <div class="template-card" onclick="useNewsletterTemplate(${template.id})">
            <div class="template-header">
                <div class="template-icon">
                    <i class="fas fa-newspaper"></i>
                </div>
                <div>
                    <div class="template-title">${template.name}</div>
                    <div class="template-description">${template.description}</div>
                </div>
            </div>
        </div>
    `).join('');
}

function displayNewsletters(newsletters, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (newsletters.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-newspaper"></i>
                <h3>No Newsletters</h3>
                <p>No ${containerId.includes('draft') ? 'draft' : 'sent'} newsletters found.</p>
            </div>
        `;
        return;
    }

    container.innerHTML = newsletters.map(newsletter => createNewsletterCard(newsletter)).join('');
}

function createNewsletterCard(newsletter) {
    const statusClass = `status-${newsletter.status}`;
    
    return `
        <div class="newsletter-card">
            <div class="newsletter-header">
                <div class="newsletter-title">
                    <h4>${newsletter.title}</h4>
                </div>
                <span class="newsletter-status ${statusClass}">${newsletter.status}</span>
            </div>
            <div class="newsletter-preview">${newsletter.content}</div>
            <div class="newsletter-meta">
                <span>Created: ${formatDate(newsletter.createdAt)}</span>
                ${newsletter.sentAt ? `<span>Sent: ${formatDate(newsletter.sentAt)}</span>` : ''}
            </div>
            <div class="newsletter-actions">
                <button class="btn btn-secondary btn-sm" onclick="editNewsletter(${newsletter.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                ${newsletter.status === 'draft' ? `
                <button class="btn btn-primary btn-sm" onclick="sendNewsletter(${newsletter.id})">
                    <i class="fas fa-paper-plane"></i> Send
                </button>
                ` : ''}
                <button class="btn btn-danger btn-sm" onclick="deleteNewsletter(${newsletter.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `;
}

// ===== MODAL FUNCTIONS =====
function showCreateTaskModal() {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-plus"></i> Create New Task</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="createTaskForm">
                    <div class="form-group">
                        <label for="taskTitle">Task Title</label>
                        <input type="text" id="taskTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="taskDescription">Description</label>
                        <textarea id="taskDescription" name="description" rows="3" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="taskPriority">Priority</label>
                            <select id="taskPriority" name="priority" required>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="taskAssignee">Assignee</label>
                            <input type="text" id="taskAssignee" name="assignee" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="taskDueDate">Due Date</label>
                        <input type="date" id="taskDueDate" name="dueDate" required>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Task</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Add form submission handler
    document.getElementById('createTaskForm').addEventListener('submit', handleCreateTask);
}

async function handleCreateTask(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const taskData = {
        title: formData.get('title'),
        description: formData.get('description'),
        priority: formData.get('priority'),
        assignee: formData.get('assignee'),
        dueDate: formData.get('dueDate'),
        status: 'pending'
    };

    try {
        const result = await mockDB.createTask(taskData);
        if (result.success) {
            showNotification('Task created successfully', 'success');
            closeModal();
            loadTasks();
        } else {
            showNotification('Failed to create task', 'error');
        }
    } catch (error) {
        console.error('Error creating task:', error);
        showNotification('Failed to create task', 'error');
    }
}

function showCreateMilestoneModal() {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-flag"></i> Create New Milestone</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="createMilestoneForm">
                    <div class="form-group">
                        <label for="milestoneTitle">Milestone Title</label>
                        <input type="text" id="milestoneTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="milestoneDescription">Description</label>
                        <textarea id="milestoneDescription" name="description" rows="3" required></textarea>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label for="milestoneDate">Date</label>
                            <input type="date" id="milestoneDate" name="date" required>
                        </div>
                        <div class="form-group">
                            <label for="milestoneProgress">Progress (%)</label>
                            <input type="number" id="milestoneProgress" name="progress" min="0" max="100" value="0" required>
                        </div>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Milestone</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Add form submission handler
    document.getElementById('createMilestoneForm').addEventListener('submit', handleCreateMilestone);
}

async function handleCreateMilestone(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const milestoneData = {
        title: formData.get('title'),
        description: formData.get('description'),
        date: formData.get('date'),
        progress: parseInt(formData.get('progress')),
        status: 'planned'
    };

    try {
        const result = await mockDB.createMilestone(milestoneData);
        if (result.success) {
            showNotification('Milestone created successfully', 'success');
            closeModal();
            loadMilestones();
        } else {
            showNotification('Failed to create milestone', 'error');
        }
    } catch (error) {
        console.error('Error creating milestone:', error);
        showNotification('Failed to create milestone', 'error');
    }
}

function showCreateTaxiRequestModal() {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-taxi"></i> Request Taxi</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="createTaxiRequestForm">
                    <div class="form-row">
                        <div class="form-group">
                            <label for="pickupDate">Pickup Date</label>
                            <input type="date" id="pickupDate" name="pickupDate" required>
                        </div>
                        <div class="form-group">
                            <label for="pickupTime">Pickup Time</label>
                            <input type="time" id="pickupTime" name="pickupTime" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label for="destination">Destination</label>
                        <input type="text" id="destination" name="destination" required>
                    </div>
                    <div class="form-group">
                        <label for="specialRequirements">Special Requirements (Optional)</label>
                        <textarea id="specialRequirements" name="specialRequirements" rows="3"></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Request</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Add form submission handler
    document.getElementById('createTaxiRequestForm').addEventListener('submit', handleCreateTaxiRequest);
}

async function handleCreateTaxiRequest(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const requestData = {
        userId: parseInt(sessionStorage.getItem('id') || localStorage.getItem('id')),
        pickupDate: formData.get('pickupDate'),
        pickupTime: formData.get('pickupTime'),
        destination: formData.get('destination'),
        specialRequirements: formData.get('specialRequirements') || null
    };

    try {
        const result = await mockDB.createTaxiRequest(requestData);
        if (result.success) {
            showNotification('Taxi request submitted successfully', 'success');
            closeModal();
            loadTaxiRequests();
        } else {
            showNotification('Failed to submit taxi request', 'error');
        }
    } catch (error) {
        console.error('Error creating taxi request:', error);
        showNotification('Failed to submit taxi request', 'error');
    }
}

function showSubmitAnonymousTipModal() {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-user-secret"></i> Submit Anonymous Tip</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="submitAnonymousTipForm">
                    <div class="form-group">
                        <label for="tipType">Tip Type</label>
                        <select id="tipType" name="type" required>
                            <option value="concern">Concern</option>
                            <option value="feedback">Feedback</option>
                            <option value="suggestion">Suggestion</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="tipTitle">Title</label>
                        <input type="text" id="tipTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="tipContent">Content</label>
                        <textarea id="tipContent" name="content" rows="5" required></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Submit Tip</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Add form submission handler
    document.getElementById('submitAnonymousTipForm').addEventListener('submit', handleSubmitAnonymousTip);
}

async function handleSubmitAnonymousTip(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const tipData = {
        type: formData.get('type'),
        title: formData.get('title'),
        content: formData.get('content')
    };

    try {
        const result = await mockDB.createAnonymousTip(tipData);
        if (result.success) {
            showNotification('Anonymous tip submitted successfully', 'success');
            closeModal();
            loadAnonymousTips();
        } else {
            showNotification('Failed to submit anonymous tip', 'error');
        }
    } catch (error) {
        console.error('Error submitting anonymous tip:', error);
        showNotification('Failed to submit anonymous tip', 'error');
    }
}

function showCreateNewsletterModal() {
    const modalHTML = `
        <div class="modal-overlay">
            <div class="modal-content">
                <div class="modal-header">
                    <h3><i class="fas fa-newspaper"></i> Create Newsletter</h3>
                    <button class="modal-close" onclick="closeModal()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form class="modal-form" id="createNewsletterForm">
                    <div class="form-group">
                        <label for="newsletterTitle">Newsletter Title</label>
                        <input type="text" id="newsletterTitle" name="title" required>
                    </div>
                    <div class="form-group">
                        <label for="newsletterContent">Content</label>
                        <textarea id="newsletterContent" name="content" rows="10" required></textarea>
                    </div>
                    <div class="modal-actions">
                        <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                        <button type="submit" class="btn btn-primary">Create Newsletter</button>
                    </div>
                </form>
            </div>
        </div>
    `;

    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Add form submission handler
    document.getElementById('createNewsletterForm').addEventListener('submit', handleCreateNewsletter);
}

async function handleCreateNewsletter(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const newsletterData = {
        title: formData.get('title'),
        content: formData.get('content')
    };

    try {
        const result = await mockDB.createNewsletter(newsletterData);
        if (result.success) {
            showNotification('Newsletter created successfully', 'success');
            closeModal();
            loadNewsletters();
        } else {
            showNotification('Failed to create newsletter', 'error');
        }
    } catch (error) {
        console.error('Error creating newsletter:', error);
        showNotification('Failed to create newsletter', 'error');
    }
}

// ===== UTILITY FUNCTIONS =====
function editTask(taskId) {
    // Implementation for editing tasks
    console.log('Edit task:', taskId);
}

function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        mockDB.deleteTask(taskId).then(result => {
            if (result.success) {
                showNotification('Task deleted successfully', 'success');
                loadTasks();
            } else {
                showNotification('Failed to delete task', 'error');
            }
        });
    }
}

function editTaxiRequest(requestId) {
    // Implementation for editing taxi requests
    console.log('Edit taxi request:', requestId);
}

function cancelTaxiRequest(requestId) {
    if (confirm('Are you sure you want to cancel this taxi request?')) {
        mockDB.updateTaxiRequest(requestId, { status: 'cancelled' }).then(result => {
            if (result.success) {
                showNotification('Taxi request cancelled successfully', 'success');
                loadTaxiRequests();
            } else {
                showNotification('Failed to cancel taxi request', 'error');
            }
        });
    }
}

function viewAnonymousTip(tipId) {
    // Implementation for viewing anonymous tips
    console.log('View anonymous tip:', tipId);
}

function resolveAnonymousTip(tipId) {
    if (confirm('Mark this anonymous tip as resolved?')) {
        mockDB.updateAnonymousTip(tipId, { status: 'resolved' }).then(result => {
            if (result.success) {
                showNotification('Anonymous tip marked as resolved', 'success');
                loadAnonymousTips();
            } else {
                showNotification('Failed to update anonymous tip', 'error');
            }
        });
    }
}

function editNewsletter(newsletterId) {
    // Implementation for editing newsletters
    console.log('Edit newsletter:', newsletterId);
}

function sendNewsletter(newsletterId) {
    if (confirm('Are you sure you want to send this newsletter to all residents?')) {
        mockDB.sendNewsletter(newsletterId).then(result => {
            if (result.success) {
                showNotification('Newsletter sent successfully', 'success');
                loadNewsletters();
            } else {
                showNotification('Failed to send newsletter', 'error');
            }
        });
    }
}

function deleteNewsletter(newsletterId) {
    if (confirm('Are you sure you want to delete this newsletter?')) {
        // Implementation for deleting newsletters
        console.log('Delete newsletter:', newsletterId);
        showNotification('Newsletter deleted successfully', 'success');
        loadNewsletters();
    }
}

function useNewsletterTemplate(templateId) {
    // Implementation for using newsletter templates
    console.log('Use newsletter template:', templateId);
    showNotification('Template loaded successfully', 'success');
}

// ===== SERVICE REQUESTS FUNCTIONALITY =====
function initializeServiceRequests() {
    // Initialize tab functionality
    const serviceTabs = document.querySelectorAll('.service-tabs .tab-btn');
    const serviceContents = document.querySelectorAll('.service-content .tab-content');
    
    serviceTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            serviceTabs.forEach(t => t.classList.remove('active'));
            serviceContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Update the sliding background position
            const tabName = tab.getAttribute('data-tab');
            const tabsContainer = tab.closest('.service-tabs');
            if (tabsContainer) {
                tabsContainer.setAttribute('data-active', tabName);
            }
            
            // Show corresponding content
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Initialize new service request button
    const newServiceRequestBtn = document.getElementById('newServiceRequestBtn');
    if (newServiceRequestBtn) {
        newServiceRequestBtn.addEventListener('click', () => {
            showCreateServiceRequestModal();
        });
    }
    
    // Load service requests data
    loadServiceRequests();
}

function loadServiceRequests() {
    // This would typically fetch from a database
    // For now, we'll use mock data
    const activeRequests = [
        {
            id: 'SR-2024-001',
            title: 'Kitchen Sink Leak',
            description: 'There\'s a persistent leak under the kitchen sink. Water is dripping from the pipe connection.',
            category: 'Plumbing',
            priority: 'High',
            status: 'in-progress',
            assignedTo: 'John D.',
            progress: 60,
            createdDate: 'Nov 15, 2024'
        },
        {
            id: 'SR-2024-002',
            title: 'Bedroom AC Not Cooling',
            description: 'The air conditioning unit in the master bedroom is running but not cooling properly.',
            category: 'HVAC',
            priority: 'Medium',
            status: 'scheduled',
            scheduledDate: 'Nov 22, 10:00 AM',
            createdDate: 'Nov 18, 2024'
        }
    ];
    
    // Populate active requests (example shown in HTML)
    // You would typically generate these cards dynamically
}

function showCreateServiceRequestModal() {
    const modalHTML = `
        <div class="modal-overlay" id="createServiceRequestModal">
            <div class="modal-container modal-large">
                <div class="modal-header">
                    <h2>Submit Service Request</h2>
                    <button class="modal-close" onclick="closeModal('createServiceRequestModal')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <form id="serviceRequestForm" class="modal-form">
                    <div class="form-group">
                        <label for="requestTitle">Request Title*</label>
                        <input type="text" id="requestTitle" name="title" required placeholder="Brief description of the issue">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="requestCategory">Category*</label>
                            <select id="requestCategory" name="category" required>
                                <option value="">Select category</option>
                                <option value="plumbing">Plumbing</option>
                                <option value="electrical">Electrical</option>
                                <option value="hvac">HVAC</option>
                                <option value="appliance">Appliance</option>
                                <option value="general">General Maintenance</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="requestPriority">Priority*</label>
                            <select id="requestPriority" name="priority" required>
                                <option value="">Select priority</option>
                                <option value="emergency">Emergency (24 hours)</option>
                                <option value="high">High (2-3 days)</option>
                                <option value="medium">Medium (1 week)</option>
                                <option value="low">Low (2+ weeks)</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label for="requestDescription">Description*</label>
                        <textarea id="requestDescription" name="description" rows="4" required 
                                  placeholder="Please provide detailed information about the issue"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="requestLocation">Location in Unit</label>
                        <input type="text" id="requestLocation" name="location" placeholder="e.g., Master bedroom, Kitchen">
                    </div>
                    
                    <div class="form-group">
                        <label for="requestAccess">Access Instructions</label>
                        <textarea id="requestAccess" name="access" rows="2" 
                                  placeholder="Any special instructions for accessing the area?"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="permission" value="true">
                            Permission to enter unit if I'm not home
                        </label>
                    </div>
                    
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" onclick="closeModal('createServiceRequestModal')">
                            Cancel
                        </button>
                        <button type="submit" class="btn btn-primary">
                            <i class="fas fa-paper-plane"></i> Submit Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('modalContainer').innerHTML = modalHTML;
    
    // Handle form submission
    document.getElementById('serviceRequestForm').addEventListener('submit', handleServiceRequestSubmit);
}

function handleServiceRequestSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const requestData = Object.fromEntries(formData.entries());
    
    // Here you would typically send the data to your backend
    console.log('Service request submitted:', requestData);
    
    // Show success notification
    showNotification('Service request submitted successfully!', 'success');
    
    // Close modal
    closeModal('createServiceRequestModal');
    
    // Refresh the service requests list
    loadServiceRequests();
}

// ===== SECTION INITIALIZATION =====
// Add these to the existing section initialization logic
document.addEventListener('DOMContentLoaded', () => {
    // ... existing initialization code ...
    
    // Initialize new sections when they become active
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.classList && node.classList.contains('content-section')) {
                    if (node.id === 'service-requests-section' && node.classList.contains('active')) {
                        initializeServiceRequests();
                    } else if (node.id === 'tasks-milestones-section' && node.classList.contains('active')) {
                        initializeTasksMilestones();
                    } else if (node.id === 'sponsored-services-section' && node.classList.contains('active')) {
                        initializeSponsoredServices();
                    } else if (node.id === 'taxi-request-section' && node.classList.contains('active')) {
                        initializeTaxiRequest();
                    } else if (node.id === 'anonymous-tips-section' && node.classList.contains('active')) {
                        initializeAnonymousTips();
                    } else if (node.id === 'newsletter-section' && node.classList.contains('active')) {
                        initializeNewsletter();
                    }
                }
            });
        });
    });

    observer.observe(document.body, { childList: true, subtree: true });
});

// ===== AMENITY BOOKINGS FUNCTIONALITY =====

// Fake booking data
const fakeBookings = [
    // Current month bookings (December 2024)
    { date: '2024-12-05', amenity: 'pool', bookedBy: 'Unit 301' },
    { date: '2024-12-05', amenity: 'social-room', bookedBy: 'Unit 405' },
    { date: '2024-12-07', amenity: 'pool', bookedBy: 'Unit 102' },
    { date: '2024-12-08', amenity: 'terrace', bookedBy: 'Unit 202' },
    { date: '2024-12-10', amenity: 'pool', bookedBy: 'Unit 506' },
    { date: '2024-12-10', amenity: 'social-room', bookedBy: 'Unit 304' },
    { date: '2024-12-12', amenity: 'social-room', bookedBy: 'Unit 301' },
    { date: '2024-12-12', amenity: 'terrace', bookedBy: 'Unit 404' },
    { date: '2024-12-14', amenity: 'pool', bookedBy: 'Unit 203' },
    { date: '2024-12-14', amenity: 'terrace', bookedBy: 'Unit 507' },
    { date: '2024-12-15', amenity: 'pool', bookedBy: 'Unit 202' },
    { date: '2024-12-16', amenity: 'social-room', bookedBy: 'Unit 105' },
    { date: '2024-12-18', amenity: 'social-room', bookedBy: 'Unit 303' },
    { date: '2024-12-19', amenity: 'pool', bookedBy: 'Unit 406' },
    { date: '2024-12-20', amenity: 'terrace', bookedBy: 'Unit 505' },
    { date: '2024-12-21', amenity: 'pool', bookedBy: 'Unit 204' },
    { date: '2024-12-21', amenity: 'social-room', bookedBy: 'Unit 302' },
    { date: '2024-12-22', amenity: 'pool', bookedBy: 'Unit 401' },
    { date: '2024-12-23', amenity: 'terrace', bookedBy: 'Unit 103' },
    { date: '2024-12-25', amenity: 'social-room', bookedBy: 'Unit 201' },
    { date: '2024-12-26', amenity: 'pool', bookedBy: 'Unit 504' },
    { date: '2024-12-27', amenity: 'terrace', bookedBy: 'Unit 205' },
    { date: '2024-12-28', amenity: 'pool', bookedBy: 'Unit 303' },
    { date: '2024-12-28', amenity: 'social-room', bookedBy: 'Unit 402' },
    { date: '2024-12-30', amenity: 'terrace', bookedBy: 'Unit 406' },
    { date: '2024-12-31', amenity: 'social-room', bookedBy: 'Unit 101' },
    // Next month bookings (January 2025)
    { date: '2025-01-02', amenity: 'pool', bookedBy: 'Unit 301' },
    { date: '2025-01-03', amenity: 'terrace', bookedBy: 'Unit 204' },
    { date: '2025-01-05', amenity: 'social-room', bookedBy: 'Unit 404' },
    { date: '2025-01-07', amenity: 'pool', bookedBy: 'Unit 102' },
    { date: '2025-01-08', amenity: 'terrace', bookedBy: 'Unit 505' },
    { date: '2025-01-10', amenity: 'social-room', bookedBy: 'Unit 303' },
    { date: '2025-01-12', amenity: 'pool', bookedBy: 'Unit 201' }
];

// User's upcoming bookings
const userBookings = [
    { 
        id: 1,
        date: '2024-12-15', 
        amenity: 'pool', 
        time: '2:00 PM - 4:00 PM',
        amenityName: 'Swimming Pool'
    },
    { 
        id: 2,
        date: '2024-12-22', 
        amenity: 'social-room', 
        time: '6:00 PM - 10:00 PM',
        amenityName: 'Social Room'
    }
];

function initializeAmenityBookings() {
    // Static July 2025 calendar
    const reserveBtn = document.getElementById('newBookingBtn');
    
    if (reserveBtn) {
        reserveBtn.addEventListener('click', showAmenityBookingModal);
    }
    
    // Display upcoming bookings
    displayUpcomingBookings();
}


function displayUpcomingBookings() {
    const bookingList = document.getElementById('upcomingBookings');
    if (!bookingList) return;
    
    if (userBookings.length === 0) {
        bookingList.innerHTML = '<p class="no-bookings">No upcoming reservations</p>';
        return;
    }
    
    bookingList.innerHTML = userBookings.map(booking => {
        const date = new Date(booking.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        return `
            <div class="booking-item">
                <div class="booking-info">
                    <div class="booking-icon ${booking.amenity}">
                        <i class="fas ${getAmenityIcon(booking.amenity)}"></i>
                    </div>
                    <div class="booking-details">
                        <h4>${booking.amenityName}</h4>
                        <p>${formattedDate} • ${booking.time}</p>
                    </div>
                </div>
                <div class="booking-actions">
                    <button class="booking-action-btn" onclick="editBooking(${booking.id})">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="booking-action-btn cancel" onclick="cancelBooking(${booking.id})">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function getAmenityIcon(amenity) {
    const icons = {
        'pool': 'fa-swimming-pool',
        'social-room': 'fa-users',
        'terrace': 'fa-sun'
    };
    return icons[amenity] || 'fa-calendar';
}

function showAmenityBookingModal() {
    showNotification('Reserve Amenity modal would open here', 'info');
}

function editBooking(bookingId) {
    showNotification(`Edit booking ${bookingId}`, 'info');
}

function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this reservation?')) {
        showNotification('Reservation cancelled successfully', 'success');
        // Remove from userBookings array
        const index = userBookings.findIndex(b => b.id === bookingId);
        if (index > -1) {
            userBookings.splice(index, 1);
            displayUpcomingBookings();
        }
    }
}