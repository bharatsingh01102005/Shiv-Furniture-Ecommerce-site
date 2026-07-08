import { createContext, useContext, useEffect, useState } from "react";
import { AuthAPI } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await AuthAPI.me();
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        refresh,

        login: async (email, password) => {
          await AuthAPI.login(email, password);
          await refresh();
        },

        googleLogin: async (credential) => {
          await AuthAPI.googleLogin(credential);
          await refresh();
        },

        signup: async (name, email, password, phone) => {
          await AuthAPI.signup(name, email, password, phone);
          await refresh();
        },

        logout: async () => {
          await AuthAPI.logout();
          setUser(null);
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}
