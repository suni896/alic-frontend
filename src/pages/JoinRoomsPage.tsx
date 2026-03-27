import { useState } from "react";
import Layout from "../components/ui/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import JoinRooms from "../components/loggedIn/JoinRooms";
import Navbar from "../components/loggedIn/Navbar";
import { styled } from "styled-components";

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

const JoinRoomsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout customNavbar={<Navbar onMenuClick={() => setSidebarOpen(true)} />}>
      <Container>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
