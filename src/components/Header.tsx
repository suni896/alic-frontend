// components/ModalHeader.tsx
import styled from "styled-components";
import { IconType } from "react-icons";
import CloseButton from "./CloseButton";

interface ModalHeaderProps {
  icon: IconType;
  title: string;
  onClose: () => void;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ icon: Icon, title, onClose }) => {
  return (
    <Header>
      <HeaderTitle>
        <StyledIcon as={Icon} />
        {title}
      </HeaderTitle>
      <CloseButton onClick={onClose} />
    </Header>
  );
};

export default ModalHeader;
const Header = styled.div`
  background: #016532;
  color: var(--white);
  padding: 1.5rem 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 10px rgba(1, 101, 50, 0.2);
  margin: -2.5rem -2.5rem 2rem -2.5rem;
  border-radius: 16px 16px 0 0;

  @media (max-width: 700px) {
    margin: -2rem -2rem 2rem -2rem;
    padding: 1.25rem 1.5rem;
  }

  @media (max-width: 400px) {
    margin: -1.5rem -1.5rem 2rem -1.5rem;
    padding: 1rem 1.25rem;
  }
`;

const HeaderTitle = styled.h2`
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 500px) {
    font-size: 1.2rem;
  }
`;

const StyledIcon = styled.div`
  color: var(--white);
  font-size: 1.5rem;
`;