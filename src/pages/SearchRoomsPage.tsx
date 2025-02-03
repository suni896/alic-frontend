import SearchRooms from "../components/loggedIn/SearchRooms";
import Layout from "../components/loggedOut/Layout";
import Sidebar from "../components/loggedIn/Sidebar";
import { styled } from "styled-components";

const Container = styled.div`
  display: flex;
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
