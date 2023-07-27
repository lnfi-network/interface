import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import cx from "classnames";

import "./Header.scss";

export function HeaderLink({ className, exact, to, children }) {
  return (
    <NavLink
      activeClassName="active"
      className={cx(className)}
      exact={exact}
      to={to}
    >
      {children}
    </NavLink>
  );
}
