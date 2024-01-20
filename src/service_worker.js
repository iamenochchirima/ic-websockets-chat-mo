self.addEventListener('message', event => {
  console.log('Service Worker: Received message event', event);
  if (event.data && event.data.type === 'SHOW_NOTIFICATION') {
    console.log('Service Worker: Processing SHOW_NOTIFICATION', event.data);
    const { title, options } = event.data;
    self.registration.showNotification(title, options)
      .then(() => console.log('Service Worker: Notification is shown'))
      .catch(err => console.error('Service Worker: Error showing notification', err));
  } else {
    console.log('Service Worker: Message event type is not SHOW_NOTIFICATION');
  }
});

self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event.notification);
  event.notification.close();
  // Handle the notification click, like opening or focusing a window
  // Add your logic here if needed
});
