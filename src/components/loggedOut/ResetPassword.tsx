import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";

axios.defaults.baseURL = "https://112.74.92.135:443";

const ResetPasswordForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-family: "Roboto", serif;
  font-weight: 700;
  text-decoration: underline;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  color: black;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
`;

const SubmitButton = styled.button`
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 1rem auto 1.5rem auto;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 55px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 3rem auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;
`;

interface ResetPasswordFormValues {
  email: string;
}

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
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

  const handleVerifySuccess = (receivedToken: string) => {
    setToken(receivedToken);
    setStep(3); // Move to new password step
  };

  const handleResetPassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    if (token) {
      try {
        const response = await axios.post("/auth/reset", {
          newPassword: newPassword,
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
            {formik.touched.email && formik.errors.email ? (
              <ErrorText>{formik.errors.email}</ErrorText>
            ) : null}
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
          <ResetPasswordForm
            onSubmit={(e) => {
              e.preventDefault();
              const passwordInput = (
                e.target as HTMLFormElement
              ).elements.namedItem("password") as HTMLInputElement;
              const confirmPasswordInput = (
                e.target as HTMLFormElement
              ).elements.namedItem("confirmPassword") as HTMLInputElement;
              handleResetPassword(
                passwordInput.value,
                confirmPasswordInput.value
              );
            }}
          >
            <Title>Set New Password</Title>
            <Label htmlFor="password">New Password</Label>
            <Input
              type="password"
              id="password"
              name="password"
              placeholder="Enter new password"
            />
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Re-enter new password"
            />
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
