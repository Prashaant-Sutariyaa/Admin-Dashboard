import apiClient from "../../../services/apiClient";

interface LoginPayload {
  username: string;
  password: string;
}

export const authService = {
  async login(payload: LoginPayload) {
    const res = await apiClient.post('/auth/login', {
      email: payload.username,
      password: payload.password,
    });

    return res.data;
  },

  logout() {
    localStorage.removeItem('access_token');
  },

  getToken() {
    return localStorage.getItem('access_token');
  },

  async getUserAccess() {
    const res = await apiClient.get('/user-access/');
    return res.data;
  }
};