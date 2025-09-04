import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";
import { API_BASE_URL } from "../../../config";

axios.defaults.baseURL = API_BASE_URL;

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
  margin: 2.5% auto;

  @media (max-width: 740px) {
    font-size: 1.7rem;
    margin-bottom: 7%;
  }

  @media (max-width: 740px) and (min-height: 80px) {
    margin-top: 5%;
    margin-bottom: 10%;
  }
`;

const Label = styled.label`
  font-size: 1rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 2px;

  @media (max-width: 740px) {
    font-size: 0.8rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  color: black;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }

  @media (max-width: 740px) {
    height: 5vh;
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: 0;
  margin-bottom: 3px;
  min-height: 1.2em; /* 预留固定高度 */
  // line-height: 1.2;

  @media (max-width: 740px) {
    font-size: 0.7rem;
    min-height: 1.1em;
  }

  @media (max-height: 720px) {
    margin: 0;
    min-height: 1em;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  height: 40px;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: black;
  color: white;
  border: none;
  outline: none;

  &:focus {
    outline: none;
    box-shadow: none;
  }

  &:focus-visible {
    outline: none;
    box-shadow: none;
  }

  &:active {
    outline: none;
    box-shadow: none;
  }

  @media (max-width: 740px) {
    width: 60%;
    margin-top: 10%;
    margin-bottom: 6%;
  }

  @media (max-height: 720px) {
    margin-bottom: 0;
    margin-top: 0;
  }

  @media (max-width: 740px) and (min-height: 820px) {
    height: 5vh;
    margin-bottom: 8%;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 40px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;

  @media (max-width: 740px) {
    width: 80%;
    font-size: 0.9rem;
    margin-top: 15%;
  }

  @media (max-height: 720px) {
    margin-top: 8%;
  }
  @media (max-width: 740px) and (min-height: 820px) {
    height: 6vh;
    margin-top: 18%;
  }
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
