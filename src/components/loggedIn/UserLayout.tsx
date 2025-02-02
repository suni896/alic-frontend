import React from "react";
import styled from "styled-components";
import Navbar from "../Navbar";
import Sidebar from "./Sidebar";

interface Props {
  children: React.ReactNode;
}

const Wrapper = styled.div`
  display: flex;
  width: 100%; /* Full width of the screen */
  margin-top: 72px; /* Account for fixed Navbar height */
  height: calc(100vh - 72px); /* Full height minus Navbar height */
`;

const UserLayout: React.FC<Props> = ({ children }) => {
  return (
    <>
      {/* Navbar */}
      <Navbar />

      {/* Sidebar and Main Content */}
      <Wrapper>
        <Sidebar />
        <main>{children}</main>
      </Wrapper>
    </>
  );
};

export default UserLayout;
