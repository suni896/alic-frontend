import { useFormik } from "formik";
import * as Yup from "yup";
import { useNavigate } from "react-router-dom";
import ContainerLayout from "./ContainerLayout";
import { useSendRegisterEmail } from "../../hooks/queries/useAuth";
import { useTranslation } from "react-i18next";
import { Input, ErrorText, SubmitButton, HelperText, Title, FieldGroup, ForgotPassword, SigninForm, AuthForm, PasswordInput } from "../ui/SharedComponents";

interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

type RegisterProps = { setEmail: (email: string) => void };

const Register = ({ setEmail }: RegisterProps): JSX.Element => {
  const { t } = useTranslation();
  const validationSchema = Yup.object({
    email: Yup.string()
      .email(t('auth.invalidEmail'))
      .required(t('auth.emailRequired')),
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
    username: Yup.string()
      .matches(
        /^[a-zA-Z0-9]*$/,
        t('auth.usernameChars')
      )
      .max(20, t('auth.usernameMaxLength'))
      .required(t('auth.usernameRequired')),
  });
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
          alert(t('auth.verificationEmailSent'));
          setEmail(values.email);
          navigate("/verify-register");
        } else {
          alert(response.message || t('auth.sendVerificationFailed'));
        }
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Send email error:", error.message);
          alert(error.message || t('auth.sendVerificationFailed'));
        } else {
          console.error("Unexpected error:", error);
          alert(t('auth.unexpectedError'));
        }
      }
    },
  });

  return (
    <ContainerLayout>
      <SigninForm>
        <Title>{t('auth.registerTitle')}</Title>
        <AuthForm onSubmit={formik.handleSubmit}>
          <FieldGroup>
            <Input
              type="email"
              name="email"
              placeholder={t('auth.emailPlaceholder')}
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.email && !!formik.errors.email}
            />
            {formik.touched.email && formik.errors.email ? (
              <ErrorText $visible>{formik.errors.email}</ErrorText>
            ) : (
              <HelperText>{t('auth.emailHelper')}</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <Input
              type="text"
              id="username"
              name="username"
              placeholder={t('auth.usernamePlaceholder')}
              value={formik.values.username}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.username && !!formik.errors.username}
            />
            {formik.touched.username && formik.errors.username ? (
              <ErrorText $visible>{formik.errors.username}</ErrorText>
            ) : (
              <HelperText>{t('auth.usernameHelper')}</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <PasswordInput
              id="password"
              name="password"
              placeholder={t('auth.passwordPlaceholder')}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.password && !!formik.errors.password}
            />
            {formik.touched.password && formik.errors.password ? (
              <ErrorText $visible>{formik.errors.password}</ErrorText>
            ) : (
              <HelperText>{t('auth.passwordHelper')}</HelperText>
            )}
          </FieldGroup>

          <FieldGroup>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder={t('auth.confirmPasswordPlaceholder')}
              value={formik.values.confirmPassword}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              $hasError={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <ErrorText $visible>{formik.errors.confirmPassword}</ErrorText>
            ) : (
              <HelperText>{t('auth.passwordHelper')}</HelperText>
            )}
          </FieldGroup>

          <SubmitButton type="submit">{t('auth.register')}</SubmitButton>
        </AuthForm>

        <ForgotPassword onClick={() => navigate("/")}>
          {t('auth.hasAccount')}
        </ForgotPassword>
      </SigninForm>
    </ContainerLayout>
  );
}

export default Register;
