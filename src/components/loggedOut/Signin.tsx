import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContainerLayout from "./ContainerLayout";

axios.defaults.baseURL = "https://112.74.92.135:443";

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
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
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

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
`;

const HelperText = styled.p`
  font-size: 0.8rem;
  color: #666;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
`;

const SigninButton = styled.button`
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 1rem auto 1.5rem auto;
  border-radius: 5px;
`;

const RegisterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 55px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 3rem auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;

  @media (max-width: 740px) {
    margin-top: 2rem;
    margin-bottom: 1rem;
  }
`;

const ForgotPassword = styled.a`
  color: #fc5600;
  text-decoration: underline;

  &:hover {
    color: #016532;
  }
`;

const validationSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

const Signin = () => {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Send login request to the backend
        const response = await axios.post("/auth/login", {
          userEmail: values.email,
          password: values.password,
        });

        // Handle successful response
        if (response.data.code === 0) {
          const token = response.data.data["Bearer Token"]; // Extract the token
          alert("Login successful!");
          localStorage.setItem("authToken", token); // Store the token in local storage
        } else {
          alert(
            response.data.message ||
              "Login failed. Please check your credentials."
          );
        }
      } catch (error) {
        // Handle errors
        console.error("Login error:", error);
        alert("Login failed. Please check your credentials and try again.");
      }
    },
  });

  const handleRegister = () => {
    navigate("/register");
  };

  const handleResetPassword = () => {
    navigate("/reset-password");
  };

  return (
    <ContainerLayout>
      <SigninForm onSubmit={formik.handleSubmit}>
        <Title>Sign-In</Title>
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          placeholder="Enter your email"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.email && formik.errors.email ? (
          <ErrorText>{formik.errors.email}</ErrorText>
        ) : (
          <HelperText>We'll never share your email.</HelperText>
        )}
        <Label htmlFor="password">Password</Label>
        <Input
          type="password"
          id="password"
          name="password"
          placeholder="Enter your password"
          value={formik.values.password}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {formik.touched.password && formik.errors.password ? (
          <ErrorText>{formik.errors.password}</ErrorText>
        ) : (
          <HelperText>Minimum 8 characters.</HelperText>
        )}
        <SigninButton type="submit">Sign In</SigninButton>
        <ForgotPassword onClick={handleResetPassword}>
          Forgot password?
        </ForgotPassword>
        <RegisterButton type="button" onClick={handleRegister}>
          CREATE AN ACCOUNT
        </RegisterButton>
      </SigninForm>
    </ContainerLayout>
  );
};

export default Signin;
