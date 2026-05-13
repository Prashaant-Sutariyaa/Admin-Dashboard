import apiClient from 'src/services/apiClient';

export interface Campaign {
    id: number;
    code: string;
    campaign_name: string;
    campaign_type: string;
    delivery_mode: string;
    delivery_method: string;
    client_id: number;
    status: string;

    start_date: string;
    end_date: string;

    total_allocation: number;
    total_delivered: number;
    total_accepted: number;
    total_rejected: number;

    currency: string;
    cpl: number;
    priority: string;

    campaign_document_name: string;
    comment: string;
}

const mapCampaign = (item: any): Campaign => ({
    id: item.id,
    code: item.campaign_code,
    campaign_name: item.campaign_name,
    campaign_type: item.campaign_type,
    delivery_mode: item.delivery_mode,
    delivery_method: item.delivery_method,
    client_id: item.client_id,
    status: item.status,

    start_date: item.start_date,
    end_date: item.end_date,

    total_allocation: item.total_allocation,
    total_delivered: item.total_delivered,
    total_accepted: item.total_accepted,
    total_rejected: item.total_rejected,

    currency: item.currency,
    cpl: item.cpl,
    priority: item.priority,

    campaign_document_name: item.campaign_document_name,
    comment: item.comment,
});

export const campaignService = {
    async getAllCampaigns() {
        const res = await apiClient.get('/campaigns/');
        return res.data.data.map(mapCampaign);
    },

    async getCampaigns(page = 1, limit = 20, status = "") {
        const params: any = { page, limit };
        if (status) { params.status = status; }
        const res = await apiClient.get('/campaigns/', { params });
        return {
            data: res.data.data.map(mapCampaign),
            total: res.data.total || 0,
            page: res.data.page || 1,
            limit: res.data.limit || limit,
        };
    },

    async getCampaignById(id: number) {
        const res = await apiClient.get(`/campaigns/${id}`);
        return mapCampaign(res.data);
    },

    async createCampaign(payload: any) {
        return (await apiClient.post('/campaigns/', payload)).data;
    },

    async updateCampaign(id: number, payload: any) {
        return (await apiClient.patch(`/campaigns/${id}`, payload)).data;
    },

    async deleteCampaign(id: number) {
        return (await apiClient.delete(`/campaigns/${id}`)).data;
    },

    async downloadDocument(id: number) {
        const res = await apiClient.get(`/campaigns/download/${id}`, {
            responseType: 'blob',
        });

        const blob = new Blob([res.data]);
        const url = window.URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = `campaign-${id}`;
        link.click();

        window.URL.revokeObjectURL(url);
    },

    async getSegmentsByCampaignId(id: number) {
        const res = await apiClient.get(`/campaign-segments/${id}`);
        return res.data;
    },


};