import SearchRooms from "../components/loggedIn/SearchRooms";
import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import { styled } from "styled-components";

// Container
const Container = styled.div`
  display: flex;
  
  /* 添加左侧边距，与侧边栏宽度相同 */
  & > :nth-child(2) {
    margin-left: 16rem;
    width: calc(100vw - 16rem); 
  }
`;

const SearchRoomsPage = () => {
  return (
    <Layout>
      <Container>
        <Sidebar />
        <SearchRooms />
      </Container>
    </Layout>
  );
};

export default SearchRoomsPage;
