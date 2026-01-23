// VerifyOTP 组件
import React from "react";
import styled from "styled-components";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { SigninForm, AuthForm, SubmitButton, ForgotPassword, Title, ConfirmationText, EmailHighlight, CodeInputContainer, CodeInput } from "./SharedComponents";
import { useOtpVerification } from "./useOtpVerification";

axios.defaults.baseURL = API_BASE_URL;
const ErrorMessage = styled.p`
  color: #fc5600;
  margin: 0;
`;

interface VerifyOTPProps {
  onVerifySuccess: (token: string) => void;
  type: string;
  email: string;
}

const VerifyOTP = ({ onVerifySuccess, type, email }: VerifyOTPProps): JSX.Element => {
  const navigate = useNavigate();

  // 使用共享 Hook，移除本地 formik/showError/handlers 重复实现
  const { formik, showError, shouldShowOtpError, handleRequestNewCode, handleCodeInputChange } =
    useOtpVerification({
      email,
      variant: type === "register" ? "register" : "reset",
      onVerifySuccess,
    });

  return (
    // <Layout>
      <ContainerLayout>
        {/* SigninForm 仅用于布局容器 */}
        <SigninForm>
          <Title>Enter verification code</Title>
          <ConfirmationText $small>
            We've sent a verification code to <EmailHighlight>{email}</EmailHighlight>
          </ConfirmationText>
          <ConfirmationText $small>
            Check your inbox and enter the code here.
          </ConfirmationText>

          {/* 实际表单提交在这里 */}
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

            {/* 首次提交/失焦后显示必填错误 */}
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

            {/* 将提交按钮放在同一个 form 内，确保提交行为正确 */}
            <SubmitButton type="submit">Verify Code</SubmitButton>
          </AuthForm>

          <ForgotPassword onClick={() => navigate("/")}>
            Back to Sign In
          </ForgotPassword>
        </SigninForm>
      </ContainerLayout>
    // {/* </Layout> */}
  );
};

export default VerifyOTP;
