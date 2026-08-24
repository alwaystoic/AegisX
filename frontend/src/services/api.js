const API_BASE_URL = "http://127.0.0.1:8000";

export const getSecurityReport = async () => {
  const response = await fetch(`${API_BASE_URL}/reports/security`);

  if (!response.ok) {
    throw new Error("Failed to fetch security report");
  }

  return response.json();
};

export const getSchedulerStatus = async () => {
  const response = await fetch(`${API_BASE_URL}/scheduler/status`);

  if (!response.ok) {
    throw new Error("Failed to fetch scheduler status");
  }

  return response.json();
};

export const analyzeThreat = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/threat-detection/analyze`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("Threat analysis failed");
  }

  return response.json();
};

export const getAIRecommendation = async (data) => {
  const response = await fetch(
    `${API_BASE_URL}/ai/recommend`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  if (!response.ok) {
    throw new Error("AI recommendation failed");
  }

  return response.json();
};