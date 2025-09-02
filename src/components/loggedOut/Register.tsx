import React from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ContainerLayout from "./ContainerLayout";
import { API_BASE_URL } from "../../../config";

axios.defaults.baseURL = API_BASE_URL;

const SigninForm = styled.form`
  flex: 1;
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
  font-size: 1rem;
  font-family: "Roboto", serif;
  font-weight: 400;
  margin-bottom: 2px;

  @media (max-width: 740px) {
    font-size: 0.8rem;
  }
`;

const Input = styled.input`
  padding: 0.75rem;
  font-size: 1rem;
  color: black;
  height: 40px;
  border: 1px solid #ccc;
  border-radius: 6px;
  background-color: white;
  width: 100%;
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: #016532;
  }

  @media (max-width: 740px) {
    height: 5vh;
  }
`;

const ErrorText = styled.p`
  font-size: 0.8rem;
  color: #fc5600;
  margin-top: 0;
  margin-bottom: 3px;
  min-height: 1.2em; /* 预留固定高度 */
  // line-height: 1.2;

  @media (max-width: 740px) {
    font-size: 0.7rem;
    min-height: 1.1em;
  }

  @media (max-height: 720px) {
    margin: 0;
    min-height: 1em;
  }
`;

const RegisterButton = styled.button<{ $hasError: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  height: 40px;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: black;
  color: white;

  @media (max-width: 740px) {
    width: 60%;
    margin-top: 10%;
    margin-bottom: 6%;
  }

  @media (max-height: 720px) {
    margin-bottom: 0;
    margin-top: 0;
  }

  @media (max-width: 740px) and (min-height: 820px) {
    height: 5vh;
    margin-bottom: 8%;
  }
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60%;
  height: 40px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 20px auto 0 auto;
  border-radius: 5px;
  background-color: #016532;
  color: white;

  @media (max-width: 740px) {
    width: 80%;
    font-size: 0.9rem;
    margin-top: 15%;
  }

  @media (max-height: 720px) {
    margin-top: 8%;
  }
  @media (max-width: 740px) and (min-height: 820px) {
    height: 6vh;
    margin-top: 18%;
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
        <ErrorText>
          {formik.touched.email && formik.errors.email ? formik.errors.email : ''}
        </ErrorText>
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
        <ErrorText>
          {formik.touched.username && formik.errors.username ? formik.errors.username : ''}
        </ErrorText>
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
        <ErrorText>
          {formik.touched.password && formik.errors.password ? formik.errors.password : ''}
        </ErrorText>
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
        <ErrorText>
          {formik.touched.confirmPassword && formik.errors.confirmPassword ? formik.errors.confirmPassword : ''}
        </ErrorText>
        <RegisterButton type="submit" $hasError={!!hasErrors}>
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
