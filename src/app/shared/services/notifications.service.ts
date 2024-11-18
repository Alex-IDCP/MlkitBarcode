import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationsService {

  constructor() { }

  initPush() {
    if (Capacitor.getPlatform() !== 'web') {
      this.registerPush();
    }
  }

  private registerPush() {
    PushNotifications.requestPermissions().then(permission => {
      if (permission.receive === 'granted') {
        PushNotifications.register();
      } else {
        // If permission is not granted
      }
    });

    PushNotifications.addListener('registration', (token) => {
      console.log(token);
    });

    PushNotifications.addListener('registrationError', (err) => {
      console.log(err);
    })

    PushNotifications.addListener('pushNotificationReceived', (notifications) => {
      console.log(notifications);
    })

  }
  
}
