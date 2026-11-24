import { useEffect } from "react";
import "./App.css";

import Navbar from "@/shared/components/Navbar";
import Toast from "@/shared/components/Toast";
import { useAuthStore } from "@/features/auth";
import { AppRouter } from "@/routes/AppRouter";

function App() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    void checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Navbar />
      <AppRouter />
      <Toast />
    </>
  );
}

export default App;
