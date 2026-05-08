import apiClient from "src/services/apiClient";

export const revenueService = {
    async getRevenue(params: any) {
        const res = await apiClient.get("/revenue", { params });
        return res.data;
    },

    async downloadRevenue(params: any) {
        const res = await apiClient.get("/revenue/download", {
            params,
            responseType: "blob",
        });
        return res;
    },

    async getSummary(params: any) {
        const res = await apiClient.get("/revenue/summary", { params });
        return res.data;
    },

    async downloadSummary(params: any) {
        const res = await apiClient.get("/revenue/summary/download", {
            params,
            responseType: "blob",
        });
        return res;
    },

    async getRevenueStats(params?: any) {
        const res = await apiClient.get("/revenue/stats", { params });
        return res.data;
    },
};