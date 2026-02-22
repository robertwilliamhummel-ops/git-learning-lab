/**
 * TechFlow Solutions - Invoice Calculator
 * Handles pricing calculations, line items, and totals
 */

class InvoiceCalculator {
    constructor() {
        this.rates = {
            remote: 80,
            onsite: 100,
            emergency: 110
        };
        this.taxRate = 0; // No HST - Not registered yet (set to 0.13 when registered)
        this.discountPercent = 0; // Discount percentage (0-100)
        this.discountAmount = 0; // Fixed discount amount
        this.lineItems = [];
        this.hourlyServices = [];
        this.initializeEventListeners();
        this.updateAllTotals();
        // Add first hourly service by default
        setTimeout(() => this.addHourlyService(), 0);
    }

    /**
     * Initialize event listeners for calculator functionality
     */
    initializeEventListeners() {
        // Add hourly service button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-hourly-service-btn' || e.target.closest('#add-hourly-service-btn')) {
                this.addHourlyService();
            }
        });

        // Add line item button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-line-item-btn') {
                this.addLineItem();
            }
        });

        // HST checkbox toggle
        document.addEventListener('change', (e) => {
            if (e.target.id === 'charge-hst') {
                this.taxRate = e.target.checked ? 0.13 : 0;
                this.updateAllTotals();
            }
        });

        // Hourly service changes (using event delegation)
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('hourly-service-type')) {
                this.updateHourlyServiceRate(e.target);
                this.calculateHourlyTotal();
            }
        });

        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('hourly-service-input')) {
                this.calculateHourlyTotal();
            }
        });

        // Remove hourly service (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-hourly-service') || e.target.closest('.remove-hourly-service')) {
                this.removeHourlyService(e.target.closest('.remove-hourly-service'));
            }
        });

        // Line item changes (using event delegation)
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('line-item-input')) {
                this.calculateLineItemsTotal();
            }
        });

        // Remove line item (using event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-line-item')) {
                this.removeLineItem(e.target);
            }
        });
    }

    /**
     * Add a new hourly service entry
     */
    addHourlyService() {
        const container = document.getElementById('hourly-services-container');
        const serviceId = 'hourly-service-' + Date.now();
        
        const serviceHtml = `
            <div class="hourly-service" data-id="${serviceId}">
                <div class="form-grid">
                    <div class="form-group">
                        <label>Service Type</label>
                        <select class="form-control hourly-service-type hourly-service-input">
                            <option value="">Select service type</option>
                            <option value="website-design" data-rate="100">Website Design & Development - $100/hour</option>
                            <option value="seo-consulting" data-rate="100">Digital Growth & SEO - $100/hour</option>
                            <option value="it-remote" data-rate="90">Remote IT Support - $90/hour</option>
                            <option value="it-onsite" data-rate="100">On-Site IT Support - $100/hour</option>
                            <option value="it-priority" data-rate="175">Business-Critical Support - $175/hour</option>
                            <option value="emergency" data-rate="120">Emergency/Rush Service - $120/hour</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Service Description</label>
                        <select class="form-control hourly-service-description hourly-service-input">
                            <option value="">Select service description</option>
                            <optgroup label="Website Design & Development">
                                <option value="Custom Website Design">Custom Website Design</option>
                                <option value="Website Development">Website Development</option>
                                <option value="Website Redesign">Website Redesign</option>
                                <option value="E-commerce Website Development">E-commerce Website Development</option>
                                <option value="Website Maintenance">Website Maintenance</option>
                                <option value="Content Management & Updates">Content Management & Updates</option>
                                <option value="Custom Features & Functionality">Custom Features & Functionality</option>
                                <option value="Website Performance Optimization">Website Performance Optimization</option>
                                <option value="Website Security Hardening">Website Security Hardening</option>
                                <option value="Domain & Hosting Setup">Domain & Hosting Setup</option>
                                <option value="Website Migration">Website Migration</option>
                                <option value="Landing Page Design">Landing Page Design</option>
                            </optgroup>
                            <optgroup label="Digital Growth & SEO">
                                <option value="SEO Audit & Analysis">SEO Audit & Analysis</option>
                                <option value="Technical SEO Optimization">Technical SEO Optimization</option>
                                <option value="Keyword Research & Strategy">Keyword Research & Strategy</option>
                                <option value="On-Page SEO Optimization">On-Page SEO Optimization</option>
                                <option value="Content Optimization">Content Optimization</option>
                                <option value="Local SEO Setup & Management">Local SEO Setup & Management</option>
                                <option value="Google My Business Optimization">Google My Business Optimization</option>
                                <option value="Link Building Strategy">Link Building Strategy</option>
                                <option value="SEO Performance Monitoring">SEO Performance Monitoring</option>
                                <option value="Competitor Analysis">Competitor Analysis</option>
                                <option value="SEO Consulting">SEO Consulting</option>
                                <option value="Search Engine Marketing (SEM)">Search Engine Marketing (SEM)</option>
                            </optgroup>
                            <optgroup label="Business IT Services">
                                <option value="Remote IT Support">Remote IT Support</option>
                                <option value="On-Site IT Support">On-Site IT Support</option>
                                <option value="Network Setup & Configuration">Network Setup & Configuration</option>
                                <option value="Server Administration">Server Administration</option>
                                <option value="Cloud Migration & Setup">Cloud Migration & Setup</option>
                                <option value="Email System Setup">Email System Setup (Microsoft 365, Google Workspace)</option>
                                <option value="Cybersecurity Assessment">Cybersecurity Assessment</option>
                                <option value="Data Backup & Recovery">Data Backup & Recovery</option>
                                <option value="IT Consulting & Strategy">IT Consulting & Strategy</option>
                                <option value="System Monitoring & Maintenance">System Monitoring & Maintenance</option>
                                <option value="Software Installation & Configuration">Software Installation & Configuration</option>
                                <option value="Hardware Procurement & Setup">Hardware Procurement & Setup</option>
                            </optgroup>
                        </select>
                    </div>
                    <div class="form-group full-width">
                        <label>Additional Details (optional)</label>
                        <textarea class="form-control hourly-service-notes hourly-service-input" rows="2" placeholder="Add specific details about this service (e.g., migrated 50GB data, configured 5 security groups)"></textarea>
                    </div>
                    <div class="form-group">
                        <label>Hours Worked</label>
                        <input type="number" class="form-control hourly-service-hours hourly-service-input" min="0" step="0.25" placeholder="0.00">
                    </div>
                    <div class="form-group">
                        <label>Rate per Hour</label>
                        <input type="number" class="form-control hourly-service-rate hourly-service-input" min="0" step="1" placeholder="Auto-filled or type custom rate">
                    </div>
                </div>
                <button type="button" class="remove-hourly-service" title="Remove service">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', serviceHtml);
        this.calculateHourlyTotal();
    }

    /**
     * Update hourly rate based on selected service type
     */
    updateHourlyServiceRate(selectElement) {
        const serviceDiv = selectElement.closest('.hourly-service');
        const rateInput = serviceDiv.querySelector('.hourly-service-rate');
        
        if (selectElement.value && selectElement.selectedOptions[0]) {
            const rate = selectElement.selectedOptions[0].dataset.rate;
            rateInput.value = rate || 0;
        } else {
            rateInput.value = 0;
        }
    }

    /**
     * Remove an hourly service
     */
    removeHourlyService(button) {
        const service = button.closest('.hourly-service');
        if (service) {
            service.remove();
            this.calculateHourlyTotal();
        }
    }

    /**
     * Calculate hourly services total
     */
    calculateHourlyTotal() {
        const services = document.querySelectorAll('.hourly-service');
        let total = 0;
        
        services.forEach(service => {
            const hours = parseFloat(service.querySelector('.hourly-service-hours').value) || 0;
            const rate = parseFloat(service.querySelector('.hourly-service-rate').value) || 0;
            total += this.roundToTwo(hours * rate);
        });
        
        total = this.roundToTwo(total);
        document.getElementById('hourly-total').textContent = this.formatCurrency(total);
        this.updateAllTotals();
    }

    /**
     * Add a new line item
     */
    addLineItem() {
        const container = document.getElementById('line-items-container');
        const lineItemId = 'line-item-' + Date.now();
        
        const lineItemHtml = `
            <div class="line-item" data-id="${lineItemId}">
                <div class="form-group">
                    <label>Description</label>
                    <input type="text" class="form-control line-item-input" data-field="description" placeholder="Service or product description">
                </div>
                <div class="form-group">
                    <label>Quantity</label>
                    <input type="number" class="form-control line-item-input" data-field="quantity" min="1" step="1" value="1">
                </div>
                <div class="form-group">
                    <label>Unit Price</label>
                    <input type="number" class="form-control line-item-input" data-field="price" min="0" step="0.01" placeholder="0.00">
                </div>
                <button type="button" class="remove-line-item" title="Remove line item">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        container.insertAdjacentHTML('beforeend', lineItemHtml);
        this.calculateLineItemsTotal();
    }

    /**
     * Remove a line item
     */
    removeLineItem(button) {
        const lineItem = button.closest('.line-item');
        if (lineItem) {
            lineItem.remove();
            this.calculateLineItemsTotal();
        }
    }

    /**
     * Calculate line items total
     */
    calculateLineItemsTotal() {
        const lineItems = document.querySelectorAll('.line-item');
        let total = 0;
        
        lineItems.forEach(item => {
            const quantity = parseFloat(item.querySelector('[data-field="quantity"]').value) || 0;
            const price = parseFloat(item.querySelector('[data-field="price"]').value) || 0;
            // Round each line item to avoid floating point accumulation
            total += this.roundToTwo(quantity * price);
        });
        
        // Final rounding
        total = this.roundToTwo(total);
        
        document.getElementById('line-items-total').textContent = this.formatCurrency(total);
        this.updateAllTotals();
    }

    /**
     * Update all totals (subtotal, tax, final total)
     */
    updateAllTotals() {
        const hourlyTotal = this.parseAmount(document.getElementById('hourly-total').textContent);
        const lineItemsTotal = this.parseAmount(document.getElementById('line-items-total').textContent);
        
        // Calculate subtotal
        let subtotal = this.roundToTwo(hourlyTotal + lineItemsTotal);
        
        // Apply discount if any
        let discountAmount = 0;
        if (this.discountPercent > 0) {
            discountAmount = this.roundToTwo(subtotal * (this.discountPercent / 100));
        } else if (this.discountAmount > 0) {
            discountAmount = this.roundToTwo(this.discountAmount);
        }
        
        // Subtotal after discount
        const subtotalAfterDiscount = this.roundToTwo(subtotal - discountAmount);
        
        // Calculate tax on discounted amount
        const taxAmount = this.roundToTwo(subtotalAfterDiscount * this.taxRate);
        
        // Final total
        const finalTotal = this.roundToTwo(subtotalAfterDiscount + taxAmount);
        
        // Update display
        document.getElementById('subtotal').textContent = this.formatCurrency(subtotal);
        document.getElementById('tax-amount').textContent = this.formatCurrency(taxAmount);
        document.getElementById('final-total').textContent = this.formatCurrency(finalTotal);
        
        // Update discount display if it exists
        const discountDisplay = document.getElementById('discount-amount');
        if (discountDisplay && discountAmount > 0) {
            discountDisplay.textContent = this.formatCurrency(discountAmount);
            discountDisplay.parentElement.style.display = 'flex';
        } else if (discountDisplay) {
            discountDisplay.parentElement.style.display = 'none';
        }
    }

    /**
     * Format number as currency
     */
    formatCurrency(amount) {
        // Ensure we're working with a number and round to 2 decimals
        const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(this.roundToTwo(numAmount));
    }
    
    /**
     * Round number to 2 decimal places (avoids floating point errors)
     */
    roundToTwo(num) {
        return Math.round((num + Number.EPSILON) * 100) / 100;
    }
    
    /**
     * Set discount percentage (0-100)
     */
    setDiscountPercent(percent) {
        this.discountPercent = Math.max(0, Math.min(100, percent));
        this.discountAmount = 0; // Clear fixed discount
        this.updateAllTotals();
    }
    
    /**
     * Set fixed discount amount
     */
    setDiscountAmount(amount) {
        this.discountAmount = Math.max(0, amount);
        this.discountPercent = 0; // Clear percentage discount
        this.updateAllTotals();
    }
    
    /**
     * Clear discount
     */
    clearDiscount() {
        this.discountPercent = 0;
        this.discountAmount = 0;
        this.updateAllTotals();
    }

    /**
     * Parse currency string to number
     */
    parseAmount(currencyString) {
        return parseFloat(currencyString.replace(/[^0-9.-]+/g, '')) || 0;
    }

    /**
     * Get hourly service data
     */
    getHourlyServiceData() {
        const services = document.querySelectorAll('.hourly-service');
        const hourlyServices = [];
        
        services.forEach(service => {
            const serviceType = service.querySelector('.hourly-service-type');
            const serviceDescription = service.querySelector('.hourly-service-description');
            const serviceNotes = service.querySelector('.hourly-service-notes');
            const hours = parseFloat(service.querySelector('.hourly-service-hours').value) || 0;
            const rate = parseFloat(service.querySelector('.hourly-service-rate').value) || 0;
            
            if (serviceType.value && hours > 0) {
                let description = serviceDescription.value || serviceType.options[serviceType.selectedIndex].text;
                const notes = serviceNotes.value.trim();
                
                // Append notes to description if present
                if (notes) {
                    description += ` - ${notes}`;
                }
                
                hourlyServices.push({
                    type: 'hourly',
                    serviceType: serviceType.options[serviceType.selectedIndex].text,
                    description: description,
                    hours: hours,
                    rate: rate,
                    total: this.roundToTwo(hours * rate)
                });
            }
        });
        
        return hourlyServices.length > 0 ? hourlyServices : null;
    }

    /**
     * Get all line items data
     */
    getLineItemsData() {
        const lineItems = document.querySelectorAll('.line-item');
        const items = [];
        
        lineItems.forEach(item => {
            const description = item.querySelector('[data-field="description"]').value.trim();
            const quantity = parseFloat(item.querySelector('[data-field="quantity"]').value) || 0;
            const price = parseFloat(item.querySelector('[data-field="price"]').value) || 0;
            
            if (description && quantity > 0 && price > 0) {
                items.push({
                    type: 'line-item',
                    description: description,
                    quantity: quantity,
                    price: price,
                    total: quantity * price
                });
            }
        });
        
        return items;
    }

    /**
     * Get invoice totals
     */
    getInvoiceTotals() {
        const subtotal = this.parseAmount(document.getElementById('subtotal').textContent);
        const taxAmount = this.parseAmount(document.getElementById('tax-amount').textContent);
        const finalTotal = this.parseAmount(document.getElementById('final-total').textContent);
        
        // Calculate discount if any
        let discountAmount = 0;
        if (this.discountPercent > 0) {
            discountAmount = this.roundToTwo(subtotal * (this.discountPercent / 100));
        } else if (this.discountAmount > 0) {
            discountAmount = this.roundToTwo(this.discountAmount);
        }
        
        return {
            subtotal: this.roundToTwo(subtotal),
            discount: this.roundToTwo(discountAmount),
            subtotalAfterDiscount: this.roundToTwo(subtotal - discountAmount),
            taxAmount: this.roundToTwo(taxAmount),
            taxRate: this.taxRate,
            finalTotal: this.roundToTwo(finalTotal)
        };
    }

    /**
     * Clear all calculations
     */
    clearCalculations() {
        // Clear hourly services
        document.getElementById('hourly-services-container').innerHTML = '';
        
        // Clear line items
        document.getElementById('line-items-container').innerHTML = '';
        
        // Reset totals
        document.getElementById('hourly-total').textContent = '$0.00';
        document.getElementById('line-items-total').textContent = '$0.00';
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('tax-amount').textContent = '$0.00';
        document.getElementById('final-total').textContent = '$0.00';
        
        // Add first hourly service
        this.addHourlyService();
    }

    /**
     * Validate invoice data
     */
    validateInvoiceData() {
        const errors = [];
        
        // Check if there's at least one service or line item
        const hourlyServices = this.getHourlyServiceData();
        const lineItems = this.getLineItemsData();
        
        if ((!hourlyServices || hourlyServices.length === 0) && lineItems.length === 0) {
            errors.push('Please add at least one service or line item');
        }
        
        // Validate hourly services if present
        if (hourlyServices && hourlyServices.length > 0) {
            hourlyServices.forEach((service, index) => {
                if (service.hours <= 0) {
                    errors.push(`Hourly service ${index + 1}: Hours worked must be greater than 0`);
                }
                if (service.rate <= 0) {
                    errors.push(`Hourly service ${index + 1}: Hourly rate must be greater than 0`);
                }
            });
        }
        
        // Validate line items
        lineItems.forEach((item, index) => {
            if (!item.description.trim()) {
                errors.push(`Line item ${index + 1}: Description is required`);
            }
            if (item.quantity <= 0) {
                errors.push(`Line item ${index + 1}: Quantity must be greater than 0`);
            }
            if (item.price <= 0) {
                errors.push(`Line item ${index + 1}: Price must be greater than 0`);
            }
        });
        
        return errors;
    }

    /**
     * Get service suggestions based on common TechFlow services
     */
    getServiceSuggestions() {
        return [
            { description: 'PC Repair & Diagnostics', defaultHours: 2, category: 'repair' },
            { description: 'Virus & Malware Removal', defaultHours: 1.5, category: 'security' },
            { description: 'Performance Optimization', defaultHours: 1, category: 'maintenance' },
            { description: 'Hardware Installation', defaultHours: 1.5, category: 'hardware' },
            { description: 'Network Setup & Configuration', defaultHours: 2.5, category: 'networking' },
            { description: 'Data Recovery', defaultHours: 3, category: 'data' },
            { description: 'Software Installation & Setup', defaultHours: 1, category: 'software' },
            { description: 'System Maintenance', defaultHours: 1.5, category: 'maintenance' },
            { description: 'Custom PC Build', defaultHours: 4, category: 'hardware' },
            { description: 'Remote Support Session', defaultHours: 1, category: 'support' }
        ];
    }
    
    /**
     * Calculate estimated time based on service complexity
     */
    estimateServiceTime(serviceDescription) {
        const suggestions = this.getServiceSuggestions();
        const match = suggestions.find(s =>
            s.description.toLowerCase().includes(serviceDescription.toLowerCase())
        );
        return match ? match.defaultHours : null;
    }
    
    /**
     * Apply bulk discount based on total hours
     */
    applyBulkDiscount(hours) {
        if (hours >= 10) {
            return 0.15; // 15% discount for 10+ hours
        } else if (hours >= 5) {
            return 0.10; // 10% discount for 5+ hours
        } else if (hours >= 3) {
            return 0.05; // 5% discount for 3+ hours
        }
        return 0;
    }
    
    /**
     * Get quick pricing estimate
     */
    getQuickEstimate(serviceType, hours) {
        const rate = this.rates[serviceType] || 100;
        const subtotal = this.roundToTwo(hours * rate);
        const tax = this.roundToTwo(subtotal * this.taxRate);
        const total = this.roundToTwo(subtotal + tax);
        
        return {
            rate: rate,
            hours: hours,
            subtotal: subtotal,
            tax: tax,
            total: total,
            formatted: {
                rate: this.formatCurrency(rate),
                subtotal: this.formatCurrency(subtotal),
                tax: this.formatCurrency(tax),
                total: this.formatCurrency(total)
            }
        };
    }

    /**
     * Apply service suggestion
     */
    applyServiceSuggestion(suggestion) {
        document.getElementById('service-description').value = suggestion.description;
        if (suggestion.defaultHours) {
            document.getElementById('hours-worked').value = suggestion.defaultHours;
            this.calculateHourlyTotal();
        }
    }

    /**
     * Get pricing summary for display
     */
    getPricingSummary() {
        const hourlyServices = this.getHourlyServiceData();
        const lineItems = this.getLineItemsData();
        const totals = this.getInvoiceTotals();
        
        return {
            hourlyServices: hourlyServices,
            lineItems: lineItems,
            totals: totals,
            itemCount: (hourlyServices ? hourlyServices.length : 0) + lineItems.length
        };
    }

    /**
     * Export calculation data for backup/import
     */
    exportCalculationData() {
        return {
            hourlyService: this.getHourlyServiceData(),
            lineItems: this.getLineItemsData(),
            totals: this.getInvoiceTotals(),
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import calculation data
     */
    importCalculationData(data) {
        try {
            this.clearCalculations();
            
            // Import hourly service
            if (data.hourlyService) {
                const service = data.hourlyService;
                // Find matching service type
                const serviceTypeSelect = document.getElementById('service-type');
                for (let option of serviceTypeSelect.options) {
                    if (option.dataset.rate == service.rate) {
                        serviceTypeSelect.value = option.value;
                        break;
                    }
                }
                
                document.getElementById('service-description').value = service.description;
                document.getElementById('hours-worked').value = service.hours;
                this.updateHourlyRate();
                this.calculateHourlyTotal();
            }
            
            // Import line items
            if (data.lineItems && data.lineItems.length > 0) {
                data.lineItems.forEach(item => {
                    this.addLineItem();
                    const lastLineItem = document.querySelector('.line-item:last-child');
                    lastLineItem.querySelector('[data-field="description"]').value = item.description;
                    lastLineItem.querySelector('[data-field="quantity"]').value = item.quantity;
                    lastLineItem.querySelector('[data-field="price"]').value = item.price;
                });
                this.calculateLineItemsTotal();
            }
            
            return true;
        } catch (error) {
            console.error('Error importing calculation data:', error);
            return false;
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.invoiceCalculator = new InvoiceCalculator();
});