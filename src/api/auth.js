import api from "./axios"; // Imports our configured Axios instance.

// Sends login credentials to Spring Boot.
export const login = async (username, password) => {
    const response = await api.post("/auth/login", {
        username,
        password,
    });

    return response.data;
};

// Gets the currently stored user.
export const getStoredUser = () => {

    // Check localStorage first.
    const localUser = localStorage.getItem("user");

    if (localUser) {
        return JSON.parse(localUser);
    }

    // If not found, check sessionStorage.
    const sessionUser = sessionStorage.getItem("user");

    if (sessionUser) {
        return JSON.parse(sessionUser);
    }

    // No user is logged in.
    return null;
};

// Gets the currently stored JWT.
export const getStoredToken = () => {

    // Check localStorage first.
    const localToken = localStorage.getItem("token");

    if (localToken) {
        return localToken;
    }

    // If not found, check sessionStorage.
    const sessionToken = sessionStorage.getItem("token");

    if (sessionToken) {
        return sessionToken;
    }

    // No token exists.
    return null;
};

// Logs the current user out.
export const logout = () => {

    // Remove the persistent login.
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Remove the session login.
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
};