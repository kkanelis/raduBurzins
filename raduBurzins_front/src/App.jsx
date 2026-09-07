import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import NavBar from "./components/NavBar/NavBar";
// import UserSidebar from "./components/UserSidebar/UserSidebar";
import Welcome from "./info/Welcome/Welcome";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Footer from "./components/Footer/Footer";
import "./index.css";

const Info = lazy(() => import("./info/InfoPage/InfoPage"));
const RegWelcome = lazy(() => import("./info/RegWelcome/RegWelcome"));
const FamilyChat = lazy(() => import("./info/FamilyChat/FamilyChat"));
const Calendar = lazy(() => import("./components/Calendar/Calendar"));
const Terms = lazy(() => import("./info/Terms/Terms"));
const Profile = lazy(() => import("./components/auth/Profile"));
const ChristmasLottery = lazy(() => import("./components/Christmas/ChristmasLottery"));
const MyEvents = lazy(() => import("./info/RegWelcome/MyEvents"));
const Albums = lazy(() => import("./info/Albums/Albums"));

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-warm-beige via-off-white to-[var(--bg-2)] flex flex-col">
      {user && <NavBar />}
      <div className={user ? "flex flex-1" : "flex-1"}>
        {/* {user && (
          <div className="hidden lg:block">
            <UserSidebar />
          </div>
        )} */}
        <main className="flex-1 w-full">
          <Suspense
            fallback={
              <div className="section-shell py-10">
                <div className="card">Ielādē lapu...</div>
              </div>
            }
          >
            <Routes>
              <Route path="/" element={user ? <RegWelcome /> : <Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<Terms />} />
              <Route
                path="/RegWelcome"
                element={
                  <ProtectedRoute>
                    <RegWelcome />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/info"
                element={
                  <ProtectedRoute>
                    <Info />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <Calendar />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/christmas"
                element={
                  <ProtectedRoute>
                    <ChristmasLottery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-events"
                element={
                  <ProtectedRoute>
                    <MyEvents />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/albums"
                element={
                  <ProtectedRoute>
                    <Albums />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/family-chat"
                element={
                  <ProtectedRoute>
                    <FamilyChat />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </main>
      </div>
      {user && <Footer />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
