import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useUserInfo } from "../../hooks/queries/useUser";
import { useLogin } from "../../hooks/queries/useAuth";
import { getUserInfo } from "../../api/user.api";
import { Input, ErrorText, SubmitButton, Title, FieldGroup, ForgotPassword, HelperText, SigninForm, AuthForm, PasswordInput } from "../ui/SharedComponents";

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password must be between 6 and 20 characters")
    .max(20, "Password must be between 6 and 20 characters")
    .matches(
      /^[a-zA-Z0-9!@#$%^&*()_+=[\]{}|;:'",.<>?/`~\\-]*$/,
      "Password can only include letters, numbers, and special characters"
    )
    .required("Password is required"),
});

interface FormValues {
  email: string;
  password: string;
}

const Signin = (): JSX.Element => {
  const navigate = useNavigate();
  const { refreshUserInfo } = useUserInfo();
  const loginMutation = useLogin();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // 检查用户是否已登录
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem("jwtToken");
      if (token) {
        try {
          // 验证 token 是否有效
          const response = await getUserInfo();
          if (response.code === 200) {
            // Token 有效，跳转到搜索房间页面
            navigate("/search-rooms");
            return;
          }
        } catch (error) {
          // Token 无效或过期，清除存储
          console.log("Token invalid or expired, staying on login page");
          localStorage.removeItem("jwtToken");
          document.cookie =
            "jwtToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure; SameSite=None";
        }
      }
      setIsCheckingAuth(false);
    };

    checkAuthStatus();
  }, [navigate]);
  
  const formik = useFormik<FormValues>({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await loginMutation.mutateAsync({
          password: values.password,
          userEmail: values.email,
        });

        if (response.code === 200) {
          // On successful login, the server sets the JWT_Token cookie
          const jwtToken = response.data["Bearer Token"];
          localStorage.setItem("jwtToken", jwtToken);
          await refreshUserInfo();
          navigate("/search-rooms");
        } else {
          alert(response.message || "Failed to log in. Please try again.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Login error:", error.message);
          alert(error.message || "Failed to log in. Please try again.");
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  const handleRegister = () => {
    navigate("/register");
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  // 检查认证状态时显示 loading
  if (isCheckingAuth) {
    return (
      <ContainerLayout>
        <SigninForm>
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div>Loading...</div>
          </div>
        </SigninForm>
      </ContainerLayout>
    );
  }

  return (
    <>
      <ContainerLayout>
        <SigninForm>
          <Title>Login to your account</Title>
          <AuthForm onSubmit={formik.handleSubmit}>
            <FieldGroup>
              <Input
                type="email"
                id="email"
                name="email"
                placeholder="Enter your email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                $hasError={formik.touched.email && !!formik.errors.email}
              />
              {formik.touched.email && formik.errors.email ? (
                <ErrorText $visible>{formik.errors.email}</ErrorText>
              ) : (
                <HelperText>We'll never share your email.</HelperText>
              )}
            </FieldGroup>

            <FieldGroup>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Enter your password"
                value={formik.values.password}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                $hasError={formik.touched.password && !!formik.errors.password}
              />
              {formik.touched.password && formik.errors.password ? (
                <ErrorText $visible>{formik.errors.password}</ErrorText>
              ) : (
                <HelperText>
                  Password must be between 6 and 20 characters.
                </HelperText>
              )}
            </FieldGroup>
          <ForgotPassword onClick={handleResetPassword}>
            Forgot password?
          </ForgotPassword>
          <SubmitButton type="submit">Sign In</SubmitButton>
          </AuthForm>
          <ForgotPassword onClick={handleRegister}>
            Don’t have an account? Get Started
          </ForgotPassword>
        </SigninForm>
      </ContainerLayout>
    </>
  );
};

export default Signin;
