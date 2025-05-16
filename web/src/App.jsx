import { useEffect, useState } from "react";
import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import AgentDashboard from "./components/AgentDashboard";
import AgentManagement from "./components/AgentManagement";
import ListManagement from "./components/ListManagement";
import LoginForm from "./components/LoginForm";

const PrivateRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  console.log("PrivateRoute Debug:", { token, user, role });

  if (!token) {
    console.log("No token found, redirecting to login");
    return <Navigate to="/login" />;
  }

  if (role && user.role !== role) {
    console.log("Role mismatch, redirecting to appropriate dashboard");
    return (
      <Navigate
        to={user.role === "admin" ? "/admin/dashboard" : "/agent/dashboard"}
      />
    );
  }

  return children;
};

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    console.log("App useEffect - storedUser:", storedUser);
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  console.log("App render - current user state:", user);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {user && (
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap items-center justify-between h-auto py-4 sm:h-16">
                <div className="flex items-center w-full sm:w-auto justify-center sm:justify-start">
                  <h1 className="text-xl sm:text-2xl font-bold text-indigo-600">
                    Agent Management System
                  </h1>
                </div>

                <div className="flex items-center w-full sm:w-auto justify-center sm:justify-end mt-2 sm:mt-0">
                  <span className="text-gray-700 text-sm sm:text-base mr-0 sm:mr-4">
                    Welcome, {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="mt-2 sm:mt-0 bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </nav>
        )}

        <Routes>
          <Route path="/login" element={<LoginForm />} />

          <Route
            path="/admin/dashboard"
            element={
              <PrivateRoute role="admin">
                <div className="space-y-8 px-4 sm:px-8 py-6">
                  <AgentManagement />
                  <ListManagement />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/agent/dashboard"
            element={
              <PrivateRoute role="agent">
                <div className="px-4 sm:px-8 py-6">
                  <AgentDashboard />
                </div>
              </PrivateRoute>
            }
          />

          <Route
            path="/"
            element={
              <Navigate
                to={
                  user?.role === "admin"
                    ? "/admin/dashboard"
                    : "/agent/dashboard"
                }
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
