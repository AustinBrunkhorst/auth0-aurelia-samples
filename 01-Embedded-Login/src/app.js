import {inject} from 'aurelia-framework';
import {HttpClient} from 'aurelia-http-client';
import {Router} from 'aurelia-router';
import {tokenIsExpired} from './utils/tokenUtils';

@inject(HttpClient, Router)
export class App {
  message = 'Auth0 - Aurelia';

  lock = new Auth0Lock(AUTH0_CLIENT_ID, AUTH0_DOMAIN, {
    autoclose: true,
    auth: { 
      redirect : false
    }});

  isAuthenticated = false;
  
  constructor(http, router) {
    this.http = http;
    this.router = router;
    var self = this;
    
    this.router.configure(config => {
      config.map([
        {
          route: ['', 'public-route'],
          name: 'public',
          moduleId: './public-route'
        },
        {
          route: 'private-route',
          name: 'private',
          moduleId: './private-route'
        }
      ]);
    });
    
    this.lock.on("authenticated", (authResult) => {
      self.lock.getUserInfo(authResult.accessToken, (error, profile) => {
        if (error) {
          // Handle error
          return;
        }

        localStorage.setItem('id_token', authResult.idToken);
        localStorage.setItem('access_token', authResult.accessToken);
        localStorage.setItem('profile', JSON.stringify(profile));
        self.isAuthenticated = true;
      });
    });

    if(tokenIsExpired())  {
      this.isAuthenticated = false;
    }
    else {
      this.isAuthenticated = true;
    }
  }
  
  login() {
    this.lock.show();   
  }
  
  logout() {
    localStorage.removeItem('profile');
    localStorage.removeItem('id_token');
    localStorage.removeItem('access_token');
    this.isAuthenticated = false;   
    this.decodedJwt = null;
  }
  
  getDecodedJwt() {
    let jwt = localStorage.getItem('id_token');
    if(jwt) {
      this.decodedJwt = JSON.stringify(jwt_decode(jwt), null, 2);
    }
    else {
      this.decodedJwt = "No JWT Saved";
    }
  }
 
}
