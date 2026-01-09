// js/supabase-config.js - VERSI FIX
console.log('🔧 Loading Supabase configuration...');

// GANTI DENGAN CREDENTIALS MILIKMU!
const SUPABASE_URL = 'https://cuwtyfggfgykgjhrvdgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4e-uWWuKR2r7_jNaWHh03A_2UVQbPAx';
        

// Pastikan supabase library sudah loaded
if (typeof supabase === 'undefined') {
    console.error('❌ Supabase JS library not loaded!');
} else {
    console.log('✅ Supabase JS library loaded');
}

// Inisialisasi client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

// Test connection
async function testConnection() {
    console.log('🔄 Testing Supabase connection...');
    
    try {
        // Coba simple query
        const { data, error } = await supabaseClient
            .from('orders')
            .select('id')
            .limit(1);
        
        if (error) {
            if (error.message.includes('does not exist')) {
                console.log('⚠️ Tables not created yet. Run setup script first.');
                return { success: false, message: 'Tables not created' };
            }
            console.error('❌ Connection error:', error.message);
            return { success: false, message: error.message };
        }
        
        console.log('✅ Connected to Supabase successfully!');
        return { success: true, message: 'Connected' };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return { success: false, message: error.message };
    }
}

// Create test order
async function createTestOrder() {
    console.log('🧪 Creating test order...');
    
    const testOrder = {
        customer_name: 'Test from Browser',
        customer_phone: '081234567890',
        total_amount: 75000,
        status: 'pending',
        payment_method: 'transfer'
    };
    
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([testOrder])
            .select();
        
        if (error) {
            console.error('❌ Failed to create order:', error.message);
            return null;
        }
        
        console.log('✅ Order created:', data[0]);
        return data[0];
        
    } catch (error) {
        console.error('❌ Error:', error);
        return null;
    }
}

// Export ke window object
window.supabaseClient = supabaseClient;
window.testSupabaseConnection = testConnection;
window.createTestOrder = createTestOrder;

console.log('✅ Supabase configuration loaded');