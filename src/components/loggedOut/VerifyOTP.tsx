import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

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

const VerifyOTP = () => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get("type"); // Get the 'type' query parameter value
  const [otp, setOtp] = useState<string[]>(new Array(6).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const navigate = useNavigate();
  const handleSignin = () => {
    navigate("/");
  };

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

  // Determine the title based on the 'type' query parameter
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
          <EmailHighlight>xxx@xxx.xx</EmailHighlight>.
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
        <BackButton type="button" onClick={handleSignin}>
          Back to Sign-In
        </BackButton>
      </ConfirmationContainer>
    </ContainerLayout>
  );
};

export default VerifyOTP;
