import { useState } from "react";
import styled from "styled-components";
import logo from "../assets/Logo.png";
import { FaGlobe } from "react-icons/fa";

interface LanguageDropdownProps {
  show: boolean;
}

const Container = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 72px;
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
  width: 60px;
  height: 66px;
  margin-right: ;
`;

const Title = styled.h1`
  color: white;
  font-size: 28px;
  font-family: "Roboto", sans-serif;
  font-weight: 500; /* Medium weight */
  margin: 0;
`;

const RightContainer = styled.div`
  display: flex;
  align-items: center;
`;

const GlobeIcon = styled(FaGlobe)`
  color: white;
  font-size: 32px;
  cursor: pointer;

  &:hover {
    color: #fc5600;
  }
`;

const LanguageDropdown = styled.div<LanguageDropdownProps>`
  position: absolute;
  background-color: white;
  border: 1px solid black;
  overflow: hidden;
  display: ${(props) => (props.show ? "block" : "none")};
`;

const DropdownOption = styled.div`
  font-size: 16px;
  color: black;
  cursor: pointer;

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
        <Title>Student Collaboration Learning System</Title>
      </LogoContainer>
      <RightContainer>
        <GlobeIcon onClick={toggleDropdown} />
        <LanguageDropdown show={dropdownOpen}>
          <DropdownOption onClick={closeDropdown}>简体中文</DropdownOption>
          <DropdownOption onClick={closeDropdown}>English</DropdownOption>
        </LanguageDropdown>
      </RightContainer>
    </Container>
  );
};

export default Navbar;
