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
// 修改导入：使用共享的 FieldGroup
import { Input, ErrorText, SubmitButton, Title, FieldGroup, ForgotPassword, HelperText, SigninForm, AuthForm } from "./SharedComponents";
import PasswordInput from "../PasswordInput";

axios.defaults.baseURL = API_BASE_URL;

// ErrorToast
const ErrorToast = styled.div`
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--color-card);
  color: #b91c1c;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-soft);
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

const Signin = (): JSX.Element => {
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
        <SigninForm>
          <Title>Login to your account</Title>
          <AuthForm onSubmit={formik.handleSubmit}>
            <FieldGroup>
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
            </FieldGroup>

            <FieldGroup>
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
            </FieldGroup>
          <ForgotPassword onClick={handleResetPassword}>
            Forgot password?
          </ForgotPassword>
            <SubmitButton type="submit">Sign In</SubmitButton>
          </AuthForm>
          <ForgotPassword onClick={handleRegister}>
            Don’t have an account? Get Started
          </ForgotPassword>
        </SigninForm>
      </ContainerLayout>
    </>
  );
};

export default Signin;
