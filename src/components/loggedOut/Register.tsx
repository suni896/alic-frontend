import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ContainerLayout from "./ContainerLayout";
import { useSendRegisterEmail } from "../../hooks/queries/useAuth";
import { Input, ErrorText, SubmitButton, HelperText, Title, FieldGroup, ForgotPassword, SigninForm, AuthForm, PasswordInput } from "../ui/SharedComponents";

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
  const sendRegisterEmailMutation = useSendRegisterEmail();

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
        const response = await sendRegisterEmailMutation.mutateAsync({
          userEmail: values.email,
          userName: values.username,
          password: values.password,
        });

        if (response.code === 200) {
          alert("Verification email sent successfully!");
          setEmail(values.email);
          navigate("/verify-register");
        } else {
          alert(response.message || "Failed to send verification email.");
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Send email error:", error.message);
          alert(error.message || "Failed to send verification email. Please try again.");
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
              onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.email && !!formik.errors.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <ErrorText $visible>{formik.errors.email}</ErrorText>
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
              onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.username && !!formik.errors.username}
            />
            {formik.touched.username && formik.errors.username ? (
              <ErrorText $visible>{formik.errors.username}</ErrorText>
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
              onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.password && !!formik.errors.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <ErrorText $visible>{formik.errors.password}</ErrorText>
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
              onFocus={(e) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <ErrorText $visible>{formik.errors.confirmPassword}</ErrorText>
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
