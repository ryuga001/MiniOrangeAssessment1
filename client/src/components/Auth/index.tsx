import { GoogleLogin } from "@react-oauth/google";
import React, { useState } from "react";
import FacebookLogin from "react-facebook-login";
import {
  loginUser,
  loginUserFacebook,
  loginUserGoogle,
  registerUser,
} from "../../api/auth";
import { getMe } from "../../api/profile";
import { useUser } from "../../context/user";
import "./auth.scss";

interface FormDataType {
  username: string;
  email: string;
  password: string;
}

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const userContext = useUser();
  const [formData, setFormData] = useState<FormDataType>({
    username: "",
    email: "",
    password: "",
  });

  const toggleMode = () => {
    setFormData({ username: "", email: "", password: "" });
    setIsRegister((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (!isRegister) {
      const res = await loginUser(formData.email, formData.password);
      if (res) {
        const response = await getMe();
        if (response.success) {
          userContext.login({
            id: response.data._id,
            username: response.data.username,
            email: response.data.email,
            phoneNo: response.data?.phoneno,
          });
        }
      } else {
        alert("login failed");
      }
      setLoading(false);
    } else {
      const res = await registerUser(
        formData.username,
        formData.email,
        formData.password
      );
      if (res) {
        const response = await getMe();
        if (response.success) {
          userContext.login({
            id: response.data._id,
            username: response.data.username,
            email: response.data.email,
            phoneNo: response.data?.phoneno,
          });
        }
      } else {
        alert("Registration Failed");
      }
    }
  };

  const handleGoogleLogin = async (response: any) => {
    try {
      const googleToken = response.credential;
      const res = await loginUserGoogle(googleToken);

      if (res.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Google login failed", error);
    }
  };

  const responseFacebook = async (response: any) => {
    if (response.status === "unknown") {
      console.log("Facebook login failed. Please try again.");
      return;
    }
    try {
      const facebookToken = response.accessToken;
      const res = await loginUserFacebook(facebookToken);

      if (res.success) {
        window.location.reload();
      }
    } catch (error) {
      console.error("Facebook login failed", error);
    }
  };
  const handleError = () => {
    console.error("Google login failed");
  };
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image">
          <img
            src="https://images.unsplash.com/photo-1575089976121-8ed7b2a54265?q=80&w=3087&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Login Visual"
          />
        </div>
        <div className="auth-form">
          <h2>{isRegister ? "Create an Account" : "Welcome Back"}</h2>
          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? "Please wait..." : isRegister ? "Register" : "Login"}
            </button>
          </form>

          <div className="oauth-buttons">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={handleError}
              useOneTap
              text={isRegister ? "signup_with" : "signin_with"}
            />
          </div>
          <div
            style={{
              alignSelf: "center",
              padding: "12px",
            }}
          >
            <FacebookLogin
              appId={import.meta.env.VITE_FACEBOOK_APP_ID}
              autoLoad={true}
              fields="name,email"
              callback={responseFacebook}
              icon="fa-facebook"
            />
          </div>

          <p>
            {isRegister ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={toggleMode}>
              {isRegister ? "Login" : "Register"}
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
