// VerifyOTP 组件
import React from "react";
import ContainerLayout from "./ContainerLayout";
import { useNavigate } from "react-router-dom";
import { SigninForm, AuthForm, SubmitButton, ForgotPassword, Title, ConfirmationText, EmailHighlight, CodeInputContainer, CodeInput, ErrorMessage } from "../ui/SharedComponents";
import { useOtpVerification } from "./useOtpVerification";
import { useTranslation } from "react-i18next";

interface VerifyOTPProps {
  onVerifySuccess: (token: string) => void;
  type: string;
  email: string;
}

function VerifyOTP({ onVerifySuccess, type, email }: VerifyOTPProps): JSX.Element {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // 使用共享 Hook，移除本地 formik/showError/handlers 重复实现
  const { formik, showError, handleRequestNewCode, handleCodeInputChange } =
    useOtpVerification({
      email,
      variant: type === "register" ? "register" : "reset",
      onVerifySuccess,
    });

  const clientHasError = formik.touched.otp && !!formik.errors.otp;

  return (
    // <Layout>
      <ContainerLayout>
        {/* SigninForm 仅用于布局容器 */}
        <SigninForm>
          <Title>{t('auth.enterVerificationCode')}</Title>
          <ConfirmationText>
            {t('auth.verificationCodeSent')} <EmailHighlight>{email}</EmailHighlight>
            <br />
            {t('auth.checkInbox')}
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
                  onBlur={() => {
                    formik.setFieldTouched("otp", true, true);
                  }}
                  onFocus={(e) => {
                    // 第一个输入框聚焦时滚动到可视区域
                    if (index === 0) {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
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
                {t('auth.codeIncorrect')}{" "}
                <br />
                <ForgotPassword onClick={handleRequestNewCode}>
                  {t('auth.requestNewCode')}
                </ForgotPassword>
              </ErrorMessage>
            ) : (
              // 无任何错误时：渲染一个隐藏的占位，保持与服务端错误相同高度
              <ErrorMessage>
                <br /><br />
              </ErrorMessage>
            )}

            <SubmitButton type="submit">{t('auth.verifyCode')}</SubmitButton>
          </AuthForm>

          <ForgotPassword onClick={() => navigate("/")}>
            {t('auth.backToSignIn')}
          </ForgotPassword>
        </SigninForm>
      </ContainerLayout>
  );
};

export default VerifyOTP;
