import { useState } from "react";
import styled from "styled-components";
import logo from "../assets/Logo.png";
import { FaGlobe } from "react-icons/fa";

interface LanguageDropdownProps {
  $show: boolean;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 7vh;
  background-color: #016532;
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 1000;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
`;

const Logo = styled.img`
  width: 40px;
  height: 46px;
  margin-right: 20px;
`;

const Title = styled.h1`
  color: white;
  font-size: 1.5rem;
  font-family: "Roboto", sans-serif;
  font-weight: 500;
  margin: 0;

  @media (max-width: 740px) {
    font-size: 0.9rem;
    margin-right: 2rem;
  }
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
  position: relative;
  margin-right: 20px;
`;

const GlobeIcon = styled(FaGlobe)`
  color: white;
  font-size: 28px;
  cursor: pointer;

  &:hover {
    color: #fc5600;
  }
`;

const LanguageDropdown = styled.div<LanguageDropdownProps>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  left: -120px;

  width: 100px;
  background-color: white;
  border: 1px solid #ccc;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: ${(props) => (props.$show ? "block" : "none")};
  z-index: 1001;

  @media (max-width: 740px) {
    top: 160%;
    left: -160%;
    transform: none;
  }
`;

const DropdownOption = styled.div`
  font-size: 16px;
  text-align: center;
  color: black;
  cursor: pointer;
  border-bottom: 1px solid black;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: #e0e0e0;
  }
`;

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const closeDropdown = () => {
    setDropdownOpen(false);
  };

  return (
    <Container>
      <LogoContainer>
        <Logo src={logo} alt="EduHK Logo" />
        <Title>
          Artificial Intelligence and Learning Analytics in Collaboration
        </Title>
      </LogoContainer>
      <RightContainer>
        <LanguageDropdown $show={dropdownOpen}>
          {/* <DropdownOption onClick={closeDropdown}>简体中文</DropdownOption> */}
          <DropdownOption onClick={closeDropdown}>English</DropdownOption>
        </LanguageDropdown>
        <GlobeIcon onClick={toggleDropdown} />
      </RightContainer>
    </Container>
  );
};

export default Navbar;
