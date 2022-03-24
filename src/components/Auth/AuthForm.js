import { useState, useRef, useContext } from "react";
import classes from "./AuthForm.module.css";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import AuthContext from "../../store/auth-context";

const AuthForm = () => {
  const history = useHistory();
  const authCtx = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const emailInputRef = useRef();
  const passwordInputRef = useRef();
  const params = useLocation().search;
  const login_hint = new URLSearchParams(params).get("login_hint");
  const message_hint = new URLSearchParams(params).get("message_hint");

  console.log("hints are :", login_hint + "----" + message_hint);

  const switchAuthModeHandler = () => {
    setIsLogin((prevState) => !prevState);
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    const enteredEmail = emailInputRef.current.value;
    const enteredPassword = passwordInputRef.current.value;

    setIsLoading(true);
    const reqConfig = {
      method: "post",
      url: "/api/lti/login",
      data: {
        email: enteredEmail,
        password: enteredPassword,
        login_hint,
        message_hint,
      },
      headers: { "Content-Type": "application/json" },
    };
    try {
      const response = await axios(reqConfig);
      setIsLoading(false);
      const data = { response };
      const token = data.token;
      console.log("token--", token);
      localStorage.setItem("auth", token);
      console.log("DATA IS---->", data);
      window.close();
    } catch (err) {
      setIsLoading(false);
      console.log("FETCH ERROR-->", err);
    }
  };
  return (
    <section className={classes.auth}>
      <h1>{isLogin ? "Login" : "Sign Up"}</h1>
      <form onSubmit={submitHandler}>
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
            {isLogin ? "Create new account" : "Login with existing account"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default AuthForm;
