import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import JoinRooms from "../components/loggedIn/JoinRooms";
import { styled } from "styled-components";

const Container = styled.div`
  display: flex;
`;

const JoinRoomsPage = () => {
  return (
    <Layout>
      <Container>
        <Sidebar />
        <JoinRooms
          onClose={function (): void {
            throw new Error("Function not implemented.");
          }}
        />
      </Container>
    </Layout>
  );
};

export default JoinRoomsPage;
