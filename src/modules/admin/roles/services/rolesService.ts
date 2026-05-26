import apiClient from 'src/services/apiClient';

export interface Role {
  id: number;
  name: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

export const rolesService = {

  async getRoles(): Promise<Role[]> {
    const res = await apiClient.get('/roles/');

    return res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
      isActive: item.is_active,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      createdAt: new Date(item.created_at).toLocaleDateString(),
      updatedAt: new Date(item.updated_at).toLocaleDateString(),
    }));
  },

  async getAllRolesList(): Promise<Role[]> {
    const res = await apiClient.get('/roles/list');

    return res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  },

  async getActiveRolesList(): Promise<Role[]> {
    const res = await apiClient.get('/roles/list?is_active=true');

    return res.data.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  },

  async getRoleById(id: number) {
    const res = await apiClient.get(`/roles/${id}`);
    return res.data;
  },

  async createRole(payload: { name: string; is_active: boolean }) {
    return (await apiClient.post('/roles/', payload)).data;
  },

  async patchRole(id: number, payload: Record<string, any>) {
    return (await apiClient.patch(`/roles/${id}`, payload)).data;
  },

  async deleteRole(id: number) {
    return (await apiClient.delete(`/roles/${id}`)).data;
  },
};