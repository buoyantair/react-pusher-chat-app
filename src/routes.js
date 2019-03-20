import React from "react";
import { Redirect, Route, BrowserRouter } from "react-router-dom";
import App from "./App";
import Auth from "./Auth/Auth";
import history from "history";

// TODO: Route components
import Home from "./Home/Home";
import Profile from "./Profile/Profile";
import Chat from "./Chat/Chat";
import Callback from "Callback/Callback";

// Intantiate the Auth0 Service
const auth = new Auth();

const handleAuthentication = (nextState, replace) => {
  if (/access_token|id_token|error/.test(nextState.location.hash)) {
    auth.handleAuthentication();
  }
};

export const makeMainRoutes = () => (
  <BrowserRouter history={history} component={App}>
    <div>
      <Route path="/" render={props => <App auth={auth} {...props} />} />
      <Route path="/home" render={props => <Home auth={auth} {...props} />} />
      <Route
        path="/chat"
        render={props =>
          !auth.isAuthenticated() ? (
            <Redirect to="/home" />
          ) : (
            <Chat auth={auth} {...props} />
          )
        }
      />
      <Route
        path="/profile"
        render={props =>
          !auth.isAuthenticated() ? (
            <Redirect to="/home" />
          ) : (
            <Profile auth={auth} {...props} />
          )
        }
      />
      <Route
        path="/callback"
        render={props => {
          handleAuthentication(props);
          return <Callback {...props} />;
        }}
      />
    </div>
  </BrowserRouter>
);
