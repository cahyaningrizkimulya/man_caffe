// js/supabase-config.js
console.log('🔧 Loading Supabase configuration...');

// CONFIGURASI SUPABASE - GANTI INI!
const SUPABASE_URL = 'https://cuwtyfggfgykgjhrvdgi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_4e-uWWuKR2r7_jNaWHh03A_2UVQbPAx';

// Inisialisasi client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
    },
    db: {
        schema: 'public'
    },
    global: {
        headers: {
            'Content-Type': 'application/json'
        }
    }
});

// Fungsi untuk test connection
async function testSupabaseConnection() {
    console.log('🔄 Testing Supabase connection...');
    
    try {
        const { data, error } = await supabaseClient
            .from('orders')
            .select('id')
            .limit(1);
        
        if (error) {
            console.error('❌ Connection error:', error.message);
            return { success: false, message: error.message };
        }
        
        console.log('✅ Connection successful!');
        return { success: true, message: 'Connected to Supabase' };
        
    } catch (error) {
        console.error('❌ Unexpected error:', error);
        return { success: false, message: error.message };
    }
}

// Fungsi untuk create test order
async function createTestOrder() {
    console.log('🧪 Creating test order...');
    
    const testOrder = {
        customer_name: 'Test Customer',
        customer_phone: '0812' + Math.floor(Math.random() * 10000000),
        total_amount: Math.floor(Math.random() * 100000) + 10000,
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

// Export untuk digunakan di file lain
window.supabaseClient = supabaseClient;
window.testSupabaseConnection = testSupabaseConnection;
window.createTestOrder = createTestOrder;

console.log('✅ Supabase configuration loaded');