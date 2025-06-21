import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import ContainerLayout from "./ContainerLayout";
import axios from "axios";
import apiClient from "./apiClient";

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
  margin: 1.5% auto;

  @media (max-width: 740px) {
    font-size: 1.7rem;
    margin: 2.5% auto;
  }

  @media (max-height: 720px) {
    margin: 0 auto;
  }
`;

const Label = styled.label`
  font-size: 0.9rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 0.8vh;

  @media (max-width: 740px) {
    font-size: 0.8rem;
    margin-bottom: 0.1vh;
  }

  @media (max-height: 720px) {
    margin-bottom: 0;
    font-size: 0.8rem;
  }
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

  @media (max-width: 740px) {
    margin-bottom: 3%;
  }

  @media (max-height: 720px) {
    height: 8%;
  }
`;

const ErrorText = styled.div`
  color: #fc5600;
  font-size: 0.7rem;
  margin-top: -3%;
  margin-bottom: 0.5%;

  @media (max-width: 740px) {
    margin-bottom: 0.5%;
  }

  @media (max-height: 720px) {
    margin-top: -4%;
  }
`;

const RegisterButton = styled.button<{ hasError: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 1rem auto 1.5rem auto;
  border-radius: 5px;
  background-color: black;
  color: white;

  @media (max-width: 740px) {
    width: 60%;
    height: 5vh;
    margin-bottom: ${({ hasError }) => (hasError ? "2%" : "1.5rem")};
  }

  @media (max-width: 740px) and (min-height: 720px) {
    margin: 10% auto;
  }
  @media (max-height: 720px) {
    height: 8%;
    margin: 2% auto;
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

  @media (max-width: 740px) {
    width: 80%;
    height: 5vh;
  }

  @media (max-height: 720px) {
    height: 8%;
    margin: 1% auto;
  }
`;

interface RegisterFormValues {
  email: string;
  username: string;
  password: string;
  confirmPassword: string;
}

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

const Register: React.FC<{ setEmail: (email: string) => void }> = ({
  setEmail,
}) => {
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
        const response = await apiClient.post("/auth/sendmail", {
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

  const handleBack = () => {
    navigate("/");
  };

  const hasErrors =
    (formik.touched.email && formik.errors.email) ||
    (formik.touched.username && formik.errors.username) ||
    (formik.touched.password && formik.errors.password) ||
    (formik.touched.confirmPassword && formik.errors.confirmPassword);

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
          type="text"
          id="username"
          name="username"
          placeholder="Enter your username"
          value={formik.values.username}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
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
          onBlur={formik.handleBlur}
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
          onBlur={formik.handleBlur}
        />
        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
          <ErrorText>{formik.errors.confirmPassword}</ErrorText>
        )}
        <RegisterButton type="submit" hasError={!!hasErrors}>
          Register
        </RegisterButton>
        <BackButton type="button" onClick={handleBack}>
          Back to Sign-In
        </BackButton>
      </SigninForm>
    </ContainerLayout>
  );
};

export default Register;
