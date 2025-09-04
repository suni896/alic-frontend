import React, { useState } from "react";
import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";
import { API_BASE_URL } from "../../../config";
import { SubmitButton, BackButton, Title, ConfirmationText, EmailHighlight, CodeInputContainer, CodeInput } from "./SharedComponents";

axios.defaults.baseURL = API_BASE_URL;

const ConfirmationContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: 100%;
`;

const Form = styled.form``;

const ErrorMessage = styled.p<{ $show: boolean }>`
  color: #fc5600;
  visibility: ${({ $show }) => ($show ? "visible" : "hidden")};
  opacity: ${({ $show }) => ($show ? 1 : 0)};
  text-align: center;
  margin: 0;
  font-size: 1rem;
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
  otp: string; // Store the complete OTP
}

interface VerifyOTPProps {
  onVerifySuccess: (token: string) => void;
  type: string; // "register" or "reset"
  email: string; // Directly pass the email
}

const VerifyOTP: React.FC<VerifyOTPProps> = ({
  onVerifySuccess,
  type,
  email, // Use the email prop directly
}) => {
  const navigate = useNavigate();
  const [showError, setShowError] = useState(false);

  const formik = useFormik<FormValues>({
    initialValues: {
      email: email, // Use the passed email directly
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
        type: type === "register" ? "1" : "3", // 1: Register, 3: Reset Password
      });

      console.log("API Response:", response.data); // Log the entire API response

      if (response.data.code === 200) {
        alert("Verification successful!");
        formik.resetForm(); // Reset form fields
        setShowError(false); // Hide error message on success
        onVerifySuccess(response.data.data.token); // Pass token to parent
      } else {
        console.log(values.email, values.otp, type);
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
      const requestBody =
        type === "register"
          ? {
              userEmail: email,
              type: "1",
            }
          : {
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
    // <Layout>
      <ContainerLayout>
        <ConfirmationContainer>
          <Title>Verify OTP</Title>
          <ConfirmationText>Confirm your email address</ConfirmationText>
          <ConfirmationText $small>
          We've sent a verification code to{" "}
          <EmailHighlight>{email}</EmailHighlight>
        </ConfirmationText>
        <ConfirmationText $small>
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
              <ErrorMessage $show={showError}>{formik.errors.otp}</ErrorMessage>
            )}

            <ErrorMessage $show={showError}>
              The code is incorrect or expired.
              <RequestNewCode onClick={handleRequestNewCode}>
                Request a new code
              </RequestNewCode>
            </ErrorMessage>

            <SubmitButton type="submit">Verify Code</SubmitButton>
            <BackButton type="button" onClick={handleSignin}>
              Back to Sign-In
            </BackButton>
          </Form>
        </ConfirmationContainer>
      </ContainerLayout>
    // {/* </Layout> */}
  );
};

export default VerifyOTP;
