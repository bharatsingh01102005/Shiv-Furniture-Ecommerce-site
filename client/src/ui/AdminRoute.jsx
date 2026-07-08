import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="pageWrap"><div className="loadingCard">Loading...</div></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (!user.isAdmin) return <Navigate to="/" replace />;
  return children;
}
