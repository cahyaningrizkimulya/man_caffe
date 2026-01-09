// js/service-worker.js
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open('cafe-v1').then(function(cache) {
            return cache.addAll([
                '/',
                '/index.html',
                '/css/style.css',
                '/js/supabase-config.js',
                '/js/auth.js',
                '/js/utils.js'
            ]);
        })
    );
});

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request).then(function(response) {
            return response || fetch(event.request);
        })
    );
});

self.addEventListener('push', function(event) {
    const data = event.data.json();
    
    const options = {
        body: data.body,
        icon: '/assets/logo.png',
        badge: '/assets/logo.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            {
                action: 'view',
                title: 'Lihat'
            },
            {
                action: 'close',
                title: 'Tutup'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow(event.notification.data.url)
        );
    }
});