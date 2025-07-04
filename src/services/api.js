// API configuration with runtime environment variable support
const getApiBaseUrl = () => {
  // In production build, this will be replaced by docker-entrypoint.sh
  // In development, it uses the standard Vite env variable
  if (import.meta.env.MODE === 'production') {
    console.log('Production mode');
    return 'VITE_API_BASE_URL_PLACEHOLDER';

  } else {
    console.log('Development mode');
  }
  console.log(import.meta.env.VITE_API_BASE_URL);
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
};

const API_BASE_URL = getApiBaseUrl();

// API service class
class QuestionsApi {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async getAllQuestions() {
    console.log(this.baseUrl);
    try {
      const response = await fetch(`${this.baseUrl}/api/questions`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }
  }

  async createQuestion(questionData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(questionData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating question:', error);
      throw error;
    }
  }

  async deleteQuestion(questionId) {
    try {
      const response = await fetch(`${this.baseUrl}/api/questions/${questionId}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // La delete potrebbe non restituire contenuto
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting question:', error);
      throw error;
    }
  }

  async getRandomQuestions(size = 5) {
    try {
      const response = await fetch(`${this.baseUrl}/api/questions/random?size=${size}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching random questions:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const questionsApi = new QuestionsApi();

// Export class for testing
export default QuestionsApi; 