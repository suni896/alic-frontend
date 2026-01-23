// ResetPasswordPage.tsx
import React from "react";
import Layout from "../components/loggedOut/Layout";
import ResetPassword from "../components/loggedOut/ResetPassword";

interface ResetPasswordPageProps {
  setEmail: React.Dispatch<React.SetStateAction<string>>;
}

const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ setEmail }) => {
  return (
    <Layout hideNavbar>
      <ResetPassword setEmail={setEmail} />
    </Layout>
  );
};

export default ResetPasswordPage;
