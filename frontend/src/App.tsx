import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import ChatLayout from "./components/ChatLayout";
import { ThemeProvider } from "./context/theme-provider";
import { AuthProvider } from "./auth/useAuth";
import { Toaster } from "@/components/ui/sonner";

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ChatLayout />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <Toaster position="top-center" />
    </ThemeProvider>
  );
}

export default App;
