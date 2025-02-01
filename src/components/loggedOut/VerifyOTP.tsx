import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

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

  &:focus {
    outline: none;
    border: 2px solid #fc5600;
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

const VerifyOTP: React.FC = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type");
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const [email, setEmail] = useState<string>("example@email.com"); //
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();

  const handleOtpChange = (value: string, index: number) => {
    if (/^[0-9]$/.test(value) || value === "") {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < inputRefs.current.length - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async () => {
    try {
      const verifiCode = otp.join("");
      const response = await axios.post("/auth/verify_code", {
        email,
        verifiCode,
        type: type === "register" ? 1 : 3, // 1: Register, 3: Reset Password
      });

      if (response.data.token) {
        alert("Verification successful!");
        if (type === "reset") {
          navigate(`/reset-password?token=${response.data.token}`);
        } else {
          navigate("/");
        }
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      alert("Failed to verify OTP. Please try again.");
    }
  };

  const handleSignin = () => {
    navigate("/");
  };

  const title =
    type === "register"
      ? "Register"
      : type === "reset"
      ? "Reset Password"
      : "Verify";

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
        <CodeInputContainer>
          {otp.map((value, index) => (
            <CodeInput
              key={index}
              value={value}
              maxLength={1}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputRefs.current[index] = el)}
            />
          ))}
        </CodeInputContainer>
        <SubmitButton type="button" onClick={handleVerifyOTP}>
          Verify Code
        </SubmitButton>
        <BackButton type="button" onClick={handleSignin}>
          Back to Sign-In
        </BackButton>
      </ConfirmationContainer>
    </ContainerLayout>
  );
};

export default VerifyOTP;
