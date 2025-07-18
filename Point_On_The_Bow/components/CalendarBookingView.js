/**
 * Calendar-based Amenity Booking Component
 * Professional calendar interface for viewing and creating bookings
 */
class CalendarBookingView {
    constructor() {
        // Always start with current month (no past months allowed)
        const today = new Date();
        this.currentDate = new Date(today.getFullYear(), today.getMonth(), 1);
        
        this.selectedDate = null;
        this.bookings = [];
        this.amenities = [];
        this.currentUser = null;
        this.bookingFormComponent = null;
        
        this.init();
    }

    /**
     * Initialize the calendar component
     */
    async init() {
        try {
            await this.loadCurrentUser();
            await this.loadAmenities();
            await this.loadBookings();
            this.render();
            this.attachEventListeners();
        } catch (error) {
            console.error('Failed to initialize calendar:', error);
            this.showError('Failed to load calendar data');
        }
    }

    /**
     * Load current user information
     */
    async loadCurrentUser() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/user/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                this.currentUser = await response.json();
            }
        } catch (error) {
            console.error('Failed to load user data:', error);
        }
    }

    /**
     * Load available amenities
     */
    async loadAmenities() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch('/api/amenities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                this.amenities = await response.json();
            }
        } catch (error) {
            console.error('Failed to load amenities:', error);
        }
    }

    /**
     * Load bookings for the current month
     */
    async loadBookings() {
        try {
            const token = localStorage.getItem('token');
            
            // Get all bookings for management/staff, or user's bookings for residents
            const response = await fetch('/api/amenity-bookings', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                this.bookings = await response.json();
            }

            // Also get public schedule for the month
            await this.loadPublicSchedule();
        } catch (error) {
            console.error('Failed to load bookings:', error);
        }
    }

    /**
     * Load public booking schedule for calendar display
     */
    async loadPublicSchedule() {
        if (this.amenities.length === 0) return;

        try {
            const token = localStorage.getItem('token');
            const firstDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
            const lastDay = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 0);
            
            this.publicSchedule = {};
            
            // Load schedule for each day of the month
            for (let d = new Date(firstDay); d <= lastDay; d.setDate(d.getDate() + 1)) {
                const dateStr = d.toISOString().split('T')[0];
                const amenityIds = this.amenities.map(a => a.id);
                
                const response = await fetch(`/api/amenities/${amenityIds.join(',')}/schedule?date=${dateStr}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                
                if (response.ok) {
                    const schedule = await response.json();
                    this.publicSchedule[dateStr] = schedule;
                }
            }
        } catch (error) {
            console.error('Failed to load public schedule:', error);
        }
    }

    /**
     * Render the calendar interface
     */
    render() {
        const container = document.getElementById('calendar-booking-container');
        if (!container) {
            console.error('Calendar container not found');
            return;
        }

        container.innerHTML = this.createCalendarHTML();
        this.injectStyles();
    }

    /**
     * Create the calendar HTML structure
     */
    createCalendarHTML() {
        const monthName = this.currentDate.toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
        });

        return `
            <div class="calendar-booking-view">
                <!-- Calendar Header -->
                <div class="calendar-header">
                    <div class="calendar-title">
                        <h2><i class="fas fa-calendar-alt"></i> Amenity Booking Calendar</h2>
                        <p class="calendar-subtitle">Click any date to book amenities</p>
                    </div>
                    
                    <!-- Month Navigation -->
                    <div class="month-navigation">
                        <button id="prev-month" 
                                class="nav-btn ${!this.canNavigateMonth(-1) ? 'disabled' : ''}" 
                                ${!this.canNavigateMonth(-1) ? 'disabled' : ''}
                                data-tooltip="${!this.canNavigateMonth(-1) ? 'Unable to book in the past' : 'Previous month'}">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <h3 class="current-month">${monthName}</h3>
                        <button id="next-month" 
                                class="nav-btn ${!this.canNavigateMonth(1) ? 'disabled' : ''}" 
                                ${!this.canNavigateMonth(1) ? 'disabled' : ''}
                                data-tooltip="${!this.canNavigateMonth(1) ? 'Maximum 3 months advance booking allowed' : 'Next month'}">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                    </div>

                    <!-- Legend -->
                    <div class="calendar-legend">
                        <div class="legend-item">
                            <div class="legend-color available"></div>
                            <span>Available</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color has-bookings"></div>
                            <span>Has Bookings</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color your-booking"></div>
                            <span>Your Bookings</span>
                        </div>
                        <div class="legend-item">
                            <div class="legend-color past-date"></div>
                            <span>Past Date</span>
                        </div>
                    </div>
                </div>

                <!-- Calendar Grid -->
                <div class="calendar-grid">
                    <!-- Day Headers -->
                    <div class="calendar-days-header">
                        <div class="day-header">Sun</div>
                        <div class="day-header">Mon</div>
                        <div class="day-header">Tue</div>
                        <div class="day-header">Wed</div>
                        <div class="day-header">Thu</div>
                        <div class="day-header">Fri</div>
                        <div class="day-header">Sat</div>
                    </div>

                    <!-- Calendar Days -->
                    <div class="calendar-days">
                        ${this.renderCalendarDays()}
                    </div>
                </div>

                <!-- Booking Summary Panel -->
                <div class="booking-summary" id="booking-summary">
                    <h4>Select a date to view bookings or create a new reservation</h4>
                </div>

                <!-- Status Display -->
                <div class="calendar-status" id="calendar-status"></div>
            </div>

            <!-- Booking Form Modal (will be populated by AmenityBookingForm) -->
            <div id="booking-form-modal" class="booking-modal" style="display: none;">
                <div class="modal-overlay" id="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Book Amenities</h3>
                        <button class="modal-close" id="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body" id="booking-form-container">
                        <!-- AmenityBookingForm will be injected here -->
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render calendar days for the current month
     */
    renderCalendarDays() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        
        // Get first day of month and how many days in month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();
        
        // Get today for comparison
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let daysHTML = '';
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < startingDayOfWeek; i++) {
            daysHTML += '<div class="calendar-day empty"></div>';
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = date.toISOString().split('T')[0];
            const isPast = date < today;
            const isToday = date.getTime() === today.getTime();
            
            // Get booking info for this date
            const dayBookings = this.getBookingsForDate(dateStr);
            const hasYourBookings = this.hasUserBookings(dateStr);
            const hasOtherBookings = this.hasOtherBookings(dateStr);
            
            let dayClass = 'calendar-day';
            if (isPast) dayClass += ' past';
            if (isToday) dayClass += ' today';
            if (hasYourBookings) dayClass += ' your-booking';
            else if (hasOtherBookings) dayClass += ' has-bookings';
            if (!isPast) dayClass += ' clickable';
            
            // Generate booking details instead of just count
            const bookingDetails = this.formatBookingDetails(dayBookings);
            
            daysHTML += `
                <div class="${dayClass}" data-date="${dateStr}" ${!isPast ? 'title="Click to book amenities"' : ''}>
                    <span class="day-number">${day}</span>
                    ${bookingDetails}
                </div>
            `;
        }
        
        return daysHTML;
    }

    /**
     * Get bookings for a specific date
     */
    getBookingsForDate(dateStr) {
        return this.bookings.filter(booking => 
            booking.booking_date === dateStr && 
            ['confirmed', 'pending'].includes(booking.booking_status)
        );
    }

    /**
     * Format booking details for calendar display
     */
    formatBookingDetails(dayBookings) {
        if (!dayBookings || dayBookings.length === 0) {
            return '';
        }

        let html = '<div class="booking-details">';
        
        // Group bookings by amenity to show concise information
        const bookingsByAmenity = {};
        
        dayBookings.forEach(booking => {
            // Get amenity name from booking
            const amenityName = this.getAmenityShortName(booking.amenity_names || booking.amenity_name);
            const timeRange = this.formatTimeRange(booking.start_time, booking.end_time);
            
            if (!bookingsByAmenity[amenityName]) {
                bookingsByAmenity[amenityName] = [];
            }
            bookingsByAmenity[amenityName].push(timeRange);
        });

        // Display each amenity's bookings
        Object.entries(bookingsByAmenity).forEach(([amenityName, timeRanges]) => {
            const timeDisplay = timeRanges.join(', ');
            html += `
                <div class="booking-item-mini">
                    <div class="amenity-name">Booked: ${amenityName}</div>
                    <div class="time-range">${timeDisplay}</div>
                </div>
            `;
        });

        html += '</div>';
        return html;
    }

    /**
     * Get short name for amenity display
     */
    getAmenityShortName(amenityName) {
        if (!amenityName) return 'Unknown';
        
        const shortNames = {
            'Swimming Pool & Spa Area': 'Pool',
            'Community Room': 'Community',
            'Rooftop Terrace': 'Terrace'
        };
        
        return shortNames[amenityName] || amenityName.split(' ')[0];
    }

    /**
     * Format time range for concise display
     */
    formatTimeRange(startTime, endTime) {
        if (!startTime || !endTime) return '';
        
        // Convert 24-hour format to 12-hour format for display
        const formatTime = (time) => {
            const [hours, minutes] = time.split(':');
            const hour = parseInt(hours);
            const ampm = hour >= 12 ? 'pm' : 'am';
            const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
            return `${displayHour}${minutes !== '00' ? ':' + minutes : ''}${ampm}`;
        };
        
        const start = formatTime(startTime);
        const end = formatTime(endTime);
        
        return `${start}-${end}`;
    }

    /**
     * Check if current user has bookings on date
     */
    hasUserBookings(dateStr) {
        if (!this.currentUser) return false;
        return this.bookings.some(booking => 
            booking.booking_date === dateStr && 
            booking.user_id === this.currentUser.id &&
            ['confirmed', 'pending'].includes(booking.booking_status)
        );
    }

    /**
     * Check if there are other bookings on date
     */
    hasOtherBookings(dateStr) {
        if (!this.publicSchedule || !this.publicSchedule[dateStr]) return false;
        
        return Object.values(this.publicSchedule[dateStr]).some(schedule => 
            schedule.bookedSlots && schedule.bookedSlots.length > 0
        );
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        // Month navigation
        const prevBtn = document.getElementById('prev-month');
        const nextBtn = document.getElementById('next-month');
        
        if (!prevBtn.disabled) {
            prevBtn.addEventListener('click', () => {
                this.changeMonth(-1);
            });
        }
        
        if (!nextBtn.disabled) {
            nextBtn.addEventListener('click', () => {
                this.changeMonth(1);
            });
        }
        
        // Date clicks
        document.querySelectorAll('.calendar-day.clickable').forEach(day => {
            day.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                this.selectDate(date);
            });
        });

        // Modal close
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeBookingModal();
        });
        
        document.getElementById('modal-overlay').addEventListener('click', () => {
            this.closeBookingModal();
        });

        // Escape key to close modal
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('booking-form-modal').style.display === 'block') {
                this.closeBookingModal();
            }
        });
    }

    /**
     * Check if month navigation is allowed
     */
    canNavigateMonth(direction) {
        const today = new Date();
        const todayMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const currentMonth = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth(), 1);
        
        if (direction === -1) {
            // Cannot go back before current month (no past bookings)
            const prevMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
            return prevMonth >= todayMonth;
        } else if (direction === 1) {
            // Allow going forward up to 3 months from today
            const maxDate = new Date(today.getFullYear(), today.getMonth() + 3, 1);
            const nextMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
            return nextMonth <= maxDate;
        }
        
        return false;
    }

    /**
     * Change month (previous/next)
     */
    async changeMonth(direction) {
        // Check if navigation is allowed
        if (!this.canNavigateMonth(direction)) {
            const message = direction === -1 ? 
                'Cannot book amenities in past months' : 
                'Cannot book more than 3 months in advance';
            this.showError(message);
            setTimeout(() => this.clearStatus(), 2000);
            return;
        }

        this.currentDate.setMonth(this.currentDate.getMonth() + direction);
        
        // Show loading
        this.showLoading('Loading calendar...');
        
        try {
            await this.loadBookings(); // Reload bookings for new month
            this.render();
            this.attachEventListeners();
            this.clearStatus();
        } catch (error) {
            console.error('Failed to load month data:', error);
            this.showError('Failed to load calendar data');
        }
    }

    /**
     * Select a date and show booking options
     */
    selectDate(dateStr) {
        this.selectedDate = dateStr;
        
        // Show booking summary for the date
        this.showDateSummary(dateStr);
        
        // Open booking form modal
        this.openBookingModal(dateStr);
    }

    /**
     * Show summary of bookings for selected date
     */
    showDateSummary(dateStr) {
        const summaryContainer = document.getElementById('booking-summary');
        const date = new Date(dateStr + 'T00:00:00');
        const formattedDate = date.toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        
        const dayBookings = this.getBookingsForDate(dateStr);
        
        let html = `<h4>📅 ${formattedDate}</h4>`;
        
        if (dayBookings.length > 0) {
            html += '<div class="day-bookings">';
            dayBookings.forEach(booking => {
                const isYours = this.currentUser && booking.user_id === this.currentUser.id;
                html += `
                    <div class="booking-item ${isYours ? 'your-booking' : 'other-booking'}">
                        <div class="booking-time">
                            <i class="fas fa-clock"></i>
                            ${booking.start_time} - ${booking.end_time}
                        </div>
                        <div class="booking-amenity">${booking.amenity_names}</div>
                        ${isYours ? '<span class="booking-badge yours">Your Booking</span>' : '<span class="booking-badge">Reserved</span>'}
                    </div>
                `;
            });
            html += '</div>';
        } else {
            html += '<p class="no-bookings">No bookings for this date</p>';
        }
        
        summaryContainer.innerHTML = html;
    }

    /**
     * Open booking form modal
     */
    async openBookingModal(dateStr) {
        const modal = document.getElementById('booking-form-modal');
        const container = document.getElementById('booking-form-container');
        
        // Clear previous form
        container.innerHTML = '';
        
        // Show modal
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Import and initialize the booking form
        try {
            // Dynamically load the AmenityBookingForm component
            if (!window.AmenityBookingForm) {
                await this.loadBookingFormScript();
            }
            
            // Initialize the form with pre-selected date
            this.bookingFormComponent = new AmenityBookingForm();
            
            // Pre-fill the date
            setTimeout(() => {
                const dateInput = document.getElementById('bookingDate');
                if (dateInput) {
                    dateInput.value = dateStr;
                    dateInput.dispatchEvent(new Event('change'));
                }
            }, 100);
            
        } catch (error) {
            console.error('Failed to load booking form:', error);
            container.innerHTML = '<div class="error">Failed to load booking form</div>';
        }
    }

    /**
     * Load booking form script dynamically
     */
    async loadBookingFormScript() {
        return new Promise((resolve, reject) => {
            if (document.getElementById('booking-form-script')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.id = 'booking-form-script';
            script.src = '/components/AmenityBookingForm.js';
            script.onload = resolve;
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Close booking modal
     */
    closeBookingModal() {
        const modal = document.getElementById('booking-form-modal');
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        
        // Refresh calendar data
        this.loadBookings().then(() => {
            this.render();
            this.attachEventListeners();
        });
    }

    /**
     * Show loading state
     */
    showLoading(message) {
        const statusElement = document.getElementById('calendar-status');
        statusElement.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
        statusElement.style.display = 'block';
    }

    /**
     * Show error message
     */
    showError(message) {
        const statusElement = document.getElementById('calendar-status');
        statusElement.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        statusElement.style.display = 'block';
    }

    /**
     * Clear status messages
     */
    clearStatus() {
        const statusElement = document.getElementById('calendar-status');
        statusElement.style.display = 'none';
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('calendar-booking-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'calendar-booking-styles';
        styles.textContent = `
            .calendar-booking-view {
                max-width: 1200px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .calendar-header {
                background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
                color: white;
                padding: 2rem;
            }

            .calendar-title h2 {
                margin: 0 0 0.5rem 0;
                font-size: 1.8rem;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .calendar-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 1rem;
            }

            .month-navigation {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 2rem;
                margin: 1.5rem 0;
            }

            .nav-btn {
                background: rgba(255, 255, 255, 0.2);
                border: none;
                color: white;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.3s ease;
            }

            .nav-btn:hover:not(.disabled) {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }

            .nav-btn.disabled {
                opacity: 0.4;
                cursor: not-allowed;
                background: rgba(255, 255, 255, 0.1);
            }

            .nav-btn.disabled:hover {
                transform: none;
                background: rgba(255, 255, 255, 0.1);
            }

            /* Tooltip styles */
            .nav-btn[data-tooltip] {
                position: relative;
            }

            .nav-btn[data-tooltip]:hover::before {
                content: attr(data-tooltip);
                position: absolute;
                top: -45px;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(0, 0, 0, 0.9);
                color: white;
                padding: 8px 12px;
                border-radius: 6px;
                font-size: 0.8rem;
                white-space: nowrap;
                z-index: 1000;
                opacity: 0;
                animation: tooltipFadeIn 0.2s ease-in-out forwards;
                pointer-events: none;
            }

            .nav-btn[data-tooltip]:hover::after {
                content: '';
                position: absolute;
                top: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 6px solid rgba(0, 0, 0, 0.9);
                z-index: 1000;
                opacity: 0;
                animation: tooltipFadeIn 0.2s ease-in-out forwards;
                pointer-events: none;
            }

            @keyframes tooltipFadeIn {
                from {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-5px);
                }
                to {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0);
                }
            }

            .current-month {
                margin: 0;
                font-size: 1.5rem;
                font-weight: 600;
                min-width: 200px;
                text-align: center;
            }

            .calendar-legend {
                display: flex;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
                margin-top: 1rem;
            }

            .legend-item {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.9rem;
            }

            .legend-color {
                width: 16px;
                height: 16px;
                border-radius: 4px;
            }

            .legend-color.available {
                background: rgba(255, 255, 255, 0.3);
                border: 2px solid rgba(255, 255, 255, 0.5);
            }

            .legend-color.has-bookings {
                background: #dc3545;
            }

            .legend-color.your-booking {
                background: #28a745;
            }

            .legend-color.past-date {
                background: #6c757d;
            }

            .calendar-grid {
                padding: 2rem;
            }

            .calendar-days-header {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                margin-bottom: 1rem;
            }

            .day-header {
                text-align: center;
                font-weight: 600;
                color: #666;
                padding: 1rem 0;
                background: #f8f9fa;
                border-radius: 8px;
            }

            .calendar-days {
                display: grid;
                grid-template-columns: repeat(7, 1fr);
                gap: 1px;
                background: #e9ecef;
                border-radius: 8px;
                padding: 1px;
            }

            .calendar-day {
                aspect-ratio: 1;
                background: white;
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                justify-content: flex-start;
                position: relative;
                min-height: 100px;
                padding: 8px;
                transition: all 0.3s ease;
                overflow: hidden;
            }

            .calendar-day.empty {
                background: #f8f9fa;
            }

            .calendar-day.clickable {
                cursor: pointer;
            }

            .calendar-day.clickable:hover {
                background: #D4AF37;
                color: white;
                transform: scale(1.05);
                z-index: 1;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }

            .calendar-day.past {
                background: #f8f9fa;
                color: #6c757d;
                opacity: 0.6;
            }

            .calendar-day.today {
                background: #e3f2fd;
                border: 2px solid #2196f3;
                font-weight: bold;
            }

            .calendar-day.has-bookings {
                background: #f8d7da;
                border-left: 4px solid #dc3545;
            }

            .calendar-day.your-booking {
                background: #d4edda;
                border-left: 4px solid #28a745;
            }

            .day-number {
                font-size: 1.1rem;
                font-weight: 500;
                margin-bottom: 4px;
                align-self: center;
            }

            .booking-details {
                width: 100%;
                font-size: 0.65rem;
                line-height: 1.2;
            }

            .booking-item-mini {
                margin-bottom: 2px;
                padding: 1px 2px;
                background: rgba(0, 0, 0, 0.05);
                border-radius: 2px;
                text-align: center;
                border-left: 2px solid #dc3545;
            }

            .calendar-day.has-bookings .booking-item-mini {
                background: rgba(220, 53, 69, 0.2);
                border-left-color: #dc3545;
            }

            .calendar-day.your-booking .booking-item-mini {
                background: rgba(40, 167, 69, 0.2);
                border-left-color: #28a745;
            }

            .amenity-name {
                font-weight: 600;
                color: #333;
                font-size: 0.6rem;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .time-range {
                font-size: 0.55rem;
                color: #666;
                margin-top: 1px;
            }

            .calendar-day:hover .booking-item-mini {
                background: rgba(255, 255, 255, 0.3) !important;
                border-left-color: white !important;
            }

            .calendar-day:hover .amenity-name,
            .calendar-day:hover .time-range {
                color: white !important;
            }

            /* Responsive adjustments for booking details */
            @media (max-width: 1024px) {
                .calendar-day {
                    min-height: 90px;
                    padding: 6px;
                }
                
                .booking-details {
                    font-size: 0.6rem;
                }
                
                .amenity-name {
                    font-size: 0.55rem;
                }
                
                .time-range {
                    font-size: 0.5rem;
                }
            }

            @media (max-width: 768px) {
                .calendar-day {
                    min-height: 80px;
                    padding: 4px;
                }
                
                .booking-details {
                    font-size: 0.55rem;
                }
                
                .amenity-name {
                    font-size: 0.5rem;
                }
                
                .time-range {
                    font-size: 0.45rem;
                }
                
                .day-number {
                    font-size: 1rem;
                    margin-bottom: 2px;
                }
            }

            .booking-summary {
                margin: 2rem;
                padding: 1.5rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #D4AF37;
            }

            .booking-summary h4 {
                margin: 0 0 1rem 0;
                color: #333;
                font-size: 1.2rem;
            }

            .day-bookings {
                display: flex;
                flex-direction: column;
                gap: 0.75rem;
            }

            .booking-item {
                background: white;
                padding: 1rem;
                border-radius: 8px;
                border-left: 4px solid #6c757d;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .booking-item.your-booking {
                border-left-color: #28a745;
                background: #f8fff9;
            }

            .booking-time {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 500;
                color: #495057;
            }

            .booking-amenity {
                color: #666;
                font-size: 0.9rem;
            }

            .booking-badge {
                padding: 0.25rem 0.75rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                background: #e9ecef;
                color: #495057;
            }

            .booking-badge.yours {
                background: #28a745;
                color: white;
            }

            .no-bookings {
                text-align: center;
                color: #6c757d;
                font-style: italic;
                margin: 1rem 0;
            }

            /* Modal Styles */
            .booking-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                z-index: 1000;
            }

            .modal-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                backdrop-filter: blur(4px);
            }

            .modal-content {
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                width: 90%;
                max-width: 1000px;
                max-height: 90vh;
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                overflow: hidden;
            }

            .modal-header {
                background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
                color: white;
                padding: 1.5rem 2rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .modal-header h3 {
                margin: 0;
                font-size: 1.3rem;
            }

            .modal-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s ease;
            }

            .modal-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .modal-body {
                max-height: calc(90vh - 100px);
                overflow-y: auto;
                padding: 0;
            }

            /* Status Messages */
            .calendar-status {
                margin: 1rem 2rem;
                display: none;
            }

            .calendar-status .loading,
            .calendar-status .error {
                padding: 1rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .calendar-status .loading {
                background: #d1ecf1;
                color: #0c5460;
            }

            .calendar-status .error {
                background: #f8d7da;
                color: #721c24;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .fa-spin {
                animation: spin 1s linear infinite;
            }

            /* Responsive Design */
            @media (max-width: 768px) {
                .calendar-header {
                    padding: 1rem;
                }

                .calendar-title h2 {
                    font-size: 1.4rem;
                }

                .month-navigation {
                    gap: 1rem;
                }

                .current-month {
                    font-size: 1.2rem;
                    min-width: 150px;
                }

                .calendar-legend {
                    gap: 1rem;
                }

                .legend-item {
                    font-size: 0.8rem;
                }

                .calendar-grid {
                    padding: 1rem;
                }

                .calendar-day {
                    min-height: 60px;
                }

                .day-number {
                    font-size: 1rem;
                }

                .modal-content {
                    width: 95%;
                }

                .modal-header {
                    padding: 1rem;
                }

                .booking-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 0.5rem;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('calendar-booking-container')) {
            window.calendarBookingView = new CalendarBookingView();
        }
    });
} else {
    if (document.getElementById('calendar-booking-container')) {
        window.calendarBookingView = new CalendarBookingView();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CalendarBookingView;
}

// Global function for closing modal (used by booking form)
window.closeBookingModal = function() {
    if (window.calendarBookingView) {
        window.calendarBookingView.closeBookingModal();
    }
}; 