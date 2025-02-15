import React, { useState } from "react";
import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import Layout from "./Layout";

axios.defaults.baseURL = "https://112.74.92.135:443";

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
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

const ConfirmationText = styled.p<{ small?: boolean }>`
  font-size: ${({ small }) => (small ? "1.3rem" : "1.8rem")};
  margin: ${({ small }) => (small ? "0.3rem 0 0 0" : "1rem 0 0.5rem 0")};
  font-family: "Roboto", serif;
  text-align: center;
  font-weight: 700;
`;

const Form = styled.form``;

const EmailHighlight = styled.span`
  color: #016532;
  font-weight: bold;
`;

const CodeInputContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin: 2rem 0 1rem 0;
`;

const CodeInput = styled.input`
  width: 3.5rem;
  height: 3.5rem;
  text-align: center;
  font-size: 1.5rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  background: #d9d9d9;
  color: #000;

  &:focus {
    outline: none;
    border-color: #016532;
  }
`;

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 55px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 2rem auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;
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
  margin: 1rem auto 0 auto;
  border-radius: 5px;
  background-color: black;
  color: white;
`;

const ErrorMessage = styled.p`
  color: #fc5600;
  margin: 0;
`;

const RequestNewCode = styled.span`
  color: #016532;
  cursor: pointer;
  text-decoration: underline;

  &:hover {
    text-decoration: none;
  }
`;

const validationSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "Code must be exactly 6 digits")
    .matches(/^\d{6}$/, "Code must be a valid number")
    .required("Verification code is required"),
});

interface FormValues {
  email: string;
  otp: string;
}

interface VerifyOTPResetProps {
  onVerifySuccess: (token: string) => void;
  email: string;
}

const VerifyOTPReset: React.FC<VerifyOTPResetProps> = ({
  onVerifySuccess,
  email,
}) => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      email: email,
      otp: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      await handleVerifyOTP(values);
    },
  });

  const handleVerifyOTP = async (values: FormValues) => {
    try {
      const response = await axios.post("/auth/verify_code", {
        email: values.email,
        verifiCode: values.otp,
        type: "3", // Reset Password
      });

      console.log("API Response:", response.data); // Log the entire API response

      if (response.data.code === 200) {
        alert("Verification successful!");
        formik.resetForm(); // Reset form fields
        setShowError(false); // Hide error message on success
        onVerifySuccess(response.data.data.token); // Pass token to parent
      } else {
        console.log(values.email, values.otp);
        console.log("Verification failed:", response.data.message); // Log the failure message
        setShowError(true); // Show error message
        formik.setErrors({
          otp: response.data.message || "The code is incorrect or expired.",
        });

        // Clear OTP inputs and reset cursor
        formik.setFieldValue("otp", "");
        document.getElementById("code-input-0")?.focus(); // Focus on the first input
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      if (axios.isAxiosError(error)) {
        console.error("Response data:", error.response?.data); // Log the error response data
        alert(
          error.response?.data?.message ||
            "Failed to verify OTP. Please try again."
        );
      } else {
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const handleSignin = () => {
    navigate("/");
  };

  const handleRequestNewCode = async () => {
    try {
      const requestBody = {
        type: "3", // Assuming type 3 is for reset password
        userEmail: email,
      };

      const response = await axios.post("/auth/sendmail", requestBody);

      if (response.data.code === 200) {
        alert("A new verification code has been sent to your email.");

        // Clear OTP inputs and reset cursor
        formik.setFieldValue("otp", "");
        document.getElementById("code-input-0")?.focus(); // Focus on the first input
      } else {
        alert(response.data.message || "Failed to send verification email.");
      }
    } catch (error) {
      console.error("Error requesting new code:", error);
      alert("Failed to send new verification code. Please try again.");
    }
  };

  const handleCodeInputChange = (index: number, value: string) => {
    const isNumber = /^[0-9]$/.test(value);

    // Check if the entered value is a number or an empty string
    if (isNumber || value === "") {
      const newOtp = formik.values.otp.split("");
      newOtp[index] = value; // Update the specific index
      formik.setFieldValue("otp", newOtp.join("")); // Join back into a string

      // Move focus to the next input if the current input is filled with a number
      if (isNumber) {
        if (index < 5) {
          const nextInput = document.getElementById(`code-input-${index + 1}`);
          nextInput?.focus(); // Move focus to the next input
        }
      }
    }

    // Handle backspace to move focus to the previous input
    if (value === "" && index > 0) {
      const prevInput = document.getElementById(`code-input-${index - 1}`);
      prevInput?.focus(); // Move focus to the previous input
    }
  };

  return (
    <Layout>
      <ContainerLayout>
        <ConfirmationContainer>
          <Title>Verify OTP</Title>
          <ConfirmationText>Confirm your email address</ConfirmationText>
          <ConfirmationText small>
            We've sent a confirmation code to{" "}
            <EmailHighlight>{email}</EmailHighlight>.
          </ConfirmationText>
          <ConfirmationText small>
            Check your inbox and enter the code here.
          </ConfirmationText>

          <Form onSubmit={formik.handleSubmit}>
            <CodeInputContainer>
              {Array.from({ length: 6 }, (_, index) => (
                <CodeInput
                  key={index}
                  id={`code-input-${index}`} // Unique ID for each input
                  maxLength={1}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    handleCodeInputChange(index, e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !formik.values.otp[index]) {
                      // Move focus to the previous input on backspace if current is empty
                      const prevInput = document.getElementById(
                        `code-input-${index - 1}`
                      );
                      prevInput?.focus();
                    }
                  }}
                  value={formik.values.otp[index] || ""} // Display the corresponding value
                />
              ))}
            </CodeInputContainer>
            {formik.touched.otp && formik.errors.otp && (
              <ErrorMessage>{formik.errors.otp}</ErrorMessage>
            )}
            {showError && (
              <ErrorMessage>
                The code is incorrect or expired.{" "}
                <RequestNewCode onClick={handleRequestNewCode}>
                  Request a new code
                </RequestNewCode>
              </ErrorMessage>
            )}
            <SubmitButton type="submit">Verify Code</SubmitButton>
            <BackButton type="button" onClick={handleSignin}>
              Back to Sign-In
            </BackButton>
          </Form>
        </ConfirmationContainer>
      </ContainerLayout>
    </Layout>
  );
};

export default VerifyOTPReset;
