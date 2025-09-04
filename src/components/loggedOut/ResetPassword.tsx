import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";
import { API_BASE_URL } from "../../../config";
import { Label, Input, ErrorText, SubmitButton, BackButton, Title } from "./SharedComponents";
import PasswordInput from "../PasswordInput";

axios.defaults.baseURL = API_BASE_URL;

const ResetPasswordForm = styled.form`
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 80%;
`;



interface ResetPasswordFormValues {
  email: string;
  password?: string;
  confirmPassword?: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
});

const resetPasswordValidationSchema = Yup.object({
  password: Yup.string()
    .min(6, "Password must be between 6 and 20 characters")
    .max(20, "Password must be between 6 and 20 characters")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'",.<>?/`~\\-]*$/,
      "Password can only include letters, numbers, and special characters"
    )
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
});

const ResetPassword: React.FC<{ setEmail: (email: string) => void }> = ({
  setEmail,
}) => {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const formik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (step === 1) {
        // Step 1: Send reset email
        try {
          const response = await axios.post("/auth/sendmail", {
            userEmail: values.email,
            type: "3", // Reset Password
          });

          if (response.data.code === 200) {
            alert("Reset email sent successfully! Check your inbox.");
            setEmail(values.email);
            setStep(2); // Move to OTP verification
          } else {
            alert(response.data.message || "Failed to send reset email.");
          }
        } catch (error) {
          console.error("Error sending reset email:", error);
          alert("Failed to send reset email. Please try again.");
        }
      }
    },
  });

  const resetPasswordFormik = useFormik({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values) => {
      if (token) {
        try {
          const response = await axios.post("/auth/reset", {
            newPassword: values.password,
            token: token,
            type: "3",
            userEmail: formik.values.email,
          });

          if (response.data.code === 200) {
            alert("Password reset successfully!");
            navigate("/"); // Redirect to home
          } else {
            alert(response.data.message || "Failed to reset password.");
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          alert("Failed to reset password. Please try again.");
        }
      }
    },
  });

  const handleVerifySuccess = (receivedToken: string) => {
    setToken(receivedToken);
    setStep(3); // Move to new password step
  };



  return (
    <>
      {step === 1 && (
        <ContainerLayout>
          <ResetPasswordForm onSubmit={formik.handleSubmit}>
            <Title>Reset Password</Title>
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
            <ErrorText>
              {formik.touched.email && formik.errors.email ? formik.errors.email : ''}
            </ErrorText>
            <SubmitButton type="submit">Send Reset Email</SubmitButton>
            <BackButton type="button" onClick={() => navigate("/")}>
              Back to Sign-In
            </BackButton>
          </ResetPasswordForm>
        </ContainerLayout>
      )}
      {step === 2 && (
        <VerifyOTP
          onVerifySuccess={handleVerifySuccess}
          type="reset"
          email={formik.values.email}
        />
      )}
      {step === 3 && (
        <ContainerLayout>
          <ResetPasswordForm onSubmit={resetPasswordFormik.handleSubmit}>
            <Title>Set New Password</Title>
            <Label htmlFor="password">New Password</Label>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Enter new password"
              value={resetPasswordFormik.values.password}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              $hasError={resetPasswordFormik.touched.password && !!resetPasswordFormik.errors.password}
            />
            <ErrorText>
              {resetPasswordFormik.touched.password && resetPasswordFormik.errors.password ? resetPasswordFormik.errors.password : ''}
            </ErrorText>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter new password"
              value={resetPasswordFormik.values.confirmPassword}
              onChange={resetPasswordFormik.handleChange}
              onBlur={resetPasswordFormik.handleBlur}
              $hasError={resetPasswordFormik.touched.confirmPassword && !!resetPasswordFormik.errors.confirmPassword}
            />
            <ErrorText>
              {resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword ? resetPasswordFormik.errors.confirmPassword : ''}
            </ErrorText>
            <SubmitButton type="submit">Submit</SubmitButton>
            <BackButton type="button" onClick={() => navigate("/")}>
              Back to Sign-In
            </BackButton>
          </ResetPasswordForm>
        </ContainerLayout>
      )}
    </>
  );
};
export default ResetPassword;
