import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";
import { API_BASE_URL } from "../../../config";
import { Input, HelperText, ErrorText, SubmitButton, SigninForm, Title, FieldGroup, ForgotPassword, AuthForm, PasswordInput } from "../SharedComponents";


axios.defaults.baseURL = API_BASE_URL;

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

type ResetValues = { password: string; confirmPassword: string };

const ResetPassword: React.FC<{ setEmail: (email: string) => void }> = ({ setEmail }) => {
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const sendmailFormik = useFormik<ResetPasswordFormValues>({
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

  const resetPasswordFormik = useFormik<ResetValues>({
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
            userEmail: sendmailFormik.values.email,
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
          <SigninForm>
            <Title>Reset Password</Title>

            <AuthForm onSubmit={sendmailFormik.handleSubmit}>
              <FieldGroup>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Email"
                  value={sendmailFormik.values.email}
                  onChange={sendmailFormik.handleChange}
                  onBlur={sendmailFormik.handleBlur}
                  $hasError={sendmailFormik.touched.email && !!sendmailFormik.errors.email}
                />
                {sendmailFormik.touched.email && sendmailFormik.errors.email ? (
                  <ErrorText>{sendmailFormik.errors.email}</ErrorText>
                ) : (
                  <HelperText>We'll never share your email.</HelperText>
                )}
              </FieldGroup>

              <SubmitButton type="submit">Send Reset Email</SubmitButton>
            </AuthForm>

            <ForgotPassword onClick={() => navigate("/")}>
              Back to Sign In
            </ForgotPassword>
          </SigninForm>
        </ContainerLayout>
      )}
      {step === 2 && (
        <VerifyOTP
          onVerifySuccess={handleVerifySuccess}
          type="reset"
          email={sendmailFormik.values.email}
        />
      )}
      {step === 3 && (
        <ContainerLayout>
          <SigninForm>
            <Title>Set New Password</Title>
            <AuthForm onSubmit={resetPasswordFormik.handleSubmit}>
            <FieldGroup>
              <PasswordInput
                id="password"
                name="password"
                placeholder="New password"
                value={resetPasswordFormik.values.password}
                onChange={resetPasswordFormik.handleChange}
                onBlur={resetPasswordFormik.handleBlur}
                $hasError={
                  resetPasswordFormik.touched.password &&
                  !!resetPasswordFormik.errors.password
                }
              />

              {resetPasswordFormik.touched.password && resetPasswordFormik.errors.password ? (
                <ErrorText>{resetPasswordFormik.errors.password}</ErrorText>
              ) : (
                <HelperText>Password must be between 6 and 20 characters.</HelperText>
              )}
            </FieldGroup>

            <FieldGroup>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Confirm new password"
                value={resetPasswordFormik.values.confirmPassword}
                onChange={resetPasswordFormik.handleChange}
                onBlur={resetPasswordFormik.handleBlur}
                $hasError={
                  resetPasswordFormik.touched.confirmPassword &&
                  !!resetPasswordFormik.errors.confirmPassword
                }
              />
              {resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword ? (
                <ErrorText>{resetPasswordFormik.errors.confirmPassword}</ErrorText>
              ) : (
                <HelperText>Password must be between 6 and 20 characters.</HelperText>
              )}
            </FieldGroup>

            <SubmitButton type="submit">Submit</SubmitButton>
            </AuthForm>
            <ForgotPassword onClick={() => navigate("/")}>
              Back to Sign In
            </ForgotPassword>
          </SigninForm>
        </ContainerLayout>
      )}
    </>
  );
};
export default ResetPassword;
