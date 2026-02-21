/**
 * TechFlow Solutions - Invoice Generator
 * Main application logic for invoice generation, preview, and printing
 */

class InvoiceGenerator {
    constructor() {
        this.invoiceCounter = this.loadInvoiceCounter();
        this.currentInvoice = null;
        this.initializeEventListeners();
        this.initializeForm();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Preview invoice button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'preview-invoice-btn') {
                this.previewInvoice();
            }
        });

        // Print invoice button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'print-invoice-btn') {
                this.printInvoice();
            }
        });

        // Clear form button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'clear-form-btn') {
                this.clearForm();
            }
        });

        // Generate new invoice number when form is cleared or on load
        document.addEventListener('DOMContentLoaded', () => {
            this.generateInvoiceNumber();
        });
    }

    /**
     * Initialize form with default values
     */
    initializeForm() {
        // Set current date
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('invoice-date').value = today;
        
        // Generate invoice number
        this.generateInvoiceNumber();
    }

    /**
     * Load invoice counter from localStorage
     */
    loadInvoiceCounter() {
        try {
            const stored = localStorage.getItem('techflow_invoice_counter');
            return stored ? parseInt(stored) : 1;
        } catch (error) {
            console.error('Error loading invoice counter:', error);
            return 1;
        }
    }

    /**
     * Save invoice counter to localStorage
     */
    saveInvoiceCounter() {
        try {
            localStorage.setItem('techflow_invoice_counter', this.invoiceCounter.toString());
        } catch (error) {
            console.error('Error saving invoice counter:', error);
        }
    }

    /**
     * Generate new invoice number
     */
    generateInvoiceNumber() {
        const year = new Date().getFullYear();
        const invoiceNumber = `TFS-${year}-${this.invoiceCounter.toString().padStart(4, '0')}`;
        document.getElementById('invoice-number').value = invoiceNumber;
        return invoiceNumber;
    }

    /**
     * Increment invoice counter
     */
    incrementInvoiceCounter() {
        this.invoiceCounter++;
        this.saveInvoiceCounter();
    }

    /**
     * Get customer data from form
     */
    getCustomerData() {
        return {
            name: document.getElementById('customer-name').value.trim(),
            company: document.getElementById('customer-company').value.trim(),
            phone: document.getElementById('customer-phone').value.trim(),
            email: document.getElementById('customer-email').value.trim(),
            address: document.getElementById('customer-address').value.trim()
        };
    }

    /**
     * Get invoice data
     */
    getInvoiceData() {
        return {
            number: document.getElementById('invoice-number').value,
            date: document.getElementById('invoice-date').value,
            customer: this.getCustomerData(),
            services: {
                hourly: window.invoiceCalculator.getHourlyServiceData(),
                lineItems: window.invoiceCalculator.getLineItemsData()
            },
            totals: window.invoiceCalculator.getInvoiceTotals(),
            createdAt: new Date().toISOString()
        };
    }

    /**
     * Validate invoice data
     */
    validateInvoice() {
        const errors = [];
        const customer = this.getCustomerData();
        
        // Validate customer information
        if (!customer.name) {
            errors.push('Customer name is required');
        }
        if (!customer.phone) {
            errors.push('Customer phone is required');
        }
        
        // Validate invoice details
        const invoiceNumber = document.getElementById('invoice-number').value;
        const invoiceDate = document.getElementById('invoice-date').value;
        
        if (!invoiceNumber) {
            errors.push('Invoice number is required');
        }
        if (!invoiceDate) {
            errors.push('Invoice date is required');
        }
        
        // Validate services using calculator
        const calculatorErrors = window.invoiceCalculator.validateInvoiceData();
        errors.push(...calculatorErrors);
        
        return errors;
    }

    /**
     * Preview invoice
     */
    previewInvoice() {
        const errors = this.validateInvoice();
        
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return;
        }
        
        const invoiceData = this.getInvoiceData();
        this.currentInvoice = invoiceData;
        
        const previewHtml = this.generateInvoiceHTML(invoiceData);
        const previewSection = document.getElementById('invoice-preview');
        const previewDocument = previewSection.querySelector('.invoice-document');
        
        previewDocument.innerHTML = previewHtml;
        previewSection.style.display = 'block';
        
        // Scroll to preview
        previewSection.scrollIntoView({ behavior: 'smooth' });
        
        // Show success message
        this.showNotification('Invoice preview generated successfully', 'success');
    }

    /**
     * Generate invoice HTML
     */
    generateInvoiceHTML(invoiceData) {
        const { customer, services, totals } = invoiceData;
        
        // Build services table rows
        let serviceRows = '';
        
        // Add hourly service if present
        if (services.hourly) {
            const service = services.hourly;
            serviceRows += `
                <tr>
                    <td>${service.description}</td>
                    <td class="amount">${service.hours}</td>
                    <td class="amount">${this.formatCurrency(service.rate)}</td>
                    <td class="amount">${this.formatCurrency(service.total)}</td>
                </tr>
            `;
        }
        
        // Add line items
        services.lineItems.forEach(item => {
            serviceRows += `
                <tr>
                    <td>${item.description}</td>
                    <td class="amount">${item.quantity}</td>
                    <td class="amount">${this.formatCurrency(item.price)}</td>
                    <td class="amount">${this.formatCurrency(item.total)}</td>
                </tr>
            `;
        });
        
        return `
            <div class="invoice-header">
                <div class="invoice-logo">
                    <img src="../assets/images/TechFlow Solutions Logo- Cropped.png" alt="TechFlow Solutions Logo" class="invoice-logo-image">
                </div>
                <div class="business-info">
                    <strong>TechFlow Solutions</strong><br>
                    Website Design & IT Services<br>
                    Greater Toronto Area<br>
                    Phone: (647) 572-8341<br>
                    Email: rob@techflowsolutions.ca
                </div>
            </div>
            
            <div class="invoice-details">
                <div class="customer-details">
                    <h3>Bill To:</h3>
                    <strong>${customer.name}</strong><br>
                    ${customer.company ? `${customer.company}<br>` : ''}
                    ${customer.phone ? `Phone: ${customer.phone}<br>` : ''}
                    ${customer.email ? `Email: ${customer.email}<br>` : ''}
                    ${customer.address ? `${customer.address.replace(/\n/g, '<br>')}` : ''}
                </div>
                <div class="invoice-info">
                    <h3>Invoice Details:</h3>
                    <strong>Invoice #:</strong> ${invoiceData.number}<br>
                    <strong>Date:</strong> ${this.formatDate(invoiceData.date)}<br>
                    <strong>Due Date:</strong> ${this.formatDate(invoiceData.date, 30)}
                </div>
            </div>
            
            <table class="services-table">
                <thead>
                    <tr>
                        <th>Description</th>
                        <th>Qty/Hours</th>
                        <th>Rate/Price</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${serviceRows}
                </tbody>
            </table>
            
            <table class="invoice-totals-table">
                <tr>
                    <td>Subtotal:</td>
                    <td class="amount">${this.formatCurrency(totals.subtotal)}</td>
                </tr>
                <tr>
                    <td>HST (13%):</td>
                    <td class="amount">${this.formatCurrency(totals.taxAmount)}</td>
                </tr>
                <tr class="total-row">
                    <td><strong>Total:</strong></td>
                    <td class="amount"><strong>${this.formatCurrency(totals.finalTotal)}</strong></td>
                </tr>
            </table>
            
            <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px solid #ddd; font-size: 0.875rem; color: #666;">
                <p><strong>Payment Terms:</strong> Payment is due within 30 days of invoice date.</p>
                <p><strong>Thank you for choosing TechFlow Solutions!</strong></p>
                <p>For questions about this invoice, please contact us at (647) 572-8321 or rob@techflowsolutions.ca</p>
            </div>
        `;
    }

    /**
     * Print invoice
     */
    printInvoice() {
        if (!this.currentInvoice) {
            this.previewInvoice();
            if (!this.currentInvoice) {
                return;
            }
        }
        
        // Increment invoice counter when printing (finalizing invoice)
        this.incrementInvoiceCounter();
        
        // Save invoice to localStorage for records
        this.saveInvoiceRecord(this.currentInvoice);
        
        // Print the invoice
        window.print();
        
        // Show success message
        this.showNotification('Invoice sent to printer successfully', 'success');
        
        // Generate new invoice number for next invoice
        this.generateInvoiceNumber();
    }

    /**
     * Save invoice record to localStorage
     */
    saveInvoiceRecord(invoiceData) {
        try {
            const invoices = this.loadInvoiceRecords();
            invoices.push({
                ...invoiceData,
                printedAt: new Date().toISOString()
            });
            
            // Keep only last 100 invoices to prevent localStorage bloat
            if (invoices.length > 100) {
                invoices.splice(0, invoices.length - 100);
            }
            
            localStorage.setItem('techflow_invoices', JSON.stringify(invoices));
        } catch (error) {
            console.error('Error saving invoice record:', error);
        }
    }

    /**
     * Load invoice records from localStorage
     */
    loadInvoiceRecords() {
        try {
            const stored = localStorage.getItem('techflow_invoices');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading invoice records:', error);
            return [];
        }
    }

    /**
     * Clear form
     */
    clearForm() {
        if (confirm('Are you sure you want to clear the form? All unsaved data will be lost.')) {
            // Clear customer form
            window.customerManager.clearCustomerForm();
            
            // Clear calculations
            window.invoiceCalculator.clearCalculations();
            
            // Reset invoice details
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('invoice-date').value = today;
            this.generateInvoiceNumber();
            
            // Hide preview
            document.getElementById('invoice-preview').style.display = 'none';
            
            // Clear current invoice
            this.currentInvoice = null;
            
            this.showNotification('Form cleared successfully', 'info');
        }
    }

    /**
     * Format currency
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-CA', {
            style: 'currency',
            currency: 'CAD'
        }).format(amount);
    }

    /**
     * Format date
     */
    formatDate(dateString, addDays = 0) {
        const date = new Date(dateString);
        if (addDays > 0) {
            date.setDate(date.getDate() + addDays);
        }
        return date.toLocaleDateString('en-CA', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * Show validation errors
     */
    showValidationErrors(errors) {
        const errorMessage = 'Please fix the following errors:\n\n' + errors.join('\n');
        alert(errorMessage);
        
        // Also show as notification
        this.showNotification('Please fix validation errors before proceeding', 'error');
    }

    /**
     * Show notification
     */
    showNotification(message, type = 'info') {
        // Use the customer manager's notification system
        if (window.customerManager) {
            window.customerManager.showNotification(message, type);
        } else {
            // Fallback to alert if customer manager not available
            alert(message);
        }
    }

    /**
     * Export invoice data
     */
    exportInvoiceData() {
        const invoiceData = this.getInvoiceData();
        const dataStr = JSON.stringify(invoiceData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `invoice_${invoiceData.number}_${invoiceData.date}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.showNotification('Invoice data exported successfully', 'success');
    }

    /**
     * Get invoice statistics
     */
    getInvoiceStats() {
        const invoices = this.loadInvoiceRecords();
        const currentYear = new Date().getFullYear();
        const currentMonth = new Date().getMonth();
        
        const thisYear = invoices.filter(inv => 
            new Date(inv.date).getFullYear() === currentYear
        );
        
        const thisMonth = invoices.filter(inv => {
            const invDate = new Date(inv.date);
            return invDate.getFullYear() === currentYear && invDate.getMonth() === currentMonth;
        });
        
        const totalRevenue = invoices.reduce((sum, inv) => sum + inv.totals.finalTotal, 0);
        const yearRevenue = thisYear.reduce((sum, inv) => sum + inv.totals.finalTotal, 0);
        const monthRevenue = thisMonth.reduce((sum, inv) => sum + inv.totals.finalTotal, 0);
        
        return {
            totalInvoices: invoices.length,
            thisYearInvoices: thisYear.length,
            thisMonthInvoices: thisMonth.length,
            totalRevenue: totalRevenue,
            yearRevenue: yearRevenue,
            monthRevenue: monthRevenue,
            averageInvoice: invoices.length > 0 ? totalRevenue / invoices.length : 0
        };
    }

    /**
     * Search invoices
     */
    searchInvoices(query) {
        const invoices = this.loadInvoiceRecords();
        const searchTerm = query.toLowerCase();
        
        return invoices.filter(invoice => 
            invoice.number.toLowerCase().includes(searchTerm) ||
            invoice.customer.name.toLowerCase().includes(searchTerm) ||
            invoice.customer.company.toLowerCase().includes(searchTerm) ||
            invoice.customer.phone.includes(searchTerm)
        );
    }

    /**
     * Get recent invoices
     */
    getRecentInvoices(limit = 10) {
        const invoices = this.loadInvoiceRecords();
        return invoices
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
            .slice(0, limit);
    }
}

// Initialize invoice generator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.invoiceGenerator = new InvoiceGenerator();
});