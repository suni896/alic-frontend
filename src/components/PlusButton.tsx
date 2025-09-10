// PlusButton.tsx
import React from "react";
import styled from "styled-components";
import { TiPlus } from "react-icons/ti";

interface PlusButtonProps {
  onClick: () => void;
  title?: string;
}

const StyledPlusContainer = styled.div`
  background-color: #d9d9d9;
  width: 3rem;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
  cursor: pointer;

  &:hover {
    background-color: #c9c9c9;
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  @media (max-width: 1000px) {
    width: 2.8rem;
    height: 2.6rem;
  }
`;

const StyledPlus = styled(TiPlus)`
  color: #016532;
  font-size: 1.6rem;
  transition: all 0.2s ease;

  &:hover {
    color: #014a24;
    transform: scale(1.1);
  }

  @media (max-width: 1000px) {
    font-size: 1.4rem;
  }
`;

const PlusButton: React.FC<PlusButtonProps> = ({ onClick, title }) => {
  return (
    <StyledPlusContainer onClick={onClick} title={title}>
      <StyledPlus />
    </StyledPlusContainer>
  );
};

export default PlusButton;