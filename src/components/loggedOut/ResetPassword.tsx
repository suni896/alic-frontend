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
  text-decoration: underline;
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

const HelperText = styled.p`
  font-size: 0.9rem;
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
});

const ResetPassword = () => {
  const formik = useFormik({
    initialValues: {
      email: "",
    },
    validationSchema,
    onSubmit: (values) => {
      alert(JSON.stringify(values, null, 2));
    },
  });

  const navigate = useNavigate();

  //   const handleResetPassword = () => {
  //     navigate("")
  //   }

  const handleSignin = () => {
    navigate("/");
  };

  return (
    <ContainerLayout>
      <ResetPasswordForm>
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
        <HelperText>We'll never share your email.</HelperText>
        <ResetPasswordButton type="submit">Reset Password</ResetPasswordButton>
        <BackButton type="button" onClick={handleSignin}>
          Back to Sign-In
        </BackButton>
      </ResetPasswordForm>
    </ContainerLayout>
  );
};

export default ResetPassword;
