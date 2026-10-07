const API_URL = "http://localhost:5000/api";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  const response = await fetch(`${API_URL}/dashboard/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch dashboard statistics");
  }

  return response.json();
};