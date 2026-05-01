import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
<<<<<<< HEAD

  if (!token) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  return children;
=======
  return token ? children : <Navigate to="/auth" replace />;
>>>>>>> ec4d3b44b8d2a619573b1df9fcf7138633a7194e
}