// VerifyOTPRegister 组件
import React from "react";
import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { SubmitButton, Title, ConfirmationText, EmailHighlight, CodeInputContainer, CodeInput, SigninForm, AuthForm, ForgotPassword } from "./SharedComponents";
import { useOtpVerification } from "./useOtpVerification";

axios.defaults.baseURL = API_BASE_URL;

const ErrorMessage = styled.p`
  color: #fc5600;
  margin: 0;
`;

interface VerifyOTPRegisterProps {
  onVerifySuccess: (token: string) => void;
  email: string;
}

const VerifyOTPRegister = ({ onVerifySuccess, email }: VerifyOTPRegisterProps): JSX.Element => {
  const navigate = useNavigate();

  // 使用共享 Hook 抽取表单与交互逻辑（注册场景）
  const { formik, showError, shouldShowOtpError, handleRequestNewCode, handleCodeInputChange } =
    useOtpVerification({
      email,
      variant: "register",
      onVerifySuccess: (token) => {
        onVerifySuccess(token);
        navigate("/"); // 注册成功后跳回登录
      },
    });

  return (
    <ContainerLayout>
      <SigninForm>
        <Title>Enter verification code</Title>
        <ConfirmationText $small>
          We've sent a verification code to <EmailHighlight>{email}</EmailHighlight>
        </ConfirmationText>
        <ConfirmationText $small>
          Check your inbox and enter the code here.
        </ConfirmationText>

        <AuthForm autoComplete="off" onSubmit={formik.handleSubmit}>
          <CodeInputContainer>
            {Array.from({ length: 6 }, (_, index) => (
              <CodeInput
                key={index}
                id={`code-input-${index}`}
                name={`otp-${index}`}
                type="text"
                inputMode="numeric"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                pattern="[0-9]*"
                maxLength={1}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleCodeInputChange(index, e.target.value);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !formik.values.otp[index]) {
                    const prevInput = document.getElementById(`code-input-${index - 1}`);
                    prevInput?.focus();
                  }
                }}
                value={formik.values.otp[index] || ""}
              />
            ))}
          </CodeInputContainer>

          {/* 首次点击提交也能出现“Verification code is required” */}
          {shouldShowOtpError && (
            <ErrorMessage>{formik.errors.otp as string}</ErrorMessage>
          )}

          {/* 服务端错误 */}
          {showError && (
            <ErrorMessage>
              The code is incorrect or expired.{" "}
              <ForgotPassword onClick={handleRequestNewCode}>
                Request a new code
              </ForgotPassword>
            </ErrorMessage>
          )}

          <SubmitButton type="submit">Verify Code</SubmitButton>
        </AuthForm>

        <ForgotPassword onClick={() => navigate("/")}>
          Back to Sign In
        </ForgotPassword>
      </SigninForm>
    </ContainerLayout>
  );
};

export default VerifyOTPRegister;
