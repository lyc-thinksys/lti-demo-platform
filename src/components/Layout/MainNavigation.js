import { Link } from "react-router-dom";
import { useContext } from "react";
import classes from "./MainNavigation.module.css";
import AuthContext from "../../store/auth-context";
import { useHistory } from "react-router";

const MainNavigation = () => {
  const history = useHistory();
  const authCtx = useContext(AuthContext);
  const logoutHandler = () => {
    authCtx.logout();
    history.replace("/launch");
  };

  const userIsLoggedIn = authCtx.isLoggedIn;
  return (
    <header className={classes.header}>
      <Link to="/">
        <div className={classes.logo}>LTI Platform Demo</div>
      </Link>
      <nav>
        <ul>
          <li>
            <Link to="/login">Login</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default MainNavigation;
