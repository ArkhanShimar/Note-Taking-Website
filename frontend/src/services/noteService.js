import api from './api';

export const noteService = {
  async getNotes() {
    const response = await api.get('/notes');
    return response.data;
  },

  async getNoteById(id) {
    const response = await api.get(`/notes/${id}`);
    return response.data;
  },

  async createNote(title, content = '', folder = null) {
    const response = await api.post('/notes', { title, content, folder });
    return response.data;
  },

  async updateNote(id, title, content, folder) {
    const response = await api.put(`/notes/${id}`, { title, content, folder });
    return response.data;
  },

  async deleteNote(id) {
    const response = await api.delete(`/notes/${id}`);
    return response.data;
  },

  async searchNotes(query) {
    const response = await api.get(`/notes/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  async addCollaborator(noteId, email) {
    const response = await api.post(`/notes/${noteId}/collaborators`, { email });
    return response.data;
  },

  async removeCollaborator(noteId, collaboratorId) {
    const response = await api.delete(`/notes/${noteId}/collaborators/${collaboratorId}`);
    return response.data;
  }
};
