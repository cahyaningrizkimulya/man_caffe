// js/simple-realtime.js
class CafeRealtimeSystem {
    constructor() {
        this.setupPolling();
        this.setupLocalStorageSync();
        this.setupEventListeners();
    }
    
    setupPolling() {
        // Poll Supabase setiap 10 detik
        setInterval(async () => {
            await this.fetchNewOrders();
            await this.fetchNewReservations();
        }, 10000);
        
        // Poll localStorage setiap 3 detik (lebih cepat)
        setInterval(() => {
            this.checkLocalStorage();
        }, 3000);
    }
    
    setupLocalStorageSync() {
        // Listen untuk storage event (jika multiple tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'pending_orders') {
                this.processPendingOrders();
            }
        });
    }
    
    async fetchNewOrders() {
        if (!window.supabaseClient) return;
        
        try {
            const { data: orders, error } = await window.supabaseClient
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false })
                .limit(10);
            
            if (error) throw error;
            
            // Bandingkan dengan yang sudah ditampilkan
            this.processNewOrders(orders);
            
        } catch (error) {
            console.error('Error fetching orders:', error);
        }
    }
    
    processNewOrders(orders) {
        // Simpan ID order terakhir yang ditampilkan
        const lastSeen = localStorage.getItem('last_seen_order_id') || 0;
        
        orders.forEach(order => {
            if (order.id > lastSeen) {
                // Order baru!
                this.showNotification({
                    title: '📦 Pesanan Baru',
                    message: `#${order.order_number} - Rp ${order.total_amount.toLocaleString()}`,
                    type: 'order',
                    data: order
                });
                
                // Update last seen
                localStorage.setItem('last_seen_order_id', order.id);
            }
        });
    }
    
    checkLocalStorage() {
        const pendingOrders = JSON.parse(localStorage.getItem('pending_orders') || '[]');
        
        if (pendingOrders.length > 0) {
            pendingOrders.forEach(order => {
                this.showNotification({
                    title: '🚨 PESANAN BARU DARI PELANGGAN',
                    message: `${order.customerName} - ${order.items.length} items`,
                    type: 'urgent',
                    data: order
                });
                
                // Update dashboard
                this.updateDashboard(order);
                
                // Simpan ke history
                this.saveToHistory(order);
            });
            
            // Clear setelah diproses
            localStorage.removeItem('pending_orders');
        }
    }
    
    showNotification(notification) {
        // Buat elemen notifikasi
        const notif = document.createElement('div');
        notif.className = 'simple-notification';
        notif.innerHTML = `
            <div class="notification-content">
                <div class="notification-title">${notification.title}</div>
                <div class="notification-message">${notification.message}</div>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        // Add CSS jika belum ada
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                .simple-notification {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: white;
                    border-left: 5px solid #4CAF50;
                    border-radius: 5px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    padding: 15px;
                    min-width: 300px;
                    max-width: 400px;
                    z-index: 10000;
                    animation: slideInRight 0.3s ease;
                }
                
                @keyframes slideInRight {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                
                .notification-content {
                    position: relative;
                }
                
                .notification-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                    color: #333;
                }
                
                .notification-message {
                    color: #666;
                    font-size: 0.9em;
                }
                
                .notification-close {
                    position: absolute;
                    top: -10px;
                    right: -10px;
                    background: #ff4444;
                    color: white;
                    border: none;
                    border-radius: 50%;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    font-size: 12px;
                    line-height: 1;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notif);
        
        // Auto remove setelah 10 detik
        setTimeout(() => {
            notif.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notif.remove(), 300);
        }, 10000);
        
        // Close button
        notif.querySelector('.notification-close').addEventListener('click', () => {
            notif.remove();
        });
        
        // Klik notifikasi untuk melihat detail
        notif.addEventListener('click', (e) => {
            if (!e.target.classList.contains('notification-close')) {
                this.viewOrderDetail(notification.data);
                notif.remove();
            }
        });
    }
    
    updateDashboard(order) {
        // Update counter
        const counter = document.getElementById('todayOrders');
        if (counter) {
            const current = parseInt(counter.textContent) || 0;
            counter.textContent = current + 1;
            
            // Animasi
            counter.style.transform = 'scale(1.2)';
            setTimeout(() => {
                counter.style.transform = 'scale(1)';
            }, 300);
        }
        
        // Update revenue
        const revenue = document.getElementById('todayRevenue');
        if (revenue) {
            const current = parseInt(revenue.textContent.replace(/[^0-9]/g, '')) || 0;
            const newTotal = current + order.totalAmount;
            revenue.textContent = `Rp ${newTotal.toLocaleString()}`;
        }
        
        // Add sound effect
        this.playNotificationSound();
    }
    
    playNotificationSound() {
        // Buat sound notification sederhana
        const audio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ');
        audio.volume = 0.3;
        audio.play().catch(e => console.log('Audio error:', e));
    }
    
    viewOrderDetail(order) {
        alert(`Detail Pesanan:\n\nPelanggan: ${order.customerName}\nTotal: Rp ${order.totalAmount.toLocaleString()}\nItems: ${order.items.map(i => i.name).join(', ')}`);
    }
    
    saveToHistory(order) {
        const history = JSON.parse(localStorage.getItem('order_history') || '[]');
        history.unshift({
            ...order,
            processedAt: new Date().toISOString()
        });
        
        // Simpan max 50 item
        if (history.length > 50) {
            history.pop();
        }
        
        localStorage.setItem('order_history', JSON.stringify(history));
    }
    
    setupEventListeners() {
        // Listen untuk custom event (bisa dipicu dari halaman lain)
        window.addEventListener('new-order', (e) => {
            this.showNotification({
                title: 'Pesanan Baru',
                message: e.detail.message,
                type: 'order',
                data: e.detail.order
            });
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    window.cafeRealtime = new CafeRealtimeSystem();
    console.log('Cafe Realtime System initialized');
});