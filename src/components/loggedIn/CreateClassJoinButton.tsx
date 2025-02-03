import styled from "styled-components";
import { IoMdPersonAdd } from "react-icons/io";
import { MdPeopleAlt } from "react-icons/md";

const CreateClassJoinButtonContainer = styled.div`
  background: white;

  width: 70%;
`;

const NewContainer = styled.button`
  display: flex;
  width: 100%;
  height: 1.6rem;
  align-items: center;
  gap: 1rem;
  margin-top: 0.3rem;
  border: solid #016532;
  background: #016532;
`;

const StyledIoMdPersonAdd = styled(IoMdPersonAdd)`
  width: 20px;
  height: 20px;
`;

const StyledMdPeopleAlt = styled(MdPeopleAlt)`
  width: 20px;
  height: 20px;
  margin-left: 2px;x
`;

const StyledText = styled.span`
  font-family: Roboto;
  font-weight: 700;
  font-size: 0.71rem;
`;

const CreateClassJoinButton = () => {
  return (
    <CreateClassJoinButtonContainer>
      <NewContainer>
        <StyledIoMdPersonAdd />
        <StyledText>CREATE NEW TAG</StyledText>
      </NewContainer>
    </CreateClassJoinButtonContainer>
  );
};

export default CreateClassJoinButton;
