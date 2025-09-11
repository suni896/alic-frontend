import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ContainerLayout from "./ContainerLayout";
import axios from "axios";
import apiClient from "./apiClient";
import { useUser } from "../loggedIn/UserContext";
import { useState } from "react";
import { API_BASE_URL } from "../../../config";
import { Label, Input, ErrorText, SigninRegisterButton, SubmitButton, Title } from "./SharedComponents";
import PasswordInput from "../PasswordInput";

axios.defaults.baseURL = API_BASE_URL;

const ErrorToast = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: #ff4444;
  padding: 12px 24px;
  font-size: 0.9rem;
  z-index: 1200; /* 设置比Material-UI AppBar更高的值 */
  animation: slideDown 0.3s ease-out;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #ffcccc;
  display: flex;
  align-items: center;
  justify-content: space-between;

  @keyframes slideDown {
    from {
      transform: translate(-50%, -20px);
      opacity: 0;
    }
    to {
      transform: translate(-50%, 0);
      opacity: 1;
    }
  }
`;

const SigninForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 90%;
  align-content: center;
`;

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: 0;
  margin-bottom: 3px;

  @media (max-width: 740px) {
    font-size: 0.7rem;
  }
`;

const ForgotPassword = styled.a`
  color: #fc5600;
  text-decoration: underline;
  cursor: pointer;
  font-size: 1rem;
  margin: 1%;

  &:hover {
    color: #016532;
  }

  @media (max-width: 740px) {
    font-size: 0.9rem;
  }
`;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be between 6 and 20 characters")
    .max(20, "Password must be between 6 and 20 characters")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'",.<>?/`~\\-]*$/,
      "Password can only include letters, numbers, and special characters"
    )
    .required("Password is required"),
});

interface FormValues {
  email: string;
  password: string;
}

const Signin: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUserInfo } = useUser();
  const [errorMessage, setErrorMessage] = useState("");
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await apiClient.post("/auth/login", {
          password: values.password,
          userEmail: values.email,
        });

        if (response.data.code === 200) {
          // On successful login, the server sets the JWT_Token cookie
          const jwtToken = response.data.data["Bearer Token"];
          localStorage.setItem("jwtToken", jwtToken);
          await refreshUserInfo();
          navigate("/search-rooms");
          console.log(response.data.code);
        } else {
          alert(
            response.data.message || "Failed to log in. Please try again."
          );
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
          alert(
            error.response?.data?.message ||
              "Failed to log in. Please try again."
          );
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  const handleRegister = () => {
    navigate("/register");
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  return (
    <>
      {errorMessage && (
        <ErrorToast>
          {errorMessage}
          <button
            onClick={() => setErrorMessage("")}
            style={{
              marginLeft: "20px",
              background: "#ff4444",
              border: "none",
              color: "white",
              cursor: "pointer",
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              fontSize: "14px",
              lineHeight: 1,
            }}
          >
            ×
          </button>
        </ErrorToast>
      )}
      <ContainerLayout>
        <SigninForm onSubmit={formik.handleSubmit}>
          <Title>Sign-In</Title>
          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {formik.touched.email && formik.errors.email ? (
            <ErrorText>{formik.errors.email}</ErrorText>
          ) : (
            <HelperText>We'll never share your email.</HelperText>
          )}
          <Label htmlFor="password">Password</Label>
          <PasswordInput
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            $hasError={formik.touched.password && !!formik.errors.password}
          />
          {formik.touched.password && formik.errors.password ? (
            <ErrorText>{formik.errors.password}</ErrorText>
          ) : (
            <HelperText>
              Password must be between 6 and 20 characters.
            </HelperText>
          )}
          <SubmitButton type="submit">Sign In</SubmitButton>
          <ForgotPassword onClick={handleResetPassword}>
            Forgot password?
          </ForgotPassword>
          <SigninRegisterButton type="button" onClick={handleRegister}>
            Create An Account
          </SigninRegisterButton>
        </SigninForm>
      </ContainerLayout>
    </>
  );
};

export default Signin;
