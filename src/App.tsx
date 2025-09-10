import { BrowserRouter, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchRoomsPage from "./pages/SearchRoomsPage";
import MyClassPage from "./pages/MyClassPage";
import VerifyOTPRegister from "./components/loggedOut/VerifyOTPRegister";
import VerifyOTPReset from "./components/loggedOut/VerifyOTPReset";
import { useState } from "react";
import SigninPage from "./pages/SigninPage";
import MyRoomPage from "./pages/MyRoomPage";
import { UserProvider } from "./components/loggedIn/UserContext";
import { RoomProvider } from "./components/loggedIn/RoomContext";

const Debugger: React.FC = () => {
  return null;
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
          </Routes>
        </RoomProvider>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
