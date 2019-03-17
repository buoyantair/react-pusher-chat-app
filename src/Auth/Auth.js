import { EventEmitter } from "events";
import auth0 from "auth0-js";
import { AUTH_CONFIG } from "./auth0Variables";
import history from "../history";

export default class Auth extends EventEmitter {
  auth0 = new auth0.WebAuth({
    domain: AUTH_CONFIG.domain,
    clientID: AUTH_CONFIG.clientId,
    redirectUri: AUTH_CONFIG.callbackUrl,
    audience: `https://${AUTH_CONFIG.domain}/userInfo`,
    responseType: "token id_token",
    scope: "openid profile"
  });

  userProfile;

  constructor() {
    super();
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
    this.handleAuthentication = this.handleAuthentication.bind(this);
    this.isAuthenticated = this.isAuthenticated.bind(this);
    this.getAccessToken = this.getAccessToken.bind(this);
    this.getProfile = this.getProfile.bind(this);
  }

  login() {
    this.auth0.authorize();
  }

  handleAuthentication() {
    this.auth0.parseHash((err, authResult) => {
      if (authResult && authResult.accessToken && authResult.idToken) {
        this.setSession(authResult);
        history.replace("/home");
      } else if (err) {
        history.replace("/home");
        console.log("error");
        alert(`Error: ${err.error}. Check the console for further details`);
      }
    });
  }

  setSession(authResult) {
    if (authResult && authResult.accessToken && authResult.idToken) {
      // Set the time that the access token will expire at

      let expiresAt = JSON.stringify(
        authResult.expiresIn * 1000 + new Date().getTime()
      );
      localStorage.setItem("access_token", authResult.accessToken);
      localStorage.setItem("id_token", authResult.idToken);
      localStorage.setItem("expires_at", expiresAt);

      // Navigate to the home page

      history.replace("/home");
    }
  }

  getAccessToken() {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      throw new Error("No access token found!");
    }

    return accessToken;
  }

  getProfile(cb) {
    let accessToken = this.getAccessToken();
    this.auth0.client.userInfo(accessToken, (err, profile) => {
      if (profile) {
        this.userProfile = profile;
        localStorage.username = profile.username;
      }

      cb(err, profile);
    });
  }

  logout() {
    // Clear localStorage

    localStorage.removeItem("access_token");
    localStorage.removeItem("id_token");
    localStorage.removeItem("expires_at");
    this.userProfile = null;

    // Navigate to homepage

    history.replace("/home");
  }

  isAuthenticated() {
    // Check whether the current time is past the access token's expiry time

    let expiresAt = JSON.parse(localStorage.getItem("expires_at"));
    return new Date().getTime() < expiresAt;
  }
}
