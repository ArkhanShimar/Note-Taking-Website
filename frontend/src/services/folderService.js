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
  }
};
