import Layout from "../components/loggedOut/Layout";
import Signin from "../components/loggedOut/Signin";

const SigninPage = () => {
  return (
    <>
      <Layout hideNavbar>
        <Signin />
      </Layout>
    </>
  );
};

export default SigninPage;
