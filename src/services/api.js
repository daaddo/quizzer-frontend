const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const questionsApi = {
  // Ottieni tutte le domande
  getAllQuestions: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel recupero delle domande:', error);
      throw error;
    }
  }
};

export default questionsApi; 