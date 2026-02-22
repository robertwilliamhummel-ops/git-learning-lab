import { db, auth } from './firebase-config.js';
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    updateDoc, 
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

class FirestoreManager {
    constructor() {
        this.customersCollection = 'customers';
        this.invoicesCollection = 'invoices';
    }

    // Get current user ID
    getUserId() {
        return auth.currentUser?.uid;
    }

    // ============ CUSTOMERS ============

    async saveCustomer(customerData) {
        try {
            const docRef = await addDoc(collection(db, this.customersCollection), {
                ...customerData,
                userId: this.getUserId(),
                createdAt: Timestamp.now(),
                updatedAt: Timestamp.now()
            });
            console.log('✅ Customer saved to Firestore:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Error saving customer:', error);
            return { success: false, error: error.message };
        }
    }

    async getCustomers() {
        try {
            const q = query(
                collection(db, this.customersCollection),
                where('userId', '==', this.getUserId()),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const customers = [];
            querySnapshot.forEach((doc) => {
                customers.push({ id: doc.id, ...doc.data() });
            });
            console.log(`✅ Retrieved ${customers.length} customers from Firestore`);
            return customers;
        } catch (error) {
            console.error('❌ Error getting customers:', error);
            return [];
        }
    }

    async updateCustomer(customerId, customerData) {
        try {
            const customerRef = doc(db, this.customersCollection, customerId);
            await updateDoc(customerRef, {
                ...customerData,
                updatedAt: Timestamp.now()
            });
            console.log('✅ Customer updated in Firestore:', customerId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating customer:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteCustomer(customerId) {
        try {
            await deleteDoc(doc(db, this.customersCollection, customerId));
            console.log('✅ Customer deleted from Firestore:', customerId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting customer:', error);
            return { success: false, error: error.message };
        }
    }

    // ============ INVOICES ============

    async saveInvoice(invoiceData) {
        try {
            const docRef = await addDoc(collection(db, this.invoicesCollection), {
                ...invoiceData,
                userId: this.getUserId(),
                createdAt: Timestamp.now(),
                status: invoiceData.status || 'unpaid' // 'unpaid', 'paid', 'cancelled'
            });
            console.log('✅ Invoice saved to Firestore:', docRef.id);
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error('❌ Error saving invoice:', error);
            return { success: false, error: error.message };
        }
    }

    async getInvoices(limit = 100) {
        try {
            const q = query(
                collection(db, this.invoicesCollection),
                where('userId', '==', this.getUserId()),
                orderBy('createdAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const invoices = [];
            querySnapshot.forEach((doc) => {
                invoices.push({ id: doc.id, ...doc.data() });
            });
            console.log(`✅ Retrieved ${invoices.length} invoices from Firestore`);
            return invoices.slice(0, limit);
        } catch (error) {
            console.error('❌ Error getting invoices:', error);
            return [];
        }
    }

    async updateInvoiceStatus(invoiceId, status) {
        try {
            const invoiceRef = doc(db, this.invoicesCollection, invoiceId);
            await updateDoc(invoiceRef, {
                status: status,
                updatedAt: Timestamp.now()
            });
            console.log('✅ Invoice status updated in Firestore:', invoiceId, status);
            return { success: true };
        } catch (error) {
            console.error('❌ Error updating invoice:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteInvoice(invoiceId) {
        try {
            await deleteDoc(doc(db, this.invoicesCollection, invoiceId));
            console.log('✅ Invoice deleted from Firestore:', invoiceId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error deleting invoice:', error);
            return { success: false, error: error.message };
        }
    }

    // ============ UTILITY METHODS ============

    // Get next invoice number
    async getNextInvoiceNumber() {
        try {
            const invoices = await this.getInvoices();
            const currentYear = new Date().getFullYear();
            
            // Filter invoices from current year
            const yearInvoices = invoices.filter(inv => {
                const invNumber = inv.invoiceNumber || '';
                return invNumber.startsWith(`TFS-${currentYear}`);
            });
            
            // Get highest number
            let highestNumber = 0;
            yearInvoices.forEach(inv => {
                const match = inv.invoiceNumber?.match(/TFS-\d{4}-(\d{4})/);
                if (match) {
                    const num = parseInt(match[1]);
                    if (num > highestNumber) highestNumber = num;
                }
            });
            
            const nextNumber = (highestNumber + 1).toString().padStart(4, '0');
            return `TFS-${currentYear}-${nextNumber}`;
        } catch (error) {
            console.error('❌ Error generating invoice number:', error);
            // Fallback to timestamp-based number
            const timestamp = Date.now().toString().slice(-4);
            return `TFS-${new Date().getFullYear()}-${timestamp}`;
        }
    }

    // Check connection to Firestore
    async testConnection() {
        try {
            const testQuery = query(
                collection(db, this.customersCollection),
                where('userId', '==', this.getUserId())
            );
            await getDocs(testQuery);
            console.log('✅ Firestore connection successful!');
            return true;
        } catch (error) {
            console.error('❌ Firestore connection failed:', error);
            return false;
        }
    }
}

// Create and export a singleton instance
const firestoreManager = new FirestoreManager();
export default firestoreManager;