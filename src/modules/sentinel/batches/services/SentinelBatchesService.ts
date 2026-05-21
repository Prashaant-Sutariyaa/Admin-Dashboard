import apiClient from "src/services/apiClient";

export interface SentinelBatch {
  campaign_code: string;
  segment_code: string;
  title?: string;

  batch_code: string;

  total_leads: number;

  dataops_total: number;
  dataops_valid: number;
  dataops_invalid: number;

  email_total: number;
  email_pending: number;
  email_valid: number;
  email_invalid: number;

  quality_total: number;
  quality_pending: number;
  quality_valid: number;
  quality_invalid: number;

  dbr_total: number;
  dbr_pending: number;
  dbr_valid: number;
  dbr_invalid: number;

  vv_total: number;
  vv_pending: number;
  vv_valid: number;
  vv_invalid: number;

  mis_total: number;
  mis_pending: number;
  mis_delivered: number;
  mis_accepted: number;
  mis_client_rejected: number;
  mis_rtd: number;
  mis_internal_rejected: number;
}

export interface SentinelBatchListResponse {
  data: SentinelBatch[];
  page: number;
  limit: number;
  total: number;
}

export const SentinelBatchesService = {

  async getBatches(page = 1, limit = 10, search?: string): Promise<SentinelBatchListResponse> {
    const params: any = { page, limit };
    if (search?.trim()) {
      params.search = search.trim();
    }
    const res = await apiClient.get("/sentinel-batches/", { params, });
    return res.data;
  },

  async getBatchDetails(segmentCode: string, page = 1, limit = 20): Promise<SentinelBatchListResponse> {
    const res = await apiClient.get(`/sentinel-batches/segment/${segmentCode}`, { params: { page, limit } });
    return res.data;
  },

  async uploadSentinelBatch(payload: FormData) {
    const res = await apiClient.post('/sentinel/jobs/upload', payload, {
      headers: { 'Content-Type': 'multipart/form-data', }
    });
    return res.data;
  },

  async exportBatchData(batch_code: string, metric: string, department: string) {
    const res = await apiClient.get('/sentinel/export/', {
      params: { batch_code, metric, department },
      responseType: 'blob',
    }
    );

    return res.data;
  },

  async getDispostionsData() {
    const res = await apiClient.get('/dispositions/');
    return res.data;
  }

};