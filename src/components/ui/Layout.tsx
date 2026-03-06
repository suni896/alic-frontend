import React from "react";
import Navbar from "../loggedIn/Navbar";
import styled from "styled-components";
import { AppBar } from "@mui/material";

const StyledAppBar = styled(AppBar)`
  flex-shrink: 0;
  z-index: 1000; /* 明确设置AppBar的z-index */
`;

const MainContent = styled.main<{ $hasNavbar: boolean }>`
  margin-top: ${(props) => (props.$hasNavbar ? "3.5rem" : "0")};
  height: ${(props) => (props.$hasNavbar ? "calc(100vh - 3.5rem)" : "100vh")};
  overflow-y: hidden;
  width: 100%;

  /* tablet >= 768px */
  @media (min-width: 48rem) {
    margin-top: ${(props) => (props.$hasNavbar ? "4.5rem" : "0")};
    height: ${(props) => (props.$hasNavbar ? "calc(100vh - 4.5rem)" : "100vh")};
  }

  /* desktop >= 1024px */
  @media (min-width: 64rem) {
    margin-top: ${(props) => (props.$hasNavbar ? "5rem" : "0")};
    height: ${(props) => (props.$hasNavbar ? "calc(100vh - 5rem)" : "100vh")};
  }
`;

interface Props {
  children: React.ReactNode;
  customNavbar?: React.ReactNode; // 添加自定义导航栏属性
  hideNavbar?: boolean; // 新增：隐藏导航栏
}

const Layout = ({ children, customNavbar, hideNavbar = false }: Props) => {
  const hasNavbar = !hideNavbar;

  return (
    <>
      {hasNavbar && (
        <StyledAppBar color="default" position="fixed">
          {customNavbar || <Navbar />} {/* 使用自定义导航栏或默认导航栏 */}
        </StyledAppBar>
      )}
      <MainContent $hasNavbar={hasNavbar}>{children}</MainContent>
    </>
  );
};

export default Layout;
