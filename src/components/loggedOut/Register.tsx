import { useState, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import styled from "styled-components";
import image1 from "../../assets/collaborativeLearning-1.png";
import image2 from "../../assets/collaborativeLearning-2.png";
import image3 from "../../assets/collaborativeLearning-3.png";
import LeftSection from "./LeftSection";
import { useNavigate } from "react-router-dom";

const images = [image1, image2, image3];

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
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

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
  text-decoration: underline;
  margin-bottom: 0.5rem;
`;

const Label = styled.label`
  font-size: 1rem;
  font-family: "Roboto Condensed", sans-serif;
  font-weight: 500;
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

const RegisterButton = styled.button`
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
});

const Register = () => {
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
      username: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const navigate = useNavigate();

  const handleBack = () => {
    navigate("/");
  };

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
            <RegisterButton type="submit">Register</RegisterButton>
            <BackButton type="button" onClick={handleBack}>
              Back to Sign-In
            </BackButton>
          </SigninForm>
        </RightSection>
      </Wrapper>
    </Container>
  );
};

export default Register;
