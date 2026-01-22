// js/utils.js

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Date(date).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Format time
function formatTime(date) {
    return new Date(date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Validate email
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
    const re = /^[0-9]{10,13}$/;
    return re.test(phone);
}

// Show loading spinner
function showLoading(container) {
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    container.innerHTML = '';
    container.appendChild(spinner);
}

// Hide loading spinner
function hideLoading(container) {
    const spinner = container.querySelector('.spinner');
    if (spinner) {
        spinner.remove();
    }
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
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
}

// Copy to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Berhasil disalin!', 'success');
    }).catch(err => {
        showToast('Gagal menyalin!', 'error');
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Confirm dialog
function confirmDialog(message, callback) {
    const dialog = document.createElement('div');
    dialog.className = 'confirm-dialog';
    dialog.innerHTML = `
        <div class="dialog-content">
            <p>${message}</p>
            <div class="dialog-buttons">
                <button class="btn-secondary btn-cancel">Batal</button>
                <button class="btn-primary btn-confirm">Ya</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(dialog);
    
    const cancelBtn = dialog.querySelector('.btn-cancel');
    const confirmBtn = dialog.querySelector('.btn-confirm');
    
    cancelBtn.addEventListener('click', () => {
        dialog.remove();
    });
    
    confirmBtn.addEventListener('click', () => {
        dialog.remove();
        callback();
    });
}

// Form validation
function validateForm(form) {
    let isValid = true;
    const inputs = form.querySelectorAll('input[required], select[required], textarea[required]');
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.classList.add('error');
            isValid = false;
        } else {
            input.classList.remove('error');
        }
    });
    
    return isValid;
}

// API helper functions
class ApiService {
    constructor() {
        this.baseUrl = 'YOUR_API_BASE_URL';
    }
    
    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('GET Error:', error);
            throw error;
        }
    }
    
    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('POST Error:', error);
            throw error;
        }
    }
    
    async put(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('PUT Error:', error);
            throw error;
        }
    }
    
    async delete(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Network response was not ok');
            return await response.json();
        } catch (error) {
            console.error('DELETE Error:', error);
            throw error;
        }
    }
}

// Local storage helper
class StorageService {
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    
    get(key) {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
    }
    
    remove(key) {
        localStorage.removeItem(key);
    }
    
    clear() {
        localStorage.clear();
    }
}

// Initialize services
const api = new ApiService();
const storage = new StorageService();

// Export for use in other files
window.utils = {
    formatCurrency,
    formatDate,
    formatTime,
    validateEmail,
    validatePhone,
    showLoading,
    hideLoading,
    debounce,
    throttle,
    copyToClipboard,
    showToast,
    confirmDialog,
    validateForm,
    api,
    storage
};
// Fungsi login admin
// =============================================
// AUTH FUNCTIONS FOR ADMIN ONLY
// =============================================

// Fungsi login admin
async function loginAdmin(email, password) {
    try {
        console.log('🔄 Attempting login for:', email);
        
        const { data, error } = await window.supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('❌ Login error:', error.message);
            throw error;
        }

        console.log('✅ Auth successful, verifying admin access...');
        
        // Verifikasi bahwa ini admin
        const isAdmin = await verifyAdmin(data.user);
        
        if (!isAdmin) {
            console.log('⚠️ User is not admin, logging out...');
            await window.supabaseClient.auth.signOut();
            return { 
                success: false, 
                error: 'Akses ditolak. Hanya admin yang dapat login ke sistem ini.' 
            };
        }

        console.log('🎉 Admin login successful!');
        return { 
            success: true, 
            data: data, 
            user: data.user,
            adminInfo: getAdminInfo() // Info tambahan dari tabel admins
        };
        
    } catch (error) {
        console.error('❌ Login process error:', error);
        return { 
            success: false, 
            error: error.message || 'Terjadi kesalahan saat login'
        };
    }
}

// Fungsi verifikasi admin
async function verifyAdmin(user) {
    if (!user || !user.id) {
        console.log('❌ No user data available');
        return false;
    }
    
    try {
        console.log('🔄 Verifying admin for user:', user.email);
        
        // Cara 1: Cek dari tabel admins di database
        const { data, error } = await window.supabaseClient
            .from('admins')
            .select('id, role, full_name, email')
            .eq('user_id', user.id)
            .maybeSingle();
            
        if (error) {
            console.error('❌ Database error:', error);
        }
        
        // Jika ditemukan di tabel admins
        if (data) {
            console.log('✅ Admin verified in database:', data);
            
            // Simpan info admin ke localStorage untuk akses cepat
            localStorage.setItem('admin_info', JSON.stringify({
                id: data.id,
                role: data.role,
                full_name: data.full_name,
                email: data.email,
                user_id: user.id
            }));
            
            // Simpan juga di sessionStorage untuk keamanan
            sessionStorage.setItem('is_admin', 'true');
            sessionStorage.setItem('admin_email', user.email);
            
            return true;
        }
        
        // Cara 2: Fallback - cek berdasarkan email pattern
        console.log('⚠️ Not found in admins table, checking email pattern...');
        const adminEmailPatterns = [
            '@admin.', 
            'admin@', 
            'administrator@',
            '.admin@'
        ];
        
        const isAdminEmail = adminEmailPatterns.some(pattern => 
            user.email.toLowerCase().includes(pattern)
        );
        
        if (isAdminEmail) {
            console.log('✅ Admin verified by email pattern');
            
            // Simpan info sementara
            localStorage.setItem('admin_info', JSON.stringify({
                id: user.id,
                role: 'admin',
                full_name: 'Administrator',
                email: user.email,
                user_id: user.id
            }));
            
            sessionStorage.setItem('is_admin', 'true');
            return true;
        }
        
        console.log('❌ User is not an admin');
        return false;
        
    } catch (err) {
        console.error('❌ Verify admin error:', err);
        return false;
    }
}

// Fungsi untuk mendapatkan info admin dari localStorage
function getAdminInfo() {
    try {
        const info = localStorage.getItem('admin_info');
        return info ? JSON.parse(info) : null;
    } catch (e) {
        console.error('Error getting admin info:', e);
        return null;
    }
}

// Cek apakah admin sudah login
async function checkAdminAuth() {
    try {
        console.log('🔄 Checking admin authentication...');
        
        const { data: { session }, error } = await window.supabaseClient.auth.getSession();
        
        if (error) {
            console.error('❌ Session error:', error);
            return { isAuthenticated: false, user: null, error: error.message };
        }
        
        if (!session) {
            console.log('❌ No active session found');
            
            // Clear storage jika tidak ada session
            localStorage.removeItem('admin_info');
            sessionStorage.removeItem('is_admin');
            
            return { isAuthenticated: false, user: null };
        }
        
        console.log('✅ Session found, verifying admin...');
        
        // Verifikasi lagi bahwa user ini adalah admin
        const isAdmin = await verifyAdmin(session.user);
        
        if (!isAdmin) {
            console.log('❌ User is not admin, logging out...');
            await window.supabaseClient.auth.signOut();
            
            // Clear storage
            localStorage.removeItem('admin_info');
            sessionStorage.removeItem('is_admin');
            
            return { isAuthenticated: false, user: null };
        }
        
        console.log('✅ Admin authenticated successfully');
        return { 
            isAuthenticated: true, 
            user: session.user,
            session: session,
            adminInfo: getAdminInfo()
        };
        
    } catch (error) {
        console.error('❌ Check auth error:', error);
        return { 
            isAuthenticated: false, 
            user: null, 
            error: error.message 
        };
    }
}

// Logout admin
async function logoutAdmin() {
    try {
        console.log('🔄 Logging out admin...');
        
        // Clear local storage
        localStorage.removeItem('admin_info');
        sessionStorage.removeItem('is_admin');
        sessionStorage.removeItem('admin_email');
        
        // Sign out from Supabase
        const { error } = await window.supabaseClient.auth.signOut();
        
        if (error) {
            throw error;
        }
        
        console.log('✅ Logout successful');
        return { success: true };
        
    } catch (error) {
        console.error('❌ Logout error:', error);
        return { 
            success: false, 
            error: error.message 
        };
    }
}

// Fungsi untuk cek apakah user adalah superadmin
function isSuperAdmin() {
    const adminInfo = getAdminInfo();
    return adminInfo && adminInfo.role === 'superadmin';
}

// Export semua fungsi
window.authAdmin = {
    loginAdmin,
    checkAdminAuth,
    logoutAdmin,
    verifyAdmin,
    getAdminInfo,
    isSuperAdmin
};

console.log('✅ auth-admin.js loaded successfully');

// Fungsi verifikasi admin
// Fungsi verifikasi admin dengan pengecekan yang lebih baik
async function verifyAdmin(user) {
    if (!user || !user.id) return false;
    
    try {
        // Cek di tabel admins
        const { data, error } = await window.supabaseClient
            .from('admins')
            .select('id, role, full_name')
            .eq('user_id', user.id)
            .maybeSingle(); // gunakan maybeSingle untuk menghandle null
            
        if (error) {
            console.error('Error verifying admin:', error);
            return false;
        }
        
        // Jika ditemukan di tabel admins
        if (data) {
            // Simpan info admin ke localStorage untuk akses cepat
            localStorage.setItem('admin_info', JSON.stringify({
                id: data.id,
                role: data.role,
                full_name: data.full_name,
                email: user.email
            }));
            return true;
        }
        
        // Fallback: cek berdasarkan email pattern
        const adminEmails = ['@admin.', 'admin@', '@mancafe.com'];
        const isAdminEmail = adminEmails.some(pattern => 
            user.email.includes(pattern)
        );
        
        return isAdminEmail;
        
    } catch (err) {
        console.error('Verify admin error:', err);
        return false;
    }
}

// Fungsi untuk mendapatkan info admin
function getAdminInfo() {
    const info = localStorage.getItem('admin_info');
    return info ? JSON.parse(info) : null;
}

// Cek apakah admin sudah login
async function checkAdminAuth() {
    const { data: { session }, error } = await window.supabaseClient.auth.getSession();
    
    if (error || !session) {
        return { isAuthenticated: false, user: null };
    }
    
    // Verifikasi lagi bahwa user ini adalah admin
    const isAdmin = await verifyAdmin(session.user);
    
    if (!isAdmin) {
        await window.supabaseClient.auth.signOut();
        return { isAuthenticated: false, user: null };
    }
    
    return { 
        isAuthenticated: true, 
        user: session.user,
        session: session
    };
}
async function setupFirstAdmin() {
    // 1. Sign up admin
    const email = 'admin@mancafe.com';
    const password = 'Admin123!@#';
    const fullName = 'Administrator Utama';
    
    console.log('Membuat admin pertama...');
    
    // Sign up
    const { data: authData, error: authError } = await supabaseClient.auth.signUp({
        email,
        password
    });
    
    if (authError) {
        console.error('Error signup:', authError);
        return;
    }
    
    const userId = authData.user.id;
    console.log('✅ User dibuat. ID:', userId);
    
    // 2. Insert ke tabel admins
    const { error: insertError } = await supabaseClient
        .from('admins')
        .insert([{
            user_id: userId,
            email,
            full_name: fullName,
            role: 'superadmin'
        }]);
    
    if (insertError) {
        console.error('Error insert admin:', insertError);
        return;
    }
    
    console.log('✅ Admin berhasil dibuat!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Login URL: /login.html');
}

// Logout admin
async function logoutAdmin() {
    try {
        const { error } = await window.supabaseClient.auth.signOut();
        if (error) throw error;
        localStorage.removeItem('admin_token');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

// Export fungsi
window.authAdmin = {
    loginAdmin,
    checkAdminAuth,
    logoutAdmin,
    verifyAdmin
};
// js/auth.js
const SUPABASE_URL = 'https://abcdefghijklmnop.supabase.co'; // GANTI
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // GANTI

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.authAdmin = {
    async checkAdminAuth() {
        try {
            console.log('Checking auth session...');
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
                console.error('Session error:', error);
                return { isAuthenticated: false, error: error.message };
            }
            
            console.log('Session data:', data);
            
            if (data.session) {
                console.log('User logged in:', data.session.user.email);
                return { isAuthenticated: true, user: data.session.user };
            }
            
            console.log('No active session');
            return { isAuthenticated: false, user: null };
            
        } catch (error) {
            console.error('Auth check failed:', error);
            return { isAuthenticated: false, user: null, error: error.message };
        }
    },

    async loginAdmin(email, password) {
        try {
            console.log('Login attempt for:', email);
            
            // Coba sign in
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password: password
            });

            if (error) {
                console.error('Login error details:', {
                    message: error.message,
                    name: error.name,
                    status: error.status
                });
                throw error;
            }

            console.log('Login success! User:', data.user);
            return { success: true, user: data.user };
            
        } catch (error) {
            console.error('Full login error:', error);
            
            // Pesan error yang lebih jelas
            let errorMessage = 'Login gagal';
            
            if (error.message?.includes('Invalid login credentials')) {
                errorMessage = 'Email atau password salah!';
            } else if (error.message?.includes('Email not confirmed')) {
                errorMessage = 'Email belum dikonfirmasi. Cek inbox email Anda.';
            } else if (error.message?.includes('fetch')) {
                errorMessage = 'Tidak bisa terhubung ke server. Cek koneksi internet atau credentials Supabase.';
            } else if (error.status === 400) {
                errorMessage = 'Format email atau password salah.';
            } else {
                errorMessage += ': ' + (error.message || 'Unknown error');
            }
            
            return { success: false, error: errorMessage };
        }
    }
};