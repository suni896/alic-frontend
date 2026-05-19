import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import VerifyOTP from "./VerifyOTP";
import { useSendResetEmail, useResetPassword } from "../../hooks/queries/useAuth";
import { useTranslation } from "react-i18next";
import { Input, HelperText, ErrorText, SubmitButton, SigninForm, Title, FieldGroup, ForgotPassword, AuthForm, PasswordInput } from "../ui/SharedComponents";

interface ResetPasswordFormValues {
  email: string;
  password?: string;
  confirmPassword?: string;
}

type ResetValues = { password: string; confirmPassword: string };

const ResetPassword: React.FC<{ setEmail: (email: string) => void }> = ({ setEmail }) => {
  const { t } = useTranslation();
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('auth.invalidEmail'))
      .required(t('auth.emailRequired')),
  });

  const resetPasswordValidationSchema = Yup.object({
    password: Yup.string()
      .min(6, t('auth.passwordLength'))
      .max(20, t('auth.passwordLength'))
      .matches(
        /^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'",.<>?/`~\\-]*$/,
        t('auth.passwordChars')
      )
      .required(t('auth.passwordRequired')),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password")], t('auth.passwordsMustMatch'))
      .required(t('auth.confirmPasswordRequired')),
  });
  const [step, setStep] = useState(1);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();
  const sendResetEmailMutation = useSendResetEmail();
  const resetPasswordMutation = useResetPassword();

  const sendmailFormik = useFormik<ResetPasswordFormValues>({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      if (step === 1) {
        // Step 1: Send reset email
        try {
          const response = await sendResetEmailMutation.mutateAsync({
            userEmail: values.email,
          });

          if (response.code === 200) {
            alert(t('auth.resetEmailSent'));
            setEmail(values.email);
            setStep(2); // Move to OTP verification
          } else {
            alert(response.message || t('auth.sendResetFailed'));
          }
        } catch (error) {
          console.error("Error sending reset email:", error);
          alert(t('auth.sendResetFailed'));
        }
      }
    },
  });

  const resetPasswordFormik = useFormik<ResetValues>({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validationSchema: resetPasswordValidationSchema,
    onSubmit: async (values) => {
      if (token) {
        try {
          const response = await resetPasswordMutation.mutateAsync({
            newPassword: values.password,
            token: token,
            type: "3",
            userEmail: sendmailFormik.values.email,
          });

          if (response.code === 200) {
            alert(t('auth.passwordResetSuccess'));
            navigate("/"); // Redirect to home
          } else {
            alert(response.message || t('auth.resetPasswordFailed'));
          }
        } catch (error) {
          console.error("Error resetting password:", error);
          alert(t('auth.resetPasswordFailed'));
        }
      }
    },
  });

  const handleVerifySuccess = (receivedToken: string) => {
    setToken(receivedToken);
    setStep(3); // Move to new password step
  };

  return (
    <>
      {step === 1 && (
        <ContainerLayout>
          <SigninForm>
            <Title>{t('auth.resetPasswordTitle')}</Title>

            <AuthForm onSubmit={sendmailFormik.handleSubmit}>
              <FieldGroup>
                <Input
                  type="email"
                  id="email"
                  name="email"
                  placeholder={t('auth.emailPlaceholder')}
                  value={sendmailFormik.values.email}
                  onChange={sendmailFormik.handleChange}
                  onBlur={sendmailFormik.handleBlur}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                  $hasError={sendmailFormik.touched.email && !!sendmailFormik.errors.email}
                />
                {sendmailFormik.touched.email && sendmailFormik.errors.email ? (
                  <ErrorText $visible>{sendmailFormik.errors.email}</ErrorText>
                ) : (
                  <HelperText>{t('auth.emailHelper')}</HelperText>
                )}
              </FieldGroup>

              <SubmitButton type="submit">{t('auth.sendResetEmail')}</SubmitButton>
            </AuthForm>

            <ForgotPassword onClick={() => navigate("/")}>
              {t('auth.backToSignIn')}
            </ForgotPassword>
          </SigninForm>
        </ContainerLayout>
      )}
      {step === 2 && (
        <VerifyOTP
          onVerifySuccess={handleVerifySuccess}
          type="reset"
          email={sendmailFormik.values.email}
        />
      )}
      {step === 3 && (
        <ContainerLayout>
          <SigninForm>
            <Title>{t('auth.setNewPasswordTitle')}</Title>
            <AuthForm onSubmit={resetPasswordFormik.handleSubmit}>
            <FieldGroup>
              <PasswordInput
                id="password"
                name="password"
                placeholder={t('auth.newPasswordPlaceholder')}
                value={resetPasswordFormik.values.password}
                onChange={resetPasswordFormik.handleChange}
                onBlur={resetPasswordFormik.handleBlur}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                $hasError={
                  resetPasswordFormik.touched.password &&
                  !!resetPasswordFormik.errors.password
                }
              />

              {resetPasswordFormik.touched.password && resetPasswordFormik.errors.password ? (
                <ErrorText $visible>{resetPasswordFormik.errors.password}</ErrorText>
              ) : (
                <HelperText>{t('auth.passwordHelper')}</HelperText>
              )}
            </FieldGroup>

            <FieldGroup>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
                value={resetPasswordFormik.values.confirmPassword}
                onChange={resetPasswordFormik.handleChange}
                onBlur={resetPasswordFormik.handleBlur}
                $hasError={
                  resetPasswordFormik.touched.confirmPassword &&
                  !!resetPasswordFormik.errors.confirmPassword
                }
              />
              {resetPasswordFormik.touched.confirmPassword && resetPasswordFormik.errors.confirmPassword ? (
                <ErrorText $visible>{resetPasswordFormik.errors.confirmPassword}</ErrorText>
              ) : (
                <HelperText>{t('auth.passwordHelper')}</HelperText>
              )}
            </FieldGroup>

            <SubmitButton type="submit">{t('common.submit')}</SubmitButton>
            </AuthForm>
            <ForgotPassword onClick={() => navigate("/")}>
              {t('auth.backToSignIn')}
            </ForgotPassword>
          </SigninForm>
        </ContainerLayout>
      )}
    </>
  );
};
export default ResetPassword;
