import React from "react";
import { styled } from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import MyClass from "../components/loggedIn/MyClass";
import TagNavbar from "../components/loggedIn/TagNavbar";

// Container
const Container = styled.div`
  display: flex;

  & > :nth-child(2) {
    margin-left: 240px;
    width: calc(100vw - 240px);
  }
`;

const MyClassPage: React.FC = () => {
  const location = useLocation();
  const { tagId } = useParams();

  // Extract the state from the location or fallback to default values
  const { title = tagId, desc = "No description available." } =
    location.state || {};
  const tagIdNumber = tagId ? parseInt(tagId, 10) : undefined;
  return (
    <Layout customNavbar={<TagNavbar tagId={tagIdNumber} />}>
      <Container>
        <Sidebar />
        <MyClass title={title} desc={desc} />
      </Container>
    </Layout>
  );
};

export default MyClassPage;
