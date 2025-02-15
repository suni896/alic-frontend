import { BrowserRouter, Route, Routes } from "react-router-dom";
import SigninPage from "./pages/SigninPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import SearchRoomsPage from "./pages/SearchRoomsPage";
import MyClassPage from "./pages/MyClassPage";
import VerifyOTPRegister from "./components/loggedOut/VerifyOTPRegister";
import VerifyOTPReset from "./components/loggedOut/VerifyOTPReset";
import { useState } from "react";

function App() {
  const [email, setEmail] = useState<string>("");

  const handleVerifySuccess = () => {
    // Handle the success scenario, e.g., redirecting or storing the token
  };

  return (
    <BrowserRouter>
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
        <Route path="/my-class-1" element={<MyClassPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
