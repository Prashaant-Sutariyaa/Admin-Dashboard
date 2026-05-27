import apiClient from 'src/services/apiClient';

export interface ModulePermission {
  id: number;
  moduleName: string;
  menuName: string;
  permissionName: string;
  description: string;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}

interface GetModulePermissionParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface ModulePermissionResponse {
  data: ModulePermission[];
  page: number;
  limit: number;
  total: number;
}

export const modulePermissionService = {
  async getAllModulePermissions(
    params?: GetModulePermissionParams
  ): Promise<ModulePermissionResponse> {

    const res = await apiClient.get('/module-permissions/', {
      params,
    });

    return {
      data: res.data.data.map((item: any) => ({
        id: item.id,
        moduleName: item.module_name,
        menuName: item.menu_name,
        permissionName: item.permission_name,
        description: item.description,
        isActive: item.is_active,
        createdBy: item.created_by,
        updatedBy: item.updated_by,
        createdAt: new Date(item.created_at).toLocaleDateString(),
        updatedAt: new Date(item.updated_at).toLocaleDateString(),
      })),

      page: res.data.page,
      limit: res.data.limit,
      total: res.data.total,
    };
  },

  async getActiveModulePermissions(): Promise<ModulePermission[]> {
    const res = await apiClient.get('/module-permissions/?is_active=true');

    return res.data.map((item: any) => ({
      id: item.id,
      moduleName: item.module_name,
      menuName: item.menu_name,
      permissionName: item.permission_name,
      description: item.description,
      isActive: item.is_active,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      createdAt: new Date(item.created_at).toLocaleDateString(),
      updatedAt: new Date(item.updated_at).toLocaleDateString(),
    }));
  },

  async create(payload: any) {
    return (await apiClient.post('/module-permissions/', payload)).data;
  },

  async patch(id: number, payload: any) {
    return (await apiClient.patch(`/module-permissions/${id}`, payload)).data;
  },

  async delete(id: number) {
    return (await apiClient.delete(`/module-permissions/${id}`)).data;
  },
};