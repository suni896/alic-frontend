import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useVerifyCode, useResendCode } from "../../hooks/queries/useAuth";
import { useTranslation } from "react-i18next";

export interface OtpFormValues {
  email: string;
  otp: string;
}

export type OtpVariant = "register" | "reset";

export const otpValidationSchema = (t: (key: string) => string) =>
  Yup.object().shape({
    otp: Yup.string()
      .length(6, t('auth.otpLength'))
      .matches(/^\d{6}$/, t('auth.otpNumber'))
      .required(t('auth.otpRequired')),
  });

interface UseOtpVerificationOptions {
  email: string;
  variant: OtpVariant;
  onVerifySuccess: (token: string) => void;
}

export const useOtpVerification = ({
  email,
  variant,
  onVerifySuccess,
}: UseOtpVerificationOptions) => {
  const { t } = useTranslation();
  const [showError, setShowError] = useState(false);
  const verifyCodeMutation = useVerifyCode();
  const resendCodeMutation = useResendCode();

  const formik = useFormik<OtpFormValues>({
    initialValues: {
      email,
      otp: "",
    },
    validationSchema: otpValidationSchema(t),
    onSubmit: async (values) => {
      try {
        const response = await verifyCodeMutation.mutateAsync({
          email: values.email,
          verifiCode: values.otp,
          type: variant === "register" ? "1" : "3",
        });

        if (response.code === 200) {
          onVerifySuccess(response.data.token);
          setShowError(false);
          formik.resetForm();
        } else {
          setShowError(true);
          // 提交失败：清空 otp，并重置 touched，让服务端错误优先显示
          formik.setFieldValue("otp", "");
          formik.setFieldTouched("otp", false, false);
          document.getElementById("code-input-0")?.focus();
        }
      } catch (error) {
        if (error instanceof Error) {
          alert(
            error.message || t('auth.failedToVerifyOtp')
          );
        } else {
          alert(t('auth.unexpectedError'));
        }
      }
    },
  });

  // 将 shouldShowOtpError 严格转为 boolean，避免 boolean | undefined
  const shouldShowOtpError: boolean =
    Boolean(formik.errors.otp) &&
    (formik.submitCount > 0 || Boolean(formik.touched.otp));

  const handleRequestNewCode = async () => {
    try {
      const response = await resendCodeMutation.mutateAsync({
        userEmail: email,
        type: variant === "register" ? "1" : "3",
      });

      if (response.code === 200) {
        alert(t('auth.newCodeSent'));
        formik.setFieldValue("otp", "");
        document.getElementById("code-input-0")?.focus();
      } else {
        alert(response.message || t('auth.sendVerificationFailed'));
      }
    } catch {
      alert(t('auth.failedToSendNewCode'));
    }
  };

  const handleCodeInputChange = (index: number, value: string) => {
    const isNumber = /^[0-9]$/.test(value);

    if (isNumber || value === "") {
      const newOtp = formik.values.otp.split("");
      newOtp[index] = value;
      formik.setFieldValue("otp", newOtp.join(""));
      // 输入时清除服务端错误
      setShowError(false);

      if (isNumber && index < 5) {
        document.getElementById(`code-input-${index + 1}`)?.focus();
      }
    }

    if (value === "" && index > 0) {
      document.getElementById(`code-input-${index - 1}`)?.focus();
    }
  };

  return {
    formik,
    showError,
    shouldShowOtpError,
    handleRequestNewCode,
    handleCodeInputChange,
  };
};
