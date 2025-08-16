import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useAuth } from "@/stores/auth";
import Navigation from "@/components/Navigation";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Home from "@/pages/Home";
import Stream from "@/pages/Stream";
import StreamView from "@/pages/StreamView";
import CreateStream from "@/pages/CreateStream";
import StartStream from "./pages/StartStream";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <>
      <Navigation />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/stream/:id"
          element={
            <PrivateRoute>
              <Stream />
            </PrivateRoute>
          }
        />
        <Route
          path="/stream-view/:id"
          element={
            <PrivateRoute>
              <StreamView />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-stream"
          element={
            <PrivateRoute>
              <CreateStream />
            </PrivateRoute>
          }
        />
        <Route
          path="/start-stream"
          element={
            <PrivateRoute>
              <StartStream />
            </PrivateRoute>
          }
        />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
