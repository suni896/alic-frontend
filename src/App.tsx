import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchRoomsPage from "./pages/SearchRoomsPage";
import MyClassPage from "./pages/MyClassPage";
import VerifyOTPRegister from "./components/loggedOut/VerifyOTPRegister";
import VerifyOTPReset from "./components/loggedOut/VerifyOTPReset";
import { useState } from "react";
import SigninPage from "./pages/SigninPage";
import MyRoomPage from "./pages/MyRoomPage";
import JoinGroupPage from "./pages/JoinGroupPage";
import RedirectHandler from "./components/RedirectHandler";
import { UserProvider } from "./components/loggedIn/UserContext";
import { RoomProvider } from "./components/loggedIn/RoomContext";

const Debugger: React.FC = () => {
  return null;
};

const AppRoutes: React.FC<{ email: string; setEmail: React.Dispatch<React.SetStateAction<string>>; handleVerifySuccess: () => void }> = ({ email, setEmail, handleVerifySuccess }) => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const groupId = searchParams.get('groupId');
  const token = searchParams.get('token');

  // 如果在/group/join_group路径且有groupId和token参数，显示重定向处理器
  if (location.pathname === '/group/join_group' && groupId && token) {
    return <RedirectHandler />;
  }

  return (
    <Routes>
      <Route path="/" element={<SigninPage />} />
      <Route
         path="/register"
         element={<RegisterPage setEmail={setEmail} />}
       />
       <Route
         path="/reset-password"
         element={<ResetPasswordPage setEmail={setEmail} />}
       />
      <Route
        path="/verify-register"
        element={
          <VerifyOTPRegister
            onVerifySuccess={handleVerifySuccess}
            email={email}
          />
        }
      />
      <Route
        path="/verify-reset"
        element={
          <VerifyOTPReset
            onVerifySuccess={handleVerifySuccess}
            email={email}
          />
        }
      />
      <Route path="/search-rooms" element={<SearchRoomsPage />} />
      <Route path="/my-class/:tagId" element={<MyClassPage />} />
      <Route path="/my-room/:groupId" element={<MyRoomPage />} />
      {/* <Route path="/room/:groupId" element={<MyRoomPage />} /> */}
      <Route path="/join/:groupId/:inviteCode" element={<JoinGroupPage />} />
       <Route path="/group/join_group" element={<RedirectHandler />} />
       {/* <Route path="/redirect" element={<RedirectHandler />} /> */}
    </Routes>
  );
};

function App() {
  const [email, setEmail] = useState<string>("");

  const handleVerifySuccess = () => {
    // Handle the success scenario, e.g., redirecting or storing the token
  };

  return (
    <BrowserRouter>
      <UserProvider>
        <RoomProvider>
          <Debugger />
          <AppRoutes email={email} setEmail={setEmail} handleVerifySuccess={handleVerifySuccess} />
        </RoomProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
