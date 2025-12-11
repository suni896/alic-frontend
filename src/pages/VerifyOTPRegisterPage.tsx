import React from "react";
import Layout from "../components/loggedOut/Layout";
import VerifyOTPRegister from "../components/loggedOut/VerifyOTPRegister";

interface VerifyOTPRegisterPageProps {
  onVerifySuccess: (token: string) => void;
  email: string;
}

const VerifyOTPRegisterPage: React.FC<VerifyOTPRegisterPageProps> = ({ email, onVerifySuccess }) => {
  return (
    <Layout>
      <VerifyOTPRegister  email={ email } onVerifySuccess={ onVerifySuccess }/>
    </Layout>
  );
};

export default VerifyOTPRegisterPage;