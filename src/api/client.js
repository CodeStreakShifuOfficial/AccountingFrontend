import api from "./axios";

// Get all clients.
export const getClients = async () => {
    const response = await api.get("/clients");
    return response.data;
};

// Get one client by ID.
export const getClient = async (id) => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
};

// Create a new client.
export const createClient = async (clientData) => {
    const response = await api.post("/clients", clientData);
    return response.data;
};

// Update an existing client.
export const updateClient = async (id, clientData) => {
    const response = await api.put(`/clients/${id}`, clientData);
    return response.data;
};

// Deactivate a client.
export const deactivateClient = async (id) => {
    const response = await api.put(`/clients/${id}/deactivate`);
    return response.data;
};

// Activate a client.
export const activateClient = async (id) => {
    const response = await api.put(`/clients/${id}/activate`);
    return response.data;
};