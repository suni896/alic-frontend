import React from "react";
import { styled } from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import MyClass from "../components/loggedIn/MyClass";

const Container = styled.div`
  display: flex;
`;

const MyClassPage: React.FC = () => {
  const location = useLocation();
  const { id } = useParams();

  // Extract the state from the location or fallback to default values
  const { title = id, desc = "No description available." } =
    location.state || {};

  return (
    <Layout>
      <Container>
        <Sidebar />
        <MyClass title={title} desc={desc} />
      </Container>
    </Layout>
  );
};

export default MyClassPage;
