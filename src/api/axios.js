import axios from "axios"; // Imports Axios for making HTTP requests.

// Create one Axios instance for our Spring Boot API.
const api = axios.create({
    baseURL: "http://localhost:8080/api", // Spring Boot API base URL.

    headers: {
        "Content-Type": "application/json", // Default content type for JSON requests.
    },
});

// Add an interceptor that runs before every request.
api.interceptors.request.use(
    (config) => {

        // Try to get the JWT from localStorage first.
        let token = localStorage.getItem("token");

        // If it isn't in localStorage, check sessionStorage.
        if (!token) {
            token = sessionStorage.getItem("token");
        }

        // If a token exists, attach it to the request.
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Return the modified request.
        return config;
    },

    (error) => {

        // Handle errors that occur before the request is sent.
        return Promise.reject(error);
    }
);

export default api; // Export the configured Axios instance.