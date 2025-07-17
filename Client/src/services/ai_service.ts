import axios from 'axios';

const API_URL = 'http://localhost:5000/api/ai';

export const askAI = async (question: string, token: string) => {
  try {
    const response = await axios.post(
      `${API_URL}/chat`,
      { question },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    if (axios.isAxiosError(error) && error.response) {
      throw error.response.data;
    }
    throw { error: "Unknown error" };
  }
};
