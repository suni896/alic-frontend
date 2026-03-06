import { useState } from "react";
import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Sidebar from "../components/loggedIn/Sidebar";
import MyRoom from "../components/loggedIn/MyRoom";
import Layout from "../components/loggedOut/Layout";
import RoomNavbar from "../components/loggedIn/RoomNavbar";

// Container
const Container = styled.div`
  display: flex;

  & > :nth-child(2) {
    margin-left: 0;
    width: 100vw;
    
    @media (min-width: 48rem) {
      margin-left: 14rem;
      width: calc(100vw - 14rem);
    }

    /* desktop >= 1024px */
    @media (min-width: 64rem) {
      margin-left: 16rem;
      width: calc(100vw - 16rem);
    }
  }
`;

const MyRoomPage = () => {
  const location = useLocation();
  const { groupId } = useParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Extract the state from the location or fallback to default values
  const { title = groupId, desc = "No description available." } =
    location.state || {};

  const groupIdNumber = groupId ? parseInt(groupId, 10) : undefined;
  
  return (
    <Layout customNavbar={<RoomNavbar groupId={groupIdNumber} onMenuClick={() => setSidebarOpen(true)} />}>
      <Container>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <MyRoom title={title} desc={desc} groupId={groupIdNumber} />
      </Container>
    </Layout>
  );
};

export default MyRoomPage;
