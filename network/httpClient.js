export async function get(url, customHeaders = {}) {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        ...customHeaders
      }
    });

    if (!response.ok) {
      throw new Error('http error');
    }

    return await response.json();
  } catch (error) {
    console.error('get request error');
    throw error;
  }
}