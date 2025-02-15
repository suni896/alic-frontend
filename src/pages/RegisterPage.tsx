import React from "react";
import Layout from "../components/loggedOut/Layout";
import Register from "../components/loggedOut/Register";

interface RegisterPageProps {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ setEmail }) => {
  return (
    <Layout>
      <Register setEmail={setEmail} />
    </Layout>
  );
};

export default RegisterPage;
