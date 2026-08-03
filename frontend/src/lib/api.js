import { axiosInstance } from "./axios"

export const getAuthUser = async () => {
    try {
        const res = await axiosInstance.get("/auth/me");
        return res.data
    } catch {
        return null
    }
}

export const login = async (loginData)=> {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
};

//logout
export const logout = async ()=> {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
};

// Settings APIs
export const getSettings = async () => {
    const response = await axiosInstance.get("/users/settings");
    return response.data;
};

export const updateSettings = async (settingsData) => {
    const response = await axiosInstance.patch("/users/settings", settingsData);
    return response.data;
};

// Template APIs
export const getTemplates = async () => {
    const response = await axiosInstance.get("/templates");
    return response.data;
};

export const createTemplate = async (templateData) => {
    const response = await axiosInstance.post("/templates/create", templateData)
    return response.data;
};

export const updateTemplate = async ({ id, templateData }) => {
    const response = await axiosInstance.patch(`/templates/${id}`, templateData);
    return response.data;
};

export const deleteTemplate = async (id) => {
    const response = await axiosInstance.delete(`/templates/${id}`);
    return response.data;
};

//Employee APIs
export const createEmployee = async (employeeData) => {
    const response = await axiosInstance.post("/employee/create-employee", employeeData)
    return response.data;
};

export const getEmployees = async () => {
    const response = await axiosInstance.get("/employee");
    return response.data;
};

export const updateEmployee = async ({ id, employeeData }) => {
    const response = await axiosInstance.patch(`/employee/${id}`, employeeData);
    return response.data;
};

export const deleteEmployee = async (id) => {
    const response = await axiosInstance.delete(`/employee/${id}`);
    return response.data;
};

//Campaign APIs


export const createCampaign = async (campaignData) => {
    const response = await axiosInstance.post("/campaigns", campaignData);
    return response.data;
};

export const getCampaigns = async () => {
    const response = await axiosInstance.get("/campaigns");
    return response.data;
};

export const deleteCampaign = async (id) => {
    const response = await axiosInstance.delete(`/campaigns/${id}`);
    return response.data;
};

export const completeCampaign = async (id) => {
    const response = await axiosInstance.patch(`/campaigns/${id}/complete`);
    return response.data;
};

export const getCampaignReport = async (id) => {
    const response = await axiosInstance.get(`/reports/campaign/${id}`);
    return response.data;
};

export const getReports = async () => {
    const response = await axiosInstance.get("/reports");
    return response.data;
};

// Public simulation tracking APIs
export const trackCampaignClick = async (trackingToken) => {
    const response = await axiosInstance.get(
        `/tracking/${encodeURIComponent(trackingToken)}/click`
    );
    return response.data;
};

export const trackCampaignSubmission = async (trackingToken) => {
    const response = await axiosInstance.post(
        `/tracking/${encodeURIComponent(trackingToken)}/submit`
    );
    return response.data;
};

export const reportCampaignEmail = async (trackingToken) => {
    const response = await axiosInstance.post(
        `/tracking/${encodeURIComponent(trackingToken)}/report`,
        undefined,
        { timeout: 10000 }
    );
    return response.data;
};

export const completeCampaignTraining = async (trackingToken) => {
    const response = await axiosInstance.post(
        `/training/${encodeURIComponent(trackingToken)}/complete`
    );
    return response.data;
};
