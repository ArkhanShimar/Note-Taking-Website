import api from './api';

export const folderService = {
  async getFolders() {
    const response = await api.get('/folders');
    return response.data;
  },

  async getFolderById(id) {
    const response = await api.get(`/folders/${id}`);
    return response.data;
  },

  async createFolder(name, color = 'indigo') {
    const response = await api.post('/folders', { name, color });
    return response.data;
  },

  async updateFolder(id, name, color) {
    const response = await api.put(`/folders/${id}`, { name, color });
    return response.data;
  },

  async deleteFolder(id) {
    const response = await api.delete(`/folders/${id}`);
    return response.data;
  },

  async verifyPin(id, pin) {
    const response = await api.post(`/folders/${id}/verify-pin`, { pin });
    return response.data;
  },

  async updatePin(id, oldPin, newPin) {
    const response = await api.put(`/folders/${id}/update-pin`, { oldPin, newPin });
    return response.data;
  }
};
