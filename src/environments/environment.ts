// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebaseConfig: {
    apiKey: "AIzaSyDftgbPz7yebTzKOsHcCu8uTW7DzKnClt0",
    authDomain: "mydigitalwallet-3823d.firebaseapp.com",
    projectId: "mydigitalwallet-3823d",
    storageBucket: "mydigitalwallet-3823d.firebasestorage.app",
    messagingSenderId: "616546260130",
    appId: "1:616546260130:web:2a128b1dde3cd088a0f3fb"
  },
    notificationsBackend: {
      baseUrl: 'https://sendnotificationfirebase-production.up.railway.app',
      email: 'user@unicolombo.edu.co',
      password: 'password123',
  },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
