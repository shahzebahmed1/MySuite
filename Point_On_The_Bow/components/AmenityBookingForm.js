/**
 * Enterprise Amenity Booking Form Component
 * Advanced booking system with real-time validation, availability checking,
 * multi-amenity selection, and comprehensive error handling.
 * 
 * @author Point on the Bow Development Team
 * @version 1.0.0
 * @since 2024
 */

class AmenityBookingForm {
    constructor() {
        this.amenities = [];
        this.selectedAmenities = new Set();
        this.currentUser = null;
        this.availabilityCache = new Map();
        this.validationRules = this.initializeValidationRules();
        this.debounceTimeout = null;
        
        this.init();
    }

    /**
     * Initialize validation rules for form fields
     */
    initializeValidationRules() {
        return {
            residentName: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-Z\s'-]+$/,
                message: 'Please enter a valid full name'
            },
            suiteNumber: {
                required: true,
                pattern: /^[0-9]{1,4}[A-Z]?$/,
                message: 'Please enter a valid suite number (e.g., 1205, 205A)'
            },
            bookingDate: {
                required: true,
                validator: (value) => {
                    const date = new Date(value);
                    const today = new Date();
                    const maxDate = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000));
                    return date >= today && date <= maxDate;
                },
                message: 'Date must be between today and 90 days from now'
            },
            startTime: {
                required: true,
                pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                message: 'Please enter a valid time (HH:MM)'
            },
            endTime: {
                required: true,
                pattern: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
                validator: (value, formData) => {
                    if (!formData.startTime) return false;
                    const start = this.parseTime(formData.startTime);
                    const end = this.parseTime(value);
                    return end > start;
                },
                message: 'End time must be after start time'
            },
            selectedAmenities: {
                required: true,
                validator: (value) => Array.isArray(value) && value.length > 0,
                message: 'Please select at least one amenity'
            },
            totalGuests: {
                required: false,
                min: 0,
                max: 100,
                message: 'Number of guests must be between 0 and 100'
            }
        };
    }

    /**
     * Initialize the booking form
     */
    async init() {
        try {
            await this.loadCurrentUser();
            await this.loadAmenities();
            this.createFormHTML();
            this.attachEventListeners();
            this.prefillUserData();
        } catch (error) {
            console.error('Failed to initialize booking form:', error);
            this.showInitError('Failed to load booking form. Please refresh the page.');
        }
    }

    /**
     * Show initialization error when form isn't created yet
     */
    showInitError(message) {
        const container = document.getElementById('booking-form-container');
        if (container) {
            container.innerHTML = `
                <div style="padding: 2rem; text-align: center; color: #721c24;">
                    <h3><i class="fas fa-exclamation-triangle"></i> Error</h3>
                    <p>${message}</p>
                    <button class="btn btn-secondary" data-action="close-modal" style="margin-top: 1rem;">Close</button>
                </div>
            `;
        } else {
            console.error('Booking form container not found');
        }
    }

    /**
     * Load current user information
     */
    async loadCurrentUser() {
        console.log('🔍 AmenityBookingForm: Starting loadCurrentUser...');
        
        const token = localStorage.getItem('token');
        console.log('🔍 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'null');
        
        // Always try to use portal user data first since we're in the portal
        if (window.portalApp && window.portalApp.currentUser) {
            console.log('✅ Using portal user data:', window.portalApp.currentUser);
            this.currentUser = window.portalApp.currentUser;
            return;
        }
        
        if (!token) {
            console.warn('❌ No authentication token found and no portal user data');
            throw new Error('No authentication token found');
        }

        try {
            console.log('🔍 Attempting API verification...');
            const response = await fetch('/api/auth/verify', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log('🔍 API verify response status:', response.status);
            
            if (!response.ok) {
                throw new Error(`Verification failed: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('✅ API verification successful:', data.user);
            this.currentUser = data.user;
        } catch (error) {
            console.error('❌ User verification error:', error);
            throw new Error('Failed to verify user');
        }
    }

    /**
     * Load available amenities
     */
    async loadAmenities() {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch('/api/amenities', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                throw new Error(`Failed to load amenities: ${response.status}`);
            }
            
            const amenities = await response.json();
            this.amenities = amenities || [];
            
            if (this.amenities.length === 0) {
                console.warn('No amenities available');
            }
        } catch (error) {
            console.error('Error loading amenities:', error);
            // Provide fallback amenities data
            this.amenities = [
                {
                    id: 1,
                    name: 'Swimming Pool & Spa Area',
                    description: 'Indoor heated swimming pool with spa facilities',
                    category: 'pool',
                    location: 'Level B1 - Pool Deck',
                    max_guests: 25,
                    hourly_rate: 0,
                    is_available: true
                },
                {
                    id: 2,
                    name: 'Community Room',
                    description: 'Large multipurpose room with kitchen facilities',
                    category: 'social', 
                    location: 'Level 2 - Community Floor',
                    max_guests: 80,
                    hourly_rate: 25,
                    is_available: true
                },
                {
                    id: 3,
                    name: 'Rooftop Terrace',
                    description: 'Outdoor rooftop space with BBQ facilities',
                    category: 'outdoor',
                    location: 'Rooftop - Level 45',
                    max_guests: 60,
                    hourly_rate: 15,
                    is_available: true
                }
            ];
        }
    }

    /**
     * Create the booking form HTML
     */
    createFormHTML() {
        const container = document.getElementById('booking-form-container') || document.body;
        
        container.innerHTML = `
            <div class="enterprise-booking-form">
                <div class="booking-form-header">
                    <h2><i class="fas fa-calendar-check"></i> Reserve Amenities</h2>
                    <p class="form-subtitle">Book swimming pool, common areas, and terrace facilities</p>
                </div>

                <form id="amenity-booking-form" class="booking-form" novalidate>
                    <!-- Personal Information Section -->
                    <div class="form-section">
                        <h3><i class="fas fa-user"></i> Resident Information</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="residentName" class="required">Full Name</label>
                                <input type="text" id="residentName" name="residentName" 
                                       placeholder="Enter your full name" required>
                                <div class="field-error" id="residentName-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="suiteNumber" class="required">Suite Number</label>
                                <input type="text" id="suiteNumber" name="suiteNumber" 
                                       placeholder="e.g., 1205, 205A" required>
                                <div class="field-error" id="suiteNumber-error"></div>
                            </div>
                        </div>
                    </div>

                    <!-- Amenity Selection Section -->
                    <div class="form-section">
                        <h3><i class="fas fa-swimming-pool"></i> Select Amenities</h3>
                        <div class="amenity-selection">
                            ${this.renderAmenityOptions()}
                        </div>
                        <div class="field-error" id="selectedAmenities-error"></div>
                    </div>

                    <!-- Date and Time Section -->
                    <div class="form-section">
                        <h3><i class="fas fa-clock"></i> Date & Time</h3>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="bookingDate" class="required">Date of Use</label>
                                <input type="date" id="bookingDate" name="bookingDate" 
                                       min="${this.getMinDate()}" max="${this.getMaxDate()}" required>
                                <div class="field-error" id="bookingDate-error"></div>
                            </div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="startTime" class="required">Start Time</label>
                                <input type="time" id="startTime" name="startTime" required>
                                <div class="field-error" id="startTime-error"></div>
                            </div>
                            <div class="form-group">
                                <label for="endTime" class="required">End Time</label>
                                <input type="time" id="endTime" name="endTime" required>
                                <div class="field-error" id="endTime-error"></div>
                            </div>
                        </div>
                        <div class="availability-status" id="availability-status"></div>
                        <div class="booking-schedule" id="booking-schedule"></div>
                    </div>

                    <!-- Event Details Section -->
                    <div class="form-section">
                        <h3><i class="fas fa-info-circle"></i> Event Details</h3>
                        <div class="form-group">
                            <label for="eventDescription">Event Description</label>
                            <textarea id="eventDescription" name="eventDescription" rows="3"
                                      placeholder="Brief description of your event or gathering (optional)"></textarea>
                            <div class="field-error" id="eventDescription-error"></div>
                        </div>
                        <div class="form-row">
                            <div class="form-group">
                                <label for="totalGuests">Number of Guests</label>
                                <input type="number" id="totalGuests" name="totalGuests" 
                                       min="0" max="100" placeholder="0">
                                <div class="field-error" id="totalGuests-error"></div>
                            </div>
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="needsFoldingChairs" name="needsFoldingChairs">
                                    <span class="checkmark"></span>
                                    Need folding chairs setup (+$25)
                                </label>
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="specialRequests">Special Requests</label>
                            <textarea id="specialRequests" name="specialRequests" rows="2"
                                      placeholder="Any special setup requirements or requests (optional)"></textarea>
                            <div class="field-error" id="specialRequests-error"></div>
                        </div>
                    </div>

                    <!-- Cost Summary Section -->
                    <div class="form-section">
                        <h3><i class="fas fa-calculator"></i> Cost Summary</h3>
                        <div class="cost-breakdown" id="cost-breakdown">
                            <div class="cost-item">
                                <span>Base Cost:</span>
                                <span id="base-cost">$0.00</span>
                            </div>
                            <div class="cost-item">
                                <span>Additional Fees:</span>
                                <span id="additional-fees">$0.00</span>
                            </div>
                            <div class="cost-item total">
                                <span><strong>Total Cost:</strong></span>
                                <span id="total-cost"><strong>$0.00</strong></span>
                            </div>
                        </div>
                    </div>

                    <!-- Form Actions -->
                    <div class="form-actions">
                        <button type="button" class="btn btn-secondary" id="cancel-booking">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                        <button type="submit" class="btn btn-primary" id="submit-booking">
                            <i class="fas fa-check"></i> Submit Booking Request
                        </button>
                    </div>

                    <!-- Loading and Status -->
                    <div class="form-status" id="form-status"></div>
                </form>
            </div>
        `;

        this.injectStyles();
    }

    /**
     * Render amenity selection options
     */
    renderAmenityOptions() {
        return this.amenities.map(amenity => `
            <div class="amenity-option" data-amenity-id="${amenity.id}">
                <label class="amenity-label">
                    <input type="checkbox" name="selectedAmenities" value="${amenity.id}" 
                           class="amenity-checkbox">
                    <div class="amenity-card">
                        <div class="amenity-icon">
                            <i class="${this.getAmenityIcon(amenity.category)}"></i>
                        </div>
                        <div class="amenity-info">
                            <h4>${amenity.name}</h4>
                            <p class="amenity-description">${amenity.description}</p>
                            <div class="amenity-details">
                                <span class="location"><i class="fas fa-map-marker-alt"></i> ${amenity.location}</span>
                                <span class="capacity"><i class="fas fa-users"></i> Up to ${amenity.max_guests} guests</span>
                                ${amenity.hourly_rate > 0 ? `<span class="rate"><i class="fas fa-dollar-sign"></i> $${amenity.hourly_rate}/hr</span>` : '<span class="rate free">Free</span>'}
                            </div>
                        </div>
                        <div class="amenity-status ${amenity.is_available ? 'available' : 'unavailable'}">
                            ${amenity.is_available ? 'Available' : 'Under Maintenance'}
                        </div>
                    </div>
                </label>
            </div>
        `).join('');
    }

    /**
     * Get appropriate icon for amenity category
     */
    getAmenityIcon(category) {
        const icons = {
            'pool': 'fas fa-swimming-pool',
            'social': 'fas fa-users',
            'outdoor': 'fas fa-tree',
            'fitness': 'fas fa-dumbbell',
            'business': 'fas fa-briefcase',
            'general': 'fas fa-building'
        };
        return icons[category] || 'fas fa-building';
    }

    /**
     * Get minimum date (today)
     */
    getMinDate() {
        return new Date().toISOString().split('T')[0];
    }

    /**
     * Get maximum date (90 days from now)
     */
    getMaxDate() {
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);
        return maxDate.toISOString().split('T')[0];
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        const form = document.getElementById('amenity-booking-form');
        
        // Form submission
        form.addEventListener('submit', this.handleSubmit.bind(this));
        
        // Amenity selection
        document.querySelectorAll('.amenity-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', this.handleAmenitySelection.bind(this));
        });

        // Date and time changes
        const dateInput = document.getElementById('bookingDate');
        const startTimeInput = document.getElementById('startTime');
        const endTimeInput = document.getElementById('endTime');

        dateInput.addEventListener('change', this.checkAvailability.bind(this));
        startTimeInput.addEventListener('change', this.checkAvailability.bind(this));
        endTimeInput.addEventListener('change', this.checkAvailability.bind(this));

        // Real-time validation
        form.querySelectorAll('input, textarea, select').forEach(field => {
            field.addEventListener('blur', () => this.validateField(field.name));
            field.addEventListener('input', () => this.debounceValidation(field.name));
        });

        // Cost calculation
        form.addEventListener('change', this.calculateCost.bind(this));

        // Cancel button
        document.getElementById('cancel-booking').addEventListener('click', this.handleCancel.bind(this));
    }

    /**
     * Prefill user data
     */
    prefillUserData() {
        if (this.currentUser) {
            document.getElementById('residentName').value = this.currentUser.name || '';
            document.getElementById('suiteNumber').value = this.currentUser.unitNumber || '';
        }
    }

    /**
     * Handle amenity selection
     */
    handleAmenitySelection(event) {
        const amenityId = parseInt(event.target.value);
        
        if (event.target.checked) {
            this.selectedAmenities.add(amenityId);
        } else {
            this.selectedAmenities.delete(amenityId);
        }

        this.updateAmenityVisuals();
        this.checkAvailability();
        this.calculateCost();
    }

    /**
     * Update visual feedback for selected amenities
     */
    updateAmenityVisuals() {
        document.querySelectorAll('.amenity-option').forEach(option => {
            const checkbox = option.querySelector('.amenity-checkbox');
            const card = option.querySelector('.amenity-card');
            
            if (checkbox.checked) {
                card.classList.add('selected');
            } else {
                card.classList.remove('selected');
            }
        });
    }

    /**
     * Check availability with debouncing
     */
    async checkAvailability() {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(async () => {
            await this.performAvailabilityCheck();
        }, 500);
    }

    /**
     * Perform actual availability check
     */
    async performAvailabilityCheck() {
        const date = document.getElementById('bookingDate').value;
        const amenityIds = Array.from(this.selectedAmenities);

        if (!date || amenityIds.length === 0) {
            this.clearAvailabilityStatus();
            return;
        }

        try {
            this.showAvailabilityLoading();
            
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/amenities/${amenityIds.join(',')}/availability?date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to check availability');

            const availability = await response.json();
            this.displayAvailabilityStatus(availability, date);
            
            // Also show booking schedule
            await this.showBookingSchedule(amenityIds, date);
            
        } catch (error) {
            console.error('Availability check failed:', error);
            this.showAvailabilityError('Failed to check availability');
        }
    }

    /**
     * Display availability status
     */
    displayAvailabilityStatus(availability, date) {
        const statusContainer = document.getElementById('availability-status');
        let html = '<h4>Availability Status</h4>';

        Object.entries(availability).forEach(([amenityId, data]) => {
            const slots = data.slots || [];
            const availableSlots = slots.filter(slot => slot.available);
            
            html += `
                <div class="availability-item">
                    <strong>${data.name}:</strong>
                    ${availableSlots.length > 0 
                        ? `<span class="status-available">${availableSlots.length} time slots available</span>`
                        : '<span class="status-unavailable">No available slots</span>'
                    }
                </div>
            `;
        });

        statusContainer.innerHTML = html;
        statusContainer.style.display = 'block';
    }

    /**
     * Show availability loading state
     */
    showAvailabilityLoading() {
        const statusContainer = document.getElementById('availability-status');
        statusContainer.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i> Checking availability...</div>';
        statusContainer.style.display = 'block';
    }

    /**
     * Show availability error
     */
    showAvailabilityError(message) {
        const statusContainer = document.getElementById('availability-status');
        statusContainer.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        statusContainer.style.display = 'block';
    }

    /**
     * Clear availability status
     */
    clearAvailabilityStatus() {
        const statusContainer = document.getElementById('availability-status');
        statusContainer.style.display = 'none';
        
        const scheduleContainer = document.getElementById('booking-schedule');
        if (scheduleContainer) {
            scheduleContainer.style.display = 'none';
        }
    }

    /**
     * Show booking schedule (without personal details)
     */
    async showBookingSchedule(amenityIds, date) {
        if (!amenityIds || amenityIds.length === 0 || !date) {
            this.clearBookingSchedule();
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`/api/amenities/${amenityIds.join(',')}/schedule?date=${date}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                console.warn('Failed to fetch booking schedule');
                return;
            }

            const schedule = await response.json();
            this.displayBookingSchedule(schedule, date);
            
        } catch (error) {
            console.error('Booking schedule fetch failed:', error);
        }
    }

    /**
     * Display booking schedule
     */
    displayBookingSchedule(schedule, date) {
        const scheduleContainer = document.getElementById('booking-schedule');
        if (!scheduleContainer) return;

        let html = '<h4>🗓️ Existing Bookings</h4>';
        let hasBookings = false;

        Object.entries(schedule).forEach(([amenityId, data]) => {
            if (data.bookedSlots && data.bookedSlots.length > 0) {
                hasBookings = true;
                html += `
                    <div class="schedule-item">
                        <strong>${data.amenityName}:</strong>
                        <div class="booked-slots">
                `;
                
                data.bookedSlots.forEach(slot => {
                    const statusClass = slot.status === 'confirmed' ? 'confirmed' : 'pending';
                    html += `
                        <div class="slot ${statusClass}">
                            <i class="fas fa-clock"></i>
                            <span>${slot.startTime} - ${slot.endTime}</span>
                            <span class="status-badge ${statusClass}">${slot.status}</span>
                        </div>
                    `;
                });
                
                html += `
                        </div>
                    </div>
                `;
            }
        });

        if (!hasBookings) {
            html += '<div class="no-bookings"><i class="fas fa-calendar-check"></i> No existing bookings for this date</div>';
        }

        scheduleContainer.innerHTML = html;
        scheduleContainer.style.display = 'block';
    }

    /**
     * Clear booking schedule
     */
    clearBookingSchedule() {
        const scheduleContainer = document.getElementById('booking-schedule');
        if (scheduleContainer) {
            scheduleContainer.style.display = 'none';
        }
    }

    /**
     * Calculate booking cost
     */
    async calculateCost() {
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const needsChairs = document.getElementById('needsFoldingChairs').checked;

        if (!startTime || !endTime || this.selectedAmenities.size === 0) {
            this.updateCostDisplay(0, 0, 0);
            return;
        }

        try {
            const duration = this.calculateDuration(startTime, endTime);
            let baseCost = 0;
            let additionalFees = 0;

            // Calculate base cost for selected amenities
            this.selectedAmenities.forEach(amenityId => {
                const amenity = this.amenities.find(a => a.id === amenityId);
                if (amenity) {
                    baseCost += (amenity.hourly_rate || 0) * duration;
                    additionalFees += (amenity.setup_fee || 0) + (amenity.cleaning_fee || 0);
                }
            });

            // Add folding chairs fee
            if (needsChairs) {
                additionalFees += 25.00;
            }

            this.updateCostDisplay(baseCost, additionalFees, baseCost + additionalFees);

        } catch (error) {
            console.error('Cost calculation failed:', error);
        }
    }

    /**
     * Update cost display
     */
    updateCostDisplay(baseCost, additionalFees, totalCost) {
        document.getElementById('base-cost').textContent = `$${baseCost.toFixed(2)}`;
        document.getElementById('additional-fees').textContent = `$${additionalFees.toFixed(2)}`;
        document.getElementById('total-cost').innerHTML = `<strong>$${totalCost.toFixed(2)}</strong>`;
    }

    /**
     * Calculate duration in hours
     */
    calculateDuration(startTime, endTime) {
        const start = this.parseTime(startTime);
        const end = this.parseTime(endTime);
        return Math.max(0, (end - start) / (1000 * 60 * 60));
    }

    /**
     * Parse time string to Date object
     */
    parseTime(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date;
    }

    /**
     * Debounced validation
     */
    debounceValidation(fieldName) {
        clearTimeout(this.debounceTimeout);
        this.debounceTimeout = setTimeout(() => {
            this.validateField(fieldName);
        }, 300);
    }

    /**
     * Validate individual field
     */
    validateField(fieldName) {
        const field = document.querySelector(`[name="${fieldName}"]`);
        const errorElement = document.getElementById(`${fieldName}-error`);
        
        if (!field || !this.validationRules[fieldName]) return true;

        const rule = this.validationRules[fieldName];
        const value = fieldName === 'selectedAmenities' 
            ? Array.from(this.selectedAmenities)
            : field.value.trim();

        let isValid = true;
        let errorMessage = '';

        // Required validation
        if (rule.required && (!value || (Array.isArray(value) && value.length === 0))) {
            isValid = false;
            errorMessage = rule.message || 'This field is required';
        }
        // Pattern validation
        else if (value && rule.pattern && !rule.pattern.test(value)) {
            isValid = false;
            errorMessage = rule.message || 'Invalid format';
        }
        // Custom validator
        else if (value && rule.validator) {
            const formData = this.getFormData();
            if (!rule.validator(value, formData)) {
                isValid = false;
                errorMessage = rule.message || 'Invalid value';
            }
        }
        // Min/Max validation
        else if (value && typeof value === 'number') {
            if (rule.min !== undefined && value < rule.min) {
                isValid = false;
                errorMessage = `Minimum value is ${rule.min}`;
            }
            else if (rule.max !== undefined && value > rule.max) {
                isValid = false;
                errorMessage = `Maximum value is ${rule.max}`;
            }
        }

        // Update UI
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = isValid ? 'none' : 'block';
        }

        if (field) {
            field.classList.toggle('error', !isValid);
            field.classList.toggle('valid', isValid && value);
        }

        return isValid;
    }

    /**
     * Validate entire form
     */
    validateForm() {
        let isValid = true;
        
        // Validate all fields with rules
        Object.keys(this.validationRules).forEach(fieldName => {
            if (!this.validateField(fieldName)) {
                isValid = false;
            }
        });

        return isValid;
    }

    /**
     * Get form data
     */
    getFormData() {
        console.log('📋 AmenityBookingForm: Starting getFormData...');
        
        const form = document.getElementById('amenity-booking-form');
        if (!form) {
            console.error('❌ Form element not found!');
            return {};
        }
        
        const formData = new FormData(form);
        const data = {};

        console.log('📋 FormData entries:');
        // Regular form fields - but skip selectedAmenities from FormData since we handle it separately
        for (let [key, value] of formData.entries()) {
            console.log(`  - ${key}: "${value}"`);
            if (key !== 'selectedAmenities') {
                data[key] = value;
            }
        }

        // Handle checkbox fields properly
        data.needsFoldingChairs = form.querySelector('#needsFoldingChairs')?.checked || false;

        // Add selected amenities from our Set
        console.log('📋 Selected amenities:', Array.from(this.selectedAmenities));
        data.selectedAmenities = Array.from(this.selectedAmenities);

        // Convert empty strings to appropriate defaults
        if (data.totalGuests === '') data.totalGuests = 0;
        if (data.eventDescription === '') data.eventDescription = '';
        if (data.specialRequests === '') data.specialRequests = '';

        console.log('📋 Final form data object (detailed):');
        console.log('  - residentName:', data.residentName);
        console.log('  - suiteNumber:', data.suiteNumber);
        console.log('  - bookingDate:', data.bookingDate);
        console.log('  - startTime:', data.startTime);
        console.log('  - endTime:', data.endTime);
        console.log('  - eventDescription:', data.eventDescription);
        console.log('  - totalGuests:', data.totalGuests);
        console.log('  - needsFoldingChairs:', data.needsFoldingChairs);
        console.log('  - specialRequests:', data.specialRequests);
        console.log('  - selectedAmenities:', data.selectedAmenities);
        console.log('📋 Complete data object:', JSON.stringify(data, null, 2));
        
        return data;
    }

    /**
     * Handle form submission
     */
    async handleSubmit(event) {
        event.preventDefault();
        console.log('🚀 AmenityBookingForm: Starting form submission...');

        // Collect form data ONCE at the start
        const formData = this.getFormData();
        console.log('📋 Initial form data collected:', formData);

        if (!this.validateFormData(formData)) {
            console.log('❌ Form validation failed');
            this.showError('Please correct the errors in the form');
            return;
        }
        console.log('✅ Form validation passed');

        try {
            this.showLoading('Submitting booking request...');
            
            const token = localStorage.getItem('token');
            console.log('🔍 Using token:', token ? `${token.substring(0, 20)}...` : 'null');
            
            console.log('📤 Sending POST request to /api/amenity-bookings...');
            console.log('📤 Request headers:', {
                'Content-Type': 'application/json',
                'Authorization': token ? `Bearer ${token.substring(0, 20)}...` : 'null'
            });
            console.log('📤 Request body:', JSON.stringify(formData, null, 2));

            const response = await fetch('/api/amenity-bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            console.log('📥 Response status:', response.status);
            console.log('📥 Response ok:', response.ok);
            console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));

            const result = await response.json();
            console.log('📥 Response data:', result);

            if (!response.ok) {
                console.error('❌ Server error response:', result);
                throw new Error(result.error || result.message || 'Booking failed');
            }

            console.log('✅ Booking submission successful:', result);
            this.showSuccess(`Booking created successfully! Reference: ${result.bookingReference || result.booking_reference || 'N/A'}`);
            
            setTimeout(() => {
                this.resetForm();
                if (typeof window.closeBookingModal === 'function') {
                    console.log('🔄 Calling window.closeBookingModal');
                    window.closeBookingModal();
                } else if (window.portalApp && window.portalApp.closeModal) {
                    console.log('🔄 Calling portalApp.closeModal');
                    window.portalApp.closeModal();
                } else {
                    console.log('⚠️ No close modal function available');
                }
            }, 2000);

        } catch (error) {
            console.error('❌ Booking submission failed:', error);
            console.error('❌ Error stack:', error.stack);
            this.showError(error.message || 'Failed to submit booking');
        }
    }

    /**
     * Validate form data object instead of re-reading form
     */
    validateFormData(data) {
        console.log('🔍 Validating form data:', data);
        
        if (!data.residentName || data.residentName.trim() === '') {
            console.log('❌ Missing resident name');
            return false;
        }
        if (!data.suiteNumber || data.suiteNumber.trim() === '') {
            console.log('❌ Missing suite number');
            return false;
        }
        if (!data.bookingDate) {
            console.log('❌ Missing booking date');
            return false;
        }
        if (!data.startTime) {
            console.log('❌ Missing start time');
            return false;
        }
        if (!data.endTime) {
            console.log('❌ Missing end time');
            return false;
        }
        if (!data.selectedAmenities || data.selectedAmenities.length === 0) {
            console.log('❌ No amenities selected');
            return false;
        }
        
        console.log('✅ All required fields present');
        return true;
    }

    /**
     * Handle cancel button
     */
    handleCancel() {
        if (confirm('Are you sure you want to cancel? All entered data will be lost.')) {
            this.resetForm();
            if (typeof window.closeBookingModal === 'function') {
                window.closeBookingModal();
            }
        }
    }

    /**
     * Reset form to initial state
     */
    resetForm() {
        const form = document.getElementById('amenity-booking-form');
        form.reset();
        this.selectedAmenities.clear();
        this.updateAmenityVisuals();
        this.clearAvailabilityStatus();
        this.updateCostDisplay(0, 0, 0);
        this.clearStatus();
        
        // Clear validation states
        form.querySelectorAll('.error, .valid').forEach(el => {
            el.classList.remove('error', 'valid');
        });
        form.querySelectorAll('.field-error').forEach(el => {
            el.style.display = 'none';
        });
    }

    /**
     * Show loading state
     */
    showLoading(message) {
        const statusElement = document.getElementById('form-status');
        statusElement.innerHTML = `<div class="loading"><i class="fas fa-spinner fa-spin"></i> ${message}</div>`;
        statusElement.style.display = 'block';
        
        // Disable form
        this.toggleFormDisabled(true);
    }

    /**
     * Show success message
     */
    showSuccess(message) {
        const statusElement = document.getElementById('form-status');
        statusElement.innerHTML = `<div class="success"><i class="fas fa-check-circle"></i> ${message}</div>`;
        statusElement.style.display = 'block';
        
        this.toggleFormDisabled(false);
    }

    /**
     * Show error message
     */
    showError(message) {
        const statusElement = document.getElementById('form-status');
        statusElement.innerHTML = `<div class="error"><i class="fas fa-exclamation-triangle"></i> ${message}</div>`;
        statusElement.style.display = 'block';
        
        this.toggleFormDisabled(false);
    }

    /**
     * Clear status messages
     */
    clearStatus() {
        const statusElement = document.getElementById('form-status');
        statusElement.style.display = 'none';
        statusElement.innerHTML = '';
    }

    /**
     * Toggle form disabled state
     */
    toggleFormDisabled(disabled) {
        const form = document.getElementById('amenity-booking-form');
        const formElements = form.querySelectorAll('input, textarea, select, button');
        
        formElements.forEach(element => {
            element.disabled = disabled;
        });
    }

    /**
     * Inject CSS styles
     */
    injectStyles() {
        if (document.getElementById('amenity-booking-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'amenity-booking-styles';
        styles.textContent = `
            .enterprise-booking-form {
                max-width: 1000px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                overflow: hidden;
            }

            .booking-form-header {
                background: linear-gradient(135deg, #D4AF37 0%, #B8941F 100%);
                color: white;
                padding: 2rem;
                text-align: center;
            }

            .booking-form-header h2 {
                margin: 0 0 0.5rem 0;
                font-size: 1.8rem;
                font-weight: 600;
            }

            .form-subtitle {
                margin: 0;
                opacity: 0.9;
                font-size: 1rem;
            }

            .booking-form {
                padding: 2rem;
            }

            .form-section {
                margin-bottom: 2.5rem;
                border-bottom: 1px solid #eee;
                padding-bottom: 2rem;
            }

            .form-section:last-of-type {
                border-bottom: none;
                margin-bottom: 1rem;
            }

            .form-section h3 {
                color: #333;
                font-size: 1.2rem;
                margin-bottom: 1.5rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .form-section h3 i {
                color: #D4AF37;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1.5rem;
                margin-bottom: 1rem;
            }

            .form-group {
                display: flex;
                flex-direction: column;
            }

            .form-group label {
                font-weight: 500;
                margin-bottom: 0.5rem;
                color: #333;
            }

            .form-group label.required::after {
                content: " *";
                color: #e74c3c;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                padding: 0.75rem;
                border: 2px solid #e0e0e0;
                border-radius: 8px;
                font-size: 1rem;
                transition: all 0.3s ease;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #D4AF37;
                box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
            }

            .form-group input.valid {
                border-color: #27ae60;
            }

            .form-group input.error {
                border-color: #e74c3c;
            }

            .field-error {
                color: #e74c3c;
                font-size: 0.875rem;
                margin-top: 0.25rem;
                display: none;
            }

            .amenity-selection {
                display: grid;
                grid-template-columns: 1fr;
                gap: 1rem;
            }

            .amenity-option {
                position: relative;
            }

            .amenity-label {
                cursor: pointer;
                display: block;
            }

            .amenity-checkbox {
                position: absolute;
                opacity: 0;
                pointer-events: none;
            }

            .amenity-card {
                border: 2px solid #e0e0e0;
                border-radius: 12px;
                padding: 1.5rem;
                display: flex;
                align-items: center;
                gap: 1rem;
                transition: all 0.3s ease;
                background: white;
            }

            .amenity-card:hover {
                border-color: #D4AF37;
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.1);
            }

            .amenity-card.selected {
                border-color: #D4AF37;
                background: #fefbf3;
                box-shadow: 0 4px 16px rgba(212, 175, 55, 0.2);
            }

            .amenity-icon {
                font-size: 2rem;
                color: #D4AF37;
                width: 60px;
                height: 60px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(212, 175, 55, 0.1);
                border-radius: 50%;
            }

            .amenity-info {
                flex: 1;
            }

            .amenity-info h4 {
                margin: 0 0 0.5rem 0;
                color: #333;
                font-size: 1.1rem;
            }

            .amenity-description {
                margin: 0 0 0.75rem 0;
                color: #666;
                font-size: 0.9rem;
                line-height: 1.4;
            }

            .amenity-details {
                display: flex;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .amenity-details span {
                font-size: 0.85rem;
                color: #666;
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .amenity-details .rate.free {
                color: #27ae60;
                font-weight: 500;
            }

            .amenity-status {
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                font-weight: 500;
                text-align: center;
            }

            .amenity-status.available {
                background: #d4edda;
                color: #155724;
            }

            .amenity-status.unavailable {
                background: #f8d7da;
                color: #721c24;
            }

            .checkbox-group {
                display: flex;
                align-items: center;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                cursor: pointer;
                font-weight: normal;
            }

            .checkmark {
                width: 20px;
                height: 20px;
                border: 2px solid #e0e0e0;
                border-radius: 4px;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
            }

            .checkbox-label input:checked + .checkmark {
                background: #D4AF37;
                border-color: #D4AF37;
            }

            .checkbox-label input:checked + .checkmark::after {
                content: "✓";
                color: white;
                font-weight: bold;
            }

            .availability-status {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                display: none;
            }

            .availability-status h4 {
                margin: 0 0 0.75rem 0;
                color: #333;
                font-size: 1rem;
            }

            .availability-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 0.5rem;
            }

            .status-available {
                color: #27ae60;
                font-weight: 500;
            }

            .status-unavailable {
                color: #e74c3c;
                font-weight: 500;
            }

            .booking-schedule {
                margin-top: 1rem;
                padding: 1rem;
                background: #f8f9fa;
                border-radius: 8px;
                border-left: 4px solid #6c757d;
                display: none;
            }

            .booking-schedule h4 {
                margin: 0 0 1rem 0;
                color: #495057;
                font-size: 1rem;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .schedule-item {
                margin-bottom: 1rem;
            }

            .schedule-item:last-child {
                margin-bottom: 0;
            }

            .schedule-item strong {
                display: block;
                margin-bottom: 0.5rem;
                color: #495057;
                font-size: 0.95rem;
            }

            .booked-slots {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }

            .booked-slots .slot {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                padding: 0.5rem 0.75rem;
                background: white;
                border-radius: 6px;
                border-left: 3px solid;
                font-size: 0.9rem;
                box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            }

            .booked-slots .slot.confirmed {
                border-left-color: #dc3545;
                background: #fff5f5;
            }

            .booked-slots .slot.pending {
                border-left-color: #ffc107;
                background: #fffbf0;
            }

            .status-badge {
                margin-left: auto;
                padding: 0.25rem 0.5rem;
                border-radius: 12px;
                font-size: 0.75rem;
                font-weight: 500;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            .status-badge.confirmed {
                background: #dc3545;
                color: white;
            }

            .status-badge.pending {
                background: #ffc107;
                color: #212529;
            }

            .no-bookings {
                text-align: center;
                padding: 1.5rem;
                color: #6c757d;
                font-style: italic;
            }

            .no-bookings i {
                display: block;
                font-size: 2rem;
                margin-bottom: 0.5rem;
                color: #28a745;
            }

            .cost-breakdown {
                background: #f8f9fa;
                border-radius: 8px;
                padding: 1.5rem;
            }

            .cost-item {
                display: flex;
                justify-content: space-between;
                margin-bottom: 0.75rem;
            }

            .cost-item.total {
                border-top: 1px solid #dee2e6;
                padding-top: 0.75rem;
                margin-top: 0.75rem;
                font-size: 1.1rem;
            }

            .form-actions {
                display: flex;
                justify-content: space-between;
                gap: 1rem;
                margin-top: 2rem;
            }

            .btn {
                padding: 0.875rem 2rem;
                border: none;
                border-radius: 8px;
                font-size: 1rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                text-decoration: none;
            }

            .btn-primary {
                background: #D4AF37;
                color: white;
            }

            .btn-primary:hover {
                background: #B8941F;
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
            }

            .btn-secondary {
                background: #6c757d;
                color: white;
            }

            .btn-secondary:hover {
                background: #5a6268;
            }

            .btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
                transform: none;
            }

            .form-status {
                margin-top: 1rem;
                display: none;
            }

            .form-status .loading,
            .form-status .success,
            .form-status .error {
                padding: 1rem;
                border-radius: 8px;
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }

            .form-status .loading {
                background: #d1ecf1;
                color: #0c5460;
            }

            .form-status .success {
                background: #d4edda;
                color: #155724;
            }

            .form-status .error {
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
                .booking-form {
                    padding: 1rem;
                }

                .form-row {
                    grid-template-columns: 1fr;
                    gap: 1rem;
                }

                .amenity-card {
                    flex-direction: column;
                    text-align: center;
                }

                .amenity-details {
                    justify-content: center;
                }

                .form-actions {
                    flex-direction: column;
                }
            }
        `;

        document.head.appendChild(styles);
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (document.getElementById('booking-form-container')) {
            new AmenityBookingForm();
        }
    });
} else {
    if (document.getElementById('booking-form-container')) {
        new AmenityBookingForm();
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AmenityBookingForm;
} 