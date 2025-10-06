import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Sidebar from "../components/loggedIn/Sidebar";
import MyRoom from "../components/loggedIn/MyRoom";
import Layout from "../components/loggedOut/Layout";
import RoomNavbar from "../components/loggedIn/RoomNavbar";

const Container = styled.div`
  display: flex;
  
  /* 添加左侧边距，与侧边栏宽度相同 */
  & > :nth-child(2) {
    margin-left: 280px;
    width: calc(100vw - 280px); /* 确保内容区域宽度正确 因为MyRoom组件内部的Container设置了 position: fixed */
  }
`;

const MyRoomPage: React.FC = () => {
  const location = useLocation();
  const { groupId } = useParams();

  // Extract the state from the location or fallback to default values
  const { title = groupId, desc = "No description available." } =
    location.state || {};

  const groupIdNumber = groupId ? parseInt(groupId, 10) : undefined;
  
  return (
    <Layout customNavbar={<RoomNavbar groupId={groupIdNumber} />}>
      <Container>
        <Sidebar />
        <MyRoom title={title} desc={desc} groupId={groupIdNumber} />
      </Container>
    </Layout>
  );
};

export default MyRoomPage;
