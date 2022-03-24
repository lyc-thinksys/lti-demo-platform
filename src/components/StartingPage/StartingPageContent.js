import react, { Fragment, useState, useEffect } from "react";
import classes from "./StartingPageContent.module.css";
import { useRef, useContext } from "react";
import AuthContext from "../../store/auth-context";
import { useHistory, useLocation } from "react-router";
import axios from "axios";
import config from "../../config/config.json";

const StartingPageContent = () => {
  const history = useHistory();
  const authCtx = useContext(AuthContext);
  const [launched, setlaunched] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const params = useLocation().search;
  // useEffect(()=>{},[])
  const [launchlogin, setLaunchLogin] = useState(
    new URLSearchParams(params).get("launchlogin")
  );
  console.log("launchlogin---", launchlogin);
  const login_hint = new URLSearchParams(params).get("login_hint");
  const message_hint = new URLSearchParams(params).get("message_hint");
  const state = new URLSearchParams(params).get("state");
  const redirectUri = new URLSearchParams(params).get("redirect_uri");
  const clientId = new URLSearchParams(params).get("client_id");
  const nonce = new URLSearchParams(params).get("nonce");
  const token = localStorage.getItem("auth");
  let message;

  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef();
  const passwordInputRef = useRef();

  const verifyToken = async () => {
    const url = "http://localhost:3000/verifytoken";
    const reqConfig = {
      method: "get",
      url: url,
      headers: {
        "Content-type": "application/json",
        Authorization: "Bearer " + token,
      },
    };
    try {
      const response = await axios(reqConfig);
      const { data } = response;
      console.log("RESPONSE---", data);
      return data.isTokenVerified;
    } catch (err) {
      console.log("CATCH ERROR--", err);
    }
  };

  const submitHandlerLaunch = async (event) => {
    event.preventDefault();
    let isTokenVerified = false;
    if (token) isTokenVerified = await verifyToken();
    console.log("TOKEN STATUS--", isTokenVerified);
    if (!isTokenVerified) {
      const url = "http://localhost:5000/api/lti/initiate/oidc";
      const reqConfig = {
        method: "get",
        url: url,
        params: {
          login_hint: config.login_hint,
          message_hint: config.message_hint,
        },
        headers: { "Content-type": "application/json" },
      };
      try {
        const response = await axios(reqConfig);

        console.log("RESPONSE---", response.data);

        setlaunched(response.data.message);
        window.close();
        // history.replace("/login");
      } catch (err) {
        console.log("CATCH ERROR--", err);
      }
    } else {
      const url = "http://localhost:5000/api/lti/launch";
      const reqConfig = {
        method: "post",
        url: url,
        data: {
          login_hint: 1234,
          message_hint: 766778,
          state: state,
        },
        headers: {
          "Content-type": "application/json",
          Authorization: "Bearer " + token,
        },
      };
      try {
        const response = await axios(reqConfig);

        console.log("RESPONSE---", response.data);

        setlaunched(response.data.message);
        // history.replace("/login");
      } catch (err) {
        console.log("CATCH ERROR--", err);
      }
    }
  };

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandlerLogin = async (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);
    const reqConfig = {
      method: "post",
      url: "http://localhost:3000/validate/login",
      data: {
        email: enteredEmail,
        password: enteredPassword,
        login_hint,
        message_hint,
        state,
      },
      headers: { "Content-Type": "application/json" },
    };
    try {
      const response = await axios(reqConfig);
      console.log("DATA IS--", response.data);
      setIsLoading(false);
      if (response.data.status === "success") {
        const token = response.data.data.token;
        localStorage.setItem("auth", token);
        const message = response.data.data.message;
        setlaunched(message);
        console.log("DATA IS---->", response.data);
        setLaunchLogin(0);
      } else {
        setErrorMessage(response.data.data.message);
      }
    } catch (err) {
      setIsLoading(false);
      console.log("FETCH ERROR-->", err);
    }
  };

  return (
    <Fragment>
      {!launchlogin && (
        <Fragment>
          <section className={classes.starting}>
            <h1>Welcome to the Platform</h1>
          </section>
          <div className={classes.action}>
            <button onClick={submitHandlerLaunch}>Launch Tool</button>
          </div>
          {launched && <div className={classes.action}>{launched}</div>}
          {message && <div className={classes.action}>{message}</div>}
        </Fragment>
      )}
      {launchlogin && (
        <Fragment>
          <section className={classes.auth}>
            <h1>{isLogin ? "Login" : "Sign Up"}</h1>
            <form onSubmit={submitHandlerLogin}>
              <div className={classes.control}>
                <label htmlFor="email">Your Email</label>
                <input type="email" id="email" ref={emailInputRef} required />
              </div>
              <div className={classes.control}>
                <label htmlFor="password">Your Password</label>
                <input
                  type="password"
                  id="password"
                  ref={passwordInputRef}
                  required
                />
              </div>
              {errorMessage && (
                <div className={classes.error}>{errorMessage}</div>
              )}
              <div className={classes.actions}>
                {!isLoading && (
                  <button>{isLogin ? "Login" : "Create Account"}</button>
                )}
                {isLoading && <p>Sending Request...</p>}
                <button
                  type="button"
                  className={classes.toggle}
                  onClick={switchAuthModeHandler}
                >
                  {isLogin
                    ? "Create new account"
                    : "Login with existing account"}
                </button>
              </div>
            </form>
          </section>
        </Fragment>
      )}
    </Fragment>
  );
};

export default StartingPageContent;
