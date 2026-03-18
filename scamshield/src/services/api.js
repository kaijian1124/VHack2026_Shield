const API_URL = 'https://scamshield-api-dtbg.onrender.com';

export async function analyzeTranscriptAPI(transcript, callerNumber = null) {
  try {
    const response = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript,
        caller_number: callerNumber,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'API error');
    }

    return await response.json();
  } catch (e) {
    throw new Error(e.message || 'Network error');
  }
}

export async function fetchHistory() {
  try {
    const response = await fetch(`${API_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    return data.logs || [];
  } catch (e) {
    throw new Error(e.message || 'Network error');
  }
}