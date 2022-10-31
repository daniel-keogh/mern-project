import React, { useState } from "react";
import jwt from "jwt-decode";
import { setUser } from "@sentry/react";

import type { Profile } from "@/types/api/profile";

type AuthContextValue = {
  token: string;
  userId: string;
  isAuthorized: boolean;
  login: (token: string) => void;
  logout: () => void;
};

type JwtPayload = Pick<Profile, "_id" | "email" | "registeredSince">;

type Props = {
  children: React.ReactNode;
};

const AuthContext = React.createContext<AuthContextValue>({
  token: "",
  userId: "",
  isAuthorized: false,
  login: () => {},
  logout: () => {},
});

export const TOKEN_KEY = "token";

export function AuthContextProvider(props: Props) {
  const token = localStorage.getItem(TOKEN_KEY);

  const [auth, setAuth] = useState(() => {
    try {
      const { _id: userId, email } = jwt<JwtPayload>(token!);

      const state = {
        token: token ?? "",
        userId,
        isAuthorized: true,
      };

      setUser({
        email,
        id: userId,
      });

      return state;
    } catch (err) {
      // invalid token
      localStorage.removeItem(TOKEN_KEY);

      return {
        token: "",
        userId: "",
        isAuthorized: false,
      };
    }
  });

  const login = (token: string) => {
    const { _id: userId, email } = jwt<JwtPayload>(token);

    setAuth({
      token,
      userId,
      isAuthorized: true,
    });

    setUser({
      email,
      id: userId,
    });

    localStorage.setItem(TOKEN_KEY, token);
  };

  const logout = () => {
    setAuth({
      token: "",
      userId: "",
      isAuthorized: false,
    });

    localStorage.removeItem(TOKEN_KEY);
  };

  const context = {
    token: auth.token,
    userId: auth.userId,
    isAuthorized: auth.isAuthorized,
    login,
    logout,
  };

  return <AuthContext.Provider value={{ ...context }}>{props.children}</AuthContext.Provider>;
}

export default AuthContext;
