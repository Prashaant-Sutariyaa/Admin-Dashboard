import apiClient from 'src/services/apiClient';

export interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  mobileNumber: string;
  jobTitle: string;
  workLocation: string;
  roleId: number;
  departmentId: number;
  isActive: boolean;
  createdBy: number;
  updatedBy: number;
  createdAt: string;
  updatedAt: string;
}
export interface UserListResponse {
  data: User[];
  page: number;
  limit: number;
  total: number;
}

export const userService = {

  async getUsers(
    page = 1,
    limit = 20
  ): Promise<UserListResponse> {

    const res =
      await apiClient.get(
        '/users/',
        {
          params: {
            page,
            limit,
          },
        }
      );

    return {
      data: res.data.data.map(
        (item: any) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          email: item.email,
          mobileNumber: item.mobile_number,
          jobTitle: item.job_title,
          workLocation: item.work_location,
          roleId: item.role_id,
          departmentId: item.department_id,
          isActive: item.is_active,
          createdBy: item.created_by,
          updatedBy: item.updated_by,
          createdAt:
            new Date(
              item.created_at
            ).toLocaleDateString(),

          updatedAt:
            new Date(
              item.updated_at
            ).toLocaleDateString(),
        })
      ),

      page: res.data.page,
      limit: res.data.limit,
      total: res.data.total,
    };
  },

  async getAllUsersList(): Promise<User[]> {
    const res = await apiClient.get('/users/list');

    return res.data.map((item: any) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
    }));
  },

  async getAllActiveUsersList(): Promise<User[]> {
    const res = await apiClient.get('/users/list?is_active=true');

    return res.data.map((item: any) => ({
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
    }));
  },

  async getUserById(id: number): Promise<User> {
    const res = await apiClient.get(`/users/${id}`);
    const item = res.data;

    return {
      id: item.id,
      firstName: item.first_name,
      lastName: item.last_name,
      email: item.email,
      mobileNumber: item.mobile_number,
      jobTitle: item.job_title,
      workLocation: item.work_location,
      roleId: item.role_id,
      departmentId: item.department_id,
      isActive: item.is_active,
      createdBy: item.created_by,
      updatedBy: item.updated_by,
      createdAt: new Date(item.created_at).toLocaleDateString(),
      updatedAt: new Date(item.updated_at).toLocaleDateString(),
    };
  },

  async createUser(payload: any) {
    return (await apiClient.post('/users/', payload)).data;
  },

  async updateUser(id: number, payload: any) {
    return (await apiClient.patch(`/users/${id}`, payload)).data;
  },

  async patchUser(id: number, payload: any) {
    return (await apiClient.patch(`/users/${id}`, payload)).data;
  },

  async deleteUser(id: number) {
    return (await apiClient.delete(`/users/${id}`)).data;
  },

  async getProfile() {
    const res = await apiClient.get('/users/profile');
    return res.data;
  }

};