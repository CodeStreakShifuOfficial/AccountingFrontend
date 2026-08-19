import { Navigate } from "react-router-dom"; // Used to redirect unauthenticated users.
import { getStoredToken } from "../api/auth"; // Gets the JWT from storage.

export default function ProtectedRoute({ children }) {
    // Get the currently stored JWT.
    const token = getStoredToken();

    // If there is no token, send the user back to login.
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If a token exists, allow the requested page to render.
    return children;
}