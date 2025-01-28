import { BrowserRouter, Route, Routes } from "react-router-dom";
import SigninPage from "./pages/SigninPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SigninPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />{" "}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
