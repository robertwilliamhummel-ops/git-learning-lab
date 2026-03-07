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

// DOM Content Loaded Event - Single initialization point
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM Content Loaded - initializing all systems');
    
    // Core functionality
    initializeNavigation();
    
    // Accordion functionality (Digital Growth page) - Initialize early to avoid crashes from other functions
    try {
        AccordionHandler.init();
    } catch (error) {
        console.error('Accordion initialization error:', error);
    }
    
    initializeScrollEffects();
    initializeForms();
    initializeAnimations();
    initializeCollapsibleSections();
    initializeFAQ();
    
    // Portfolio functionality
    if (document.querySelector('.portfolio-filter')) {
        PortfolioFilter.init();
        LoadMoreButton.init();
    }
    PortfolioAnimations.init();
    
    // Sticky CTA bar
    StickyCTABar.init();
    
    // Phone formatting
    document.querySelectorAll('input[type="tel"]').forEach(input => {
        input.addEventListener('input', function() {
            formatPhoneNumber(this);
        });
    });
    
    // Phone click tracking
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', trackPhoneClick);
    });
    
    // Lazy loading
    initializeLazyLoading();
    
    console.log('✅ All components initialized successfully');
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
            
            // Prevent body scroll when menu is open
            if (isMenuOpen) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
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
            
            // Handle form submission
            handleFormSubmission(formData, formType, form, submitBtn, originalText);
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
function handleFormSubmission(formData, formType, form, submitBtn, originalText) {
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
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        })
        .catch(function(error) {
            console.error('Email send failed:', error);
            showNotification('Sorry, there was an error sending your message. Please try calling us directly.', 'error');
            
            // Reset button
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
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
 * Phone Number Formatting
 */
function formatPhoneNumber(input) {
    const value = input.value.replace(/\D/g, '');
    const match = value.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
        input.value = `(${match[1]}) ${match[2]}-${match[3]}`;
    }
}

// Phone formatting is now initialized in main DOMContentLoaded event

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

// Phone click tracking is now initialized in main DOMContentLoaded event

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

// Lazy loading is now initialized in main DOMContentLoaded event

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

/**
 * Portfolio Filter Functionality
 */
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

/**
 * Load More Button Functionality
 */
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

/**
 * Portfolio Page - Animated Counter
 */
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

/**
 * Accordion Functionality for Digital Growth Page
 */
const AccordionHandler = {
    init: function() {
        const accordionHeaders = document.querySelectorAll('.accordion-header');
        
        if (accordionHeaders.length === 0) {
            console.log('No accordions found on this page');
            return;
        }
        
        accordionHeaders.forEach(header => {
            header.addEventListener('click', this.toggleAccordion.bind(this, header));
        });
        
        console.log(`Accordion handler initialized with ${accordionHeaders.length} accordions`);
    },
    
    toggleAccordion: function(header) {
        const content = header.nextElementSibling;
        const isActive = header.classList.contains('active');
        
        // Toggle active state
        if (isActive) {
            header.classList.remove('active');
            content.classList.remove('active');
        } else {
            header.classList.add('active');
            content.classList.add('active');
        }
        
        // Optional: Close other accordions (uncomment for single-open behavior)
        /*
        const allHeaders = document.querySelectorAll('.accordion-header');
        allHeaders.forEach(otherHeader => {
            if (otherHeader !== header) {
                otherHeader.classList.remove('active');
                otherHeader.nextElementSibling.classList.remove('active');
            }
        });
        */
    }
};

/**
 * Sticky CTA Bar Functionality
 */
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

// All initialization is now handled in the single main DOMContentLoaded event at the top

// Clean up on page unload
window.addEventListener('beforeunload', function() {
    StickyCTABar.destroy();
});
