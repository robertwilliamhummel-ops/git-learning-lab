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

        // Send invoice button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'send-invoice-btn') {
                this.sendInvoice();
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
        
        // Add hourly services if present
        if (services.hourly && Array.isArray(services.hourly)) {
            services.hourly.forEach(service => {
                serviceRows += `
                    <tr>
                        <td>${service.description}</td>
                        <td class="amount">${service.hours}</td>
                        <td class="amount">${this.formatCurrency(service.rate)}</td>
                        <td class="amount">${this.formatCurrency(service.total)}</td>
                    </tr>
                `;
            });
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
                <div class="business-info">
                    <div class="company-name">TechFlow Solutions</div>
                    <div>Website Design & IT Services</div>
                    <div>Greater Toronto Area</div>
                    <div>Phone: (647) 572-8341</div>
                    <div>Email: info@techflowsolutions.ca</div>
                </div>
                <div class="invoice-logo">
                    <img src="../assets/images/TechFlow Solutions Logo- Cropped.png" alt="TechFlow Solutions Logo" class="invoice-logo-image">
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
            
            <!-- Payment Options Section (Compact) -->
            <div class="payment-section" style="margin: 25px 0; padding: 15px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
                <h3 style="color: #667eea; margin: 0 0 12px 0; font-size: 18px; text-align: center;">Payment Options</h3>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                    <!-- E-Transfer (First - Preferred) -->
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #28a745;">
                        <div style="color: #28a745; font-weight: bold; font-size: 14px; margin-bottom: 8px;">📧 E-Transfer</div>
                        <p style="margin: 4px 0; font-size: 13px; line-height: 1.3;">
                            <strong>To:</strong> info@techflowsolutions.ca<br>
                            <strong>Amount:</strong> <span style="color: #28a745; font-weight: bold;">${this.formatCurrency(totals.finalTotal)}</span>
                        </p>
                        <p style="font-size: 10px; color: #666; margin: 6px 0 0 0;">No fees • Auto-deposit enabled</p>
                    </div>
                    
                    <!-- Credit Card (Second) -->
                    <div style="background: white; padding: 12px; border-radius: 6px; border: 1px solid #667eea;">
                        <div style="color: #667eea; font-weight: bold; font-size: 14px; margin-bottom: 8px;">💳 Credit Card</div>
                        <button onclick="window.payWithStripe(${totals.finalTotal}, '${invoiceData.number}', '${customer.email || ''}', '${customer.name}')"
                           style="display: block; width: 100%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 10px; text-align: center; border: none; border-radius: 4px; font-weight: bold; font-size: 14px; cursor: pointer;">
                            Pay ${this.formatCurrency(totals.finalTotal)} →
                        </button>
                        <p style="font-size: 10px; color: #666; text-align: center; margin: 6px 0 0 0;">Secure payment powered by Stripe</p>
                    </div>
                </div>
                
                <div style="text-align: center; padding-top: 10px; border-top: 1px solid #dee2e6; font-size: 11px; color: #6c757d;">
                    <p style="margin: 3px 0;"><strong style="color: #495057;">Payment due within 15 days</strong> • Questions? (647) 572-8341</p>
                    <p style="margin: 3px 0; font-style: italic;">Thank you for choosing TechFlow Solutions!</p>
                </div>
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
     * Send invoice via email and save to Firestore
     */
    async sendInvoice() {
        // Validate invoice first
        const errors = this.validateInvoice();
        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return;
        }

        // Check if customer has email
        const customer = this.getCustomerData();
        if (!customer.email) {
            alert('Customer email is required to send invoice');
            return;
        }

        try {
            // Show loading state
            const btn = document.getElementById('send-invoice-btn');
            const originalHTML = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            // Get invoice data
            const invoiceData = this.getInvoiceData();
            
            // Save to Firestore
            const saveResult = await window.firestoreManager.saveInvoice(invoiceData);
            
            if (!saveResult.success) {
                throw new Error('Failed to save invoice to database');
            }
            
            // Send email via Firebase Function (use original invoiceData, not saveResult)
            await this.sendInvoiceEmail(invoiceData);
            
            // Increment counter
            this.incrementInvoiceCounter();
            
            // Show success
            this.showNotification(
                `Invoice ${invoiceData.number} sent successfully!`,
                'success'
            );
            
            // Clear form for next invoice
            this.clearForm();
            
        } catch (error) {
            console.error('Error sending invoice:', error);
            this.showNotification(
                `Error sending invoice: ${error.message}`,
                'error'
            );
        } finally {
            // Restore button
            const btn = document.getElementById('send-invoice-btn');
            if (btn) {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-envelope"></i> Send Invoice';
            }
        }
    }

    /**
     * Send invoice email via Firebase Function
     */
    async sendInvoiceEmail(invoiceData) {
        console.log('📧 sendInvoiceEmail called with:', invoiceData);
        console.log('📧 Customer data:', invoiceData.customer);
        
        const { getFunctions, httpsCallable } = await import(
            'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js'
        );
        const functions = getFunctions();
        
        // Call the email function
        const sendEmail = httpsCallable(functions, 'sendInvoiceEmail');
        
        // Format items for email
        const items = [];
        
        // Add hourly services (with safety checks)
        if (invoiceData.services && invoiceData.services.hourly && Array.isArray(invoiceData.services.hourly)) {
            invoiceData.services.hourly.forEach(service => {
                items.push({
                    description: service.description,
                    quantity: service.hours,
                    rate: service.rate,
                    amount: service.total
                });
            });
        }
        
        // Add line items (with safety checks)
        if (invoiceData.services && invoiceData.services.lineItems && Array.isArray(invoiceData.services.lineItems)) {
            invoiceData.services.lineItems.forEach(item => {
                items.push({
                    description: item.description,
                    quantity: item.quantity,
                    rate: item.price,
                    amount: item.total
                });
            });
        }
        
        const result = await sendEmail({
            customerEmail: invoiceData.customer.email,
            customerName: invoiceData.customer.name,
            invoiceNumber: invoiceData.invoiceNumber || invoiceData.number,
            invoiceDate: this.formatDate(invoiceData.date),
            items: items,
            subtotal: invoiceData.totals.subtotal.toFixed(2),
            tax: invoiceData.totals.taxAmount.toFixed(2),
            total: invoiceData.totals.finalTotal.toFixed(2),
            // Add amount for Stripe payment link generation
            amount: invoiceData.totals.finalTotal
        });
        
        return result.data;
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