import { useState } from "react";
import SearchRooms from "../components/loggedIn/SearchRooms";
import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import Navbar from "../components/Navbar";
import { styled } from "styled-components";

// Container
const Container = styled.div`
  display: flex;
  
  /* 添加左侧边距，与侧边栏宽度相同 */
  & > :nth-child(2) {
    margin-left: 0;
    width: 100vw;
    
    @media (min-width: 48rem) {
      margin-left: 16rem;
      width: calc(100vw - 16rem);
    }
  }
`;

const SearchRoomsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <Layout customNavbar={<Navbar onMenuClick={() => setSidebarOpen(true)} />}>
      <Container>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <SearchRooms />
      </Container>
    </Layout>
  );
};

export default SearchRoomsPage;
