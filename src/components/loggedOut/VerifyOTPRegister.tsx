// VerifyOTPRegister 组件
import React from "react";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../../../config";
import { SubmitButton, Title, ConfirmationText, EmailHighlight, CodeInputContainer, CodeInput, SigninForm, AuthForm, ForgotPassword, ErrorMessage } from "../SharedComponents";
import { useOtpVerification } from "./useOtpVerification";

axios.defaults.baseURL = API_BASE_URL;

interface VerifyOTPRegisterProps {
  onVerifySuccess: (token: string) => void;
  email: string;
}

const VerifyOTPRegister = ({ onVerifySuccess, email }: VerifyOTPRegisterProps): JSX.Element => {
  const navigate = useNavigate();

  // 使用共享 Hook 抽取表单与交互逻辑（注册场景）
  const { formik, showError, handleRequestNewCode, handleCodeInputChange } =
    useOtpVerification({
      email,
      variant: "register",
      onVerifySuccess: (token) => {
        onVerifySuccess(token);
        navigate("/"); // 注册成功后跳回登录
      },
    });

  const clientHasError = formik.touched.otp && !!formik.errors.otp;

  return (
    <ContainerLayout>
      <SigninForm>
        <Title>Enter verification code</Title>
        <ConfirmationText>
          We've sent a verification code to <EmailHighlight>{email}</EmailHighlight>
        </ConfirmationText>
        <ConfirmationText>
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
                onBlur={() => {
                  // 失焦：标记 touched 并触发校验，让“Verification code is required”覆盖服务端错误
                  formik.setFieldTouched("otp", true, true);
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

          {clientHasError ? (
            <ErrorMessage>{formik.errors.otp as string}<br /><br /></ErrorMessage>
          ) : showError ? (
            <ErrorMessage>
              The code is incorrect or expired.{" "}
              <br />
              <ForgotPassword onClick={handleRequestNewCode}>
                Request a new code
              </ForgotPassword>
            </ErrorMessage>
          ) : (
            // 无任何错误时：渲染一个隐藏的占位，保持与服务端错误相同高度
            <ErrorMessage>
              <br /><br />
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
