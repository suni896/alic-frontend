import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useVerifyCode, useResendCode } from "../../hooks/queries/useAuth";

export interface OtpFormValues {
  email: string;
  otp: string;
}

export type OtpVariant = "register" | "reset";

export const otpValidationSchema = Yup.object().shape({
  otp: Yup.string()
    .length(6, "Code must be exactly 6 digits")
    .matches(/^\d{6}$/, "Code must be a valid number")
    .required("Verification code is required"),
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
  const [showError, setShowError] = useState(false);
  const verifyCodeMutation = useVerifyCode();
  const resendCodeMutation = useResendCode();

  const formik = useFormik<OtpFormValues>({
    initialValues: {
      email,
      otp: "",
    },
    validationSchema: otpValidationSchema,
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
            error.message || "Failed to verify OTP. Please try again."
          );
        } else {
          alert("An unexpected error occurred. Please try again.");
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
        alert("A new verification code has been sent to your email.");
        formik.setFieldValue("otp", "");
        document.getElementById("code-input-0")?.focus();
      } else {
        alert(response.message || "Failed to send verification email.");
      }
    } catch {
      alert("Failed to send new verification code. Please try again.");
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
