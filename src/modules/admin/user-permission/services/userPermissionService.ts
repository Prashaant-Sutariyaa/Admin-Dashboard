import apiClient from 'src/services/apiClient';

export const userPermissionService = {
  async get(userId: number) {
    const res = await apiClient.get(`/user-permissions/?user_id=${userId}`);
    return res.data;
  },

  async upsert(payload: {
    user_id: number;
    module_permission_id: number;
    is_active: boolean;
  }) {
    return (await apiClient.post('/user-permissions/upsert', payload)).data;
  },
  async remove(userId: number, modulePermissionId: number) {
    const res = await apiClient.delete(
      `/user-permissions/?user_id=${userId}&module_permission_id=${modulePermissionId}`
    );
    return res.data;
  }
};