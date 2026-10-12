export const API_URL = "http://localhost:5000/api";

export const getDashboardStats = async () => {
  const token = localStorage.getItem("token");

  if (!token) {
    const error = new Error("No authentication token found");
    (error as any).status = 401;
    throw error;
  }

  const response = await fetch(`${API_URL}/dashboard/stats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Failed to fetch dashboard statistics"
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const getPublicPageBySlug = async (slug: string) => {
  const response = await fetch(`${API_URL}/public/content/${slug}`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Page not found");
  }

  return data.content || data;
};