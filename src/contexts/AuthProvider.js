// src/contexts/AuthContext.js
import React, { createContext, useContext, useState } from "react";
import { toast } from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { loginService } from "../services/auth-services/loginService";
import { signupService } from "../services/auth-services/signupService"; // <-- create this

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState("profile");

  const [loginCredential, setLoginCredential] = useState({
    email: "",
    password: "",
  });
  const [signupCredential, setSignupCredential] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const encodedToken = localStorage.getItem("token");
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const email = localStorage.getItem("email");

  const [auth, setAuth] = useState(
    encodedToken
      ? { token: encodedToken, isAuth: true, firstName, lastName, email }
      : { token: "", isAuth: false }
  );

  // --- Login Handler ---
  const loginHandler = async (e, email, password) => {
    e.preventDefault();
    try {
      setLoginLoading(true);
      setError("");
      const response = await loginService(email, password);

      console.log(response)

      if (response.status === 200) {
        const { encodedToken, foundUser } = response.data;
        const { firstName, lastName, email } = foundUser;

        console.log(encodedToken, foundUser)

        setAuth({
          token: encodedToken,
          isAuth: true,
          firstName,
          lastName,
          email,
        });

        localStorage.setItem("token", encodedToken);
        localStorage.setItem("isAuth", true);
        localStorage.setItem("firstName", firstName);
        localStorage.setItem("lastName", lastName);
        localStorage.setItem("email", email);

        setLoginCredential({ email: "", password: "" });
        toast.success(`Welcome back, ${firstName}!`);

        navigate(location?.state?.from?.pathname || "/");
      }
    } catch (error) {
      console.log(error)
      setError(error?.response?.data?.errors?.[0] || "Login failed");
    } finally {
      setLoginLoading(false);
    }
  };

  
  const signupHandler = async (e, signupData) => {
  
    try {
      setLoginLoading(true);
      setError("");

      const response = await signupService(signupData);

      if (response.status === 201) {
        toast.success("Signup successful. Please login.");
        setSignupCredential({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
        });
        navigate("/login"); // Redirect to login
      }
    } catch (error) {
      setError(error?.response?.data?.errors?.[0] || "Signup failed");
    } finally {
      setLoginLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        auth,
        setAuth,
        loginHandler,
        signupHandler,
        error,
        setError,
        loginLoading,
        loginCredential,
        setLoginCredential,
        signupCredential,
        setSignupCredential,
        currentPage,
        setCurrentPage,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
