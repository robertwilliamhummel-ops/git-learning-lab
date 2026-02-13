/**
 * TechFlow Solutions - Main JavaScript File
 * Handles navigation, forms, animations, and interactive features
 */

console.log('Main.js loaded successfully');

// Utility functions - defined first to avoid timing issues
const Utils = {
    // Debounce function for performance
    debounce: function(func, wait, immediate) {
        let timeout;
        return function executedFunction() {
            const context = this;
            const args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },
    
    // Throttle function for scroll events
    throttle: function(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },
    
    // Format currency with error handling
    formatCurrency: function(amount) {
        try {
            return new Intl.NumberFormat('en-CA', {
                style: 'currency',
                currency: 'CAD'
            }).format(amount);
        } catch (error) {
            console.error('Currency formatting error:', error);
            return `$${amount.toFixed(2)}`;
        }
    },
    
    // Validate email
    isValidEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Format phone number
    formatPhone: function(phone) {
        const cleaned = phone.replace(/\D/g, '');
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
        return phone;
    }
};

// Export for use in other scripts
window.TechFlowUtils = Utils;

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM Content Loaded - initializing all systems');
    initializeNavigation();
    initializeScrollEffects();
    initializeForms();
    initializeAnimations();
    initializeServiceCalculator();
    initializeCollapsibleSections();
    // Initialize booking system with delay to ensure DOM is ready
    setTimeout(() => {
        initializeBookingSystem();
    }, 100);
    initializeFAQ();
    
    // Initialize portfolio functionality
    if (document.querySelector('.portfolio-filter')) {
        PortfolioFilter.init();
        LoadMoreButton.init();
    }
    
    // Initialize portfolio animations
    PortfolioAnimations.init();
    
    // Initialize mobile optimizations
    initializeMobileOptimizations();
});

/**
 * Navigation Functionality
 */
function initializeNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileNavLinks = document.querySelectorAll('.nav-menu .nav-link'); // Only mobile nav links
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    let isMenuOpen = false;

    // Enhanced mobile menu toggle with accessibility
    if (hamburger && navMenu && backdrop) {
        
        // Toggle menu function with enhanced debugging
        function toggleMenu() {
            console.log('🔄 TOGGLE MENU CALLED:', {
                currentState: isMenuOpen,
                aboutToBecome: !isMenuOpen
            });
            
            isMenuOpen = !isMenuOpen;
            
            // Update classes
            hamburger.classList.toggle('active', isMenuOpen);
            navMenu.classList.toggle('active', isMenuOpen);
            backdrop.classList.toggle('active', isMenuOpen);
            
            console.log('✅ CLASSES UPDATED:', {
                newState: isMenuOpen,
                hamburgerActive: hamburger.classList.contains('active'),
                menuActive: navMenu.classList.contains('active'),
                backdropActive: backdrop.classList.contains('active')
            });
            
            // Update ARIA attributes
            hamburger.setAttribute('aria-expanded', isMenuOpen);
            
            // Prevent body scroll when menu is open, but allow menu scroll
            if (isMenuOpen) {
                document.body.style.overflow = 'hidden';
                navMenu.style.overflowY = 'auto';
            } else {
                document.body.style.overflow = '';
                navMenu.style.overflowY = '';
            }
            
            // Focus management
            if (isMenuOpen) {
                // Focus first menu item when opening
                const firstLink = navMenu.querySelector('.nav-link');
                if (firstLink) {
                    setTimeout(() => firstLink.focus(), 100);
                }
            } else {
                // Return focus to hamburger when closing
                hamburger.focus();
            }
        }
        
        // Close menu function with debugging
        function closeMenu() {
            console.log('❌ CLOSE MENU CALLED:', {
                currentState: isMenuOpen,
                willClose: isMenuOpen
            });
            
            if (isMenuOpen) {
                isMenuOpen = false;
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                backdrop.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                document.body.style.overflow = '';
                navMenu.style.overflowY = '';
                
                console.log('✅ MENU CLOSED:', {
                    newState: isMenuOpen,
                    hamburgerActive: hamburger.classList.contains('active'),
                    menuActive: navMenu.classList.contains('active')
                });
            } else {
                console.log('⚠️ CLOSE MENU CALLED BUT MENU ALREADY CLOSED');
            }
        }
        
        // Hamburger click handler with enhanced debugging and event handling
        hamburger.addEventListener('click', function(e) {
            // Only stop propagation, don't prevent default for button clicks
            e.stopPropagation();
            
            console.log('🍔 HAMBURGER CLICK EVENT:', {
                timestamp: new Date().toLocaleTimeString(),
                currentMenuState: isMenuOpen,
                hamburgerHasActive: hamburger.classList.contains('active'),
                menuHasActive: navMenu.classList.contains('active'),
                event: e,
                target: e.target,
                currentTarget: e.currentTarget,
                clientX: e.clientX,
                clientY: e.clientY
            });
            
            toggleMenu();
            
            // Log state after toggle
            setTimeout(() => {
                console.log('🔄 AFTER TOGGLE:', {
                    newMenuState: isMenuOpen,
                    hamburgerHasActive: hamburger.classList.contains('active'),
                    menuHasActive: navMenu.classList.contains('active')
                });
            }, 50);
        });
        
        // Add additional event listeners for better mobile support
        hamburger.addEventListener('touchstart', function(e) {
            console.log('👆 HAMBURGER TOUCH START');
        });
        
        hamburger.addEventListener('touchend', function(e) {
            console.log('👆 HAMBURGER TOUCH END');
            // Only prevent default on touch end to avoid double-firing
            // but don't prevent the button's normal click behavior
        });
        
        // Fallback mechanism: Double-click detection for stubborn cases
        let lastClickTime = 0;
        hamburger.addEventListener('dblclick', function(e) {
            console.log('🔄 DOUBLE CLICK DETECTED - FORCING TOGGLE');
            e.stopPropagation();
            toggleMenu();
        });
        
        // Additional fallback: Long press detection
        let longPressTimer;
        hamburger.addEventListener('mousedown', function(e) {
            longPressTimer = setTimeout(() => {
                console.log('⏰ LONG PRESS DETECTED - FORCING CLOSE');
                if (isMenuOpen) {
                    closeMenu();
                }
            }, 1000);
        });
        
        hamburger.addEventListener('mouseup', function(e) {
            clearTimeout(longPressTimer);
        });
        
        hamburger.addEventListener('mouseleave', function(e) {
            clearTimeout(longPressTimer);
        });
        
        // Backdrop click handler with debugging
        backdrop.addEventListener('click', function(e) {
            console.log('🎭 BACKDROP CLICKED:', {
                timestamp: new Date().toLocaleTimeString(),
                target: e.target,
                currentTarget: e.currentTarget,
                menuState: isMenuOpen
            });
            closeMenu();
        });
        
        // Close mobile menu when clicking on a link
        navLinks.forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isMenuOpen) {
                closeMenu();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (window.innerWidth > 767 && isMenuOpen) {
                closeMenu();
            }
        });
        
        // Prevent backdrop scroll but allow menu scroll
        backdrop.addEventListener('touchmove', function(e) {
            e.preventDefault();
        }, { passive: false });
        
        navMenu.addEventListener('touchmove', function(e) {
            e.stopPropagation();
        });
    }

    // Fix persistent focus on navigation links
    function initializeFocusManagement() {
        const navLinks = document.querySelectorAll('.nav-link');
        
        // Remove focus from nav links when clicking elsewhere
        document.addEventListener('click', function(e) {
            // If the clicked element is not a nav link, blur all nav links
            if (!e.target.closest('.nav-link')) {
                navLinks.forEach(link => {
                    if (link === document.activeElement) {
                        link.blur();
                    }
                });
            }
        });
        
        // Also remove focus when pressing Enter on nav links (after navigation)
        navLinks.forEach(link => {
            link.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    // Small delay to allow navigation, then blur
                    setTimeout(() => {
                        this.blur();
                    }, 100);
                }
            });
        });
    }
    
    // Initialize focus management
    initializeFocusManagement();

    // Skip JavaScript active state management - rely on HTML active classes
    // The HTML files already have correct active states set manually
    console.log('🔍 NAVIGATION DEBUG: Skipping JS active state management, using HTML active classes');

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

/**
 * Scroll Effects
 */
function initializeScrollEffects() {
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    // Header scroll effect
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Add shadow to header when scrolling
        if (scrollTop > 10) {
            header.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';
        }

        lastScrollTop = scrollTop;
    });

    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observe elements for animation
    document.querySelectorAll('.service-card, .why-feature, .testimonial-card').forEach(el => {
        observer.observe(el);
    });
}

/**
 * Collapsible Service Sections
 */
function initializeCollapsibleSections() {
    console.log('Initializing collapsible service sections');
    
    // Find all service toggle buttons
    const toggleButtons = document.querySelectorAll('.service-toggle');
    
    toggleButtons.forEach(button => {
        button.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            const targetId = this.getAttribute('aria-controls');
            const targetContent = document.getElementById(targetId);
            
            if (!targetContent) {
                console.warn(`Target content not found for ID: ${targetId}`);
                return;
            }
            
            // Toggle the expanded state
            const newExpandedState = !isExpanded;
            this.setAttribute('aria-expanded', newExpandedState);
            
            // Toggle classes
            this.classList.toggle('collapsed', !newExpandedState);
            targetContent.classList.toggle('collapsed', !newExpandedState);
            
            // Smooth height transition
            if (newExpandedState) {
                // Expanding
                targetContent.style.maxHeight = targetContent.scrollHeight + 'px';
                targetContent.style.opacity = '1';
                targetContent.style.padding = '';
                targetContent.style.margin = '';
            } else {
                // Collapsing
                targetContent.style.maxHeight = '0';
                targetContent.style.opacity = '0';
                targetContent.style.padding = '0';
                targetContent.style.margin = '0';
            }
            
            console.log(`Toggled ${targetId}: ${newExpandedState ? 'expanded' : 'collapsed'}`);
        });
    });
    
    // Initialize default states - all sections collapsed by default (except Remote Support)
    toggleButtons.forEach(button => {
        const targetId = button.getAttribute('aria-controls');
        const targetContent = document.getElementById(targetId);
        const section = button.closest('.service-section');
        
        if (!targetContent || !section) return;
        
        // Skip remote support section as it should always be expanded
        if (section.classList.contains('remote-support-service')) {
            return;
        }
        
        // All sections start collapsed on all screen sizes
        button.setAttribute('aria-expanded', 'false');
        button.classList.add('collapsed');
        targetContent.classList.add('collapsed');
        
        // Ensure toggle button is visible
        button.style.display = 'block';
    });
    
    console.log(`Initialized ${toggleButtons.length} collapsible service sections`);
}

/**
 * Form Handling
 */
function initializeForms() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const formType = form.getAttribute('data-form-type') || 'contact';
            
            // Show loading state
            const submitBtn = form.querySelector('button[type="submit"]');
            const originalText = submitBtn.textContent;
            submitBtn.innerHTML = '<span class="spinner"></span>Sending...';
            submitBtn.disabled = true;
            
            // Simulate form submission (replace with actual endpoint)
            setTimeout(() => {
                handleFormSubmission(formData, formType, form);
                
                // Reset button
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }, 2000);
        });
    });

    // Real-time form validation
    document.querySelectorAll('input, textarea, select').forEach(field => {
        field.addEventListener('blur', function() {
            validateField(this);
        });

        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

/**
 * Form Validation
 */
function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');
    
    clearFieldError(field);
    
    if (required && !value) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            showFieldError(field, 'Please enter a valid email address');
            return false;
        }
    }
    
    if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            showFieldError(field, 'Please enter a valid phone number');
            return false;
        }
    }
    
    return true;
}

function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

function clearFieldError(field) {
    field.classList.remove('error');
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

/**
 * Form Submission Handler
 */
function handleFormSubmission(formData, formType, form) {
    // Initialize EmailJS with your actual public key
    emailjs.init("QPLcDCj74Fq0lTwK-");
    
    const templateParams = {};
    
    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
        templateParams[key] = value;
    }
    
    // Add form type and timestamp
    templateParams.form_type = formType;
    templateParams.submission_date = new Date().toLocaleString();
    templateParams.to_email = 'rob@techflowsolutions.ca';
    
    // Send email using EmailJS
    emailjs.send('service_fpx3i2b', 'template_dwmz48t', templateParams)
        .then(function(response) {
            console.log('Email sent successfully:', response);
            showNotification('Message sent successfully! We\'ll get back to you soon.', 'success');
            
            // Reset form
            form.reset();
            
            // For booking forms, redirect to confirmation
            if (formType === 'booking') {
                setTimeout(() => {
                    showNotification('Booking submitted! Check your email for confirmation.', 'success');
                }, 2000);
            }
        })
        .catch(function(error) {
            console.error('Email send failed:', error);
            showNotification('Sorry, there was an error sending your message. Please try calling us directly.', 'error');
        });
}

/**
 * Notification System
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">Got it!</button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Auto hide after 8 seconds (longer for mobile users)
    setTimeout(() => {
        hideNotification(notification);
    }, 8000);
    
    // Close button functionality
    notification.querySelector('.notification-close').addEventListener('click', () => {
        hideNotification(notification);
    });
    
    // Add backdrop for mobile
    if (window.innerWidth <= 768) {
        const backdrop = document.createElement('div');
        backdrop.className = 'notification-backdrop';
        backdrop.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        document.body.appendChild(backdrop);
        
        setTimeout(() => {
            backdrop.style.opacity = '1';
        }, 100);
        
        // Remove backdrop when notification is closed
        const originalHide = hideNotification;
        window.hideNotificationWithBackdrop = function(notif) {
            backdrop.style.opacity = '0';
            setTimeout(() => {
                if (backdrop.parentNode) {
                    backdrop.parentNode.removeChild(backdrop);
                }
            }, 300);
            originalHide(notif);
        };
        
        // Update close button to use backdrop version
        notification.querySelector('.notification-close').addEventListener('click', () => {
            window.hideNotificationWithBackdrop(notification);
        });
    }
}

function hideNotification(notification) {
    notification.classList.remove('show');
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 300);
}

/**
 * Animations
 */
function initializeAnimations() {
    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        .service-card,
        .why-feature,
        .testimonial-card {
            opacity: 0;
            transform: translateY(30px);
            transition: all 0.6s ease-out;
        }
        
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
        
        .notification {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) scale(0.8);
            background: var(--bg-dark);
            color: var(--text-primary);
            border-radius: 12px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
            padding: 24px;
            transition: all 0.3s ease-out;
            z-index: 10000;
            max-width: 90vw;
            width: 400px;
            text-align: center;
            opacity: 0;
            visibility: hidden;
        }
        
        .notification.show {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
            visibility: visible;
        }
        
        .notification-success {
            border: 3px solid #10b981;
            background: linear-gradient(135deg, var(--bg-dark) 0%, rgba(16, 185, 129, 0.1) 100%);
        }
        
        .notification-error {
            border: 3px solid #ef4444;
            background: linear-gradient(135deg, var(--bg-dark) 0%, rgba(239, 68, 68, 0.1) 100%);
        }
        
        /* Mobile-specific notification styles */
        @media (max-width: 768px) {
            .notification {
                width: 90vw;
                max-width: 350px;
                padding: 20px;
                font-size: 1.1rem;
                border-radius: 16px;
            }
        }
        
        .notification-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 16px;
        }
        
        .notification-message {
            font-size: 1.1rem;
            font-weight: 600;
            line-height: 1.5;
            color: var(--text-primary);
        }
        
        .notification-close {
            background: var(--primary-blue);
            color: white;
            border: none;
            border-radius: 8px;
            padding: 8px 16px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background-color 0.2s ease;
        }
        
        .notification-close:hover {
            background: var(--secondary-blue);
        }
        
        /* Success notification icon */
        .notification-success .notification-content::before {
            content: '✓';
            display: block;
            font-size: 3rem;
            color: #10b981;
            margin-bottom: 8px;
        }
        
        /* Error notification icon */
        .notification-error .notification-content::before {
            content: '⚠';
            display: block;
            font-size: 3rem;
            color: #ef4444;
            margin-bottom: 8px;
        }
        
        .field-error {
            color: #ef4444;
            font-size: 0.875rem;
            margin-top: 4px;
        }
        
        .error {
            border-color: #ef4444 !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * Service Calculator
 */
function initializeServiceCalculator() {
    console.log('Initializing service calculator...');
    const calculator = document.getElementById('service-calculator');
    if (!calculator) {
        console.warn('Service calculator element not found');
        return;
    }
    
    const serviceSelect = calculator.querySelector('#service-type');
    const urgencySelect = calculator.querySelector('#urgency');
    const estimateDisplay = calculator.querySelector('#price-estimate');
    
    if (!serviceSelect || !urgencySelect || !estimateDisplay) {
        console.error('Calculator elements not found:', {
            serviceSelect: !!serviceSelect,
            urgencySelect: !!urgencySelect,
            estimateDisplay: !!estimateDisplay
        });
        return;
    }
    
    console.log('Calculator elements found successfully');
    
    const basePrices = {
        'remote-support': 80,           // Remote support fixed rate - instant service
        'diagnostic': 125,              // $125 (waived with repair)
        'virus-removal': 200,           // $175-$225 → middle = $200
        'performance-optimization': 175, // $150-$200 → middle = $175
        'ssd-upgrade': 225,             // $225 + SSD cost (service only)
        'ram-upgrade': 125,             // $125 + RAM cost (service only)
        'network-setup': 300,           // $250-$350 → middle = $300
        'data-recovery': 450,           // $300-$600+ → middle = $450
        'custom-build': 400             // $300-$500 → middle = $400 (service only)
    };
    
    const urgencyMultipliers = {
        'standard': 1,
        'same-day': 1.1
    };
    
    // Completion time estimates for each service
    const completionTimes = {
        'remote-support': {
            standard: 'Connect in minutes - work completed within 1-2 hours',
            'same-day': 'Connect instantly - priority support'
        },
        'diagnostic': {
            standard: '2-4 hours for complete system analysis',
            'same-day': '1-2 hours with priority scheduling'
        },
        'virus-removal': {
            standard: '4-8 hours for thorough cleaning and protection setup',
            'same-day': '2-4 hours with expedited service'
        },
        'performance-optimization': {
            standard: '3-6 hours for complete system optimization',
            'same-day': '2-3 hours with priority service'
        },
        'ssd-upgrade': {
            standard: 'Same day service - 2-4 hours including data migration',
            'same-day': '1-2 hours with priority installation'
        },
        'ram-upgrade': {
            standard: 'Same day service - 1-2 hours installation',
            'same-day': '30-60 minutes with priority service'
        },
        'network-setup': {
            standard: '4-6 hours for complete network configuration',
            'same-day': '2-3 hours with expedited setup'
        },
        'data-recovery': {
            standard: '24-72 hours depending on drive condition',
            'same-day': '4-12 hours for urgent recovery attempts'
        },
        'custom-build': {
            standard: '2-3 days for complete build and testing',
            'same-day': 'Same day build available for standard configurations'
        }
    };
    
    // Service recommendations based on selection
    const serviceRecommendations = {
        'remote-support': [
            { service: 'performance-optimization', reason: 'Often needed after remote fixes' },
            { service: 'virus-removal', reason: 'Common remote support request' }
        ],
        'diagnostic': [
            { service: 'ssd-upgrade', reason: 'Most common performance improvement' },
            { service: 'performance-optimization', reason: 'Usually follows diagnostic' }
        ],
        'virus-removal': [
            { service: 'performance-optimization', reason: 'Restore optimal performance' },
            { service: 'remote-support', reason: 'Ongoing protection monitoring' }
        ],
        'performance-optimization': [
            { service: 'ssd-upgrade', reason: 'Best performance boost available' },
            { service: 'ram-upgrade', reason: 'Complement optimization efforts' }
        ],
        'ssd-upgrade': [
            { service: 'performance-optimization', reason: 'Maximize your new SSD performance' },
            { service: 'ram-upgrade', reason: 'Complete performance package' }
        ],
        'ram-upgrade': [
            { service: 'ssd-upgrade', reason: 'Ultimate performance combination' },
            { service: 'performance-optimization', reason: 'Optimize for new hardware' }
        ],
        'network-setup': [
            { service: 'remote-support', reason: 'Ongoing network maintenance' },
            { service: 'diagnostic', reason: 'Ensure all devices are optimized' }
        ],
        'data-recovery': [
            { service: 'ssd-upgrade', reason: 'Prevent future data loss' },
            { service: 'diagnostic', reason: 'Identify what caused the failure' }
        ],
        'custom-build': [
            { service: 'performance-optimization', reason: 'Optimize your new system' },
            { service: 'network-setup', reason: 'Professional network integration' }
        ]
    };
    
    function calculatePrice() {
        console.log('🔧 PRICING DEBUG: calculatePrice() called');
        const service = serviceSelect.value;
        const urgency = urgencySelect.value;
        const completionTimeElement = calculator.querySelector('#completion-time');
        const completionTextElement = calculator.querySelector('#completion-text');
        const bookingButton = calculator.querySelector('.calculator-actions a');
        
        console.log('📊 PRICING DEBUG: Selected values:', {
            service: service || '(empty)',
            urgency: urgency || '(empty)'
        });
        
        // Hide completion time if no service selected
        if (!service || !urgency) {
            console.log('⚠️ PRICING DEBUG: Missing selection, setting placeholder');
            estimateDisplay.textContent = 'Select options above';
            estimateDisplay.style.color = '#6b7280';
            if (completionTimeElement) {
                completionTimeElement.style.display = 'none';
            }
            // Reset booking button to default
            if (bookingButton) {
                bookingButton.href = 'booking.html';
            }
            return;
        }
        
        // DIAGNOSTIC: Check if this is a remote service
        const isRemoteService = service === 'remote-support';
        console.log('🏠 PRICING DEBUG: Is remote service?', isRemoteService);
        
        const basePrice = basePrices[service] || 100;
        const multiplier = urgencyMultipliers[urgency] || 1;
        
        // SPECIAL CASE: Remote support is always $80 (no urgency multipliers)
        let totalPrice;
        if (isRemoteService) {
            totalPrice = basePrice; // Fixed $80 rate for remote support
            console.log('🏠 PRICING DEBUG: Remote support - fixed rate applied:', {
                service,
                basePrice,
                totalPrice,
                note: 'Remote support ignores urgency multipliers - instant service'
            });
        } else {
            // Regular calculation for on-site services
            totalPrice = Math.round(basePrice * multiplier);
            console.log('🧮 PRICING DEBUG: On-site service calculation:', {
                service,
                basePrice,
                urgency,
                multiplier,
                totalPrice,
                note: 'On-site services use urgency multipliers'
            });
        }
        
        // Display completion time
        if (completionTimes[service] && completionTimes[service][urgency]) {
            const completionTime = completionTimes[service][urgency];
            if (completionTextElement) {
                completionTextElement.textContent = completionTime;
            }
            if (completionTimeElement) {
                completionTimeElement.style.display = 'flex';
                // Add smooth fade-in animation
                completionTimeElement.style.opacity = '0';
                setTimeout(() => {
                    completionTimeElement.style.opacity = '1';
                }, 100);
            }
        }
        
        // Update booking button with selected service
        if (bookingButton && service) {
            bookingButton.href = `booking.html?service=${service}`;
            console.log('🔗 Updated booking link:', bookingButton.href);
        }
        
        // Update service recommendations
        updateServiceRecommendations(service);
        
        try {
            const formattedPrice = Utils.formatCurrency(totalPrice);
            console.log('💰 ENHANCED DEBUG: Formatted price:', formattedPrice);
            
            // Add smooth price update animation
            estimateDisplay.style.transform = 'scale(1.1)';
            estimateDisplay.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                estimateDisplay.textContent = formattedPrice;
                estimateDisplay.style.color = '#f59e0b';
                estimateDisplay.style.transform = 'scale(1)';
            }, 150);
            
        } catch (error) {
            console.error('❌ ENHANCED DEBUG: Error formatting currency:', error);
            estimateDisplay.textContent = `$${totalPrice.toFixed(2)}`;
            estimateDisplay.style.color = '#059669';
            console.log('⚠️ ENHANCED DEBUG: Fallback price set:', estimateDisplay.textContent);
        }
    }
    
    // Function to update service recommendations
    function updateServiceRecommendations(selectedService) {
        const recommendationsContainer = document.querySelector('#service-recommendations .recommendation-list');
        if (!recommendationsContainer || !serviceRecommendations[selectedService]) {
            return;
        }
        
        const recommendations = serviceRecommendations[selectedService];
        const serviceNames = {
            'remote-support': 'Remote Support',
            'diagnostic': 'Computer Diagnostic',
            'virus-removal': 'Virus Removal',
            'performance-optimization': 'Performance Optimization',
            'ssd-upgrade': 'SSD Upgrade',
            'ram-upgrade': 'RAM Upgrade',
            'network-setup': 'Network Setup',
            'data-recovery': 'Data Recovery',
            'custom-build': 'Custom PC Build'
        };
        
        const serviceIcons = {
            'remote-support': 'fas fa-desktop',
            'diagnostic': 'fas fa-search',
            'virus-removal': 'fas fa-shield-virus',
            'performance-optimization': 'fas fa-tachometer-alt',
            'ssd-upgrade': 'fas fa-hdd',
            'ram-upgrade': 'fas fa-memory',
            'network-setup': 'fas fa-network-wired',
            'data-recovery': 'fas fa-life-ring',
            'custom-build': 'fas fa-desktop'
        };
        
        // Clear existing recommendations
        recommendationsContainer.innerHTML = '';
        
        // Add new recommendations
        recommendations.forEach((rec, index) => {
            const recElement = document.createElement('div');
            recElement.className = 'recommendation-item';
            if (index === 0) recElement.classList.add('popular');
            
            recElement.innerHTML = `
                <i class="${serviceIcons[rec.service]}"></i>
                <div class="recommendation-content">
                    <h4>${serviceNames[rec.service]}</h4>
                    <p>${rec.reason}</p>
                    <span class="recommendation-badge">${index === 0 ? 'Recommended' : 'Popular'}</span>
                </div>
            `;
            
            recommendationsContainer.appendChild(recElement);
        });
        
        // Add fade-in animation
        recommendationsContainer.style.opacity = '0';
        setTimeout(() => {
            recommendationsContainer.style.opacity = '1';
        }, 200);
    }
    
    // Add event listeners
    serviceSelect.addEventListener('change', calculatePrice);
    urgencySelect.addEventListener('change', calculatePrice);
    
    console.log('Service calculator initialized successfully');
}
    
    /**
     * Enhanced Booking System with Multi-Step Navigation
     */
    function initializeBookingSystem() {
    console.log('Initializing booking system...');
    const bookingForm = document.getElementById('booking-form');
    if (!bookingForm) {
        console.log('Booking form not found!');
        return;
    }

    let currentStep = 1;
    const totalSteps = 4;

    // Initialize first step
    showStep(1);
    updateStepIndicators(1);

    // Service selection handlers
    initializeServiceSelection();
    
    // Step navigation handlers
    initializeStepNavigation();
    
    // Form validation
    initializeBookingValidation();
    
    // Date and time handlers will be initialized when step 2 is shown

    function showStep(stepNumber) {
        console.log('📋 STEP DEBUG: Showing step:', stepNumber);
        
        // Hide all steps with force
        const allSteps = document.querySelectorAll('.form-step');
        allSteps.forEach(step => {
            step.classList.remove('active');
            step.style.display = 'none';
        });
        
        // Show current step - specifically target .form-step elements
        const currentStepElement = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        if (currentStepElement) {
            // Force show the step with multiple methods
            currentStepElement.classList.add('active');
            currentStepElement.style.display = 'block';
            currentStepElement.style.visibility = 'visible';
            currentStepElement.style.opacity = '1';
            
            console.log('✅ STEP DEBUG: Step', stepNumber, 'is now active and visible');
            
            // Special handling for step 2 (Date & Time)
            if (stepNumber === 2) {
                console.log('📅 STEP DEBUG: Initializing step 2 - Date & Time');
                
                // Force show the time selection section
                const timeSelection = currentStepElement.querySelector('.time-selection');
                if (timeSelection) {
                    timeSelection.style.display = 'block';
                    timeSelection.style.visibility = 'visible';
                    timeSelection.style.opacity = '1';
                    console.log('✅ STEP DEBUG: Time selection section forced visible');
                }
                
                // Show backup time selection immediately as fallback
                const backupSelection = currentStepElement.querySelector('.backup-time-selection');
                if (backupSelection) {
                    backupSelection.style.display = 'block';
                    backupSelection.style.visibility = 'visible';
                    backupSelection.style.opacity = '1';
                    console.log('🔄 STEP DEBUG: Backup time selection shown');
                }
                
                // Initialize date/time functionality
                setTimeout(() => {
                    initializeDateTimeSelection();
                }, 100);
            }
        } else {
            console.error('❌ STEP DEBUG: Target step not found:', stepNumber);
        }
        
        currentStep = stepNumber;
        updateStepIndicators(stepNumber);
        
        // Smooth scroll to booking form when changing steps
        const bookingForm = document.getElementById('booking-form');
        if (bookingForm) {
            bookingForm.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    function updateStepIndicators(stepNumber) {
        document.querySelectorAll('.step').forEach((step, index) => {
            step.classList.remove('active');
            if (index + 1 === stepNumber) {
                step.classList.add('active');
            }
        });
    }

    function initializeServiceSelection() {
        const serviceOptions = document.querySelectorAll('.service-option');
        const step1NextBtn = document.getElementById('step1-next');

        serviceOptions.forEach(option => {
            option.addEventListener('click', function() {
                // Remove selected class from all options
                serviceOptions.forEach(opt => opt.classList.remove('selected'));
                
                // Add selected class to clicked option
                this.classList.add('selected');
                
                // Check the radio button
                const radio = this.querySelector('input[type="radio"]');
                if (radio) {
                    radio.checked = true;
                }
                
                // Enable next button
                if (step1NextBtn) {
                    step1NextBtn.disabled = false;
                }
            });
        });

        // Step 1 next button
        if (step1NextBtn) {
            step1NextBtn.addEventListener('click', function() {
                if (validateStep1()) {
                    showStep(2);
                }
            });
        }
    }

    function initializeDateTimeSelection() {
        console.log('📅 DATE/TIME DEBUG: Initializing date/time selection...');
        
        // Use more robust element selection
        const dateInput = document.getElementById('booking-date') || document.querySelector('input[type="date"]');
        const timeSlotsContainer = document.getElementById('time-slots') || document.querySelector('.time-slots');
        const step2NextBtn = document.getElementById('step2-next');
        const step2BackBtn = document.getElementById('step2-back');

        console.log('📅 DATE/TIME DEBUG: Elements found:', {
            dateInput: !!dateInput,
            timeSlotsContainer: !!timeSlotsContainer,
            step2NextBtn: !!step2NextBtn,
            step2BackBtn: !!step2BackBtn
        });

        // Set minimum date to today
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.min = today;
            console.log('📅 DATE/TIME DEBUG: Set minimum date to:', today);
            
            // Remove any existing event listeners first
            dateInput.removeEventListener('change', handleDateChange);
            dateInput.addEventListener('change', handleDateChange);
            
            // Also listen for input events as fallback
            dateInput.removeEventListener('input', handleDateChange);
            dateInput.addEventListener('input', handleDateChange);
            
            function handleDateChange() {
                console.log('📅 DATE/TIME DEBUG: Date changed to:', this.value);
                if (this.value) {
                    generateTimeSlots(this.value);
                } else {
                    clearTimeSlots();
                }
                checkStep2Completion();
            }
            
            console.log('✅ DATE/TIME DEBUG: Date input event listeners added');
        } else {
            console.error('❌ DATE/TIME DEBUG: Date input element not found!');
        }
        
        // Initialize time slots container if date already has value
        if (dateInput && dateInput.value) {
            console.log('📅 DATE/TIME DEBUG: Date already selected, generating time slots...');
            generateTimeSlots(dateInput.value);
        }

        // Step 2 navigation
        if (step2NextBtn) {
            step2NextBtn.addEventListener('click', function() {
                if (validateStep2()) {
                    showStep(3);
                }
            });
        }

        if (step2BackBtn) {
            step2BackBtn.addEventListener('click', function() {
                showStep(1);
            });
        }

        function generateTimeSlots(selectedDate) {
            console.log('⏰ TIME SLOTS DEBUG: Generating time slots for date:', selectedDate);
            
            // Re-find container in case it wasn't available before
            const container = timeSlotsContainer || document.getElementById('time-slots') || document.querySelector('.time-slots');
            
            if (!container) {
                console.error('❌ TIME SLOTS DEBUG: Time slots container not found! Switching to backup...');
                switchToBackupTimeSelection();
                return;
            }

            const timeSlots = [
                '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
                '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM',
                '5:00 PM', '6:00 PM', '7:00 PM', '8:00 PM'
            ];

            console.log('⏰ TIME SLOTS DEBUG: Clearing existing time slots...');
            container.innerHTML = '';
            
            // Add a wrapper div for better styling
            const slotsWrapper = document.createElement('div');
            slotsWrapper.className = 'time-slots-wrapper';

            let slotsCreated = 0;
            timeSlots.forEach((time, index) => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = time;
                timeSlot.dataset.time = time;
                timeSlot.setAttribute('data-index', index);
                
                // Force visibility styles with !important equivalent
                timeSlot.style.cssText = `
                    display: flex !important;
                    visibility: visible !important;
                    opacity: 1 !important;
                    background: var(--bg-secondary) !important;
                    color: var(--text-primary) !important;
                    border: 2px solid var(--light-gray) !important;
                    padding: 12px !important;
                    margin: 4px !important;
                    border-radius: 8px !important;
                    cursor: pointer !important;
                    text-align: center !important;
                    min-height: 40px !important;
                    align-items: center !important;
                    justify-content: center !important;
                `;

                timeSlot.addEventListener('click', function() {
                    console.log('⏰ TIME SLOTS DEBUG: Time slot clicked:', time);
                    
                    // Remove selected class from all time slots
                    document.querySelectorAll('.time-slot').forEach(slot => {
                        slot.classList.remove('selected');
                        slot.style.background = 'var(--bg-secondary)';
                        slot.style.color = 'var(--text-primary)';
                    });
                    
                    // Add selected class to clicked slot
                    this.classList.add('selected');
                    this.style.background = 'var(--primary-blue) !important';
                    this.style.color = 'white !important';
                    
                    console.log('⏰ TIME SLOTS DEBUG: Time slot selected, checking completion...');
                    checkStep2Completion();
                });

                slotsWrapper.appendChild(timeSlot);
                slotsCreated++;
            });
            
            container.appendChild(slotsWrapper);
            
            console.log('✅ TIME SLOTS DEBUG: Generated', slotsCreated, 'time slots');
            
            // Check if slots are actually visible after a short delay
            setTimeout(() => {
                const visibleSlots = container.querySelectorAll('.time-slot');
                console.log('🔍 TIME SLOTS DEBUG: Visible slots after generation:', visibleSlots.length);
                
                if (visibleSlots.length === 0) {
                    console.warn('⚠️ TIME SLOTS DEBUG: No visible slots detected, switching to backup...');
                    switchToBackupTimeSelection();
                }
            }, 500);
        }
        
        function switchToBackupTimeSelection() {
            console.log('🔄 BACKUP DEBUG: Switching to backup time selection...');
            
            // Hide the original time slots
            const originalContainer = document.getElementById('time-slots');
            if (originalContainer) {
                originalContainer.style.display = 'none';
            }
            
            // Show the backup selection
            const backupContainer = document.querySelector('.backup-time-selection');
            const backupSelect = document.getElementById('backup-time-select');
            
            if (backupContainer && backupSelect) {
                backupContainer.style.display = 'block';
                
                // Add event listener to backup select
                backupSelect.addEventListener('change', function() {
                    console.log('🔄 BACKUP DEBUG: Time selected:', this.value);
                    checkStep2Completion();
                });
                
                console.log('✅ BACKUP DEBUG: Backup time selection activated');
            } else {
                console.error('❌ BACKUP DEBUG: Backup elements not found!');
            }
        }
        
        function clearTimeSlots() {
            const container = timeSlotsContainer || document.getElementById('time-slots') || document.querySelector('.time-slots');
            if (container) {
                container.innerHTML = '<p class="select-date-first">Please select a date first</p>';
                console.log('🧹 TIME SLOTS DEBUG: Time slots cleared');
            }
        }

        function checkStep2Completion() {
            const dateSelected = dateInput && dateInput.value;
            const timeSelected = document.querySelector('.time-slot.selected');
            
            if (step2NextBtn) {
                step2NextBtn.disabled = !(dateSelected && timeSelected);
            }
        }
    }

    function initializeStepNavigation() {
        // Step 3 navigation
        const step3NextBtn = document.getElementById('step3-next');
        const step3BackBtn = document.getElementById('step3-back');

        if (step3NextBtn) {
            step3NextBtn.addEventListener('click', function() {
                if (validateStep3()) {
                    updateReviewSection();
                    showStep(4);
                }
            });
        }

        if (step3BackBtn) {
            step3BackBtn.addEventListener('click', function() {
                showStep(2);
            });
        }

        // Step 4 navigation
        const step4BackBtn = document.getElementById('step4-back');

        if (step4BackBtn) {
            step4BackBtn.addEventListener('click', function() {
                showStep(3);
            });
        }
    }

    function initializeBookingValidation() {
        // Real-time validation for step 3 fields
        const requiredFields = document.querySelectorAll('#customer-first-name, #customer-last-name, #customer-email, #customer-phone, #service-location');
        
        requiredFields.forEach(field => {
            field.addEventListener('input', function() {
                validateField(this);
                checkStep3Completion();
            });
        });

        function checkStep3Completion() {
            const step3NextBtn = document.getElementById('step3-next');
            if (!step3NextBtn) return;

            const allValid = Array.from(requiredFields).every(field => {
                return field.value.trim() !== '' && validateField(field);
            });

            step3NextBtn.disabled = !allValid;
        }
    }

    function validateStep1() {
        const selectedService = document.querySelector('.service-option.selected');
        if (!selectedService) {
            showNotification('Please select a service to continue.', 'error');
            return false;
        }
        return true;
    }

    function validateStep2() {
        const dateInput = document.getElementById('booking-date');
        const selectedTime = document.querySelector('.time-slot.selected');

        if (!dateInput || !dateInput.value) {
            showNotification('Please select a date for your appointment.', 'error');
            return false;
        }

        if (!selectedTime) {
            showNotification('Please select a time slot for your appointment.', 'error');
            return false;
        }

        return true;
    }

    function validateStep3() {
        const firstName = document.getElementById('customer-first-name');
        const lastName = document.getElementById('customer-last-name');
        const email = document.getElementById('customer-email');
        const phone = document.getElementById('customer-phone');
        const location = document.getElementById('service-location');

        const fields = [
            { field: firstName, name: 'First Name' },
            { field: lastName, name: 'Last Name' },
            { field: email, name: 'Email Address' },
            { field: phone, name: 'Phone Number' },
            { field: location, name: 'Service Location' }
        ];

        for (let { field, name } of fields) {
            if (!field || !field.value.trim()) {
                showNotification(`Please enter your ${name}.`, 'error');
                if (field) field.focus();
                return false;
            }
        }

        // Validate email format
        if (email && !Utils.isValidEmail(email.value)) {
            showNotification('Please enter a valid email address.', 'error');
            email.focus();
            return false;
        }

        return true;
    }

    function updateReviewSection() {
        // Update service info
        const selectedService = document.querySelector('.service-option.selected');
        if (selectedService) {
            const serviceName = selectedService.querySelector('h3').textContent;
            const servicePrice = selectedService.querySelector('.service-price').textContent;
            
            document.getElementById('review-service').textContent = serviceName;
            document.getElementById('review-price').textContent = servicePrice;
        }

        // Update date and time
        const dateInput = document.getElementById('booking-date');
        const selectedTime = document.querySelector('.time-slot.selected');
        const selectedUrgency = document.querySelector('input[name="urgency"]:checked');

        if (dateInput) {
            const date = new Date(dateInput.value);
            document.getElementById('review-date').textContent = date.toLocaleDateString();
        }

        if (selectedTime) {
            document.getElementById('review-time').textContent = selectedTime.textContent;
        }

        if (selectedUrgency) {
            const urgencyLabel = selectedUrgency.parentNode.querySelector('h4').textContent;
            document.getElementById('review-urgency').textContent = urgencyLabel;
        }

        // Update location
        const locationSelect = document.getElementById('service-location');
        if (locationSelect) {
            document.getElementById('review-location').textContent = locationSelect.options[locationSelect.selectedIndex].text;
        }

        // Update contact info
        const firstName = document.getElementById('customer-first-name');
        const lastName = document.getElementById('customer-last-name');
        const email = document.getElementById('customer-email');
        const phone = document.getElementById('customer-phone');

        if (firstName && lastName) {
            document.getElementById('review-name').textContent = `${firstName.value} ${lastName.value}`;
        }
        if (email) {
            document.getElementById('review-email').textContent = email.value;
        }
        if (phone) {
            document.getElementById('review-phone').textContent = phone.value;
        }

        // Update description
        const description = document.getElementById('problem-description');
        if (description) {
            document.getElementById('review-description').textContent = description.value || 'No additional details provided.';
        }
    }

    function validateField(field) {
        const value = field.value.trim();
        const type = field.type;

        if (type === 'email' && value) {
            return Utils.isValidEmail(value);
        }

        if (type === 'tel' && value) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            return phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''));
        }

        return value !== '';
    }
}


/**
 * Phone Number Formatting
 */
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        input.value = `(${match[1]}) ${match[2]}-${match[3]}`;
    }
}

// Apply phone formatting to phone inputs
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
});

/**
 * Phone Link Analytics Tracking (Optional)
 */
function trackPhoneClick() {
    // Track phone contact clicks for analytics only
    if (typeof gtag !== 'undefined') {
        gtag('event', 'phone_contact', {
            'event_category': 'contact',
            'event_label': 'phone_click'
        });
    }
}

// Add phone click tracking (optional analytics only)
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', trackPhoneClick);
    });
});

/**
 * Lazy Loading for Images
 */
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', initializeLazyLoading);

/**
 * Utility Functions
 */

/**
 * FAQ Functionality
 */
function initializeFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        const icon = question.querySelector('i');
        
        if (question && answer) {
            question.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all other FAQ items
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                        const otherIcon = otherItem.querySelector('.faq-question i');
                        if (otherIcon) {
                            otherIcon.classList.remove('fa-minus');
                            otherIcon.classList.add('fa-plus');
                        }
                    }
                });
                
                // Toggle current item
                if (isActive) {
                    item.classList.remove('active');
                    if (icon) {
                        icon.classList.remove('fa-minus');
                        icon.classList.add('fa-plus');
                    }
                } else {
                    item.classList.add('active');
                    if (icon) {
                        icon.classList.remove('fa-plus');
                        icon.classList.add('fa-minus');
                    }
                }
            });
        }
    });
}


// Portfolio Filter Functionality
const PortfolioFilter = {
    init: function() {
        this.bindEvents();
        this.showAllItems(); // Show all items by default
    },
    
    bindEvents: function() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleFilterClick(e.target);
            });
        });
    },
    
    handleFilterClick: function(clickedButton) {
        // Update active button
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        clickedButton.classList.add('active');
        
        // Get filter value
        const filterValue = clickedButton.getAttribute('data-filter');
        
        // Filter items
        this.filterItems(filterValue);
    },
    
    filterItems: function(filterValue) {
        // Get all portfolio cards (both secondary and additional)
        const portfolioCards = document.querySelectorAll('.portfolio-card, .additional-portfolio-card');
        
        portfolioCards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            
            if (filterValue === 'all' || cardCategory === filterValue) {
                // Show the card with animation
                card.style.display = 'block';
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 10);
            } else {
                // Hide the card with animation
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });
        
        // Update section visibility
        this.updateSectionVisibility(filterValue);
    },
    
    updateSectionVisibility: function(filterValue) {
        const secondaryCards = document.querySelectorAll('.portfolio-card');
        const additionalCards = document.querySelectorAll('.additional-portfolio-card');
        const secondarySection = document.querySelector('.secondary-portfolio-cards');
        const additionalSection = document.querySelector('.additional-portfolio-projects');
        
        // Check if any secondary cards are visible
        const visibleSecondaryCards = Array.from(secondaryCards).some(card => {
            const cardCategory = card.getAttribute('data-category');
            return filterValue === 'all' || cardCategory === filterValue;
        });
        
        // Check if any additional cards are visible
        const visibleAdditionalCards = Array.from(additionalCards).some(card => {
            const cardCategory = card.getAttribute('data-category');
            return filterValue === 'all' || cardCategory === filterValue;
        });
        
        // Show/hide sections based on visible cards
        if (secondarySection) {
            secondarySection.style.display = visibleSecondaryCards ? 'block' : 'none';
        }
        
        if (additionalSection) {
            additionalSection.style.display = visibleAdditionalCards ? 'block' : 'none';
        }
    },
    
    showAllItems: function() {
        const portfolioCards = document.querySelectorAll('.portfolio-card, .additional-portfolio-card');
        portfolioCards.forEach(card => {
            card.style.display = 'block';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        });
        
        // Show all sections
        const sections = document.querySelectorAll('.secondary-portfolio-cards, .additional-portfolio-projects');
        sections.forEach(section => {
            section.style.display = 'block';
        });
    }
};

// Load More Button Functionality
const LoadMoreButton = {
    init: function() {
        const loadMoreBtn = document.getElementById('load-more-btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', this.handleLoadMore.bind(this));
        }
    },
    
    handleLoadMore: function(e) {
        e.preventDefault();
        
        // For now, just scroll to contact section or show a message
        // In a real implementation, this would load more portfolio items
        const ctaSection = document.querySelector('.cta-section');
        if (ctaSection) {
            ctaSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }
        
        // Optional: Show a message
        const button = e.target.closest('button');
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> All Projects Shown';
        button.disabled = true;
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.disabled = false;
        }, 3000);
    }
};


// Portfolio Page - Animated Counter
const PortfolioAnimations = {
    // Animated counter for statistics
    animateCounters: function() {
        const counters = document.querySelectorAll('.stat-number[data-count]');
        
        const animateCounter = (counter) => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;
            
            const updateCounter = () => {
                if (current < target) {
                    current += increment;
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            updateCounter();
        };
        
        // Intersection Observer for triggering animation when in view
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('animated')) {
                    entry.target.classList.add('animated');
                    animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => observer.observe(counter));
    },
    
    // Initialize portfolio animations
    init: function() {
        if (document.querySelector('.portfolio-hero')) {
            this.animateCounters();
        }
    }
};


// Sticky CTA Bar Functionality
const StickyCTABar = {
    init: function() {
        this.stickyBar = document.getElementById('sticky-cta-bar');
        this.pageHeader = document.querySelector('.page-header');
        
        if (!this.stickyBar) {
            console.log('Sticky CTA bar not found on this page');
            return;
        }
        
        // Use throttled scroll handler for better performance
        this.handleScroll = Utils.throttle(this.onScroll.bind(this), 100);
        
        // Add scroll event listener
        window.addEventListener('scroll', this.handleScroll);
        
        // Initial check
        this.onScroll();
        
        console.log('Sticky CTA bar initialized');
    },
    
    onScroll: function() {
        if (!this.stickyBar || !this.pageHeader) return;
        
        const headerHeight = this.pageHeader.offsetHeight;
        const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        
        // Show sticky bar when scrolled past the page header
        if (scrollPosition > headerHeight) {
            this.stickyBar.classList.add('visible');
        } else {
            this.stickyBar.classList.remove('visible');
        }
    },
    
    destroy: function() {
        if (this.handleScroll) {
            window.removeEventListener('scroll', this.handleScroll);
        }
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - Initializing all components...');
    
    // Initialize existing components
    Navigation.init();
    ServiceCalculator.init();
    BookingForm.init();
    PortfolioFilter.init();
    LoadMoreButton.init();
    PortfolioAnimations.init();
    
    // Initialize new sticky CTA bar
    StickyCTABar.init();
    
    // Initialize PHASE 6: Revenue Features
    RevenueFeatures.init();
    
    console.log('✅ All components initialized successfully');
});

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    StickyCTABar.destroy();

// ===================================
// PHASE 6: REVENUE FEATURES JAVASCRIPT
// ===================================

// Real-time Booking Availability Counter System
const BookingAvailability = {
    // Configuration for different services
    serviceConfig: {
        'home-office': { min: 2, max: 5, decreaseRate: 0.3 },
        'gaming-pc': { min: 3, max: 7, decreaseRate: 0.25 },
        'business-setup': { min: 1, max: 4, decreaseRate: 0.4 },
        'pc-refresh': { min: 2, max: 6, decreaseRate: 0.35 },
        'pc-repair': { min: 5, max: 12, decreaseRate: 0.2 },
        'networking': { min: 2, max: 8, decreaseRate: 0.3 },
        'hardware': { min: 3, max: 9, decreaseRate: 0.25 }
    },

    init: function() {
        console.log('🔢 Initializing Booking Availability System...');
        this.initializeCounters();
        this.startCounterUpdates();
        console.log('✅ Booking Availability System initialized');
    },

    initializeCounters: function() {
        const counters = document.querySelectorAll('.slots-remaining');
        
        counters.forEach(counter => {
            const service = counter.getAttribute('data-service');
            const config = this.serviceConfig[service];
            
            if (config) {
                // Set initial random value within range
                const initialValue = Math.floor(Math.random() * (config.max - config.min + 1)) + config.min;
                counter.textContent = initialValue;
                counter.setAttribute('data-current', initialValue);
                
                console.log(`📊 ${service}: Initial slots = ${initialValue}`);
            }
        });
    },

    startCounterUpdates: function() {
        // Update counters every 2-5 minutes with realistic decreases
        setInterval(() => {
            this.updateRandomCounter();
        }, Math.random() * 180000 + 120000); // 2-5 minutes

        // Smaller fluctuations every 30-60 seconds
        setInterval(() => {
            this.minorCounterUpdate();
        }, Math.random() * 30000 + 30000); // 30-60 seconds
    },

    updateRandomCounter: function() {
        const counters = document.querySelectorAll('.slots-remaining');
        if (counters.length === 0) return;

        const randomCounter = counters[Math.floor(Math.random() * counters.length)];
        const service = randomCounter.getAttribute('data-service');
        const config = this.serviceConfig[service];
        const currentValue = parseInt(randomCounter.getAttribute('data-current'));

        if (config && currentValue > config.min) {
            // Decrease by 1 with configured probability
            if (Math.random() < config.decreaseRate) {
                const newValue = Math.max(currentValue - 1, config.min);
                this.animateCounterChange(randomCounter, newValue);
                
                console.log(`📉 ${service}: Slots decreased from ${currentValue} to ${newValue}`);
                
                // Trigger booking notification when slots get low
                if (newValue <= 2) {
                    BookingNotifications.showUrgencyNotification(service, newValue);
                }
            }
        }
    },

    minorCounterUpdate: function() {
        const counters = document.querySelectorAll('.slots-remaining');
        if (counters.length === 0) return;

        // Occasionally increase a counter (simulating cancelled bookings)
        if (Math.random() < 0.3) {
            const randomCounter = counters[Math.floor(Math.random() * counters.length)];
            const service = randomCounter.getAttribute('data-service');
            const config = this.serviceConfig[service];
            const currentValue = parseInt(randomCounter.getAttribute('data-current'));

            if (config && currentValue < config.max) {
                const newValue = Math.min(currentValue + 1, config.max);
                this.animateCounterChange(randomCounter, newValue);
                
                console.log(`📈 ${service}: Slots increased from ${currentValue} to ${newValue}`);
            }
        }
    },

    animateCounterChange: function(counter, newValue) {
        // Add pulse animation
        counter.classList.add('updating');
        
        setTimeout(() => {
            counter.textContent = newValue;
            counter.setAttribute('data-current', newValue);
            counter.classList.remove('updating');
        }, 300);
    }
};

// Real-time Booking Notifications System
const BookingNotifications = {
    // Sample customer data for realistic notifications
    customerNames: [
        'John D.', 'Sarah M.', 'Mike R.', 'Lisa K.', 'David P.', 'Emma W.',
        'Chris L.', 'Anna S.', 'Tom B.', 'Maria G.', 'Steve H.', 'Kate F.',
        'Alex C.', 'Nina T.', 'Ryan J.', 'Sophie A.', 'Mark V.', 'Zoe N.'
    ],

    serviceNames: {
        'home-office': 'Home Office Bundle',
        'gaming-pc': 'Gaming PC Bundle',
        'business-setup': 'Business Setup Bundle',
        'pc-refresh': 'Complete PC Refresh',
        'pc-repair': 'PC Repair Service',
        'networking': 'Network Setup',
        'hardware': 'Hardware Upgrade'
    },

    locations: [
        'Toronto', 'Mississauga', 'Brampton', 'Markham', 'Richmond Hill',
        'Vaughan', 'Oakville', 'Burlington', 'Milton', 'Pickering'
    ],

    notificationQueue: [],
    isShowingNotification: false,

    init: function() {
        console.log('🔔 Initializing Booking Notifications System...');
        this.createNotificationContainer();
        this.startNotificationCycle();
        console.log('✅ Booking Notifications System initialized');
    },

    createNotificationContainer: function() {
        const container = document.getElementById('booking-notifications');
        if (!container) {
            console.warn('⚠️ Booking notifications container not found');
            return;
        }
        
        this.container = container;
    },

    startNotificationCycle: function() {
        // Show notifications every 15-45 seconds
        setInterval(() => {
            if (!this.isShowingNotification) {
                this.showRandomBookingNotification();
            }
        }, Math.random() * 30000 + 15000); // 15-45 seconds

        // Show first notification after 5 seconds
        setTimeout(() => {
            this.showRandomBookingNotification();
        }, 5000);
    },

    showRandomBookingNotification: function() {
        if (!this.container) return;

        const services = Object.keys(this.serviceNames);
        const randomService = services[Math.floor(Math.random() * services.length)];
        const randomName = this.customerNames[Math.floor(Math.random() * this.customerNames.length)];
        const randomLocation = this.locations[Math.floor(Math.random() * this.locations.length)];
        const serviceName = this.serviceNames[randomService];

        const timeAgo = Math.floor(Math.random() * 30) + 1; // 1-30 minutes ago

        this.showNotification({
            name: randomName,
            service: serviceName,
            location: randomLocation,
            timeAgo: timeAgo
        });
    },

    showUrgencyNotification: function(service, slotsRemaining) {
        if (!this.container) return;

        const serviceName = this.serviceNames[service] || service;
        
        this.showNotification({
            name: 'System Alert',
            service: `Only ${slotsRemaining} ${serviceName} slots left!`,
            location: 'GTA',
            timeAgo: 0,
            isUrgent: true
        });
    },

    showNotification: function(data) {
        if (this.isShowingNotification) {
            this.notificationQueue.push(data);
            return;
        }

        this.isShowingNotification = true;

        const notification = this.createNotificationElement(data);
        this.container.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-hide after 6 seconds
        setTimeout(() => {
            this.hideNotification(notification);
        }, 6000);
    },

    createNotificationElement: function(data) {
        const notification = document.createElement('div');
        notification.className = 'booking-notification';
        
        const iconClass = data.isUrgent ? 'fas fa-exclamation-triangle' : 'fas fa-user';
        const timeText = data.timeAgo === 0 ? 'just now' : `${data.timeAgo} min ago`;
        
        notification.innerHTML = `
            <div class="notification-content">
                <div class="notification-avatar">
                    <i class="${iconClass}"></i>
                </div>
                <div class="notification-text">
                    <div class="notification-name">${data.name}</div>
                    <p class="notification-action">booked ${data.service} in ${data.location}</p>
                    <div class="notification-time">${timeText}</div>
                </div>
                <button class="notification-close" aria-label="Close notification">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add close button functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            this.hideNotification(notification);
        });

        return notification;
    },

    hideNotification: function(notification) {
        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            
            this.isShowingNotification = false;
            
            // Show next notification in queue
            if (this.notificationQueue.length > 0) {
                const nextNotification = this.notificationQueue.shift();
                setTimeout(() => {
                    this.showNotification(nextNotification);
                }, 1000);
            }
        }, 500);
    }
};

// Bundle Selection and Integration
const BundleIntegration = {
    init: function() {
        console.log('📦 Initializing Bundle Integration...');
        this.initializeBundleButtons();
        this.handleURLParameters();
        console.log('✅ Bundle Integration initialized');
    },

    initializeBundleButtons: function() {
        const bundleButtons = document.querySelectorAll('.bundle-cta .btn');
        
        bundleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.handleBundleSelection(e);
            });
        });
    },

    handleURLParameters: function() {
        const urlParams = new URLSearchParams(window.location.search);
        const bundle = urlParams.get('bundle');
        const service = urlParams.get('service');
        
        if (bundle) {
            console.log(`🎯 Bundle pre-selected: ${bundle}`);
            this.preSelectBundle(bundle);
        } else if (service) {
            console.log(`🎯 Service pre-selected: ${service}`);
            this.preSelectService(service);
        }
    },

    handleBundleSelection: function(e) {
        const button = e.target.closest('.btn');
        const href = button.getAttribute('href');
        
        // Add analytics tracking
        if (typeof gtag !== 'undefined') {
            const bundleType = this.extractBundleFromURL(href);
            gtag('event', 'bundle_selection', {
                'bundle_type': bundleType,
                'event_category': 'revenue',
                'event_label': bundleType
            });
        }
        
        console.log(`📦 Bundle selected: ${href}`);
    },

    preSelectBundle: function(bundleType) {
        // Highlight the selected bundle
        const bundleCards = document.querySelectorAll('.bundle-card');
        bundleCards.forEach(card => {
            const bundleButton = card.querySelector('.bundle-cta .btn');
            if (bundleButton && bundleButton.href.includes(bundleType)) {
                card.classList.add('pre-selected');
                card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    },

    preSelectService: function(serviceType) {
        // Highlight the selected service section
        const serviceSection = document.getElementById(serviceType);
        if (serviceSection) {
            serviceSection.classList.add('pre-selected');
            serviceSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    },

    extractBundleFromURL: function(url) {
        const match = url.match(/bundle=([^&]+)/);
        return match ? match[1] : 'unknown';
    }
};

// Enhanced Service Interactions
const ServiceEnhancements = {
    init: function() {
        console.log('⚡ Initializing Service Enhancements...');
        this.initializeHoverEffects();
        this.initializeClickTracking();
        console.log('✅ Service Enhancements initialized');
    },

    initializeHoverEffects: function() {
        const bundleCards = document.querySelectorAll('.bundle-card');
        
        bundleCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightBundleFeatures(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.resetBundleHighlight(card);
            });
        });
    },

    highlightBundleFeatures: function(card) {
        const features = card.querySelectorAll('.bundle-features li');
        features.forEach((feature, index) => {
            setTimeout(() => {
                feature.style.transform = 'translateX(5px)';
                feature.style.color = 'var(--primary-blue)';
            }, index * 100);
        });
    },

    resetBundleHighlight: function(card) {
        const features = card.querySelectorAll('.bundle-features li');
        features.forEach(feature => {
            feature.style.transform = 'translateX(0)';
            feature.style.color = '';
        });
    },

    initializeClickTracking: function() {
        // Track all CTA button clicks
        const ctaButtons = document.querySelectorAll('.btn[href*="booking"], .bundle-cta .btn');
        
        ctaButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const buttonText = button.textContent.trim();
                const href = button.getAttribute('href');
                
                console.log(`🎯 CTA clicked: ${buttonText} -> ${href}`);
                
                // Analytics tracking
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'cta_click', {
                        'button_text': buttonText,
                        'destination': href,
                        'event_category': 'conversion'
                    });
                }
            });
        });
    }
};

// Performance Monitoring for Revenue Features
const RevenueAnalytics = {
    init: function() {
        console.log('📊 Initializing Revenue Analytics...');
        this.trackPageEngagement();
        this.trackScrollDepth();
        this.trackTimeOnPage();
        console.log('✅ Revenue Analytics initialized');
    },

    trackPageEngagement: function() {
        // Track bundle section visibility
        const bundleSection = document.getElementById('service-bundles');
        if (bundleSection) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        console.log('📦 Bundle section viewed');
                        
                        if (typeof gtag !== 'undefined') {
                            gtag('event', 'bundle_section_view', {
                                'event_category': 'engagement',
                                'event_label': 'service_bundles'
                            });
                        }
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(bundleSection);
        }
    },

    trackScrollDepth: function() {
        let maxScroll = 0;
        
        window.addEventListener('scroll', Utils.throttle(() => {
            const scrollPercent = Math.round(
                (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
            );
            
            if (scrollPercent > maxScroll) {
                maxScroll = scrollPercent;
                
                // Track milestone scroll depths
                if ([25, 50, 75, 90].includes(scrollPercent)) {
                    console.log(`📏 Scroll depth: ${scrollPercent}%`);
                    
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'scroll_depth', {
                            'scroll_percent': scrollPercent,
                            'event_category': 'engagement'
                        });
                    }
                }
            }
        }, 1000));
    },

    trackTimeOnPage: function() {
        const startTime = Date.now();
        
        // Track time milestones
        [30, 60, 120, 300].forEach(seconds => {
            setTimeout(() => {
                console.log(`⏱️ Time on page: ${seconds}s`);
                
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'time_on_page', {
                        'time_seconds': seconds,
                        'event_category': 'engagement'
                    });
                }
            }, seconds * 1000);
        });
    }
};

// Initialize all revenue features
const RevenueFeatures = {
    init: function() {
        console.log('💰 Initializing PHASE 6: Revenue Features...');
        
        // Only initialize on services page
        if (document.getElementById('service-bundles') || document.querySelector('.service-availability')) {
            BookingAvailability.init();
            BookingNotifications.init();
            BundleIntegration.init();
            ServiceEnhancements.init();
            RevenueAnalytics.init();
            
            console.log('✅ All Revenue Features initialized successfully');
        } else {
            console.log('ℹ️ Revenue features not needed on this page');
        }
    }
};

// Add CSS for counter animation
const style = document.createElement('style');
style.textContent = `
    .slots-remaining.updating {
        animation: pulse-update 0.6s ease-in-out;
    }
    
    @keyframes pulse-update {
        0% { transform: scale(1); color: var(--text-primary); }
        50% { transform: scale(1.2); color: var(--primary-blue); }
        100% { transform: scale(1); color: var(--text-primary); }
    }
    
    .bundle-card.pre-selected {
        border-color: var(--primary-blue);
        box-shadow: 0 0 20px rgba(88, 166, 255, 0.3);
        transform: translateY(-5px);
    }
    
    .service-section.pre-selected {
        background: rgba(88, 166, 255, 0.05);
        border-left: 4px solid var(--primary-blue);
    }
`;
document.head.appendChild(style);
});
