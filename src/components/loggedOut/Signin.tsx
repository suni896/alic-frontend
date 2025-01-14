import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import styled from "styled-components";
import image1 from "../../assets/collaborativeLearning-1.png";
import image2 from "../../assets/collaborativeLearning-2.png";
import image3 from "../../assets/collaborativeLearning-3.png";
import LeftSection from "./LeftSection"; // Adjust the path as necessary

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: white;
  margin-top: 30px;
`;

const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  width: 90%;
  height: 70%;
  max-width: 1300px;
  background: white;
  overflow: hidden;
  border: 1px solid #016532;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1); /* Drop shadow */
`;

const images = [image1, image2, image3];

const RightSection = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 0.5rem 2rem;
`;

const SigninForm = styled.form`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 1rem;
`;

const Label = styled.label`
  font-size: 1.2rem;
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 500;
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
  font-size: 0.9rem;
  color: #fc5600;
  margin-top: -0.8rem;
  margin-bottom: 1rem;
`;

const HelperText = styled.p`
  font-size: 0.9rem;
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
  border-radius: 0;
`;

const RegisterButton = styled.button`
  width: 60%;
  height: 55px;
  padding: 0.75rem;
  font-size: 1rem;
  cursor: pointer;
  margin: 3rem auto 0 auto;
  border-radius: 0;
  background-color: #016532;
  color: white;
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
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  return (
    <Container>
      <Wrapper>
        <LeftSection
          currentImage={images[currentIndex]}
          currentIndex={currentIndex}
          images={images}
        />
        <RightSection>
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
              onBlur={formik.handleChange}
            />
            {formik.touched.password && formik.errors.password ? (
              <ErrorText>{formik.errors.password}</ErrorText>
            ) : (
              <HelperText>Minimum 8 characters.</HelperText>
            )}
            <SigninButton type="submit">Sign In</SigninButton>
            <ForgotPassword>Forgot password?</ForgotPassword>
            <RegisterButton type="button">CREATE AN ACCOUNT</RegisterButton>
          </SigninForm>
        </RightSection>
      </Wrapper>
    </Container>
  );
};

export default Signin;
