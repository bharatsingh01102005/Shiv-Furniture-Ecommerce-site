import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pageWrap"><div className="loadingCard">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
