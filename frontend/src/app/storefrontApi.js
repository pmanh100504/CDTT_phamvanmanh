export const API_URL = 'http://127.0.0.1:8000/api/storefront';

export async function fetchStorefront(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  // Try to get customer user id from localStorage for header auth simulation
  let userId = '';
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('customer_user');
    if (user) {
      try {
        userId = JSON.parse(user).id;
      } catch (e) {
        // Ignore
      }
    }
  }

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(userId ? { 'X-User-Id': userId } : {}),
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
    console.error(`Storefront API Error (${endpoint}):`, error);
    throw error;
  }
}
