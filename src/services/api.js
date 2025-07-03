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
  },

  // Ottieni domande casuali per il quiz
  getRandomQuestions: async (size) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/random?size=${size}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nel recupero delle domande casuali:', error);
      throw error;
    }
  },

  // Crea una nuova domanda
  createQuestion: async (questionData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Errore nella creazione della domanda:', error);
      throw error;
    }
  },

  // Cancella una domanda per ID
  deleteQuestion: async (questionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/questions/${questionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Errore nella cancellazione della domanda:', error);
      throw error;
    }
  }
};

export default questionsApi; 