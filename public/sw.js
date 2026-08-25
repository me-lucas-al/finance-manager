self.addEventListener('push', function (event) {
  if (event.data) {
    const data = event.data.json();
    
    // Avoid putting financial data in the cache or title. The payload should be sanitized by the backend.
    const options = {
      body: data.message,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '2'
      }
    };
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
