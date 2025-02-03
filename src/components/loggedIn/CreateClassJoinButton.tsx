import styled from "styled-components";
import { IoMdPersonAdd } from "react-icons/io";
import { MdPeopleAlt } from "react-icons/md";
import { FiTag } from "react-icons/fi";

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

const StyledText = styled.span`
  font-family: Roboto;
  font-weight: 700;
  font-size: 0.71rem;
`;

const CreateClassJoinButton = () => {
  return (
    <CreateClassJoinButtonContainer>
      <NewContainer>
        <FiTag />
        <StyledText>CREATE NEW TAG</StyledText>
      </NewContainer>
    </CreateClassJoinButtonContainer>
  );
};

export default CreateClassJoinButton;
