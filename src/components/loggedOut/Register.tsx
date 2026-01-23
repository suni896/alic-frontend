import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContainerLayout from "./ContainerLayout";
import { API_BASE_URL } from "../../../config";
 // 移除未使用的 Label 引入
// 修改导入：加入 FieldGroup
import { Input, ErrorText, SubmitButton, HelperText, Title, FieldGroup, ForgotPassword, SigninForm, AuthForm } from "./SharedComponents";
import PasswordInput from "../PasswordInput";

axios.defaults.baseURL = API_BASE_URL;

// 修改注册页的表单布局间距
// styled components
// 移除本地 FieldGroup 定义，仅保留 SigninForm


interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

type RegisterProps = { setEmail: (email: string) => void };

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
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords must match")
    .required("Confirm Password is required"),
  username: Yup.string()
    .matches(
      /^[a-zA-Z0-9]*$/,
      "Username can only contain English letters and numbers"
    )
    .max(20, "Username must be at most 20 characters")
    .required("Username is required"),
});

const Register = ({ setEmail }: RegisterProps): JSX.Element => {
  const navigate = useNavigate();

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const response = await axios.post("/auth/sendmail", {
          userEmail: values.email,
          userName: values.username,
          password: values.password,
          type: "1",
        });

        if (response.data.code === 200) {
          alert("Verification email sent successfully!");
          setEmail(values.email);
          navigate("/verify-register");
        } else {
          alert(response.data.message || "Failed to send verification email.");
        }
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          console.error("Axios error:", error.response?.data || error.message);
          alert(
            error.response?.data?.message ||
              "Failed to send verification email. Please try again."
          );
        } else {
          console.error("Unexpected error:", error);
          alert("An unexpected error occurred. Please try again.");
        }
      }
    },
  });

  return (
    <ContainerLayout>
      <SigninForm>
        <Title>Register</Title>
        <AuthForm onSubmit={formik.handleSubmit}>
          <FieldGroup>
            <Input
              type="email"
              name="email"
              placeholder="Email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.email && formik.errors.email ? (
              <ErrorText>{formik.errors.email}</ErrorText>
            ) : (
              <HelperText>We'll never share your email.</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder="Username"
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {formik.touched.username && formik.errors.username ? (
              <ErrorText>{formik.errors.username}</ErrorText>
            ) : (
              <HelperText>Username can only contain English letters and numbers</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <PasswordInput
              id="password"
              name="password"
              placeholder="Password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              $hasError={formik.touched.password && !!formik.errors.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <ErrorText>{formik.errors.password}</ErrorText>
            ) : (
              <HelperText>Password must be between 6 and 20 characters.</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Comfirm password"
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              $hasError={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <ErrorText>{formik.errors.confirmPassword}</ErrorText>
            ) : (
              <HelperText>Password must be between 6 and 20 characters.</HelperText>
            )}
          </FieldGroup>

          <SubmitButton type="submit">Register</SubmitButton>
        </AuthForm>

        <ForgotPassword onClick={() => navigate("/")}>
          Already have an account? Sign In
        </ForgotPassword>
      </SigninForm>
    </ContainerLayout>
  );
}

export default Register;
