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
                this.previewInvoice().catch(err => console.error('Preview error:', err));
            }
        });

        // Close preview button
        document.addEventListener('click', (e) => {
            if (e.target.id === 'close-preview-btn' || e.target.closest('#close-preview-btn')) {
                document.getElementById('invoice-preview').style.display = 'none';
                const iframe = document.getElementById('pdf-preview-iframe');
                if (iframe.src) {
                    URL.revokeObjectURL(iframe.src); // Free memory
                    iframe.src = '';
                }
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
     * Preview invoice - generates real Puppeteer PDF
     */
    async previewInvoice() {
        const errors = this.validateInvoice();

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return;
        }

        // Show preview section with loading state
        const previewSection = document.getElementById('invoice-preview');
        const loadingDiv = document.getElementById('preview-loading');
        const iframe = document.getElementById('pdf-preview-iframe');

        previewSection.style.display = 'block';
        loadingDiv.style.display = 'block';
        iframe.style.display = 'none';
        previewSection.scrollIntoView({ behavior: 'smooth' });

        // Disable preview button during generation
        const previewBtn = document.getElementById('preview-invoice-btn');
        const originalHTML = previewBtn.innerHTML;
        previewBtn.disabled = true;
        previewBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';

        try {
            const invoiceData = this.getInvoiceData();
            this.currentInvoice = invoiceData;

            // Build items array for Firebase function (same format as sendInvoice)
            const items = [];
            if (invoiceData.services?.hourly && Array.isArray(invoiceData.services.hourly)) {
                invoiceData.services.hourly.forEach(service => {
                    items.push({
                        description: service.description,
                        quantity: service.hours,
                        rate: service.rate,
                        amount: service.total
                    });
                });
            }
            if (invoiceData.services?.lineItems && Array.isArray(invoiceData.services.lineItems)) {
                invoiceData.services.lineItems.forEach(item => {
                    items.push({
                        description: item.description,
                        quantity: item.quantity,
                        rate: item.price,
                        amount: item.total
                    });
                });
            }

            // Call Firebase function to generate real Puppeteer PDF
            const { getFunctions, httpsCallable } = await import(
                'https://www.gstatic.com/firebasejs/10.8.0/firebase-functions.js'
            );
            const functions = getFunctions();
            const previewPDF = httpsCallable(functions, 'previewInvoicePDF');

            const result = await previewPDF({
                items: items,
                customerName: invoiceData.customer.name,
                invoiceNumber: invoiceData.number,
                invoiceDate: this.formatDate(invoiceData.date),
                subtotal: invoiceData.totals.subtotal.toFixed(2),
                tax: invoiceData.totals.taxAmount.toFixed(2),
                total: invoiceData.totals.finalTotal.toFixed(2),
            });

            if (!result.data.success || !result.data.pdfBase64) {
                throw new Error('Preview generation returned no PDF data');
            }

            // Convert base64 to blob URL and display in iframe
            const binaryString = atob(result.data.pdfBase64);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
            }
            const pdfBlob = new Blob([bytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(pdfBlob);

            // Show PDF in iframe
            iframe.src = blobUrl;
            loadingDiv.style.display = 'none';
            iframe.style.display = 'block';

            this.showNotification('PDF preview generated — this is exactly what your client will receive', 'success');

        } catch (error) {
            console.error('❌ Preview generation failed:', error);
            loadingDiv.style.display = 'none';
            previewSection.style.display = 'none';
            this.showNotification(`Preview failed: ${error.message}`, 'error');
        } finally {
            previewBtn.disabled = false;
            previewBtn.innerHTML = originalHTML;
        }
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
            
            // Increment counter and generate next invoice number
            this.incrementInvoiceCounter();
            this.generateInvoiceNumber();
            
            // Show success
            this.showNotification(
                `Invoice ${invoiceData.number} sent successfully! Next invoice number ready.`,
                'success'
            );
            
            // Note: Form is NOT cleared automatically so you can review what was sent
            // User can manually click "Clear Form" button when ready for next invoice
            
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
            
            // Hide preview and clean up iframe memory
            document.getElementById('invoice-preview').style.display = 'none';
            const iframe = document.getElementById('pdf-preview-iframe');
            if (iframe && iframe.src) {
                URL.revokeObjectURL(iframe.src);
                iframe.src = '';
            }
            
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