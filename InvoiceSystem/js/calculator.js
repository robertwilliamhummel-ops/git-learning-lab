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
        this.taxRate = 0.13; // HST 13% for Ontario
        this.discountPercent = 0; // Discount percentage (0-100)
        this.discountAmount = 0; // Fixed discount amount
        this.lineItems = [];
        this.initializeEventListeners();
        this.updateAllTotals();
    }

    /**
     * Initialize event listeners for calculator functionality
     */
    initializeEventListeners() {
        // Service type change
        document.addEventListener('change', (e) => {
            if (e.target.id === 'service-type') {
                this.updateHourlyRate();
                this.calculateHourlyTotal();
            }
        });

        // Hours worked change
        document.addEventListener('input', (e) => {
            if (e.target.id === 'hours-worked') {
                this.calculateHourlyTotal();
            }
        });

        // Add line item button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'add-line-item-btn') {
                this.addLineItem();
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
     * Update hourly rate based on selected service type
     */
    updateHourlyRate() {
        const serviceType = document.getElementById('service-type');
        const hourlyRateInput = document.getElementById('hourly-rate');
        
        if (serviceType.value && serviceType.selectedOptions[0]) {
            const rate = serviceType.selectedOptions[0].dataset.rate;
            hourlyRateInput.value = rate || 0;
        } else {
            hourlyRateInput.value = 0;
        }
    }

    /**
     * Calculate hourly services total
     */
    calculateHourlyTotal() {
        const hours = parseFloat(document.getElementById('hours-worked').value) || 0;
        const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;
        
        // Round to 2 decimal places to avoid floating point errors
        const total = this.roundToTwo(hours * rate);
        
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
        const serviceType = document.getElementById('service-type');
        const serviceDescription = document.getElementById('service-description');
        const hours = parseFloat(document.getElementById('hours-worked').value) || 0;
        const rate = parseFloat(document.getElementById('hourly-rate').value) || 0;
        
        if (!serviceType.value || hours === 0) {
            return null;
        }
        
        return {
            type: 'hourly',
            serviceType: serviceType.options[serviceType.selectedIndex].text,
            description: serviceDescription.value || serviceType.options[serviceType.selectedIndex].text,
            hours: hours,
            rate: rate,
            total: hours * rate
        };
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
        // Clear hourly service
        document.getElementById('service-type').value = '';
        document.getElementById('service-description').value = '';
        document.getElementById('hours-worked').value = '';
        document.getElementById('hourly-rate').value = '';
        
        // Clear line items
        document.getElementById('line-items-container').innerHTML = '';
        
        // Reset totals
        document.getElementById('hourly-total').textContent = '$0.00';
        document.getElementById('line-items-total').textContent = '$0.00';
        document.getElementById('subtotal').textContent = '$0.00';
        document.getElementById('tax-amount').textContent = '$0.00';
        document.getElementById('final-total').textContent = '$0.00';
    }

    /**
     * Validate invoice data
     */
    validateInvoiceData() {
        const errors = [];
        
        // Check if there's at least one service or line item
        const hourlyService = this.getHourlyServiceData();
        const lineItems = this.getLineItemsData();
        
        if (!hourlyService && lineItems.length === 0) {
            errors.push('Please add at least one service or line item');
        }
        
        // Validate hourly service if present
        if (hourlyService) {
            if (hourlyService.hours <= 0) {
                errors.push('Hours worked must be greater than 0');
            }
            if (hourlyService.rate <= 0) {
                errors.push('Hourly rate must be greater than 0');
            }
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
        const hourlyService = this.getHourlyServiceData();
        const lineItems = this.getLineItemsData();
        const totals = this.getInvoiceTotals();
        
        return {
            hourlyService: hourlyService,
            lineItems: lineItems,
            totals: totals,
            itemCount: (hourlyService ? 1 : 0) + lineItems.length
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