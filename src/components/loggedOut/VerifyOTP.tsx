import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { useFormik } from "formik";
import * as Yup from "yup";

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
  margin: ${({ small }) => (small ? "0.3rem 0 0 0" : "1rem 0 0.5rem 0 ")};
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
  margin: 4rem 0 1rem 0;
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
  margin: 3rem auto 0 auto;
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
  background-color: #fc5600;
  color: white;
`;

const ErrorMessage = styled.p`
  color: #fc5600;
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

const VerifyOTP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const email = searchParams.get("email") || ""; // Get email from URL params
  const username = searchParams.get("username") || ""; // Get username from URL params
  const password = searchParams.get("password") || ""; // Get password from URL params
  const navigate = useNavigate();

  const formik = useFormik<FormValues>({
    initialValues: {
      email: email,
      otp: "", // Initialize otp as an empty string
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

      console.log(values.email, values.otp, type);
      console.log("API Response:", response.data);

      if (response.data.code === 200) {
        alert("Verification successful!");
        if (type === "reset") {
          // Handle reset logic if needed
        } else {
          navigate("/");
        }
      } else {
        console.error(
          "Verification failed:",
          response.data.message || "Unknown error"
        );
        formik.setErrors({ otp: "The code is incorrect or expired." });
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  const handleSignin = () => {
    navigate("/");
  };

  const handleRequestNewCode = async () => {
    // Clear fields and reset states
    formik.setFieldValue("otp", "");
    formik.setErrors({});

    // Log the parameters before sending
    console.log("Requesting new verification code with parameters:");
    console.log("userEmail:", email);
    console.log("userName:", username);
    console.log("password:", password); // Log password to check its value
    console.log("type:", type);

    // Validate parameters before the API call
    if (!email || !username || !password) {
      alert("Email, username, and password must be provided.");
      return;
    }

    try {
      // Send another verification email
      const response = await axios.post("/auth/sendmail", {
        userEmail: email, // Ensure this matches what the API expects
        userName: username, // Ensure this matches what the API expects
        password: password, // Only include if required by your API
        type: "1",
      });

      if (response.data.code === 200) {
        alert("A new verification email has been sent to your email.");
      } else {
        alert(response.data.message || "Failed to send verification email.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error("Axios error:", error.response?.data || error.message);
        alert(
          error.response?.data?.message ||
            "Failed to send verification email. Please try again."
        );
      } else {
        console.error("Unexpected error:", error);
        alert("An unexpected error occurred. Please try again.");
      }
    }
  };

  const title =
    type === "register"
      ? "Register"
      : type === "reset"
      ? "Reset Password"
      : "Verify";

  const handleCodeInputChange = (index: number, value: string) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = formik.values.otp.split("");
      newOtp[index] = value; // Update the specific index
      formik.setFieldValue("otp", newOtp.join("")); // Join back into a string
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-input-${index + 1}`);
        nextInput?.focus(); // Move focus to the next input
      }
    }
  };

  return (
    <ContainerLayout>
      <ConfirmationContainer>
        <Title>{title}</Title>
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
                value={formik.values.otp[index] || ""} // Display the corresponding value
              />
            ))}
          </CodeInputContainer>
          {formik.touched.otp && formik.errors.otp && (
            <ErrorMessage>{formik.errors.otp}</ErrorMessage>
          )}
          <ErrorMessage>
            The code is incorrect or expired.{" "}
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
  );
};

export default VerifyOTP;
