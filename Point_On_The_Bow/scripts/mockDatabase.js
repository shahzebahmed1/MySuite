// Mock Database - Simulates PostgreSQL structure
// In production, these would be actual database queries

const ROLES = {
    PROPERTY_MANAGER: 'property_manager',
    BOARD_MEMBER: 'board_member',
    LEAD_CONCIERGE: 'lead_concierge',
    CONCIERGE: 'concierge',
    RESIDENT: 'resident'
};

// Role hierarchy (higher number = more permissions)
const ROLE_LEVELS = {
    [ROLES.PROPERTY_MANAGER]: 5,
    [ROLES.BOARD_MEMBER]: 4,
    [ROLES.LEAD_CONCIERGE]: 3,
    [ROLES.CONCIERGE]: 2,
    [ROLES.RESIDENT]: 1
};

// Mock users table
const USERS = [
    // Property Manager
    {
        id: 1,
        email: 'manager@pointonthebow.ca',
        password: 'manager123', // In production, this would be hashed
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: ROLES.PROPERTY_MANAGER,
        unitNumber: 'Office',
        phone: '403-555-0101',
        active: true,
        createdAt: '2024-01-01'
    },
    // Board Members
    {
        id: 2,
        email: 'board1@pointonthebow.ca',
        password: 'board123',
        firstName: 'Michael',
        lastName: 'Chen',
        role: ROLES.BOARD_MEMBER,
        unitNumber: '2501',
        phone: '403-555-0102',
        active: true,
        createdAt: '2024-01-01'
    },
    {
        id: 3,
        email: 'board2@pointonthebow.ca',
        password: 'board123',
        firstName: 'Patricia',
        lastName: 'Williams',
        role: ROLES.BOARD_MEMBER,
        unitNumber: '1805',
        phone: '403-555-0103',
        active: true,
        createdAt: '2024-01-01'
    },
    // Lead Concierge
    {
        id: 4,
        email: 'lead.concierge@pointonthebow.ca',
        password: 'lead123',
        firstName: 'Robert',
        lastName: 'Martinez',
        role: ROLES.LEAD_CONCIERGE,
        unitNumber: 'Concierge Desk',
        phone: '403-555-0104',
        active: true,
        createdAt: '2024-01-01'
    },
    // Concierge Staff
    {
        id: 5,
        email: 'concierge1@pointonthebow.ca',
        password: 'concierge123',
        firstName: 'Emma',
        lastName: 'Davis',
        role: ROLES.CONCIERGE,
        unitNumber: 'Concierge Desk',
        phone: '403-555-0105',
        active: true,
        createdAt: '2024-01-01'
    },
    {
        id: 6,
        email: 'concierge2@pointonthebow.ca',
        password: 'concierge123',
        firstName: 'James',
        lastName: 'Wilson',
        role: ROLES.CONCIERGE,
        unitNumber: 'Concierge Desk',
        phone: '403-555-0106',
        active: true,
        createdAt: '2024-01-01'
    },
    // Residents
    {
        id: 7,
        email: 'john.doe@gmail.com',
        password: 'resident123',
        firstName: 'John',
        lastName: 'Doe',
        role: ROLES.RESIDENT,
        unitNumber: '1205',
        phone: '403-555-0107',
        active: true,
        createdAt: '2024-01-15'
    },
    {
        id: 8,
        email: 'jane.smith@gmail.com',
        password: 'resident123',
        firstName: 'Jane',
        lastName: 'Smith',
        role: ROLES.RESIDENT,
        unitNumber: '805',
        phone: '403-555-0108',
        active: true,
        createdAt: '2024-01-20'
    },
    {
        id: 9,
        email: 'demo@example.com',
        password: 'demo123',
        firstName: 'Demo',
        lastName: 'User',
        role: ROLES.RESIDENT,
        unitNumber: '1001',
        phone: '403-555-0109',
        active: true,
        createdAt: '2024-01-25'
    }
];

// Mock database functions
const mockDB = {
    // Authenticate user
    async authenticateUser(email, password) {
        // Simulate async database query
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = USERS.find(u => 
                    u.email.toLowerCase() === email.toLowerCase() && 
                    u.password === password &&
                    u.active
                );
                
                if (user) {
                    // Return user without password
                    const { password, ...userWithoutPassword } = user;
                    resolve({ success: true, user: userWithoutPassword });
                } else {
                    resolve({ success: false, error: 'Invalid email or password' });
                }
            }, 500); // Simulate network delay
        });
    },

    // Create new user (for registration)
    async createUser(userData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if email already exists
                const existingUser = USERS.find(u => 
                    u.email.toLowerCase() === userData.email.toLowerCase()
                );
                
                if (existingUser) {
                    resolve({ success: false, error: 'Email already registered' });
                    return;
                }

                // Create new user
                const newUser = {
                    id: USERS.length + 1,
                    email: userData.email,
                    password: userData.password, // In production, hash this
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: ROLES.RESIDENT, // New registrations default to resident
                    unitNumber: userData.unitNumber,
                    phone: userData.phone || '',
                    active: false, // Requires approval
                    createdAt: new Date().toISOString().split('T')[0]
                };

                USERS.push(newUser);
                
                resolve({ 
                    success: true, 
                    message: 'Registration successful! Your account is pending approval.',
                    user: { ...newUser, password: undefined }
                });
            }, 1000);
        });
    },

    // Get user by ID
    async getUserById(userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const user = USERS.find(u => u.id === userId);
                if (user) {
                    const { password, ...userWithoutPassword } = user;
                    resolve({ success: true, user: userWithoutPassword });
                } else {
                    resolve({ success: false, error: 'User not found' });
                }
            }, 200);
        });
    },

    // Get board members with their positions
    async getBoardMembers() {
        return new Promise((resolve) => {
            setTimeout(() => {
                const boardMembers = BOARD_POSITIONS.map(position => {
                    const user = USERS.find(u => u.id === position.userId);
                    return {
                        ...position,
                        user: user ? { ...user, password: undefined } : null
                    };
                }).filter(member => member.user !== null);
                
                resolve({ success: true, boardMembers });
            }, 300);
        });
    },

    // Get board meetings
    async getBoardMeetings(status = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let meetings = [...BOARD_MEETINGS];
                
                if (status) {
                    meetings = meetings.filter(m => m.status === status);
                }
                
                // Sort by date (newest first)
                meetings.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                resolve({ success: true, meetings });
            }, 300);
        });
    },

    // Create new board meeting
    async createBoardMeeting(meetingData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newMeeting = {
                    id: BOARD_MEETINGS.length + 1,
                    ...meetingData,
                    status: 'scheduled',
                    attendees: [],
                    minutes: null,
                    createdAt: new Date().toISOString().split('T')[0]
                };
                
                BOARD_MEETINGS.push(newMeeting);
                resolve({ success: true, meeting: newMeeting });
            }, 500);
        });
    },

    // Update board meeting
    async updateBoardMeeting(meetingId, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const meetingIndex = BOARD_MEETINGS.findIndex(m => m.id === meetingId);
                
                if (meetingIndex !== -1) {
                    BOARD_MEETINGS[meetingIndex] = { ...BOARD_MEETINGS[meetingIndex], ...updateData };
                    resolve({ success: true, meeting: BOARD_MEETINGS[meetingIndex] });
                } else {
                    resolve({ success: false, error: 'Meeting not found' });
                }
            }, 300);
        });
    },

    // Check user permissions
    hasPermission(userRole, requiredRole) {
        return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
    },

    // Get role display name
    getRoleDisplayName(role) {
        const displayNames = {
            [ROLES.PROPERTY_MANAGER]: 'Property Manager',
            [ROLES.BOARD_MEMBER]: 'Board Member',
            [ROLES.LEAD_CONCIERGE]: 'Lead Concierge',
            [ROLES.CONCIERGE]: 'Concierge',
            [ROLES.RESIDENT]: 'Resident'
        };
        return displayNames[role] || 'Unknown';
    },

    // Get all announcements
    async getAnnouncements() {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Sort by date (newest first)
                const sortedAnnouncements = [...ANNOUNCEMENTS].sort((a, b) => 
                    new Date(b.createdAt) - new Date(a.createdAt)
                );
                
                resolve({ success: true, announcements: sortedAnnouncements });
            }, 300);
        });
    },

    // Create new announcement (Property Manager only)
    async createAnnouncement(announcementData, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if user is property manager
                const user = USERS.find(u => u.id === userId);
                if (!user || user.role !== ROLES.PROPERTY_MANAGER) {
                    resolve({ success: false, error: 'Only Property Managers can create announcements' });
                    return;
                }

                const newAnnouncement = {
                    id: ANNOUNCEMENTS.length + 1,
                    title: announcementData.title,
                    content: announcementData.content,
                    createdBy: userId,
                    createdAt: new Date().toISOString(),
                    active: true
                };

                ANNOUNCEMENTS.push(newAnnouncement);
                resolve({ success: true, announcement: newAnnouncement });
            }, 500);
        });
    },

    // Delete announcement (Property Manager only)
    async deleteAnnouncement(announcementId, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if user is property manager
                const user = USERS.find(u => u.id === userId);
                if (!user || user.role !== ROLES.PROPERTY_MANAGER) {
                    resolve({ success: false, error: 'Only Property Managers can delete announcements' });
                    return;
                }

                const announcementIndex = ANNOUNCEMENTS.findIndex(a => a.id === announcementId);
                if (announcementIndex !== -1) {
                    ANNOUNCEMENTS.splice(announcementIndex, 1);
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Announcement not found' });
                }
            }, 300);
        });
    },

    // Get announcement by ID
    async getAnnouncementById(announcementId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const announcement = ANNOUNCEMENTS.find(a => a.id === announcementId);
                if (announcement) {
                    resolve({ success: true, announcement });
                } else {
                    resolve({ success: false, error: 'Announcement not found' });
                }
            }, 200);
        });
    },

    // Document Vault Functions
    async getDocumentFolders() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(DOCUMENT_FOLDERS);
            }, 300);
        });
    },

    async getDocuments() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(DOCUMENTS);
            }, 300);
        });
    },

    async uploadDocument(documentData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newDocument = {
                    id: DOCUMENTS.length + 1,
                    ...documentData,
                    uploadDate: new Date().toISOString(),
                    views: 0
                };
                DOCUMENTS.push(newDocument);
                resolve(newDocument);
            }, 500);
        });
    },

    async deleteDocument(documentId, userId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                // Check if user is property manager or admin
                const user = USERS.find(u => u.id === userId);
                if (!user || (user.role !== ROLES.PROPERTY_MANAGER && user.role !== ROLES.ADMIN)) {
                    resolve({ success: false, error: 'Insufficient permissions to delete documents' });
                    return;
                }

                const documentIndex = DOCUMENTS.findIndex(d => d.id === documentId);
                if (documentIndex !== -1) {
                    DOCUMENTS.splice(documentIndex, 1);
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Document not found' });
                }
            }, 300);
        });
    },

    // Extended Absence Functions
    async getExtendedAbsences() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(EXTENDED_ABSENCES);
            }, 300);
        });
    },

    async createExtendedAbsence(absenceData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newAbsence = {
                    id: EXTENDED_ABSENCES.length + 1,
                    ...absenceData,
                    status: 'active',
                    createdAt: new Date().toISOString(),
                    userId: 1 // Would be current user ID in real implementation
                };
                EXTENDED_ABSENCES.push(newAbsence);
                resolve(newAbsence);
            }, 500);
        });
    },

    async cancelExtendedAbsence(absenceId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const absence = EXTENDED_ABSENCES.find(a => a.id === parseInt(absenceId));
                if (absence) {
                    absence.status = 'cancelled';
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Absence not found' });
                }
            }, 300);
        });
    },

    async deleteExtendedAbsence(absenceId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const index = EXTENDED_ABSENCES.findIndex(a => a.id === parseInt(absenceId));
                if (index !== -1) {
                    EXTENDED_ABSENCES.splice(index, 1);
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Absence not found' });
                }
            }, 300);
        });
    },

    getUserById(userId) {
        return USERS.find(u => u.id === parseInt(userId));
    },

    // Tasks & Milestones
    async getTasks() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(TASKS);
            }, 300);
        });
    },

    async createTask(taskData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTask = {
                    id: TASKS.length + 1,
                    ...taskData,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                TASKS.push(newTask);
                resolve({ success: true, task: newTask });
            }, 500);
        });
    },

    async updateTask(taskId, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const taskIndex = TASKS.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    TASKS[taskIndex] = { ...TASKS[taskIndex], ...updateData, updatedAt: new Date().toISOString() };
                    resolve({ success: true, task: TASKS[taskIndex] });
                } else {
                    resolve({ success: false, error: 'Task not found' });
                }
            }, 500);
        });
    },

    async deleteTask(taskId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const taskIndex = TASKS.findIndex(t => t.id === taskId);
                if (taskIndex !== -1) {
                    TASKS.splice(taskIndex, 1);
                    resolve({ success: true });
                } else {
                    resolve({ success: false, error: 'Task not found' });
                }
            }, 500);
        });
    },

    async getMilestones() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(MILESTONES);
            }, 300);
        });
    },

    async createMilestone(milestoneData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newMilestone = {
                    id: MILESTONES.length + 1,
                    ...milestoneData,
                    createdAt: new Date().toISOString()
                };
                MILESTONES.push(newMilestone);
                resolve({ success: true, milestone: newMilestone });
            }, 500);
        });
    },

    // Sponsored Services
    async getSponsoredServices() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(SPONSORED_SERVICES);
            }, 300);
        });
    },

    // Taxi Requests
    async getTaxiRequests(userId = null) {
        return new Promise((resolve) => {
            setTimeout(() => {
                let requests = TAXI_REQUESTS;
                if (userId) {
                    requests = requests.filter(r => r.userId === userId);
                }
                resolve(requests);
            }, 300);
        });
    },

    async createTaxiRequest(requestData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newRequest = {
                    id: TAXI_REQUESTS.length + 1,
                    ...requestData,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                TAXI_REQUESTS.push(newRequest);
                resolve({ success: true, request: newRequest });
            }, 500);
        });
    },

    async updateTaxiRequest(requestId, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const requestIndex = TAXI_REQUESTS.findIndex(r => r.id === requestId);
                if (requestIndex !== -1) {
                    TAXI_REQUESTS[requestIndex] = { ...TAXI_REQUESTS[requestIndex], ...updateData };
                    resolve({ success: true, request: TAXI_REQUESTS[requestIndex] });
                } else {
                    resolve({ success: false, error: 'Request not found' });
                }
            }, 500);
        });
    },

    // Anonymous Tips
    async getAnonymousTips() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(ANONYMOUS_TIPS);
            }, 300);
        });
    },

    async createAnonymousTip(tipData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newTip = {
                    id: ANONYMOUS_TIPS.length + 1,
                    ...tipData,
                    status: 'pending',
                    createdAt: new Date().toISOString()
                };
                ANONYMOUS_TIPS.push(newTip);
                resolve({ success: true, tip: newTip });
            }, 500);
        });
    },

    async updateAnonymousTip(tipId, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const tipIndex = ANONYMOUS_TIPS.findIndex(t => t.id === tipId);
                if (tipIndex !== -1) {
                    ANONYMOUS_TIPS[tipIndex] = { ...ANONYMOUS_TIPS[tipIndex], ...updateData };
                    resolve({ success: true, tip: ANONYMOUS_TIPS[tipIndex] });
                } else {
                    resolve({ success: false, error: 'Tip not found' });
                }
            }, 500);
        });
    },

    // Newsletter
    async getNewsletters() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(NEWSLETTERS);
            }, 300);
        });
    },

    async createNewsletter(newsletterData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newNewsletter = {
                    id: NEWSLETTERS.length + 1,
                    ...newsletterData,
                    status: 'draft',
                    createdAt: new Date().toISOString()
                };
                NEWSLETTERS.push(newNewsletter);
                resolve({ success: true, newsletter: newNewsletter });
            }, 500);
        });
    },

    async updateNewsletter(newsletterId, updateData) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newsletterIndex = NEWSLETTERS.findIndex(n => n.id === newsletterId);
                if (newsletterIndex !== -1) {
                    NEWSLETTERS[newsletterIndex] = { ...NEWSLETTERS[newsletterIndex], ...updateData };
                    resolve({ success: true, newsletter: NEWSLETTERS[newsletterIndex] });
                } else {
                    resolve({ success: false, error: 'Newsletter not found' });
                }
            }, 500);
        });
    },

    async sendNewsletter(newsletterId) {
        return new Promise((resolve) => {
            setTimeout(() => {
                const newsletterIndex = NEWSLETTERS.findIndex(n => n.id === newsletterId);
                if (newsletterIndex !== -1) {
                    NEWSLETTERS[newsletterIndex].status = 'sent';
                    NEWSLETTERS[newsletterIndex].sentAt = new Date().toISOString();
                    resolve({ success: true, newsletter: NEWSLETTERS[newsletterIndex] });
                } else {
                    resolve({ success: false, error: 'Newsletter not found' });
                }
            }, 1000);
        });
    }
};

// Mock announcements data
const ANNOUNCEMENTS = [
    {
        id: 1,
        title: "Holiday Schedule - Building Hours",
        content: "Please note that building amenities will have modified hours during the holiday season. The fitness center will be closed on December 25th and January 1st. The pool will have reduced hours from December 24th to January 2nd (10 AM - 6 PM). Regular hours will resume January 3rd, 2025.",
        createdBy: 1, // Property Manager
        createdAt: "2024-12-15T10:00:00Z",
        active: true,
        priority: "high",
        category: "Building Operations"
    },
    {
        id: 2,
        title: "Window Cleaning Notice",
        content: "Professional window cleaning will take place on all floors from December 18-20, 2024. Please ensure your balcony doors are accessible and remove any items from balcony railings. The cleaning crew will work between 8 AM and 4 PM. Thank you for your cooperation.",
        createdBy: 1,
        createdAt: "2024-12-10T14:30:00Z",
        active: true,
        priority: "medium",
        category: "Maintenance"
    },
    {
        id: 3,
        title: "New Fitness Equipment Installed",
        content: "We're excited to announce that new cardio equipment has been installed in the fitness center! The new additions include two Peloton bikes, a rowing machine, and an elliptical trainer. All equipment is now available for use. Please remember to wipe down equipment after use and respect the 60-minute time limit during peak hours.",
        createdBy: 1,
        createdAt: "2024-12-05T09:15:00Z",
        active: true,
        priority: "low",
        category: "Amenities"
    },
    {
        id: 4,
        title: "Elevator Maintenance Scheduled",
        content: "Routine maintenance will be performed on Elevator #2 on December 28th from 9 AM to 2 PM. During this time, please use Elevator #1 or the stairs. We apologize for any inconvenience and appreciate your patience.",
        createdBy: 1,
        createdAt: "2024-12-01T11:00:00Z",
        active: true,
        priority: "high",
        category: "Maintenance"
    },
    {
        id: 5,
        title: "Parking Garage Cleaning",
        content: "The parking garage will undergo deep cleaning on December 30th from 6 AM to 12 PM. Please ensure your vehicle is parked within the designated lines and remove any personal items from common areas. Power washing will be conducted, so please keep car windows closed.",
        createdBy: 1,
        createdAt: "2024-11-28T16:45:00Z",
        active: true,
        priority: "medium",
        category: "Maintenance"
    },
    {
        id: 6,
        title: "Fire Alarm Testing - All Units",
        content: "Annual fire alarm testing will be conducted throughout the building on January 15th, 2025, between 9 AM and 5 PM. The alarm system will sound intermittently during testing. This is mandatory testing required by the Calgary Fire Department. No evacuation is necessary unless instructed by building staff.",
        createdBy: 1,
        createdAt: "2025-01-08T08:30:00Z",
        active: true,
        priority: "high",
        category: "Safety"
    },
    {
        id: 7,
        title: "New Parcel Locker System",
        content: "We're pleased to announce the installation of a new smart parcel locker system in the lobby. Starting January 20th, all packages will be securely stored in these lockers. You'll receive an email/text with a unique code to retrieve your packages 24/7. This will enhance security and convenience for all residents.",
        createdBy: 1,
        createdAt: "2025-01-10T11:15:00Z",
        active: true,
        priority: "medium",
        category: "Building Operations"
    },
    {
        id: 8,
        title: "Water Shut-Off Notice - Floors 15-20",
        content: "Essential plumbing repairs require a water shut-off for units on floors 15-20 on January 18th from 8 AM to 12 PM. Please store water for essential needs. Hot water may take 30 minutes to return after service is restored. We apologize for the inconvenience.",
        createdBy: 1,
        createdAt: "2025-01-12T15:00:00Z",
        active: true,
        priority: "high",
        category: "Maintenance"
    },
    {
        id: 9,
        title: "Community BBQ Event - Save the Date",
        content: "Mark your calendars! Our annual winter BBQ event will be held on February 10th, 2025, from 12 PM to 4 PM in the party room. Join us for grilled favorites, hot chocolate, and great company. RSVP through the events section by February 5th. All residents and their families are welcome!",
        createdBy: 1,
        createdAt: "2025-01-05T13:20:00Z",
        active: true,
        priority: "low",
        category: "Community"
    },
    {
        id: 10,
        title: "Guest Suite Renovation Complete",
        content: "The guest suite renovation is now complete! The newly redesigned suite features modern furnishings, a fully equipped kitchen, and upgraded bathroom. The suite is available for booking at $150/night for residents' guests. Book through the amenity booking system. Thank you for your patience during the renovation.",
        createdBy: 1,
        createdAt: "2024-12-20T10:45:00Z",
        active: true,
        priority: "low",
        category: "Amenities"
    },
    {
        id: 11,
        title: "Security Update - Lobby Access",
        content: "For enhanced security, the lobby doors will now be locked 24/7. Residents must use their key fobs for entry at all times. Visitors must be buzzed in through the intercom system. Please do not prop doors open or allow tailgating. Report any security concerns to the concierge immediately.",
        createdBy: 1,
        createdAt: "2024-12-18T09:00:00Z",
        active: true,
        priority: "high",
        category: "Security"
    },
    {
        id: 12,
        title: "Recycling Program Updates",
        content: "Calgary's recycling program has new guidelines effective immediately. Plastic bags are no longer accepted in blue bins. Please use paper bags or loose items only. A detailed guide is posted in the recycling rooms on each floor. Let's work together to reduce contamination and improve our recycling rate!",
        createdBy: 1,
        createdAt: "2024-11-25T14:00:00Z",
        active: true,
        priority: "medium",
        category: "Building Operations"
    }
];

// Mock board meetings data
const BOARD_MEETINGS = [
    {
        id: 1,
        title: "Monthly Board Meeting - January 2025",
        date: "2025-01-25",
        time: "19:00",
        location: "Board Room - 3rd Floor",
        status: "scheduled",
        agenda: [
            "Review of December 2024 financials and year-end report",
            "2025 capital projects planning and budget allocation",
            "Property management contract renewal discussion",
            "Resident survey results and action items",
            "Amenity renovation proposals - pool deck and fitness center",
            "Security system upgrade progress report"
        ],
        attendees: [2, 3], // Board member IDs
        minutes: null,
        documents: ["2024_Year_End_Financial_Report.pdf", "2025_Capital_Projects_Proposal.pdf", "Resident_Survey_Results.pdf"],
        virtualMeetingLink: "https://zoom.us/j/123456789",
        createdBy: 2,
        createdAt: "2025-01-10"
    },
    {
        id: 2,
        title: "Special Board Meeting - Insurance Renewal",
        date: "2025-01-15",
        time: "18:00",
        location: "Board Room - 3rd Floor",
        status: "scheduled",
        agenda: [
            "Insurance broker presentation - 2025 renewal options",
            "Coverage analysis and recommendations",
            "Premium comparison with previous years",
            "Deductible options discussion",
            "Vote on insurance provider selection"
        ],
        attendees: [2, 3],
        minutes: null,
        documents: ["Insurance_Renewal_Options_2025.pdf", "Coverage_Comparison_Chart.xlsx"],
        virtualMeetingLink: "https://zoom.us/j/987654321",
        createdBy: 3,
        createdAt: "2025-01-05"
    },
    {
        id: 3,
        title: "Monthly Board Meeting - December 2024",
        date: "2024-12-22",
        time: "19:00",
        location: "Board Room - 3rd Floor",
        status: "completed",
        agenda: [
            "Review of November financials",
            "Holiday decorations budget approval", 
            "Elevator maintenance contract renewal",
            "New amenity booking system discussion",
            "2025 budget draft review"
        ],
        attendees: [2, 3],
        minutes: "Meeting called to order at 7:00 PM by President Michael Chen. Quorum established with all board members present.\n\nFinancial Report: November financials reviewed. Operating expenses within budget. Reserve fund contribution on track.\n\nHoliday Decorations: Motion to approve $5,000 for holiday decorations. Approved unanimously.\n\nElevator Contract: Three-year renewal with Otis approved at 3% annual increase. Motion carried.\n\nAmenity Booking System: Demo of new online system presented. Go-live date set for February 1, 2025.\n\n2025 Budget: Draft budget presented with 2.5% increase in condo fees. To be finalized at January meeting.\n\nMeeting adjourned at 8:45 PM.",
        documents: ["November_2024_Financials.pdf", "Elevator_Contract_Renewal.pdf", "2025_Draft_Budget.xlsx"],
        recordingUrl: "https://recordings.pointonthebow.ca/2024-12-22",
        createdBy: 2,
        createdAt: "2024-12-01"
    },
    {
        id: 4,
        title: "Emergency Board Meeting - Building Security",
        date: "2024-11-15",
        time: "18:30",
        location: "Virtual Meeting",
        status: "completed",
        agenda: [
            "Security camera system upgrade",
            "Access control improvements",
            "Emergency protocols review",
            "Incident report review"
        ],
        attendees: [2, 3],
        minutes: "Emergency meeting called to order at 6:30 PM via Zoom.\n\nSecurity Incidents: Property Manager reported two unauthorized access attempts in parking garage.\n\nCamera System: Current system has blind spots. Proposal from SecureTech for $15,000 upgrade reviewed.\n\nMotion: Approve immediate installation of additional cameras and upgraded NVR system. Budget: $15,000 from reserve fund. Approved unanimously.\n\nAccess Control: All residents to be reminded about not allowing tailgating. New signage to be installed.\n\nEmergency Protocols: Updated protocols to be distributed to all residents by November 20th.\n\nMeeting adjourned at 7:45 PM.",
        documents: ["Security_Incident_Report_Nov2024.pdf", "SecureTech_Proposal.pdf", "Emergency_Protocols_v2.pdf"],
        virtualMeetingLink: "https://zoom.us/j/emergency2024",
        createdBy: 2,
        createdAt: "2024-11-10"
    },
    {
        id: 5,
        title: "Annual General Meeting 2024",
        date: "2024-10-20",
        time: "14:00",
        location: "Party Room & Virtual Hybrid",
        status: "completed",
        agenda: [
            "Call to order and registration",
            "Approval of 2023 AGM minutes",
            "President's report",
            "Treasurer's report and audited financials",
            "Property management report",
            "Board elections - 2 positions",
            "Reserve fund study presentation",
            "Bylaw amendments vote",
            "New business from the floor"
        ],
        attendees: [2, 3, 1], // Board members + property manager
        minutes: "2024 ANNUAL GENERAL MEETING MINUTES\n\nDate: October 20, 2024, 2:00 PM\nLocation: Party Room (Hybrid with Zoom)\nAttendance: 127 units represented (85% quorum achieved)\n\nCALL TO ORDER: President Michael Chen called meeting to order at 2:05 PM.\n\n2023 AGM MINUTES: Motion to approve. Carried.\n\nPRESIDENT'S REPORT: Highlighted successful year with major projects completed including lobby renovation and gym equipment upgrade.\n\nFINANCIAL REPORT: Audited statements presented. Operating fund healthy. Reserve fund at 92% of recommended level. Motion to approve. Carried.\n\nPROPERTY MANAGEMENT: Sarah Johnson reported 98% occupancy, successful implementation of new maintenance tracking system.\n\nELECTIONS: Two positions available. Michael Chen and Patricia Williams re-elected by acclamation.\n\nRESERVE FUND STUDY: Engineer presented 25-year plan. Major items: roof replacement (2027), elevator modernization (2029).\n\nBYLAW AMENDMENTS:\n- Pet policy update (max 2 pets): Approved 118-9\n- Rental restriction (min 6 months): Approved 95-32\n- Electric vehicle charging rules: Approved 125-2\n\nNEW BUSINESS:\n- Resident suggestion for community garden explored\n- Questions about visitor parking answered\n\nADJOURNMENT: 4:15 PM\n\nMinutes prepared by: Patricia Williams, Secretary",
        documents: ["AGM_2024_Package.pdf", "Audited_Financials_2024.pdf", "Reserve_Fund_Study_2024.pdf", "Election_Results_2024.pdf"],
        recordingUrl: "https://recordings.pointonthebow.ca/AGM-2024",
        residentAttendance: 127,
        votingResults: {
            "Pet Policy Amendment": { "for": 118, "against": 9 },
            "Rental Restriction": { "for": 95, "against": 32 },
            "EV Charging Rules": { "for": 125, "against": 2 }
        },
        createdBy: 2,
        createdAt: "2024-10-01"
    },
    {
        id: 6,
        title: "Budget Planning Meeting - 2025",
        date: "2024-11-28",
        time: "19:00",
        location: "Board Room - 3rd Floor",
        status: "completed",
        agenda: [
            "2024 financial performance review",
            "2025 operating budget draft",
            "Capital project priorities",
            "Condo fee adjustment proposal",
            "Contract renewals and negotiations"
        ],
        attendees: [2, 3],
        minutes: "Budget planning session completed. 2025 budget proposes 2.5% fee increase to cover inflation and maintain reserve fund contributions. Major contracts reviewed for renewal opportunities.",
        documents: ["2025_Operating_Budget_Draft.xlsx", "Capital_Projects_Priority_List.pdf"],
        createdBy: 3,
        createdAt: "2024-11-20"
    },
    {
        id: 7,
        title: "Quarterly Board Meeting - Q3 2024",
        date: "2024-09-15",
        time: "19:00",
        location: "Board Room - 3rd Floor",
        status: "completed",
        agenda: [
            "Q3 financial review",
            "Maintenance report",
            "Resident complaints and resolutions",
            "Amenity usage statistics",
            "Upcoming projects update"
        ],
        attendees: [2, 3],
        minutes: "Q3 review showed strong financial position. Maintenance on schedule. Pool resurfacing project approved for Q4. Gym usage up 30% following equipment upgrade.",
        documents: ["Q3_2024_Financials.pdf", "Maintenance_Report_Q3.pdf", "Amenity_Usage_Stats.xlsx"],
        createdBy: 2,
        createdAt: "2024-09-01"
    }
];

// Mock board positions and terms
const BOARD_POSITIONS = [
    {
        userId: 2,
        position: "Board President",
        termStart: "2024-01-01",
        termEnd: "2025-12-31",
        responsibilities: [
            "Preside over board meetings",
            "Represent the corporation in legal matters",
            "Oversee property management",
            "Emergency decision making authority"
        ],
        contactEmail: "president@pointonthebow.ca",
        biography: "Michael has been a resident since 2020 and brings 15 years of corporate management experience to the board."
    },
    {
        userId: 3,
        position: "Board Secretary-Treasurer",
        termStart: "2024-01-01", 
        termEnd: "2025-12-31",
        responsibilities: [
            "Maintain meeting minutes",
            "Oversee financial reporting",
            "Manage corporate documents",
            "Coordinate with auditors"
        ],
        contactEmail: "secretary@pointonthebow.ca",
        biography: "Patricia is a certified accountant with over 20 years of experience in financial management and has lived in the building since 2019."
    }
];

// Mock document folders data
const DOCUMENT_FOLDERS = [
    {
        id: 'agm',
        name: 'AGM Materials',
        description: 'Annual general meeting agendas, minutes, financial reports, and voting results.',
        icon: 'fas fa-users',
        accessLevel: 'all',
        documentCount: 15
    },
    {
        id: 'activation',
        name: 'Activation Files',
        description: 'Condominium corporation activation documents, initial board appointments, and developer turnover records.',
        icon: 'fas fa-file-contract',
        accessLevel: 'board',
        documentCount: 8
    },
    {
        id: 'architecture',
        name: 'Architecture & Renovations',
        description: 'Unit modification request forms, approved renovation guidelines, and architectural standards.',
        icon: 'fas fa-drafting-compass',
        accessLevel: 'all',
        documentCount: 12
    },
    {
        id: 'board',
        name: 'Board & Committees',
        description: 'Current board member profiles, committee structures, meeting schedules, and contact information.',
        icon: 'fas fa-user-tie',
        accessLevel: 'all',
        documentCount: 6
    },
    {
        id: 'construction',
        name: 'Building Systems & Manuals',
        description: 'Construction drawings, equipment manuals, warranty documents, and system specifications.',
        icon: 'fas fa-tools',
        accessLevel: 'board',
        documentCount: 45
    },
    {
        id: 'covid',
        name: 'Health & Safety Protocols',
        description: 'COVID-19 policies, health guidelines, cleaning protocols, and safety procedures.',
        icon: 'fas fa-shield-virus',
        accessLevel: 'all',
        documentCount: 10
    },
    {
        id: 'declaration',
        name: 'Governance Documents',
        description: 'Condominium declaration, bylaws, rules and regulations, and policy resolutions.',
        icon: 'fas fa-gavel',
        accessLevel: 'all',
        documentCount: 18
    },
    {
        id: 'emergency',
        name: 'Emergency Information',
        description: 'Emergency procedures, evacuation plans, contact lists, and approved emergency vendors.',
        icon: 'fas fa-exclamation-triangle',
        accessLevel: 'all',
        documentCount: 14
    },
    {
        id: 'financial',
        name: 'Financial Documents',
        description: 'Audited financial statements, budgets, reserve fund studies, and financial policies.',
        icon: 'fas fa-dollar-sign',
        accessLevel: 'all',
        documentCount: 25
    },
    {
        id: 'insurance',
        name: 'Insurance Documents',
        description: 'Building insurance policies, coverage summaries, claim procedures, and certificates.',
        icon: 'fas fa-shield-alt',
        accessLevel: 'all',
        documentCount: 8
    },
    {
        id: 'maintenance',
        name: 'Maintenance Records',
        description: 'Preventive maintenance schedules, service reports, contractor agreements, and warranties.',
        icon: 'fas fa-wrench',
        accessLevel: 'board',
        documentCount: 32
    },
    {
        id: 'forms',
        name: 'Resident Forms',
        description: 'Move-in/out forms, renovation requests, complaint forms, and various application templates.',
        icon: 'fas fa-file-alt',
        accessLevel: 'all',
        documentCount: 20
    }
];

// Mock documents data
const DOCUMENTS = [
    // AGM Materials
    {
        id: 1,
        name: 'AGM_2024_Complete_Package.pdf',
        type: 'pdf',
        size: '4.8 MB',
        folderId: 'agm',
        description: 'Complete AGM package including agenda, financials, and proxy forms',
        uploadDate: '2024-10-01T09:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '2.0',
        tags: ['AGM', '2024', 'Important'],
        views: 286,
        downloads: 145,
        lastModified: '2024-10-15T14:30:00Z'
    },
    {
        id: 2,
        name: 'AGM_2024_Audited_Financial_Statements.pdf',
        type: 'pdf',
        size: '2.4 MB',
        folderId: 'agm',
        description: 'Audited financial statements for fiscal year 2024',
        uploadDate: '2024-10-15T10:30:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Financial', 'Audit', '2024'],
        views: 198,
        downloads: 89,
        protected: true
    },
    {
        id: 3,
        name: 'AGM_2024_Minutes_FINAL.pdf',
        type: 'pdf',
        size: '890 KB',
        folderId: 'agm',
        description: 'Final approved minutes from 2024 Annual General Meeting',
        uploadDate: '2024-11-05T11:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Minutes', 'AGM', '2024'],
        views: 156,
        downloads: 67
    },
    {
        id: 4,
        name: 'Board_Meeting_Minutes_December_2024.pdf',
        type: 'pdf',
        size: '1.2 MB',
        folderId: 'agm',
        description: 'Board meeting minutes from December 22, 2024',
        uploadDate: '2024-12-23T09:15:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Board', 'Minutes', '2024'],
        views: 89,
        downloads: 34
    },

    // Activation Files
    {
        id: 5,
        name: 'CCC_50276_Registration_Certificate.pdf',
        type: 'pdf',
        size: '450 KB',
        folderId: 'activation',
        description: 'Official condominium corporation registration certificate',
        uploadDate: '2020-06-15T12:00:00Z',
        uploadedBy: 'Developer',
        version: '1.0',
        tags: ['Legal', 'Registration', 'Official'],
        views: 234,
        downloads: 45,
        protected: true,
        restricted: true
    },
    {
        id: 6,
        name: 'Developer_Turnover_Package.pdf',
        type: 'pdf',
        size: '12.5 MB',
        folderId: 'activation',
        description: 'Complete turnover documentation from developer',
        uploadDate: '2020-06-15T14:00:00Z',
        uploadedBy: 'Developer',
        version: '1.0',
        tags: ['Turnover', 'Developer', 'Important'],
        views: 178,
        downloads: 23,
        restricted: true
    },
    {
        id: 7,
        name: 'Initial_Board_Appointment.pdf',
        type: 'pdf',
        size: '340 KB',
        folderId: 'activation',
        description: 'Initial board member appointments by developer',
        uploadDate: '2020-06-01T10:00:00Z',
        uploadedBy: 'Developer',
        version: '1.0',
        views: 145,
        downloads: 18,
        restricted: true
    },

    // Architecture & Renovations
    {
        id: 8,
        name: 'Unit_Renovation_Guidelines_2024.pdf',
        type: 'pdf',
        size: '2.8 MB',
        folderId: 'architecture',
        description: 'Comprehensive guidelines for unit renovations including approved contractors',
        uploadDate: '2024-01-15T09:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '3.0',
        tags: ['Renovation', 'Guidelines', '2024'],
        views: 456,
        downloads: 234,
        popular: true
    },
    {
        id: 9,
        name: 'Architectural_Change_Request_Form.docx',
        type: 'word',
        size: '125 KB',
        folderId: 'architecture',
        description: 'Fillable form for requesting architectural modifications',
        uploadDate: '2024-03-01T08:45:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '2.1',
        tags: ['Form', 'Renovation', 'Request'],
        views: 312,
        downloads: 189,
        editable: true
    },
    {
        id: 10,
        name: 'Balcony_Flooring_Approved_Materials.pdf',
        type: 'pdf',
        size: '1.5 MB',
        folderId: 'architecture',
        description: 'List of approved materials for balcony flooring with samples',
        uploadDate: '2024-05-10T14:30:00Z',
        uploadedBy: 'Michael Chen',
        version: '1.0',
        tags: ['Balcony', 'Materials', 'Approved'],
        views: 267,
        downloads: 145
    },
    {
        id: 11,
        name: 'Kitchen_Renovation_Checklist.pdf',
        type: 'pdf',
        size: '890 KB',
        folderId: 'architecture',
        description: 'Step-by-step checklist for kitchen renovations',
        uploadDate: '2024-06-20T11:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '1.2',
        tags: ['Kitchen', 'Checklist', 'Renovation'],
        views: 189,
        downloads: 98
    },

    // Board & Committees
    {
        id: 12,
        name: 'Board_Directory_2024-2025.pdf',
        type: 'pdf',
        size: '450 KB',
        folderId: 'board',
        description: 'Current board members with photos and contact information',
        uploadDate: '2024-11-01T10:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Board', 'Directory', 'Contact'],
        views: 445,
        downloads: 167
    },
    {
        id: 13,
        name: 'Committee_Structure_Chart.pdf',
        type: 'pdf',
        size: '280 KB',
        folderId: 'board',
        description: 'Organizational chart of all committees and their mandates',
        uploadDate: '2024-01-20T09:30:00Z',
        uploadedBy: 'Michael Chen',
        version: '2.0',
        tags: ['Committee', 'Organization', 'Structure'],
        views: 234,
        downloads: 89
    },

    // Building Systems & Manuals
    {
        id: 14,
        name: 'HVAC_System_Complete_Manual.pdf',
        type: 'pdf',
        size: '15.7 MB',
        folderId: 'construction',
        description: 'Complete HVAC system documentation including troubleshooting guide',
        uploadDate: '2020-08-15T10:00:00Z',
        uploadedBy: 'Facility Manager',
        version: '1.0',
        tags: ['HVAC', 'Manual', 'Technical'],
        views: 123,
        downloads: 34,
        technical: true,
        restricted: true
    },
    {
        id: 15,
        name: 'Elevator_Maintenance_Schedule_2025.xlsx',
        type: 'excel',
        size: '145 KB',
        folderId: 'construction',
        description: 'Annual elevator maintenance schedule with contractor contacts',
        uploadDate: '2024-12-15T14:00:00Z',
        uploadedBy: 'Robert Martinez',
        version: '1.0',
        tags: ['Elevator', 'Maintenance', 'Schedule'],
        views: 198,
        downloads: 56
    },
    {
        id: 16,
        name: 'Fire_System_Testing_Records.pdf',
        type: 'pdf',
        size: '3.2 MB',
        folderId: 'construction',
        description: 'Complete fire system testing records and certificates',
        uploadDate: '2024-11-30T11:30:00Z',
        uploadedBy: 'Robert Martinez',
        version: '1.0',
        tags: ['Fire', 'Safety', 'Testing'],
        views: 167,
        downloads: 45,
        compliance: true
    },

    // Governance Documents
    {
        id: 17,
        name: 'Condominium_Declaration_Registered.pdf',
        type: 'pdf',
        size: '4.5 MB',
        folderId: 'declaration',
        description: 'Official registered condominium declaration with all schedules',
        uploadDate: '2020-06-15T12:00:00Z',
        uploadedBy: 'Legal',
        version: '1.0',
        tags: ['Declaration', 'Legal', 'Official'],
        views: 567,
        downloads: 234,
        protected: true,
        watermarked: true
    },
    {
        id: 18,
        name: 'Bylaws_Consolidated_2024.pdf',
        type: 'pdf',
        size: '2.1 MB',
        folderId: 'declaration',
        description: 'Consolidated bylaws including all amendments through 2024',
        uploadDate: '2024-11-15T09:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '4.0',
        tags: ['Bylaws', 'Legal', '2024'],
        views: 423,
        downloads: 189,
        changelog: 'Added EV charging rules, updated pet policy'
    },
    {
        id: 19,
        name: 'Rules_and_Regulations_2025.pdf',
        type: 'pdf',
        size: '1.8 MB',
        folderId: 'declaration',
        description: 'Complete rules and regulations effective January 1, 2025',
        uploadDate: '2024-12-20T10:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '5.0',
        tags: ['Rules', 'Regulations', '2025'],
        views: 389,
        downloads: 167,
        effectiveDate: '2025-01-01'
    },
    {
        id: 20,
        name: 'Policy_Resolutions_Index.pdf',
        type: 'pdf',
        size: '450 KB',
        folderId: 'declaration',
        description: 'Index of all board policy resolutions with summaries',
        uploadDate: '2024-10-30T14:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '2.0',
        tags: ['Policy', 'Index', 'Board'],
        views: 234,
        downloads: 89
    },

    // Emergency Information
    {
        id: 21,
        name: 'Emergency_Procedures_Quick_Guide.pdf',
        type: 'pdf',
        size: '2.3 MB',
        folderId: 'emergency',
        description: 'Quick reference guide for all emergency procedures - PRINT AND KEEP HANDY',
        uploadDate: '2025-01-10T08:00:00Z',
        uploadedBy: 'Robert Martinez',
        version: '3.0',
        tags: ['Emergency', 'Safety', 'Important'],
        views: 456,
        downloads: 312,
        priority: 'high',
        printable: true
    },
    {
        id: 22,
        name: 'Evacuation_Floor_Plans_All_Floors.pdf',
        type: 'pdf',
        size: '8.9 MB',
        folderId: 'emergency',
        description: 'Detailed evacuation plans for all floors with assembly points',
        uploadDate: '2024-09-15T10:30:00Z',
        uploadedBy: 'Fire Safety Officer',
        version: '2.0',
        tags: ['Evacuation', 'Floor Plans', 'Safety'],
        views: 345,
        downloads: 234
    },
    {
        id: 23,
        name: 'Emergency_Vendor_Contacts_2025.xlsx',
        type: 'excel',
        size: '125 KB',
        folderId: 'emergency',
        description: '24/7 emergency vendor contact list with response times',
        uploadDate: '2025-01-01T00:01:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '1.0',
        tags: ['Vendors', 'Emergency', 'Contacts'],
        views: 234,
        downloads: 145,
        updated: 'quarterly'
    },

    // Financial Documents
    {
        id: 24,
        name: 'Budget_2025_Approved.pdf',
        type: 'pdf',
        size: '1.9 MB',
        folderId: 'financial',
        description: 'Board-approved operating and reserve budget for 2025',
        uploadDate: '2024-12-28T10:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Budget', '2025', 'Financial'],
        views: 378,
        downloads: 156
    },
    {
        id: 25,
        name: 'Reserve_Fund_Study_2024.pdf',
        type: 'pdf',
        size: '6.7 MB',
        folderId: 'financial',
        description: 'Comprehensive 25-year reserve fund study by Morrison Hershfield',
        uploadDate: '2024-08-20T09:00:00Z',
        uploadedBy: 'External Consultant',
        version: '1.0',
        tags: ['Reserve Fund', 'Study', 'Engineering'],
        views: 298,
        downloads: 112,
        professional: true
    },
    {
        id: 26,
        name: 'Financial_Statements_Q3_2024.pdf',
        type: 'pdf',
        size: '1.2 MB',
        folderId: 'financial',
        description: 'Quarterly financial statements for Q3 2024',
        uploadDate: '2024-10-15T11:00:00Z',
        uploadedBy: 'Patricia Williams',
        version: '1.0',
        tags: ['Financial', 'Q3', '2024'],
        views: 189,
        downloads: 78
    },

    // Insurance Documents
    {
        id: 27,
        name: 'Insurance_Policy_Summary_2025.pdf',
        type: 'pdf',
        size: '890 KB',
        folderId: 'insurance',
        description: 'Summary of building insurance coverage for residents',
        uploadDate: '2025-01-02T10:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '1.0',
        tags: ['Insurance', '2025', 'Summary'],
        views: 412,
        downloads: 234,
        important: true
    },
    {
        id: 28,
        name: 'Insurance_Certificate_2025.pdf',
        type: 'pdf',
        size: '345 KB',
        folderId: 'insurance',
        description: 'Certificate of insurance for mortgage/lease requirements',
        uploadDate: '2025-01-02T10:30:00Z',
        uploadedBy: 'Insurance Broker',
        version: '1.0',
        tags: ['Certificate', 'Insurance', 'Official'],
        views: 356,
        downloads: 189
    },

    // Forms
    {
        id: 29,
        name: 'Move_In_Out_Form_2025.docx',
        type: 'word',
        size: '98 KB',
        folderId: 'forms',
        description: 'Required form for scheduling moves and elevator reservations',
        uploadDate: '2024-12-01T09:00:00Z',
        uploadedBy: 'Emma Davis',
        version: '3.0',
        tags: ['Form', 'Moving', 'Fillable'],
        views: 567,
        downloads: 345,
        fillable: true
    },
    {
        id: 30,
        name: 'Pet_Registration_Form.pdf',
        type: 'pdf',
        size: '156 KB',
        folderId: 'forms',
        description: 'Mandatory pet registration form with photo requirements',
        uploadDate: '2024-11-01T10:00:00Z',
        uploadedBy: 'Sarah Johnson',
        version: '2.0',
        tags: ['Pet', 'Registration', 'Form'],
        views: 234,
        downloads: 123
    },
    {
        id: 31,
        name: 'Bicycle_Storage_Application.pdf',
        type: 'pdf',
        size: '87 KB',
        folderId: 'forms',
        description: 'Application for bicycle storage locker assignment',
        uploadDate: '2024-09-15T14:00:00Z',
        uploadedBy: 'Robert Martinez',
        version: '1.0',
        tags: ['Bicycle', 'Storage', 'Application'],
        views: 189,
        downloads: 67
    },

    // Maintenance Records
    {
        id: 32,
        name: 'Preventive_Maintenance_Schedule_2025.xlsx',
        type: 'excel',
        size: '234 KB',
        folderId: 'maintenance',
        description: 'Complete preventive maintenance schedule for all building systems',
        uploadDate: '2024-12-20T11:00:00Z',
        uploadedBy: 'Robert Martinez',
        version: '1.0',
        tags: ['Maintenance', 'Schedule', '2025'],
        views: 145,
        downloads: 56,
        restricted: true
    },
    {
        id: 33,
        name: 'Roof_Inspection_Report_2024.pdf',
        type: 'pdf',
        size: '4.5 MB',
        folderId: 'maintenance',
        description: 'Annual roof inspection report with photos and recommendations',
        uploadDate: '2024-10-30T09:30:00Z',
        uploadedBy: 'External Inspector',
        version: '1.0',
        tags: ['Roof', 'Inspection', 'Report'],
        views: 123,
        downloads: 34,
        photos: true,
        restricted: true
    }
];

// Mock extended absences data
const EXTENDED_ABSENCES = [
    // Current Active Absences
    {
        id: 1,
        title: "Winter Vacation in Florida",
        reason: "Vacation",
        startDate: "2024-12-20",
        endDate: "2025-01-10",
        emergencyContact: "Sarah Johnson",
        emergencyPhone: "(555) 123-4567",
        emergencyRelation: "Daughter",
        monitoringRequested: true,
        monitoringFrequency: "Weekly",
        keyAccess: true,
        specialInstructions: "Please check that heating is working properly during cold snaps. Water plants on balcony weekly.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "active",
        createdAt: "2024-12-15T10:00:00Z",
        userId: 5
    },
    {
        id: 2,
        title: "Business Conference - Toronto",
        reason: "Business Travel",
        startDate: "2024-12-28",
        endDate: "2025-01-03",
        emergencyContact: "Michael Chen",
        emergencyPhone: "(555) 987-6543",
        emergencyRelation: "Colleague",
        monitoringRequested: false,
        monitoringFrequency: null,
        keyAccess: false,
        specialInstructions: "",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: false
        },
        status: "active",
        createdAt: "2024-12-20T14:30:00Z",
        userId: 6
    },
    {
        id: 3,
        title: "Extended Medical Leave",
        reason: "Medical Leave",
        startDate: "2024-12-15",
        endDate: "2025-02-15",
        emergencyContact: "Emma Rodriguez",
        emergencyPhone: "(555) 234-5678",
        emergencyRelation: "Daughter",
        monitoringRequested: true,
        monitoringFrequency: "Daily",
        keyAccess: true,
        specialInstructions: "Medical recovery period. Please check on mail daily and ensure heating stays between 20-22°C.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "active",
        createdAt: "2024-12-10T16:20:00Z",
        userId: 4
    },

    // Upcoming Absences
    {
        id: 4,
        title: "Family Visit - Vancouver",
        reason: "Family Visit",
        startDate: "2025-01-15",
        endDate: "2025-02-28",
        emergencyContact: "David Park",
        emergencyPhone: "(555) 456-7890",
        emergencyRelation: "Brother",
        monitoringRequested: true,
        monitoringFrequency: "Bi-weekly",
        keyAccess: true,
        specialInstructions: "Please water the plants in the living room every week. Cat will be with pet sitter.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "upcoming",
        createdAt: "2024-12-10T09:15:00Z",
        userId: 7
    },
    {
        id: 5,
        title: "Spring Break Trip - Mexico",
        reason: "Vacation",
        startDate: "2025-03-10",
        endDate: "2025-03-20",
        emergencyContact: "Jennifer Martinez",
        emergencyPhone: "(555) 345-6789",
        emergencyRelation: "Sister",
        monitoringRequested: false,
        monitoringFrequency: null,
        keyAccess: false,
        specialInstructions: "",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: true
        },
        status: "upcoming",
        createdAt: "2024-12-22T11:30:00Z",
        userId: 8
    },
    {
        id: 6,
        title: "Work Assignment - London UK",
        reason: "Business Travel",
        startDate: "2025-02-01",
        endDate: "2025-04-30",
        emergencyContact: "James Wilson",
        emergencyPhone: "+44-20-7946-0958",
        emergencyRelation: "Manager",
        monitoringRequested: true,
        monitoringFrequency: "Weekly",
        keyAccess: true,
        specialInstructions: "3-month work assignment. Please ensure all mail is collected and apartment stays well-ventilated.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "upcoming",
        createdAt: "2024-12-18T14:45:00Z",
        userId: 9
    },
    {
        id: 7,
        title: "Summer Cottage Stay",
        reason: "Temporary Relocation",
        startDate: "2025-06-01",
        endDate: "2025-08-31",
        emergencyContact: "Robert Chen",
        emergencyPhone: "(555) 567-8901",
        emergencyRelation: "Son",
        monitoringRequested: true,
        monitoringFrequency: "Bi-weekly",
        keyAccess: false,
        specialInstructions: "Spending summer at cottage. No key access needed - just external checks.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "upcoming",
        createdAt: "2024-12-20T10:15:00Z",
        userId: 2
    },

    // Past/Completed Absences
    {
        id: 8,
        title: "Thanksgiving Visit - Montreal",
        reason: "Family Visit",
        startDate: "2024-11-28",
        endDate: "2024-12-05",
        emergencyContact: "Marie Dubois",
        emergencyPhone: "(514) 555-0123",
        emergencyRelation: "Mother",
        monitoringRequested: false,
        monitoringFrequency: null,
        keyAccess: false,
        specialInstructions: "",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: true
        },
        status: "completed",
        createdAt: "2024-11-20T13:20:00Z",
        userId: 3
    },
    {
        id: 9,
        title: "Medical Treatment - Seattle",
        reason: "Medical Leave",
        startDate: "2024-11-01",
        endDate: "2024-11-25",
        emergencyContact: "Linda Wilson",
        emergencyPhone: "(555) 321-9876",
        emergencyRelation: "Sister",
        monitoringRequested: true,
        monitoringFrequency: "Daily",
        keyAccess: true,
        specialInstructions: "Surgery recovery. Daily checks essential for medication delivery.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "completed",
        createdAt: "2024-10-25T16:45:00Z",
        userId: 8
    },
    {
        id: 10,
        title: "European Vacation",
        reason: "Vacation",
        startDate: "2024-09-15",
        endDate: "2024-10-05",
        emergencyContact: "Robert Thompson",
        emergencyPhone: "(555) 789-0123",
        emergencyRelation: "Friend",
        monitoringRequested: false,
        monitoringFrequency: null,
        keyAccess: false,
        specialInstructions: "",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: true
        },
        status: "completed",
        createdAt: "2024-09-01T11:20:00Z",
        userId: 9
    },
    {
        id: 11,
        title: "Summer Vacation - Italy",
        reason: "Vacation",
        startDate: "2024-08-10",
        endDate: "2024-08-25",
        emergencyContact: "Anna Rossi",
        emergencyPhone: "+39-06-1234-5678",
        emergencyRelation: "Tour Guide",
        monitoringRequested: true,
        monitoringFrequency: "Weekly",
        keyAccess: true,
        specialInstructions: "Water plants twice a week. Leave lights on timer.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: true
        },
        status: "completed",
        createdAt: "2024-07-28T09:30:00Z",
        userId: 5
    },
    {
        id: 12,
        title: "Business Trip - Japan",
        reason: "Business Travel",
        startDate: "2024-10-20",
        endDate: "2024-11-10",
        emergencyContact: "Hiroshi Tanaka",
        emergencyPhone: "+81-3-1234-5678",
        emergencyRelation: "Business Partner",
        monitoringRequested: true,
        monitoringFrequency: "Bi-weekly",
        keyAccess: false,
        specialInstructions: "Business conference and client meetings. External monitoring only.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "completed",
        createdAt: "2024-10-05T15:10:00Z",
        userId: 6
    },

    // Cancelled Absence
    {
        id: 13,
        title: "Christmas Trip - Cancelled",
        reason: "Vacation",
        startDate: "2024-12-22",
        endDate: "2025-01-02",
        emergencyContact: "Sarah Miller",
        emergencyPhone: "(555) 678-9012",
        emergencyRelation: "Sister",
        monitoringRequested: true,
        monitoringFrequency: "Weekly",
        keyAccess: true,
        specialInstructions: "Trip cancelled due to family emergency.",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: true,
            securityCheck: true,
            mailHold: true
        },
        status: "cancelled",
        createdAt: "2024-12-05T12:00:00Z",
        userId: 7
    },

    // Board Member Absence (User ID 2 is board member)
    {
        id: 14,
        title: "Board Conference - Calgary",
        reason: "Business Travel",
        startDate: "2025-01-20",
        endDate: "2025-01-25",
        emergencyContact: "Patricia Wong",
        emergencyPhone: "(555) 890-1234",
        emergencyRelation: "Spouse",
        monitoringRequested: false,
        monitoringFrequency: null,
        keyAccess: false,
        specialInstructions: "",
        safetyChecklist: {
            waterTaps: true,
            appliances: true,
            hvacAdjusted: false,
            securityCheck: true,
            mailHold: false
        },
        status: "upcoming",
        createdAt: "2024-12-22T08:45:00Z",
        userId: 2
    }
];

// Mock Tasks Data
const TASKS = [
    {
        id: 1,
        title: "Annual Fire Safety Inspection",
        description: "Schedule and conduct annual fire safety inspection for all units and common areas. Calgary Fire Department requires full building inspection including fire extinguishers, emergency exits, alarm systems, and sprinkler systems.",
        priority: "high",
        status: "in-progress",
        assignee: "Robert Martinez",
        dueDate: "2025-01-31",
        category: "Safety",
        createdAt: "2024-12-15T09:00:00Z",
        updatedAt: "2025-01-10T14:30:00Z",
        completedTasks: ["Scheduled with Fire Department", "Notified all residents"],
        pendingTasks: ["Complete common area inspection", "Test all alarm panels", "Document deficiencies"],
        attachments: ["Fire_Inspection_Checklist.pdf", "CFD_Requirements_2025.pdf"],
        progress: 40
    },
    {
        id: 2,
        title: "HVAC System Maintenance",
        description: "Schedule routine maintenance for building HVAC systems. Includes filter replacements, coil cleaning, and system diagnostics for all rooftop units.",
        priority: "medium",
        status: "pending",
        assignee: "Emma Davis",
        dueDate: "2025-02-15",
        category: "Maintenance",
        createdAt: "2024-12-20T14:30:00Z",
        updatedAt: "2024-12-20T14:30:00Z",
        completedTasks: [],
        pendingTasks: ["Contact HVAC contractor", "Schedule maintenance window", "Notify affected floors"],
        estimatedCost: "$8,500",
        progress: 0
    },
    {
        id: 3,
        title: "Resident Welcome Package Update",
        description: "Update welcome packages for new residents with current information including updated amenity hours, emergency procedures, and building policies.",
        priority: "low",
        status: "completed",
        assignee: "Sarah Johnson",
        dueDate: "2024-12-10",
        category: "Administrative",
        createdAt: "2024-12-01T11:00:00Z",
        updatedAt: "2024-12-10T16:00:00Z",
        completedTasks: ["Updated contact information", "Revised amenity rules", "Added QR codes for digital access", "Printed 50 packages"],
        pendingTasks: [],
        completionDate: "2024-12-10",
        progress: 100
    },
    {
        id: 4,
        title: "Parking Garage Lighting Upgrade",
        description: "Replace outdated fluorescent lighting fixtures in parking garage with energy-efficient LED alternatives. Project includes all 3 parking levels and entrance/exit areas.",
        priority: "medium",
        status: "pending",
        assignee: "James Wilson",
        dueDate: "2025-03-01",
        category: "Maintenance",
        createdAt: "2024-12-18T16:45:00Z",
        updatedAt: "2025-01-05T10:00:00Z",
        completedTasks: ["Energy audit completed", "LED fixtures selected"],
        pendingTasks: ["Obtain board approval", "Schedule installation", "Coordinate with electrical contractor"],
        estimatedCost: "$25,000",
        energySavings: "40% reduction in lighting costs",
        progress: 25
    },
    {
        id: 5,
        title: "Emergency Contact List Update",
        description: "Verify and update emergency contact information for all residents. Critical for emergency response and building evacuations.",
        priority: "high",
        status: "in-progress",
        assignee: "Emma Davis",
        dueDate: "2025-01-15",
        category: "Safety",
        createdAt: "2024-12-22T10:20:00Z",
        updatedAt: "2025-01-12T09:15:00Z",
        completedTasks: ["Sent update request to all residents", "Updated 75% of records"],
        pendingTasks: ["Follow up with non-respondents", "Update emergency binder", "Distribute to concierge"],
        unitsCompleted: 215,
        totalUnits: 286,
        progress: 75
    },
    {
        id: 6,
        title: "Pool Deck Resurfacing",
        description: "Complete resurfacing of pool deck area. Address cracking and improve slip resistance. Must be completed before summer season.",
        priority: "high",
        status: "pending",
        assignee: "Robert Martinez",
        dueDate: "2025-04-30",
        category: "Maintenance",
        createdAt: "2025-01-08T11:30:00Z",
        updatedAt: "2025-01-08T11:30:00Z",
        completedTasks: [],
        pendingTasks: ["Get contractor quotes", "Select materials", "Schedule during pool closure", "Notify residents"],
        estimatedCost: "$35,000",
        progress: 0
    },
    {
        id: 7,
        title: "Security Camera Upgrade - Phase 2",
        description: "Install additional cameras in blind spots identified in security audit. Upgrade NVR system to handle increased camera load.",
        priority: "high",
        status: "in-progress",
        assignee: "James Wilson",
        dueDate: "2025-01-25",
        category: "Security",
        createdAt: "2024-11-20T13:00:00Z",
        updatedAt: "2025-01-10T15:45:00Z",
        completedTasks: ["Board approval obtained", "Contractor selected", "Equipment ordered", "Parking garage cameras installed"],
        pendingTasks: ["Install lobby cameras", "Configure NVR system", "Test all cameras", "Train staff"],
        progress: 60
    },
    {
        id: 8,
        title: "Implement Recycling Education Program",
        description: "Develop and implement comprehensive recycling education program to improve building's waste diversion rate.",
        priority: "low",
        status: "pending",
        assignee: "Sarah Johnson",
        dueDate: "2025-02-28",
        category: "Environmental",
        createdAt: "2025-01-05T14:20:00Z",
        updatedAt: "2025-01-05T14:20:00Z",
        completedTasks: [],
        pendingTasks: ["Create educational materials", "Schedule information sessions", "Install new signage", "Monitor compliance"],
        targetDiversionRate: "70%",
        currentDiversionRate: "45%",
        progress: 0
    },
    {
        id: 9,
        title: "Lobby Furniture Replacement",
        description: "Replace aging lobby furniture with modern, durable pieces that match recent renovation aesthetic.",
        priority: "low",
        status: "completed",
        assignee: "Sarah Johnson",
        dueDate: "2024-11-30",
        category: "Aesthetic",
        createdAt: "2024-10-15T10:00:00Z",
        updatedAt: "2024-11-28T17:00:00Z",
        completedTasks: ["Design approved", "Furniture ordered", "Old furniture removed", "New furniture installed"],
        pendingTasks: [],
        completionDate: "2024-11-28",
        finalCost: "$18,500",
        progress: 100
    },
    {
        id: 10,
        title: "Window Washing Contract Renewal",
        description: "Review and negotiate renewal of window washing contract. Current contract expires end of January.",
        priority: "medium",
        status: "in-progress",
        assignee: "Sarah Johnson",
        dueDate: "2025-01-20",
        category: "Contracts",
        createdAt: "2025-01-02T09:00:00Z",
        updatedAt: "2025-01-11T11:30:00Z",
        completedTasks: ["RFP sent to 4 vendors", "Received 3 quotes"],
        pendingTasks: ["Compare proposals", "Check references", "Present to board", "Execute contract"],
        currentVendor: "Crystal Clear Windows",
        progress: 50
    },
    {
        id: 11,
        title: "EV Charging Station Installation",
        description: "Install 10 Level 2 EV charging stations in visitor parking area as approved in AGM.",
        priority: "medium",
        status: "pending",
        assignee: "Robert Martinez",
        dueDate: "2025-05-31",
        category: "Infrastructure",
        createdAt: "2024-10-25T14:00:00Z",
        updatedAt: "2024-10-25T14:00:00Z",
        completedTasks: [],
        pendingTasks: ["Electrical capacity study", "Select charging equipment", "Apply for permits", "Install infrastructure", "Set up payment system"],
        estimatedCost: "$85,000",
        rebatesAvailable: "$25,000 from city program",
        progress: 0
    },
    {
        id: 12,
        title: "Update Emergency Evacuation Plan",
        description: "Review and update building emergency evacuation plan. Conduct drill with Fire Department.",
        priority: "high",
        status: "pending",
        assignee: "Robert Martinez",
        dueDate: "2025-02-15",
        category: "Safety",
        createdAt: "2025-01-10T08:00:00Z",
        updatedAt: "2025-01-10T08:00:00Z",
        completedTasks: [],
        pendingTasks: ["Review current plan", "Update floor wardens list", "Create new evacuation maps", "Schedule drill", "Train staff"],
        lastDrillDate: "2024-03-15",
        progress: 0
    }
];

// Mock Milestones Data
const MILESTONES = [
    {
        id: 1,
        title: "Building Construction Completed",
        description: "Point on the Bow construction and initial occupancy. 286 luxury units with premium amenities in the heart of Calgary's Eau Claire district.",
        date: "2020-06-15",
        category: "Building",
        progress: 100,
        status: "completed",
        impact: "286 families moved into their new homes",
        celebration: "Grand opening ceremony with Mayor Nenshi",
        media: ["grand_opening_photo.jpg", "construction_timelapse.mp4"]
    },
    {
        id: 2,
        title: "First Year Anniversary",
        description: "Celebrating one year of successful operation with 98% occupancy rate and high resident satisfaction.",
        date: "2021-06-15",
        category: "Community",
        progress: 100,
        status: "completed",
        impact: "Established strong community culture",
        celebration: "Rooftop BBQ party for all residents",
        achievements: ["Zero major incidents", "98% occupancy", "4.8/5 resident satisfaction"]
    },
    {
        id: 3,
        title: "Green Building Certification",
        description: "Achieved LEED Gold certification for sustainable building practices including energy efficiency, water conservation, and indoor air quality.",
        date: "2022-03-20",
        category: "Sustainability",
        progress: 100,
        status: "completed",
        impact: "25% reduction in energy costs, 30% water savings",
        features: ["High-efficiency HVAC", "LED lighting throughout", "Water-saving fixtures", "Recycling program"],
        certificationScore: "68/110 points"
    },
    {
        id: 4,
        title: "Community Center Opening",
        description: "Grand opening of the fully renovated community center featuring party room, business center, and games room.",
        date: "2023-09-10",
        category: "Amenities",
        progress: 100,
        status: "completed",
        impact: "300% increase in community events",
        features: ["100-person party room", "Full catering kitchen", "Business center with private offices", "Games room with billiards"],
        totalInvestment: "$1.2 million"
    },
    {
        id: 5,
        title: "Lobby Renovation Completed",
        description: "Complete transformation of main lobby with modern design, enhanced security, and improved accessibility.",
        date: "2024-08-15",
        category: "Building",
        progress: 100,
        status: "completed",
        impact: "Enhanced building prestige and property values",
        features: ["24/7 concierge desk", "Smart parcel lockers", "Art installations", "Accessible entrance"],
        designAward: "2024 Calgary Design Excellence Award"
    },
    {
        id: 6,
        title: "100% Reserve Fund Target",
        description: "Achieved full funding of reserve fund as recommended by engineering study.",
        date: "2024-12-31",
        category: "Financial",
        progress: 100,
        status: "completed",
        impact: "Strong financial position for future repairs",
        fundBalance: "$4.2 million",
        nextMajorProject: "Roof replacement in 2027"
    },
    {
        id: 7,
        title: "5th Anniversary Celebration",
        description: "Planning for 5th anniversary community celebration with special events throughout June 2025.",
        date: "2025-06-15",
        category: "Community",
        progress: 35,
        status: "in-progress",
        plannedEvents: ["Gala dinner", "Kids carnival", "Pet parade", "Time capsule ceremony", "Charity fundraiser"],
        budget: "$50,000",
        committee: ["Michael Chen", "Patricia Williams", "Sarah Johnson"]
    },
    {
        id: 8,
        title: "Solar Panel Installation",
        description: "Installation of 500kW solar panel system on roof to reduce carbon footprint and energy costs.",
        date: "2025-08-30",
        category: "Sustainability",
        progress: 15,
        status: "in-progress",
        impact: "Projected 40% reduction in common area electricity costs",
        phases: ["Feasibility study (complete)", "Design phase (in progress)", "Permitting", "Installation"],
        paybackPeriod: "7 years",
        carbonReduction: "200 tons CO2/year"
    },
    {
        id: 9,
        title: "Electric Vehicle Ready",
        description: "Complete installation of EV charging infrastructure in visitor parking.",
        date: "2025-05-31",
        category: "Infrastructure",
        progress: 0,
        status: "planned",
        impact: "Support for sustainable transportation",
        specifications: ["10 Level 2 chargers", "2 DC fast chargers", "Smart payment system", "Reserved EV parking"],
        governmentGrant: "$25,000 approved"
    },
    {
        id: 10,
        title: "Smart Building Upgrade",
        description: "Implement IoT sensors and building automation for enhanced efficiency and resident experience.",
        date: "2026-03-31",
        category: "Technology",
        progress: 0,
        status: "planned",
        impact: "20% energy savings, predictive maintenance",
        features: ["Smart thermostats", "Occupancy sensors", "Predictive maintenance", "Mobile app integration"],
        vendor: "To be selected"
    },
    {
        id: 11,
        title: "Roof Replacement Project",
        description: "Major capital project to replace building roof system as per reserve fund study.",
        date: "2027-09-30",
        category: "Infrastructure",
        progress: 0,
        status: "planned",
        impact: "Ensure building envelope integrity for next 25 years",
        scope: ["Complete tear-off", "New membrane system", "Enhanced insulation", "Green roof sections"],
        estimatedCost: "$1.8 million",
        fundingSource: "Reserve fund"
    },
    {
        id: 12,
        title: "10th Anniversary Vision",
        description: "Planning for the building's 10th anniversary and next decade vision.",
        date: "2030-06-15",
        category: "Community",
        progress: 0,
        status: "planned",
        visionThemes: ["Net-zero energy", "Age-friendly community", "Smart city integration", "Community resilience"],
        targetAchievements: ["Carbon neutral operations", "95% resident satisfaction", "Zero deferred maintenance"]
    }
];

// Mock Sponsored Services Data
const SPONSORED_SERVICES = [
    {
        id: 1,
        name: "Sparkle & Shine Cleaning Services",
        description: "Professional residential cleaning services with eco-friendly products. Trusted by Point on the Bow residents since 2021.",
        icon: "fas fa-broom",
        contact: "(403) 555-2847",
        email: "info@sparkleshine.ca",
        website: "www.sparkleshine.ca",
        features: [
            "Weekly/bi-weekly regular cleaning",
            "Deep cleaning services",
            "Move-in/move-out cleaning",
            "Post-construction cleanup",
            "Green cleaning products only",
            "Bonded and insured staff"
        ],
        pricing: {
            "1 Bedroom": "$120-150",
            "2 Bedroom": "$150-180",
            "3 Bedroom": "$180-220",
            "Deep Clean": "+50%"
        },
        discount: "10% off first cleaning for Point on the Bow residents",
        availability: "Monday-Saturday, 8 AM - 6 PM",
        rating: 4.8,
        reviews: 45,
        category: "Cleaning"
    },
    {
        id: 2,
        name: "Elite Auto Spa",
        description: "Luxury automotive detailing and maintenance services. We come to you in the Point on the Bow parkade!",
        icon: "fas fa-car",
        contact: "(403) 555-3695",
        email: "book@eliteautospa.ca",
        website: "www.eliteautospa.ca",
        features: [
            "Full interior detailing",
            "Exterior wash, clay bar & wax",
            "Paint correction & ceramic coating",
            "Leather conditioning & protection",
            "Engine bay cleaning",
            "Headlight restoration",
            "Mobile service to your parking spot"
        ],
        pricing: {
            "Express Wash": "$40",
            "Full Detail": "$200-300",
            "Ceramic Coating": "$800-1200",
            "Monthly Plans": "Starting at $99"
        },
        discount: "15% off ceramic coating packages",
        availability: "7 days a week, 8 AM - 8 PM",
        rating: 4.9,
        reviews: 78,
        category: "Automotive"
    },
    {
        id: 3,
        name: "Happy Tails Pet Services",
        description: "Calgary's most trusted pet care professionals. Licensed, bonded, and passionate about your furry friends!",
        icon: "fas fa-dog",
        contact: "(403) 555-7284",
        email: "woof@happytailscalgary.com",
        website: "www.happytailscalgary.com",
        features: [
            "Individual dog walks (30/45/60 min)",
            "Group walks in nearby parks",
            "In-home pet sitting",
            "Pet taxi to vet/groomer",
            "Medication administration",
            "Puppy socialization walks",
            "Cat care visits",
            "Emergency/holiday care"
        ],
        pricing: {
            "30-min walk": "$25",
            "60-min walk": "$40",
            "Pet sitting": "$60/day",
            "Overnight care": "$85/night"
        },
        discount: "Free meet & greet, 10% off monthly packages",
        availability: "365 days a year, 7 AM - 9 PM",
        rating: 5.0,
        reviews: 112,
        category: "Pet Services"
    },
    {
        id: 4,
        name: "Calgary Elite Transportation",
        description: "Premium transportation services exclusively for Point on the Bow residents. Professional, punctual, and luxurious.",
        icon: "fas fa-taxi",
        contact: "(403) 555-RIDE (7433)",
        email: "dispatch@calgaryelite.com",
        website: "www.calgaryelite.com",
        features: [
            "Airport transfers (YYC)",
            "Corporate transportation",
            "Special event service",
            "Medical appointments",
            "Shopping trips",
            "Wine tours",
            "Mountain excursions",
            "24/7 availability"
        ],
        fleetOptions: [
            "Luxury sedans (BMW, Mercedes)",
            "SUVs (Cadillac Escalade)",
            "Executive vans",
            "Stretch limousines"
        ],
        pricing: {
            "Airport (one-way)": "$65-85",
            "Hourly rate": "$75-120",
            "Mountain trips": "Quote on request"
        },
        discount: "10% off for Point on the Bow residents",
        availability: "24/7 with advance booking",
        rating: 4.7,
        reviews: 89,
        category: "Transportation"
    },
    {
        id: 5,
        name: "The Pampered Chef Catering",
        description: "Gourmet meal delivery and private chef services. From intimate dinners to large parties in your suite or party room.",
        icon: "fas fa-utensils",
        contact: "(403) 555-3425",
        email: "chef@pamperedchefyyc.com",
        website: "www.pamperedchefyyc.com",
        features: [
            "Weekly meal prep delivery",
            "Private chef for dinner parties",
            "Party room catering",
            "Cooking classes in your home",
            "Special dietary accommodations",
            "Wine pairing services",
            "Holiday meal packages"
        ],
        pricing: {
            "Meal prep": "$15-25/meal",
            "Private chef": "$300-500/event",
            "Catering": "$40-80/person"
        },
        cuisineTypes: ["French", "Italian", "Asian Fusion", "Plant-based", "Keto/Paleo"],
        discount: "Free dessert with first order over $200",
        availability: "Tuesday-Sunday",
        rating: 4.9,
        reviews: 67,
        category: "Food Services"
    },
    {
        id: 6,
        name: "TechAssist Home Services",
        description: "In-home technology setup, support, and training. Specializing in smart home integration for seniors.",
        icon: "fas fa-laptop",
        contact: "(403) 555-8324",
        email: "help@techassistcalgary.ca",
        website: "www.techassistcalgary.ca",
        features: [
            "Smart TV setup & training",
            "Computer/tablet support",
            "WiFi troubleshooting",
            "Smart home device installation",
            "Printer setup & support",
            "Data backup services",
            "Video calling setup for families",
            "Cybersecurity consultations"
        ],
        pricing: {
            "Service call": "$80/hour",
            "Monthly support": "$150",
            "Device setup": "$60-120"
        },
        specialOffers: ["Free phone consultation", "Senior discount 20%"],
        availability: "Monday-Friday 9 AM - 7 PM, Saturday 10 AM - 4 PM",
        rating: 4.8,
        reviews: 34,
        category: "Technology"
    },
    {
        id: 7,
        name: "Zen Wellness Mobile Spa",
        description: "Bringing the spa experience to your home. Massage, facials, and wellness treatments in the comfort of your suite.",
        icon: "fas fa-spa",
        contact: "(403) 555-9362",
        email: "relax@zenwellnessmobile.ca",
        website: "www.zenwellnessmobile.ca",
        features: [
            "Swedish & deep tissue massage",
            "Hot stone therapy",
            "Reflexology",
            "Facials & skincare",
            "Couples massage",
            "Prenatal massage",
            "Reiki & energy healing",
            "Yoga & meditation sessions"
        ],
        pricing: {
            "60-min massage": "$120",
            "90-min massage": "$170",
            "Facial": "$95-150",
            "Packages": "10% off 5+ sessions"
        },
        therapists: "All RMTs and certified estheticians",
        availability: "7 days a week, 9 AM - 9 PM",
        rating: 5.0,
        reviews: 92,
        category: "Wellness"
    },
    {
        id: 8,
        name: "Handy Helper Services",
        description: "Your building-approved handyman service for all minor repairs and installations. Quick, reliable, and affordable.",
        icon: "fas fa-tools",
        contact: "(403) 555-4265",
        email: "fix@handyhelperyyc.com",
        website: "www.handyhelperyyc.com",
        features: [
            "Picture & TV mounting",
            "Furniture assembly",
            "Closet organization",
            "Minor electrical work",
            "Plumbing repairs",
            "Caulking & weatherstripping",
            "Door & window adjustments",
            "Holiday decoration installation"
        ],
        pricing: {
            "Service call": "$65",
            "Hourly rate": "$45",
            "TV mounting": "$120-180"
        },
        certifications: ["Licensed", "Insured", "WCB covered"],
        availability: "Monday-Saturday, 8 AM - 6 PM",
        rating: 4.7,
        reviews: 156,
        category: "Home Services"
    }
];

// Mock Taxi Requests Data
const TAXI_REQUESTS = [
    {
        id: 1,
        userId: 7,
        userName: "John Doe",
        unitNumber: "1205",
        pickupDate: "2025-01-15",
        pickupTime: "08:00",
        destination: "Calgary International Airport (YYC)",
        returnTrip: false,
        numberOfPassengers: 2,
        specialRequirements: "Early morning pickup, need space for 2 large suitcases. Flight AC102 to Toronto at 10:30 AM.",
        vehiclePreference: "SUV",
        status: "confirmed",
        confirmationNumber: "PTB-2025-0115",
        driverName: "Michael Thompson",
        driverPhone: "(403) 555-8899",
        vehicleDetails: "Black Cadillac Escalade - License: ABC 123",
        estimatedFare: "$75",
        createdAt: "2025-01-10T14:30:00Z",
        confirmedAt: "2025-01-10T16:15:00Z"
    },
    {
        id: 2,
        userId: 8,
        userName: "Jane Smith",
        unitNumber: "805",
        pickupDate: "2025-01-20",
        pickupTime: "19:30",
        destination: "Teatro Restaurant - 200 8th Ave SE",
        returnTrip: true,
        returnTime: "22:30",
        numberOfPassengers: 4,
        specialRequirements: "Anniversary dinner reservation at 8 PM. Need luxury sedan. Return pickup at 10:30 PM.",
        vehiclePreference: "Luxury Sedan",
        status: "confirmed",
        confirmationNumber: "PTB-2025-0120",
        driverName: "David Chen",
        driverPhone: "(403) 555-7766",
        vehicleDetails: "Silver Mercedes S-Class - License: LUX 456",
        estimatedFare: "$120 (round trip)",
        createdAt: "2025-01-12T16:45:00Z",
        confirmedAt: "2025-01-13T09:00:00Z"
    },
    {
        id: 3,
        userId: 9,
        userName: "Demo User",
        unitNumber: "1001",
        pickupDate: "2025-01-08",
        pickupTime: "06:00",
        destination: "Calgary International Airport (YYC)",
        returnTrip: false,
        numberOfPassengers: 1,
        specialRequirements: "International flight to London, need to arrive by 6:45 AM. One carry-on only.",
        vehiclePreference: "Any",
        status: "completed",
        confirmationNumber: "PTB-2025-0108",
        driverName: "Robert Martinez",
        driverPhone: "(403) 555-3344",
        vehicleDetails: "Black BMW 5 Series - License: BMW 789",
        actualFare: "$68",
        estimatedFare: "$65",
        tripDuration: "25 minutes",
        createdAt: "2025-01-05T09:20:00Z",
        confirmedAt: "2025-01-05T11:00:00Z",
        completedAt: "2025-01-08T06:25:00Z",
        rating: 5,
        feedback: "Excellent service! Driver was punctual and professional."
    },
    {
        id: 4,
        userId: 2,
        userName: "Michael Chen",
        unitNumber: "2501",
        pickupDate: "2025-01-18",
        pickupTime: "14:00",
        destination: "Foothills Medical Centre - 1403 29 St NW",
        returnTrip: true,
        returnTime: "16:30",
        numberOfPassengers: 1,
        specialRequirements: "Medical appointment at 2:30 PM. May need assistance with walker.",
        vehiclePreference: "Accessible Vehicle",
        status: "pending",
        confirmationNumber: null,
        createdAt: "2025-01-13T10:30:00Z"
    },
    {
        id: 5,
        userId: 3,
        userName: "Patricia Williams",
        unitNumber: "1805",
        pickupDate: "2025-01-22",
        pickupTime: "09:00",
        destination: "Chinook Centre - 6455 Macleod Trail SW",
        returnTrip: true,
        returnTime: "12:00",
        numberOfPassengers: 2,
        specialRequirements: "Shopping trip with friend. Need trunk space for packages.",
        vehiclePreference: "SUV",
        status: "pending",
        confirmationNumber: null,
        createdAt: "2025-01-13T15:20:00Z"
    },
    {
        id: 6,
        userId: 5,
        userName: "Emma Davis",
        unitNumber: "Concierge",
        pickupDate: "2025-01-05",
        pickupTime: "23:30",
        destination: "Home - 123 Bow Street SW (staff transport)",
        returnTrip: false,
        numberOfPassengers: 1,
        specialRequirements: "Late shift ending, staff safety transport as per building policy.",
        vehiclePreference: "Any",
        status: "completed",
        confirmationNumber: "PTB-2025-0105",
        driverName: "Sarah Johnson",
        driverPhone: "(403) 555-2211",
        vehicleDetails: "White Toyota Camry - License: CAB 321",
        actualFare: "$25 (Building covered)",
        createdAt: "2025-01-05T22:00:00Z",
        completedAt: "2025-01-05T23:50:00Z"
    },
    {
        id: 7,
        userId: 7,
        userName: "John Doe",
        unitNumber: "1205",
        pickupDate: "2024-12-24",
        pickupTime: "17:00",
        destination: "Mount Royal - Private Residence",
        returnTrip: false,
        numberOfPassengers: 4,
        specialRequirements: "Christmas Eve dinner with family. Bringing gifts.",
        vehiclePreference: "SUV",
        status: "completed",
        confirmationNumber: "PTB-2024-1224",
        driverName: "William Brown",
        vehicleDetails: "Red GMC Yukon - License: XMS eve",
        actualFare: "$45",
        createdAt: "2024-12-20T11:00:00Z",
        completedAt: "2024-12-24T17:20:00Z",
        rating: 5
    },
    {
        id: 8,
        userId: 4,
        userName: "Robert Martinez",
        unitNumber: "Concierge",
        pickupDate: "2025-01-25",
        pickupTime: "07:00",
        destination: "Calgary Tower - 101 9 Ave SW",
        returnTrip: false,
        numberOfPassengers: 3,
        specialRequirements: "Taking visiting family for breakfast at Sky 360. Need recommendations for tourist activities.",
        vehiclePreference: "Luxury Sedan",
        status: "pending",
        confirmationNumber: null,
        createdAt: "2025-01-14T08:45:00Z"
    },
    {
        id: 9,
        userId: 8,
        userName: "Jane Smith",
        unitNumber: "805",
        pickupDate: "2025-01-12",
        pickupTime: "13:00",
        destination: "Heritage Park - 1900 Heritage Dr SW",
        returnTrip: true,
        returnTime: "17:00",
        numberOfPassengers: 2,
        specialRequirements: "Taking grandchildren to Heritage Park. Need car seats for ages 4 and 6.",
        vehiclePreference: "SUV with car seats",
        status: "cancelled",
        confirmationNumber: "PTB-2025-0112",
        cancellationReason: "Children sick with flu",
        createdAt: "2025-01-08T14:00:00Z",
        cancelledAt: "2025-01-11T20:00:00Z"
    },
    {
        id: 10,
        userId: 9,
        userName: "Demo User",
        unitNumber: "1001",
        pickupDate: "2025-02-14",
        pickupTime: "18:30",
        destination: "River Café - Prince's Island Park",
        returnTrip: true,
        returnTime: "21:30",
        numberOfPassengers: 2,
        specialRequirements: "Valentine's Day dinner. Would like champagne in vehicle if possible. Return pickup from restaurant.",
        vehiclePreference: "Luxury Sedan",
        status: "pending",
        confirmationNumber: null,
        specialNotes: "VIP service requested",
        createdAt: "2025-01-13T19:30:00Z"
    }
];

// Mock Anonymous Tips Data
const ANONYMOUS_TIPS = [
    {
        id: 1,
        type: "concern",
        category: "Noise",
        title: "Noise Complaint - Unit 1205",
        content: "Excessive noise coming from unit 1205 during late hours. Sounds like construction or renovation work happening after 10 PM. This has been ongoing for the past week and is disturbing multiple residents on the 12th floor. The noise includes drilling, hammering, and what sounds like furniture moving.",
        location: "Floor 12",
        urgency: "high",
        status: "investigating",
        assignedTo: "Robert Martinez",
        createdAt: "2025-01-08T22:15:00Z",
        updatedAt: "2025-01-10T09:00:00Z",
        adminNotes: "Contacted unit owner. Unauthorized renovation confirmed. Cease work order issued.",
        resolution: null,
        followUpDate: "2025-01-15"
    },
    {
        id: 2,
        type: "suggestion",
        category: "Amenities",
        title: "Additional Bike Storage",
        content: "Would love to see additional bike storage options in the parking garage. Current space is often full, especially in summer months. Many residents are now using e-bikes which take up more space. Perhaps convert some of the unused storage lockers on P1?",
        location: "Parking Garage",
        urgency: "low",
        status: "under-review",
        assignedTo: "Sarah Johnson",
        createdAt: "2025-01-10T11:30:00Z",
        updatedAt: "2025-01-11T14:00:00Z",
        adminNotes: "Good suggestion. Will include in next board meeting agenda. Conducting survey of bike storage usage.",
        supportCount: 24,
        estimatedCost: "$15,000"
    },
    {
        id: 3,
        type: "feedback",
        category: "Staff",
        title: "Great Concierge Service",
        content: "The concierge team has been incredibly helpful with package deliveries and visitor management. Special thanks to Emma and James who always go above and beyond. They remember residents by name and provide exceptional service. This really makes Point on the Bow feel like home!",
        location: "Lobby",
        urgency: "low",
        status: "acknowledged",
        assignedTo: "Sarah Johnson",
        createdAt: "2025-01-12T15:45:00Z",
        updatedAt: "2025-01-12T16:30:00Z",
        adminNotes: "Wonderful feedback! Shared with concierge team. Added to their personnel files.",
        staffMentioned: ["Emma Davis", "James Wilson"],
        actionTaken: "Commendation added to employee records"
    },
    {
        id: 4,
        type: "concern",
        category: "Safety",
        title: "Parking Garage Lighting",
        content: "Some areas of the parking garage are poorly lit, especially near the elevator on P2. Safety concern for evening returns. Nearly tripped over something I couldn't see. Other residents have mentioned feeling unsafe in these dark areas.",
        location: "Parking Level P2",
        urgency: "high",
        status: "resolved",
        assignedTo: "James Wilson",
        createdAt: "2024-12-28T18:20:00Z",
        updatedAt: "2025-01-05T11:00:00Z",
        adminNotes: "Immediate action taken. All burnt out bulbs replaced. LED upgrade approved for Q1 2025.",
        resolution: "Replaced 12 burnt out bulbs on P2. Motion sensors adjusted for better coverage. Full LED upgrade scheduled for March 2025.",
        resolutionDate: "2025-01-05",
        cost: "$450 (temporary fix)"
    },
    {
        id: 5,
        type: "concern",
        category: "Security",
        title: "Suspicious Person in Lobby",
        content: "Noticed someone trying multiple apartment buzzers yesterday around 3 PM. When confronted, they said they were 'delivering flyers' but had no flyers visible. Left quickly when I mentioned calling security. Male, approximately 30s, wearing dark jacket.",
        location: "Main Lobby",
        urgency: "high",
        status: "resolved",
        assignedTo: "Robert Martinez",
        createdAt: "2025-01-09T16:30:00Z",
        updatedAt: "2025-01-10T10:00:00Z",
        adminNotes: "Reviewed security footage. Individual identified and banned from property. All staff notified.",
        resolution: "Person identified as solicitor from previous incidents. Photo distributed to all staff. No further incidents.",
        policeReportFiled: false,
        videoEvidence: true
    },
    {
        id: 6,
        type: "suggestion",
        category: "Environmental",
        title: "Composting Program",
        content: "Many buildings in Calgary now have composting programs. Would be great to add this to our waste management system. I'd be happy to help organize if there's interest. Could significantly reduce our waste and help the environment.",
        location: "Building-wide",
        urgency: "low",
        status: "under-review",
        assignedTo: "Sarah Johnson",
        createdAt: "2025-01-11T09:15:00Z",
        updatedAt: "2025-01-11T16:00:00Z",
        adminNotes: "Great environmental initiative. Researching city programs and requirements. Will survey residents.",
        supportCount: 45,
        estimatedCost: "$5,000 setup + $200/month"
    },
    {
        id: 7,
        type: "concern",
        category: "Maintenance",
        title: "Pool Temperature Too Cold",
        content: "The pool has been uncomfortably cold for the past two weeks. Several residents have mentioned it. The posted temperature says 82°F but it feels much colder. Makes it difficult for those of us who use it for therapy.",
        location: "Pool - 4th Floor",
        urgency: "medium",
        status: "investigating",
        assignedTo: "Emma Davis",
        createdAt: "2025-01-12T07:30:00Z",
        updatedAt: "2025-01-13T11:00:00Z",
        adminNotes: "Confirmed temperature at 78°F, not 82°F as posted. Heater inspection scheduled for tomorrow.",
        maintenanceTicket: "MT-2025-0142"
    },
    {
        id: 8,
        type: "feedback",
        category: "Community",
        title: "Love the Holiday Decorations",
        content: "The holiday decorations this year were absolutely beautiful! The lobby looked magical and really brought the community together. Many visitors commented on how welcoming it made the building feel. Thank you to whoever organized this!",
        location: "Lobby & Common Areas",
        urgency: "low",
        status: "acknowledged",
        assignedTo: "Sarah Johnson",
        createdAt: "2024-12-26T14:20:00Z",
        updatedAt: "2024-12-27T09:00:00Z",
        adminNotes: "Lovely feedback! Shared with decoration committee. Budget approved for next year.",
        supportCount: 67
    },
    {
        id: 9,
        type: "concern",
        category: "Pets",
        title: "Dog Waste Not Being Picked Up",
        content: "Someone is not cleaning up after their dog on the 3rd floor terrace. This has happened multiple times this week. It's unsanitary and unfair to other residents who use the terrace. Please remind all pet owners of their responsibilities.",
        location: "3rd Floor Terrace",
        urgency: "medium",
        status: "investigating",
        assignedTo: "Robert Martinez",
        createdAt: "2025-01-13T13:00:00Z",
        updatedAt: "2025-01-13T15:30:00Z",
        adminNotes: "Posted additional signage. Reviewing camera footage to identify the responsible party.",
        petPolicyViolation: true
    },
    {
        id: 10,
        type: "suggestion",
        category: "Technology",
        title: "Mobile App for Building Services",
        content: "Would be amazing to have a mobile app where we could book amenities, submit maintenance requests, receive announcements, etc. Many modern buildings have this. Would make life so much easier than logging into the web portal each time.",
        location: "Building-wide",
        urgency: "low",
        status: "pending",
        assignedTo: null,
        createdAt: "2025-01-14T10:00:00Z",
        updatedAt: "2025-01-14T10:00:00Z",
        adminNotes: null,
        supportCount: 38,
        estimatedCost: "$25,000-40,000"
    },
    {
        id: 11,
        type: "concern",
        category: "HVAC",
        title: "Temperature Fluctuations in Unit",
        content: "Wild temperature swings in my unit (18th floor, south facing). It's either too hot or too cold, never comfortable. Thermostat shows one temperature but feels completely different. This wastes energy and affects comfort. Other units on my floor have similar issues.",
        location: "Floor 18 - South Side",
        urgency: "medium",
        status: "assigned",
        assignedTo: "Emma Davis",
        createdAt: "2025-01-13T08:45:00Z",
        updatedAt: "2025-01-13T14:00:00Z",
        adminNotes: "Common issue with south-facing units. HVAC contractor scheduled to investigate zone controls.",
        affectedUnits: ["1801", "1803", "1805", "1807"],
        maintenanceTicket: "MT-2025-0145"
    },
    {
        id: 12,
        type: "feedback",
        category: "Management",
        title: "Excellent Communication During Water Shut-off",
        content: "Want to thank management for the excellent communication during the recent water shut-off. Multiple notices, reminders, and the text alerts were very helpful. The work was completed faster than expected too. This is how building management should be done!",
        location: "Floors 15-20",
        urgency: "low",
        status: "acknowledged",
        assignedTo: "Sarah Johnson",
        createdAt: "2025-01-12T14:00:00Z",
        updatedAt: "2025-01-12T16:00:00Z",
        adminNotes: "Great feedback on our new communication protocol. Will continue this approach for future maintenance.",
        communicationMethod: ["Email", "Text", "Door notices", "Elevator signs"]
    }
];

// Mock Newsletter Data
const NEWSLETTERS = [
    {
        id: 1,
        title: "January 2025 - New Year, New Beginnings",
        content: `
<h2>Happy New Year, Point on the Bow Residents!</h2>

<p>As we welcome 2025, we're excited to share updates and important information for the month ahead.</p>

<h3>🎆 New Year's Highlights</h3>
<ul>
    <li>Thank you to all who joined our New Year's Eve celebration! Over 100 residents welcomed 2025 together.</li>
    <li>Fitness Center extended hours (6 AM - 11 PM) now in effect for your resolution goals!</li>
    <li>New smart parcel locker system goes live January 20th</li>
</ul>

<h3>📋 Important Dates</h3>
<ul>
    <li><strong>Jan 15:</strong> Fire alarm testing (9 AM - 5 PM)</li>
    <li><strong>Jan 18:</strong> Water shut-off floors 15-20 (8 AM - 12 PM)</li>
    <li><strong>Jan 25:</strong> Board Meeting - All residents welcome (7 PM)</li>
    <li><strong>Feb 10:</strong> Winter BBQ Event - Save the date!</li>
</ul>

<h3>🏆 Resident Spotlight</h3>
<p>Congratulations to John and Mary Thompson (Unit 1504) on their 50th wedding anniversary! The Thompsons have been residents since 2021 and are active in our community garden.</p>

<h3>💡 Energy Saving Tip</h3>
<p>Did you know? Setting your thermostat just 1°C lower in winter can save up to 5% on heating costs. Every bit helps with rising energy prices!</p>

<h3>🆕 Welcome New Residents</h3>
<p>Please join us in welcoming:</p>
<ul>
    <li>The Chen Family - Unit 902</li>
    <li>Dr. Sarah Mitchell - Unit 1247</li>
    <li>Robert & Linda Davis - Unit 2103</li>
</ul>

<h3>📞 Important Contacts</h3>
<ul>
    <li>Concierge: (403) 555-0100</li>
    <li>Emergency Maintenance: (403) 555-0111</li>
    <li>Property Manager: sarah.johnson@pointonthebow.ca</li>
</ul>

<p>Stay warm and have a wonderful January!</p>
<p><em>- Your Property Management Team</em></p>
        `,
        status: "sent",
        sentAt: "2025-01-01T10:00:00Z",
        createdAt: "2024-12-28T14:00:00Z",
        createdBy: 1,
        recipientCount: 286,
        openRate: "78%",
        sections: ["highlights", "dates", "spotlight", "tips", "welcome", "contacts"],
        attachments: ["January_2025_Calendar.pdf", "Fire_Alarm_Testing_Notice.pdf"]
    },
    {
        id: 2,
        title: "February 2025 - Love Your Building",
        content: `
<h2>February Newsletter - Love is in the Air!</h2>

<p>February brings Valentine's Day, Family Day, and exciting building updates.</p>

<h3>❤️ Valentine's Special Events</h3>
<ul>
    <li><strong>Feb 14:</strong> Couples' Wine & Cheese Evening (7-9 PM, Party Room)</li>
    <li><strong>Feb 14:</strong> Kids' Valentine Card Making (3-5 PM, Craft Room)</li>
    <li>Special Valentine's dinner menu at nearby Teatro Restaurant - 15% off for residents</li>
</ul>

<h3>🏗️ Building Updates</h3>
<ul>
    <li>Pool deck resurfacing project approved - Work begins April 1st</li>
    <li>New security cameras installation 60% complete</li>
    <li>EV charging station project moving to design phase</li>
</ul>

<h3>📊 By the Numbers</h3>
<ul>
    <li>98% occupancy rate maintained</li>
    <li>24 service requests completed in January</li>
    <li>$2,847 raised for local food bank</li>
    <li>15 new bike storage spots added</li>
</ul>

<h3>🏃 Fitness Challenge</h3>
<p>Join our "February Fitness Challenge" - Track your gym visits and win prizes! Top 3 users get free personal training sessions.</p>

<h3>🔔 Reminder</h3>
<ul>
    <li>Annual fire extinguisher inspections begin Feb 20th</li>
    <li>Guest suite now available for booking online</li>
    <li>Please update your emergency contact information</li>
</ul>
        `,
        status: "draft",
        createdAt: "2025-01-15T16:30:00Z",
        createdBy: 1,
        scheduledFor: "2025-02-01T10:00:00Z",
        sections: ["events", "updates", "statistics", "fitness", "reminders"],
        attachments: ["February_2025_Calendar.pdf"]
    },
    {
        id: 3,
        title: "December 2024 - Holiday Cheer",
        content: `
<h2>Season's Greetings from Point on the Bow!</h2>

<p>December is here, bringing festive celebrations and a chance to reflect on a wonderful year in our community.</p>

<h3>🎄 Holiday Events Schedule</h3>
<ul>
    <li><strong>Dec 10:</strong> Tree Lighting Ceremony (6 PM, Lobby)</li>
    <li><strong>Dec 15:</strong> Children's Holiday Party (2-4 PM)</li>
    <li><strong>Dec 20:</strong> Adult Holiday Cocktail Party (7-10 PM)</li>
    <li><strong>Dec 31:</strong> New Year's Eve Celebration (9 PM - 1 AM)</li>
</ul>

<h3>🎁 Giving Back</h3>
<p>Our annual toy drive collected 157 toys for Calgary children in need! Thank you for your incredible generosity.</p>

<h3>⛄ Winter Reminders</h3>
<ul>
    <li>Keep balcony drains clear of snow and ice</li>
    <li>Report any heating issues immediately</li>
    <li>Guest parking may be limited due to snow removal</li>
    <li>Watch for ice on walkways - extra caution needed</li>
</ul>

<h3>🎉 2024 Year in Review</h3>
<ul>
    <li>Completed lobby renovation winning design award</li>
    <li>Achieved 100% reserve fund target</li>
    <li>Maintained 98% resident satisfaction rate</li>
    <li>Zero major incidents or insurance claims</li>
</ul>

<h3>📅 Holiday Schedule</h3>
<ul>
    <li>Dec 24-25: Office closed, emergency service only</li>
    <li>Dec 31-Jan 1: Office closed, concierge available</li>
    <li>Amenities: Modified hours Dec 24-Jan 2</li>
</ul>

<p>Wishing you and your loved ones a joyful holiday season!</p>
        `,
        status: "sent",
        sentAt: "2024-12-01T10:00:00Z",
        createdAt: "2024-11-25T09:00:00Z",
        createdBy: 1,
        recipientCount: 285,
        openRate: "82%",
        clickRate: "45%",
        popularSections: ["events", "toy drive"],
        attachments: ["Holiday_Schedule_2024.pdf", "December_Events_Flyer.pdf"]
    },
    {
        id: 4,
        title: "March 2025 - Spring Forward",
        content: `
<h2>Spring is Almost Here!</h2>

<p>March brings longer days, spring cleaning opportunities, and exciting community initiatives.</p>

<h3>🌷 Spring Events</h3>
<ul>
    <li><strong>Mar 15:</strong> Spring Cleaning Swap Meet (10 AM - 2 PM)</li>
    <li><strong>Mar 20:</strong> First Day of Spring Social (5-7 PM)</li>
    <li><strong>Mar 22:</strong> Gardening Workshop for Balcony Plants</li>
</ul>

<h3>🧹 Spring Cleaning Tips</h3>
<ul>
    <li>Schedule your annual dryer vent cleaning</li>
    <li>Change HVAC filters (available at concierge)</li>
    <li>Test your smoke detectors</li>
    <li>Clean balcony furniture before the season</li>
</ul>

<h3>🌱 Green Initiatives</h3>
<p>Composting program survey results: 73% of residents support implementation! Board reviewing options for Q2 launch.</p>

<h3>🚧 Maintenance Updates</h3>
<ul>
    <li>Window cleaning scheduled for Mar 25-27</li>
    <li>Garage pressure washing Mar 30</li>
    <li>Pool reopens March 15 after maintenance</li>
</ul>
        `,
        status: "draft",
        createdAt: "2025-01-20T11:15:00Z",
        createdBy: 1,
        scheduledFor: "2025-03-01T10:00:00Z",
        sections: ["events", "cleaning", "green", "maintenance"]
    },
    {
        id: 5,
        title: "Special Edition - 5th Anniversary",
        content: `
<h2>🎉 Celebrating 5 Years of Point on the Bow! 🎉</h2>

<p>June 15, 2025 marks five incredible years since our building opened. Join us for a month of celebrations!</p>

<h3>🎆 Anniversary Events</h3>
<ul>
    <li><strong>June 7:</strong> Kids' Carnival (1-4 PM)</li>
    <li><strong>June 14:</strong> Gala Dinner ($50/person, Grand Ballroom)</li>
    <li><strong>June 15:</strong> Open House & Time Capsule Ceremony</li>
    <li><strong>June 21:</strong> Charity Golf Tournament</li>
    <li><strong>June 28:</strong> Rooftop Jazz Night</li>
</ul>

<h3>🏆 5-Year Achievements</h3>
<ul>
    <li>Zero major incidents</li>
    <li>$4.2M in reserve funds</li>
    <li>LEED Gold certification</li>
    <li>98% average occupancy</li>
    <li>Award-winning lobby design</li>
</ul>

<h3>📸 Memory Lane</h3>
<p>Share your favorite Point on the Bow memories and photos for our anniversary display!</p>

<h3>🎁 Anniversary Contests</h3>
<ul>
    <li>Photo contest: "My Favorite Building View"</li>
    <li>Essay contest: "Why I Love Living Here"</li>
    <li>Kids' art contest: "My Home"</li>
</ul>

<p>Here's to many more wonderful years together!</p>
        `,
        status: "draft",
        createdAt: "2025-01-14T13:00:00Z",
        createdBy: 1,
        scheduledFor: "2025-06-01T10:00:00Z",
        sections: ["events", "achievements", "contests", "memories"],
        specialEdition: true
    },
    {
        id: 6,
        title: "November 2024 - Giving Thanks",
        content: `
<h2>November at Point on the Bow</h2>

<p>As we approach the holiday season, we have much to be thankful for in our wonderful community.</p>

<h3>🎁 Annual Toy Drive Begins</h3>
<p>Drop off new, unwrapped toys at the concierge desk by December 15th. Let's exceed last year's 142 toys!</p>

<h3>🤘 Board Election Results</h3>
<p>Congratulations to our re-elected board members:</p>
<ul>
    <li>Michael Chen - President</li>
    <li>Patricia Williams - Secretary/Treasurer</li>
</ul>
<p>Thank you to all residents who participated in the AGM!</p>

<h3>🌡️ Winter Preparation</h3>
<ul>
    <li>Heating system inspections complete</li>
    <li>Snow removal contract renewed</li>
    <li>Winter emergency kits available at concierge</li>
</ul>

<h3>🎅 Save the Dates</h3>
<ul>
    <li>Dec 10: Tree Lighting Ceremony</li>
    <li>Dec 15: Children's Holiday Party</li>
    <li>Dec 31: New Year's Eve Bash</li>
</ul>
        `,
        status: "sent",
        sentAt: "2024-11-01T10:00:00Z",
        createdAt: "2024-10-28T15:00:00Z",
        createdBy: 1,
        recipientCount: 284,
        openRate: "76%",
        attachments: ["AGM_Results_2024.pdf", "Winter_Prep_Checklist.pdf"]
    }
];

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { mockDB, ROLES, ROLE_LEVELS };
} 