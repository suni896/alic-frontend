import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ContainerLayout from "./ContainerLayout";

const SigninForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  font-family: "Roboto", serif;
  font-weight: 700;
  text-decoration: underline;
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-family: "Roboto", -serif;
  font-weight: 400;
  margin-bottom: 0.3rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 0.8rem;
  color: black;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  margin-bottom: 1rem;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }
`;

const ErrorText = styled.div`
  color: #fc5600;
  font-size: 0.7rem;
  margin-top: -1.1rem;
  margin-bottom: 0.2rem;
`;

const RegisterButton = styled.button`
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 1rem auto 1.5rem auto;
  border-radius: 5px;

  @media (max-width: 740px) {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 55px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 0 auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;
`;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
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

const Register = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
      username: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
      handleVerifyOTP();
    },
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

  const handleVerifyOTP = () => {
    navigate("/verify?type=register");
  };

  return (
    <ContainerLayout>
      <SigninForm onSubmit={formik.handleSubmit}>
        <Title>Register</Title>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email && (
          <ErrorText>{formik.errors.email}</ErrorText>
        )}
        <Label htmlFor="username">Username</Label>
        <Input
          type="string"
          id="username"
          name="username"
          placeholder="Enter your username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleChange}
        />
        {formik.touched.username && formik.errors.username && (
          <ErrorText>{formik.errors.username}</ErrorText>
        )}
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleChange}
        />
        {formik.touched.password && formik.errors.password && (
          <ErrorText>{formik.errors.password}</ErrorText>
        )}
        <Label htmlFor="confirmPassword">Confirm Password</Label>
        <Input
          type="password"
          id="confirmPassword"
          name="confirmPassword"
          placeholder="Enter your password again"
          value={formik.values.confirmPassword}
          onChange={formik.handleChange}
          onBlur={formik.handleChange}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <ErrorText>{formik.errors.confirmPassword}</ErrorText>
        )}
        <RegisterButton type="submit">Register</RegisterButton>
        <BackButton type="button" onClick={handleBack}>
          Back to Sign-In
        </BackButton>
      </SigninForm>
    </ContainerLayout>
  );
};

export default Register;
