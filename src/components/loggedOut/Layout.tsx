import React from "react";
import Navbar from "../Navbar";
import styled from "styled-components";
import { AppBar } from "@mui/material";

const StyledAppBar = styled(AppBar)`
  flex-shrink: 0;
  z-index: 1000; /* 明确设置AppBar的z-index */
`;

const MainContent = styled.main`
  margin-top: 7vh; /* 与 Navbar 高度匹配 */
  height: calc(100vh - 7vh);
  overflow-y: auto;
  width: 100%;
`;

interface Props {
  children: React.ReactNode;
  customNavbar?: React.ReactNode; // 添加自定义导航栏属性
}

const Layout = ({ children, customNavbar }: Props) => {
  return (
    <>
      <StyledAppBar color="default" position="fixed">
        {customNavbar || <Navbar />} {/* 使用自定义导航栏或默认导航栏 */}
      </StyledAppBar>
      <MainContent>{children}</MainContent>
    </>
  );
};

export default Layout;
