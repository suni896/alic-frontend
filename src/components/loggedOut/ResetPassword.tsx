import React, { useState } from "react";
import ContainerLayout from "./ContainerLayout";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

const ResetPasswordForm = styled.form`
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

const ResetPasswordButton = styled.button`
  width: 40%;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 1rem auto 1.5rem auto;
  border-radius: 5px;
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
  margin: 3rem auto 0 auto;
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
});

const ResetPassword: React.FC = () => {
  const [isConfirmationView, setIsConfirmationView] = useState(false);

  const formik = useFormik({
    initialValues: {
      email: "",
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
  const handleSignin = () => {
    navigate("/");
  };

  const handleVerifyOTP = () => {
    navigate("/verify?type=reset");
  };

  const handleViewTransition = () => {
    if (formik.values.email && !formik.errors.email) {
      setIsConfirmationView(true);
    } else {
      formik.setTouched({ email: true });
    }
  };

  return (
    <ContainerLayout>
      {!isConfirmationView ? (
        <ResetPasswordForm onSubmit={formik.handleSubmit}>
          <Title>Reset Password</Title>
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
          <ResetPasswordButton type="button" onClick={handleViewTransition}>
            Reset Password
          </ResetPasswordButton>
          <BackButton type="button" onClick={handleSignin}>
            Back to Sign-In
          </BackButton>
        </ResetPasswordForm>
      ) : (
        <ResetPasswordForm onSubmit={formik.handleSubmit}>
          <Title>Reset Password</Title>
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
          <ResetPasswordButton type="submit">Submit</ResetPasswordButton>
          <BackButton type="button" onClick={handleSignin}>
            Back to Sign-In
          </BackButton>
        </ResetPasswordForm>
      )}
    </ContainerLayout>
  );
};

export default ResetPassword;
