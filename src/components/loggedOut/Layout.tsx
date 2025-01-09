import React from "react";
import Navbar from "../Navbar";
import styled from "styled-components";
import { AppBar } from "@mui/material";

const StyledAppBar = styled(AppBar)`
  flex-shrink: 0;
`;

interface Props {
  children: React.ReactNode;
}

const Layout = ({ children }: Props) => {
  return (
    <>
      <StyledAppBar color="default" position="fixed">
        <Navbar />
      </StyledAppBar>
      <main>{children}</main>
    </>
  );
};

export default Layout;
