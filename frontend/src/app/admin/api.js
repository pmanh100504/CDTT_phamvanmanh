export const API_URL = 'http://127.0.0.1:8000/api/admin';

export async function fetchApi(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || `API error: ${response.status}`);
    }
    
    return data;
  } catch (error) {
    console.warn(`Fetch API Error (${endpoint}):`, error);
    throw error;
  }
}
