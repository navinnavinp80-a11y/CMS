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
    if (response.status === 401) {
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch { }
    }
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.message || "Failed to fetch dashboard statistics"
    );
    (error as any).status = response.status;
    throw error;
  }

  return response.json();
};

export const getPublicPageBySlug = async (slug: string = "") => {
  const cleanSlug = slug.trim() ? encodeURIComponent(slug.trim()) : "";
  const endpoint = cleanSlug ? `${API_URL}/public/content/${cleanSlug}` : `${API_URL}/public/content`;
  const response = await fetch(endpoint, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Page not found");
  }

  return data.content || data;
};

export const getPublicPages = async () => {
  const response = await fetch(`${API_URL}/public/content/pages/list`, {
    method: "GET",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch published pages");
  }

  return data.pages || [];
};


export interface StoreSectionData {
  id: string;
  type: string;
  title: string;
  settings: Record<string, any>;
}

export interface StoreThemeData {
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  fontFamily: string;
  buttonStyle: "square" | "rounded" | "pill";
  contentWidth: "compact" | "normal" | "full";
  sectionSpacing: "compact" | "normal" | "spacious";
}

export interface StoreItem {
  _id: string;
  storeName: string;
  name?: string;
  slug: string;
  themeId?: string;
  status: "draft" | "published";
  owner?: string | { _id: string; name?: string; email?: string };
  sections: StoreSectionData[];
  theme: StoreThemeData;
  createdAt: string;
  updatedAt: string;
  publishedVersion?: {
    storeName: string;
    themeId?: string;
    sections: StoreSectionData[];
    theme: StoreThemeData;
    publishedAt: string;
  };
}

export type StoreConfigResponse = StoreItem;

/**
 * Fetch all stores for the current user.
 * Supports optional search string.
 */
export const getStores = async (searchTerm?: string): Promise<StoreItem[]> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const url = new URL(`${API_URL}/store`);
  if (searchTerm && searchTerm.trim()) {
    url.searchParams.set("search", searchTerm.trim());
  }

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch stores");
  }

  return data.stores || (data.store ? [data.store] : []);
};

/**
 * Fetch a single store by its ID.
 */
export const getStoreById = async (id: string): Promise<StoreItem> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/store/${id}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch store details");
  }

  return data.store;
};

/**
 * Create a new store with name and unique slug.
 */
export const createStore = async (payload: {
  storeName: string;
  slug: string;
  themeId?: string;
}): Promise<StoreItem> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to create store");
  }

  return data.store;
};

/**
 * Update an existing store by ID.
 */
export const updateStore = async (
  id: string,
  payload: Partial<StoreItem>
): Promise<StoreItem> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/store/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to update store");
  }

  return data.store;
};

/**
 * Delete a store by ID.
 */
export const deleteStore = async (id: string): Promise<void> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/store/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to delete store");
  }
};

/**
 * Publish a store by ID.
 */
export const publishStoreById = async (
  id: string,
  payload?: {
    storeName?: string;
    slug?: string;
    themeId?: string;
    sections?: StoreSectionData[];
    theme?: StoreThemeData;
  }
): Promise<StoreItem> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_URL}/store/${id}/publish`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload || {}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to publish store");
  }

  return data.store;
};

/**
 * Legacy getStoreConfig, with optional storeId support.
 */
export const getStoreConfig = async (storeId?: string): Promise<StoreConfigResponse> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  const endpoint = storeId ? `${API_URL}/store/${storeId}` : `${API_URL}/store`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch store configuration");
  }

  return data.store;
};

/**
 * Legacy saveStoreConfig, with optional storeId support.
 */
export const saveStoreConfig = async (
  payloadOrId:
    | string
    | {
      storeName?: string;
      sections?: StoreSectionData[];
      theme?: StoreThemeData;
    },
  maybePayload?: {
    storeName?: string;
    sections?: StoreSectionData[];
    theme?: StoreThemeData;
  }
): Promise<StoreConfigResponse> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  let endpoint = `${API_URL}/store`;
  let payload: Record<string, any> = {};

  if (typeof payloadOrId === "string") {
    endpoint = `${API_URL}/store/${payloadOrId}`;
    payload = maybePayload || {};
  } else {
    payload = payloadOrId || {};
  }

  const response = await fetch(endpoint, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to save store configuration");
  }

  return data.store;
};

/**
 * Legacy publishStoreConfig, with optional storeId support.
 */
export const publishStoreConfig = async (
  payloadOrId?:
    | string
    | {
      storeName?: string;
      sections?: StoreSectionData[];
      theme?: StoreThemeData;
    },
  maybePayload?: {
    storeName?: string;
    sections?: StoreSectionData[];
    theme?: StoreThemeData;
  }
): Promise<StoreConfigResponse> => {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("No authentication token found");
  }

  let endpoint = `${API_URL}/store/publish`;
  let payload: Record<string, any> = {};

  if (typeof payloadOrId === "string") {
    endpoint = `${API_URL}/store/${payloadOrId}/publish`;
    payload = maybePayload || {};
  } else if (payloadOrId) {
    payload = payloadOrId;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to publish store");
  }

  return data.store;
};

export const getPublicStoreConfig = async (slug?: string): Promise<{
  _id?: string;
  storeName: string;
  slug?: string;
  sections: StoreSectionData[];
  theme: StoreThemeData;
  publishedAt?: string;
}> => {
  const url = slug ? `${API_URL}/public/store/${slug}` : `${API_URL}/public/store`;
  const response = await fetch(url, {
    method: "GET",
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Published storefront not found");
  }

  return data.store;
};

export const getPublicStoreConfigBySlug = async (slug: string) => {
  return getPublicStoreConfig(slug);
};

export interface WebsiteData {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  status: "draft" | "published";
  homePage?: any;
  owner?: any;
  templateId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const getWebsites = async (): Promise<WebsiteData[]> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_URL}/websites`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch websites");
  }

  return Array.isArray(data.websites) ? data.websites : data.website ? [data.website] : [];
};

export const createWebsite = async (payload: {
  name: string;
  slug?: string;
  description?: string;
  status?: "draft" | "published";
  templateId?: string;
}): Promise<WebsiteData> => {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${API_URL}/websites`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || "Failed to create website");
    error.status = response.status;
    error.limitReached = data.limitReached;
    error.currentCount = data.currentCount;
    error.maxAllowed = data.maxAllowed;
    throw error;
  }

  return data.website;
};

export interface UserPlanData {
  plan: "free" | "premium";
  isPremiumActive: boolean;
  premiumExpiresAt: string | null;
  usage?: {
    websitesCount: number;
    storesCount: number;
    totalCreations: number;
    maxAllowed: number;
    remaining: number;
    canCreate: boolean;
  };
}

export const getUserPlan = async (): Promise<UserPlanData | null> => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/plan`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) return null;
    const data = await response.json();
    return data;
  } catch {
    return null;
  }
};

export const getCurrentUser = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.user || data;
    }

    // Fallback: query /plan
    const planData = await getUserPlan();
    if (planData) {
      let storedUser: any = {};
      try {
        storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      } catch {}
      return {
        ...storedUser,
        plan: planData.plan,
        premiumExpiresAt: planData.premiumExpiresAt,
        isPremium: planData.isPremiumActive,
      };
    }
  } catch (e) {
    console.error("Failed to fetch current user profile:", e);
  }
  return null;
};