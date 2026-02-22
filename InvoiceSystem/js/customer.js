/**
 * TechFlow Solutions - Customer Management System
 * Handles customer data storage and retrieval using Firebase Firestore
 */

import firestoreManager from './firestore-manager.js';

class CustomerManager {
    constructor() {
        this.customers = [];
        this.isLoading = false;
        this.initializeEventListeners();
        this.loadCustomersFromFirestore();
    }

    /**
     * Load customers from Firestore
     */
    async loadCustomersFromFirestore() {
        if (this.isLoading) return;
        
        this.isLoading = true;
        try {
            this.customers = await firestoreManager.getCustomers();
            this.populateCustomerDropdown();
            console.log(`✅ Loaded ${this.customers.length} customers from Firestore`);
        } catch (error) {
            console.error('❌ Error loading customers:', error);
            this.showNotification('Error loading customer data', 'error');
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Add or update a customer
     */
    async saveCustomer(customerData) {
        // Validate required fields
        if (!customerData.name || !customerData.phone) {
            this.showNotification('Customer name and phone are required', 'error');
            return false;
        }

        try {
            // Check if customer already exists (by phone number)
            const existingCustomer = this.customers.find(c => c.phone === customerData.phone);
            
            if (existingCustomer) {
                // Update existing customer in Firestore
                const result = await firestoreManager.updateCustomer(existingCustomer.id, customerData);
                
                if (result.success) {
                    // Update local cache
                    const index = this.customers.findIndex(c => c.id === existingCustomer.id);
                    if (index !== -1) {
                        this.customers[index] = {
                            ...this.customers[index],
                            ...customerData
                        };
                    }
                    this.showNotification('Customer updated successfully', 'success');
                    this.populateCustomerDropdown();
                    return true;
                } else {
                    throw new Error(result.error);
                }
            } else {
                // Add new customer to Firestore
                const result = await firestoreManager.saveCustomer(customerData);
                
                if (result.success) {
                    // Add to local cache
                    this.customers.push({
                        id: result.id,
                        ...customerData
                    });
                    this.showNotification('Customer saved successfully', 'success');
                    this.populateCustomerDropdown();
                    return true;
                } else {
                    throw new Error(result.error);
                }
            }
        } catch (error) {
            console.error('❌ Error saving customer:', error);
            this.showNotification('Error saving customer: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Get customer by ID
     */
    getCustomer(id) {
        return this.customers.find(c => c.id === id);
    }

    /**
     * Get customer by phone number
     */
    getCustomerByPhone(phone) {
        return this.customers.find(c => c.phone === phone);
    }

    /**
     * Delete customer
     */
    async deleteCustomer(id) {
        try {
            const result = await firestoreManager.deleteCustomer(id);
            
            if (result.success) {
                // Remove from local cache
                const index = this.customers.findIndex(c => c.id === id);
                if (index !== -1) {
                    this.customers.splice(index, 1);
                }
                this.populateCustomerDropdown();
                this.showNotification('Customer deleted successfully', 'success');
                return true;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error('❌ Error deleting customer:', error);
            this.showNotification('Error deleting customer: ' + error.message, 'error');
            return false;
        }
    }

    /**
     * Populate customer dropdown
     */
    populateCustomerDropdown() {
        const dropdown = document.getElementById('existing-customer');
        if (!dropdown) return;

        // Clear existing options except the first one
        dropdown.innerHTML = '<option value="">Select existing customer or add new</option>';

        // Sort customers by name
        const sortedCustomers = [...this.customers].sort((a, b) => 
            a.name.localeCompare(b.name)
        );

        // Add customer options
        sortedCustomers.forEach(customer => {
            const option = document.createElement('option');
            option.value = customer.id;
            option.textContent = `${customer.name}${customer.company ? ` (${customer.company})` : ''} - ${customer.phone}`;
            dropdown.appendChild(option);
        });
    }

    /**
     * Load customer data into form
     */
    loadCustomerIntoForm(customerId) {
        const customer = this.getCustomer(customerId);
        if (!customer) return;

        document.getElementById('customer-name').value = customer.name || '';
        document.getElementById('customer-company').value = customer.company || '';
        document.getElementById('customer-phone').value = customer.phone || '';
        document.getElementById('customer-email').value = customer.email || '';
        document.getElementById('customer-address').value = customer.address || '';
    }

    /**
     * Get customer data from form
     */
    getCustomerDataFromForm() {
        return {
            name: document.getElementById('customer-name').value.trim(),
            company: document.getElementById('customer-company').value.trim(),
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            address: document.getElementById('customer-address').value.trim()
        };
    }

    /**
     * Clear customer form
     */
    clearCustomerForm() {
        document.getElementById('customer-name').value = '';
        document.getElementById('customer-company').value = '';
        document.getElementById('customer-phone').value = '';
        document.getElementById('customer-email').value = '';
        document.getElementById('customer-address').value = '';
        document.getElementById('existing-customer').value = '';
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Customer dropdown change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'existing-customer') {
                const customerId = e.target.value;
                if (customerId) {
                    this.loadCustomerIntoForm(customerId);
                }
            }
        });

        // New customer button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'new-customer-btn') {
                this.clearCustomerForm();
            }
        });

        // Save customer button
        document.addEventListener('click', async (e) => {
            if (e.target.id === 'save-customer-btn') {
                const button = e.target;
                const originalText = button.innerHTML;
                
                // Disable button and show loading state
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
                
                const customerData = this.getCustomerDataFromForm();
                await this.saveCustomer(customerData);
                
                // Re-enable button
                button.disabled = false;
                button.innerHTML = originalText;
            }
            
            // Delete customer button
            if (e.target.id === 'delete-customer-btn' || e.target.closest('#delete-customer-btn')) {
                const dropdown = document.getElementById('existing-customer');
                const selectedCustomerId = dropdown.value;
                
                if (!selectedCustomerId) {
                    this.showNotification('Please select a customer to delete', 'warning');
                    return;
                }
                
                const customer = this.getCustomer(selectedCustomerId);
                if (!customer) {
                    this.showNotification('Customer not found', 'error');
                    return;
                }
                
                // Confirm deletion
                if (confirm(`Are you sure you want to delete "${customer.name}"?\n\nThis action cannot be undone.`)) {
                    const button = e.target.closest('#delete-customer-btn');
                    const originalText = button.innerHTML;
                    
                    // Disable button and show loading state
                    button.disabled = true;
                    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Deleting...';
                    
                    const success = await this.deleteCustomer(selectedCustomerId);
                    
                    if (success) {
                        // Clear the form after successful deletion
                        this.clearCustomerForm();
                    }
                    
                    // Re-enable button
                    button.disabled = false;
                    button.innerHTML = originalText;
                }
            }
        });
    }

    /**
     * Show notification to user
     */
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
                <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;

        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            background: ${this.getNotificationColor(type)};
            color: white;
            padding: 1rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            animation: slideIn 0.3s ease-out;
        `;

        // Add notification styles to document if not already added
        if (!document.querySelector('#notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'notification-styles';
            styles.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                .notification-content {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .notification-close {
                    background: none;
                    border: none;
                    color: white;
                    cursor: pointer;
                    margin-left: auto;
                    padding: 0.25rem;
                    border-radius: 0.25rem;
                    opacity: 0.8;
                }
                .notification-close:hover {
                    opacity: 1;
                    background: rgba(255, 255, 255, 0.1);
                }
            `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }

    /**
     * Get notification icon based on type
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    /**
     * Get notification color based on type
     */
    getNotificationColor(type) {
        const colors = {
            success: '#238636',
            error: '#da3633',
            warning: '#d29922',
            info: '#58a6ff'
        };
        return colors[type] || colors.info;
    }

    /**
     * Refresh customers from Firestore
     */
    async refreshCustomers() {
        await this.loadCustomersFromFirestore();
        this.showNotification('Customer list refreshed', 'success');
    }

    /**
     * Get customer statistics
     */
    getCustomerStats() {
        return {
            total: this.customers.length,
            withEmail: this.customers.filter(c => c.email).length,
            withCompany: this.customers.filter(c => c.company).length
        };
    }
}

// Initialize customer manager when DOM is loaded
// Wait for auth to be ready before initializing
let customerManagerInstance = null;

document.addEventListener('DOMContentLoaded', () => {
    // Import auth from firebase-config to wait for authentication
    import('./firebase-config.js').then(({ auth }) => {
        // Wait for auth state to be determined
        auth.onAuthStateChanged((user) => {
            if (user && !customerManagerInstance) {
                // User is logged in, initialize customer manager
                customerManagerInstance = new CustomerManager();
                window.customerManager = customerManagerInstance;
                console.log('✅ Customer Manager initialized with Firestore for user:', user.email);
            } else if (!user) {
                console.log('⚠️ User not logged in - Customer Manager not initialized');
            }
        });
    });
});

export default CustomerManager;