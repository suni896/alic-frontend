import Layout from "../components/ui/Layout";
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
