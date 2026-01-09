// js/database-functions.js
// Semua fungsi untuk CRUD database

class DatabaseService {
    constructor() {
        if (!window.supabaseClient) {
            console.error('❌ Supabase client not initialized!');
            return;
        }
        this.client = window.supabaseClient;
    }
    
    // ==================== MENU FUNCTIONS ====================
    
    // Get all menu items
    async getMenuItems(filters = {}) {
        try {
            let query = this.client
                .from('menu_items')
                .select('*, categories(name)');
            
            // Apply filters
            if (filters.category_id) {
                query = query.eq('category_id', filters.category_id);
            }
            
            if (filters.is_available !== undefined) {
                query = query.eq('is_available', filters.is_available);
            }
            
            if (filters.is_featured) {
                query = query.eq('is_featured', true);
            }
            
            const { data, error } = await query.order('name');
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error getting menu items:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Add new menu item
    async addMenuItem(menuData) {
        try {
            const { data, error } = await this.client
                .from('menu_items')
                .insert([menuData])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error adding menu item:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update menu item
    async updateMenuItem(id, updates) {
        try {
            const { data, error } = await this.client
                .from('menu_items')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error updating menu item:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Delete menu item
    async deleteMenuItem(id) {
        try {
            const { error } = await this.client
                .from('menu_items')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            return { success: true };
            
        } catch (error) {
            console.error('Error deleting menu item:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== ORDER FUNCTIONS ====================
    
    // Get all orders
    async getOrders(filters = {}) {
        try {
            let query = this.client
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.date) {
                query = query.eq('order_date', filters.date);
            }
            
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error getting orders:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Create new order
    async createOrder(orderData) {
        try {
            // First, create the order
            const { data: order, error: orderError } = await this.client
                .from('orders')
                .insert([{
                    customer_name: orderData.customerName,
                    customer_phone: orderData.customerPhone,
                    total_amount: orderData.total,
                    status: 'pending',
                    notes: orderData.notes,
                    order_type: orderData.orderType || 'dine-in'
                }])
                .select()
                .single();
            
            if (orderError) throw orderError;
            
            // Then, add order items
            if (orderData.items && orderData.items.length > 0) {
                const orderItems = orderData.items.map(item => ({
                    order_id: order.id,
                    menu_item_id: item.id,
                    menu_item_name: item.name,
                    quantity: item.quantity,
                    unit_price: item.price
                }));
                
                const { error: itemsError } = await this.client
                    .from('order_items')
                    .insert(orderItems);
                
                if (itemsError) throw itemsError;
            }
            
            return { 
                success: true, 
                data: order,
                message: `Order #${order.order_number} created successfully!`
            };
            
        } catch (error) {
            console.error('Error creating order:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update order status
    async updateOrderStatus(orderId, status) {
        try {
            const { data, error } = await this.client
                .from('orders')
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error updating order status:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== RESERVATION FUNCTIONS ====================
    
    // Get all reservations
    async getReservations(filters = {}) {
        try {
            let query = this.client
                .from('reservations')
                .select('*, customers(name, phone), tables(table_number)')
                .order('reservation_date', { ascending: true })
                .order('reservation_time', { ascending: true });
            
            // Apply filters
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.date) {
                query = query.eq('reservation_date', filters.date);
            }
            
            if (filters.upcoming) {
                const today = new Date().toISOString().split('T')[0];
                query = query.gte('reservation_date', today);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error getting reservations:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Create new reservation
    async createReservation(reservationData) {
        try {
            const { data, error } = await this.client
                .from('reservations')
                .insert([{
                    customer_name: reservationData.customerName,
                    customer_phone: reservationData.customerPhone,
                    reservation_date: reservationData.date,
                    reservation_time: reservationData.time,
                    number_of_guests: reservationData.guests,
                    table_id: reservationData.tableId,
                    status: 'pending',
                    special_requests: reservationData.notes
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error creating reservation:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== CUSTOMER FUNCTIONS ====================
    
    // Get all customers
    async getCustomers() {
        try {
            const { data, error } = await this.client
                .from('customers')
                .select('*')
                .order('name');
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error getting customers:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Add new customer
    async addCustomer(customerData) {
        try {
            const { data, error } = await this.client
                .from('customers')
                .insert([{
                    name: customerData.name,
                    email: customerData.email,
                    phone: customerData.phone,
                    address: customerData.address,
                    customer_type: customerData.type || 'regular'
                }])
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error adding customer:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== TABLE FUNCTIONS ====================
    
    // Get all tables
    async getTables(filters = {}) {
        try {
            let query = this.client
                .from('tables')
                .select('*')
                .order('table_number');
            
            if (filters.status) {
                query = query.eq('status', filters.status);
            }
            
            if (filters.location) {
                query = query.eq('location', filters.location);
            }
            
            const { data, error } = await query;
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error getting tables:', error);
            return { success: false, error: error.message };
        }
    }
    
    // Update table status
    async updateTableStatus(tableId, status) {
        try {
            const { data, error } = await this.client
                .from('tables')
                .update({ 
                    status: status,
                    updated_at: new Date().toISOString()
                })
                .eq('id', tableId)
                .select()
                .single();
            
            if (error) throw error;
            return { success: true, data };
            
        } catch (error) {
            console.error('Error updating table status:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== REPORT FUNCTIONS ====================
    
    // Get sales report
    async getSalesReport(startDate, endDate) {
        try {
            const { data, error } = await this.client
                .from('orders')
                .select('*')
                .gte('order_date', startDate)
                .lte('order_date', endDate)
                .order('order_date');
            
            if (error) throw error;
            
            // Group by date
            const report = {};
            data.forEach(order => {
                const date = order.order_date;
                if (!report[date]) {
                    report[date] = {
                        date: date,
                        orders: 0,
                        revenue: 0,
                        orderIds: []
                    };
                }
                report[date].orders++;
                report[date].revenue += order.total_amount;
                report[date].orderIds.push(order.id);
            });
            
            return { 
                success: true, 
                data: Object.values(report),
                totalOrders: data.length,
                totalRevenue: data.reduce((sum, order) => sum + order.total_amount, 0)
            };
            
        } catch (error) {
            console.error('Error getting sales report:', error);
            return { success: false, error: error.message };
        }
    }
    
    // ==================== UTILITY FUNCTIONS ====================
    
    // Upload image
    async uploadImage(file, folder = 'menu') {
        try {
            const fileName = `${folder}/${Date.now()}_${file.name}`;
            const { data, error } = await this.client.storage
                .from('cafe-images')
                .upload(fileName, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = this.client.storage
                .from('cafe-images')
                .getPublicUrl(fileName);
            
            return { success: true, url: publicUrl };
            
        } catch (error) {
            console.error('Error uploading image:', error);
            return { success: false, error: error.message };
        }
    }
}

// Initialize database service
window.db = new DatabaseService();