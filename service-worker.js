/* eslint strict: 0 */

'use strict';

// on push create notification
self.addEventListener('push', function(event) {
  if( !(self.Notification && self.Notification.permission === 'granted') ){
    return;
  }

  if(event.data){
    const pushedData = event.data.json();
    event.waitUntil(self.registration.showNotification(pushedData.title, pushedData.options));
  }
});

// on notification click open related url
self.addEventListener('notificationclick', function(event) {
  const data = event.notification.data;
  if(event.action){
    if(event.action === 'open'){
      if(data){
        event.notification.close();
        if(data.url_open){
          self.clients.openWindow(data.url_open);
        }
      }
  	}else if(event.action === 'close'){
      if(data){
        event.notification.close();
        if(data.url_close){
          fetch(data.url_close, {method: 'POST'}).catch(() => console.log("Can’t access " + data.url_close + " response. Blocked by browser?"));
        }
      }
    }
  }else if(data){
    event.notification.close();
    if(data.url_open){
      self.clients.openWindow(data.url_open);
    }
  }
});
