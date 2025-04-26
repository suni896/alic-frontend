import styled from "styled-components";
import { useLocation, useParams } from "react-router-dom";
import Sidebar from "../components/loggedIn/Sidebar";
import MyRoom from "../components/loggedIn/MyRoom";
import { AppBar } from "@mui/material";
import RoomNavbar from "../components/loggedIn/RoomNavbar";

const StyledAppBar = styled(AppBar)`
  flex-shrink: 0;
`;

const Container = styled.div`
  display: flex;
`;

const MyRoomPage: React.FC = () => {
  const location = useLocation();
  const { groupId } = useParams();

  // Extract the state from the location or fallback to default values
  const { title = groupId, desc = "No description available." } =
    location.state || {};

  const groupIdNumber = groupId ? parseInt(groupId, 10) : undefined;
  return (
    <>
      <StyledAppBar color="default" position="fixed">
        <RoomNavbar groupId={groupIdNumber} />
        <Container>
          <Sidebar />
          <MyRoom title={title} desc={desc} groupId={groupIdNumber} />{" "}
          {/* Pass props */}
        </Container>
      </StyledAppBar>
    </>
  );
};

export default MyRoomPage;
