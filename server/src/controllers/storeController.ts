import { Request, Response } from "express";
import StoreConfig, { IStoreConfig, IStoreSection, IStoreTheme } from "../models/StoreConfig";
import { canUserCreate } from "../services/entitlementService";

export const getDefaultTheme = (): IStoreTheme => ({
  primaryColor: "#202223",
  secondaryColor: "#4f46e5",
  backgroundColor: "#ffffff",
  fontFamily: "Inter, sans-serif",
  buttonStyle: "rounded",
  contentWidth: "normal",
  sectionSpacing: "normal",
});

export const getDefaultSections = (storeName: string = "My Store"): IStoreSection[] => [
  {
    id: "announcement-default",
    type: "announcement",
    title: "Announcement Bar",
    settings: {
      text: "Welcome to our store • Free shipping on orders over $50!",
      backgroundColor: "#111827",
      textColor: "#ffffff",
    },
  },
  {
    id: "header-default",
    type: "header",
    title: "Header / Navigation",
    settings: {
      storeName: storeName,
      navLinks: [
        { label: "Home", url: "/" },
        { label: "Catalog", url: "/store" },
        { label: "About", url: "#" },
        { label: "Contact", url: "#" },
      ],
      backgroundColor: "#ffffff",
    },
  },
  {
    id: "hero-default",
    type: "hero",
    title: "Hero Banner",
    settings: {
      heading: "Discover your next favorite.",
      subtitle: "Carefully curated products engineered for modern living.",
      buttonText: "Shop now",
      buttonUrl: "#products",
      backgroundColor: "#e9eef5",
      textAlign: "center",
      backgroundImage: "",
    },
  },
  {
    id: "featured-products-default",
    type: "featured-products",
    title: "Featured Products",
    settings: {
      heading: "Featured Products",
      productsCount: 4,
      gridColumns: 4,
    },
  },
  {
    id: "image-banner-default",
    type: "image-banner",
    title: "Image Banner",
    settings: {
      imageUrl: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
      heading: "Artisan Quality & Design",
      description: "Crafted using sustainable materials built to last a lifetime.",
      buttonText: "Explore Collection",
      buttonUrl: "#",
    },
  },
  {
    id: "rich-text-default",
    type: "rich-text",
    title: "Rich Text",
    settings: {
      heading: "Our Commitment to Craft",
      body: "We partner with responsible independent creators around the world to bring you timeless, durable items made without compromise.",
      textAlign: "center",
    },
  },
  {
    id: "newsletter-default",
    type: "newsletter",
    title: "Newsletter",
    settings: {
      heading: "Subscribe to our emails",
      description: "Be the first to learn about seasonal drops, exclusive perks, and behind-the-scenes stories.",
      buttonText: "Subscribe",
    },
  },
  {
    id: "footer-default",
    type: "footer",
    title: "Footer",
    settings: {
      storeName: storeName,
      footerText: `© ${new Date().getFullYear()} ${storeName}. All rights reserved.`,
      backgroundColor: "#111827",
      textColor: "#9ca3af",
    },
  },
];

export const normalizeSlug = (slug: string): string => {
  return slug
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * GET /api/store
 * Returns all stores belonging to the authenticated user.
 * Supports optional ?search= query parameter.
 */
export const getStores = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const searchQuery = req.query.search as string | undefined;
    const filter: Record<string, any> = req.user?.role === "admin" ? {} : { owner: userId };

    if (searchQuery && searchQuery.trim() !== "") {
      const regex = new RegExp(searchQuery.trim(), "i");
      filter.$or = [{ storeName: regex }, { name: regex }, { slug: regex }];
    }

    const stores = await StoreConfig.find(filter)
      .populate("owner", "name email role")
      .sort({ updatedAt: -1 });

    // Automatic migration: backfill slug for any legacy store record
    for (const store of stores) {
      if (!store.slug) {
        const raw = store.storeName || "my-store";
        store.slug = `${normalizeSlug(raw)}-${store._id.toString().slice(-4)}`;
        await store.save();
      }
    }

    res.status(200).json({
      message: "Stores fetched successfully",
      stores,
      store: stores[0] || null,
    });
  } catch (error) {
    console.error("Get stores error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * POST /api/store
 * Creates a new store for the authenticated user.
 */
export const createStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    // Entitlement check
    const entitlement = await canUserCreate(userId);
    if (!entitlement.allowed) {
      res.status(403).json({
        message:
          entitlement.reason ||
          "Creation limit reached on Free plan. Upgrade to Premium to create more websites and stores.",
        limitReached: true,
        currentCount: entitlement.currentCount,
        maxAllowed: entitlement.maxAllowed,
      });
      return;
    }

    const { storeName, name, slug } = req.body;
    const finalName = (storeName || name || "").trim();

    if (!finalName) {
      res.status(400).json({ message: "Store name is required" });
      return;
    }

    if (!slug || slug.trim() === "") {
      res.status(400).json({ message: "Store URL / slug is required" });
      return;
    }

    const cleanSlug = normalizeSlug(slug);
    if (!cleanSlug) {
      res.status(400).json({ message: "Invalid slug format. Please use letters, numbers, and hyphens." });
      return;
    }

    // Check if slug is already taken
    const slugExists = await StoreConfig.findOne({ slug: cleanSlug });
    if (slugExists) {
      res.status(400).json({ message: `The store URL / slug "${cleanSlug}" is already in use. Please choose another.` });
      return;
    }

    const newStore = await StoreConfig.create({
      owner: userId,
      storeName: finalName,
      name: finalName,
      slug: cleanSlug,
      status: "draft",
      sections: getDefaultSections(finalName),
      theme: getDefaultTheme(),
    });

    res.status(201).json({
      message: "Store created successfully",
      store: newStore,
    });
  } catch (error: any) {
    console.error("Create store error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "A store with this slug already exists." });
      return;
    }
    res.status(500).json({ message: "Server error creating store" });
  }
};

/**
 * GET /api/store/:id
 * Fetches a single store by ID.
 * Enforces owner/admin authorization.
 */
export const getStoreById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const store = await StoreConfig.findById(id);

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    // Authorization check
    const storeOwnerId = (store.owner as any)?._id
      ? (store.owner as any)._id.toString()
      : store.owner?.toString();
    if (storeOwnerId && storeOwnerId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ message: "You are not authorized to access this store" });
      return;
    }

    res.status(200).json({
      message: "Store fetched successfully",
      store,
    });
  } catch (error) {
    console.error("Get store by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * PUT /api/store/:id
 * Updates an existing store draft/config.
 * Enforces owner/admin authorization.
 */
export const updateStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const store = await StoreConfig.findById(id);

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    // Authorization check
    const storeOwnerId = (store.owner as any)?._id
      ? (store.owner as any)._id.toString()
      : store.owner?.toString();
    if (storeOwnerId && storeOwnerId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ message: "You are not authorized to modify this store" });
      return;
    }

    const { storeName, name, slug, sections, theme, status } = req.body;

    if (slug) {
      const cleanSlug = normalizeSlug(slug);
      if (!cleanSlug) {
        res.status(400).json({ message: "Invalid slug format" });
        return;
      }
      if (cleanSlug !== store.slug) {
        const slugExists = await StoreConfig.findOne({
          slug: cleanSlug,
          _id: { $ne: id },
        });
        if (slugExists) {
          res.status(400).json({ message: `The store URL / slug "${cleanSlug}" is already in use.` });
          return;
        }
        store.slug = cleanSlug;
      }
    }

    if (storeName !== undefined || name !== undefined) {
      const updatedName = (storeName || name || "").trim();
      if (updatedName) {
        store.storeName = updatedName;
        store.name = updatedName;
      }
    }

    if (sections !== undefined) {
      store.sections = sections;
    }

    if (theme !== undefined) {
      store.theme = theme;
    }

    if (status !== undefined && (status === "draft" || status === "published")) {
      store.status = status;
    }

    await store.save();

    res.status(200).json({
      message: "Store updated successfully",
      store,
    });
  } catch (error: any) {
    console.error("Update store error:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "A store with this slug already exists." });
      return;
    }
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * DELETE /api/store/:id
 * Permanently deletes a store.
 * Enforces owner/admin authorization.
 */
export const deleteStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const store = await StoreConfig.findById(id);

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    // Authorization check
    const storeOwnerId = (store.owner as any)?._id
      ? (store.owner as any)._id.toString()
      : store.owner?.toString();
    if (storeOwnerId && storeOwnerId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ message: "You are not authorized to delete this store" });
      return;
    }

    await StoreConfig.findByIdAndDelete(id);

    res.status(200).json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    console.error("Delete store error:", error);
    res.status(500).json({ message: "Server error deleting store" });
  }
};

/**
 * POST /api/store/:id/publish
 * Publishes a store snapshot to make it publicly viewable.
 */
export const publishStore = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { id } = req.params;
    const store = await StoreConfig.findById(id);

    if (!store) {
      res.status(404).json({ message: "Store not found" });
      return;
    }

    // Authorization check
    const storeOwnerId = (store.owner as any)?._id
      ? (store.owner as any)._id.toString()
      : store.owner?.toString();
    if (storeOwnerId && storeOwnerId !== userId && req.user?.role !== "admin") {
      res.status(403).json({ message: "You are not authorized to publish this store" });
      return;
    }

    const { storeName, name, slug, sections, theme } = req.body;

    if (slug) {
      const cleanSlug = normalizeSlug(slug);
      if (cleanSlug && cleanSlug !== store.slug) {
        const slugExists = await StoreConfig.findOne({
          slug: cleanSlug,
          _id: { $ne: id },
        });
        if (slugExists) {
          res.status(400).json({ message: `The store URL / slug "${cleanSlug}" is already in use.` });
          return;
        }
        store.slug = cleanSlug;
      }
    }

    if (storeName !== undefined || name !== undefined) {
      const updatedName = (storeName || name || "").trim();
      if (updatedName) {
        store.storeName = updatedName;
        store.name = updatedName;
      }
    }

    if (sections !== undefined) {
      store.sections = sections;
    }

    if (theme !== undefined) {
      store.theme = theme;
    }

    store.status = "published";
    store.publishedVersion = {
      storeName: store.storeName,
      sections: store.sections,
      theme: store.theme,
      publishedAt: new Date(),
    };

    await store.save();

    res.status(200).json({
      message: "Store published successfully",
      store,
    });
  } catch (error) {
    console.error("Publish store error:", error);
    res.status(500).json({ message: "Server error publishing store" });
  }
};

/**
 * GET /api/public/store/:slug
 * Publicly fetches a published store by its slug.
 */
export const getPublicStoreConfigBySlug = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const rawSlug = Array.isArray(req.params.slug) ? req.params.slug[0] : req.params.slug;
    const cleanSlug = normalizeSlug(rawSlug || "");

    const store = await StoreConfig.findOne({
      slug: cleanSlug,
      status: "published",
    });

    if (!store || !store.publishedVersion) {
      res.status(404).json({
        message: "Storefront is currently unpublished or not found.",
      });
      return;
    }

    res.status(200).json({
      message: "Published storefront fetched successfully",
      store: {
        _id: store._id,
        storeName: store.publishedVersion.storeName || store.storeName,
        slug: store.slug,
        sections: store.publishedVersion.sections || store.sections,
        theme: store.publishedVersion.theme || store.theme,
        publishedAt: store.publishedVersion.publishedAt,
      },
    });
  } catch (error) {
    console.error("Get public store by slug error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * GET /api/public/store
 * Legacy / fallback public storefront fetcher (supports ?slug= or latest published store).
 */
export const getPublicStoreConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const slugQuery = typeof req.query.slug === "string" ? req.query.slug : undefined;

    let filter: Record<string, any> = { status: "published" };
    if (slugQuery) {
      filter.slug = normalizeSlug(slugQuery);
    }

    const config = await StoreConfig.findOne(filter).sort({ updatedAt: -1 });

    if (!config || !config.publishedVersion) {
      res.status(404).json({
        message: "Storefront is currently unpublished or under maintenance.",
      });
      return;
    }

    res.status(200).json({
      message: "Published storefront fetched successfully",
      store: {
        _id: config._id,
        storeName: config.publishedVersion.storeName || config.storeName,
        slug: config.slug,
        sections: config.publishedVersion.sections || config.sections,
        theme: config.publishedVersion.theme || config.theme,
        publishedAt: config.publishedVersion.publishedAt,
      },
    });
  } catch (error) {
    console.error("Get public store error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Backward compatibility: getStoreConfig
 */
export const getStoreConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    let config = await StoreConfig.findOne({ owner: userId }).sort({ updatedAt: -1 });

    if (!config) {
      const entitlement = await canUserCreate(userId);
      if (!entitlement.allowed) {
        res.status(200).json({
          message: "No store configuration found. Creation limit reached on Free plan.",
          store: null,
          stores: [],
          limitReached: true,
        });
        return;
      }

      const defaultName = "My Store";
      config = await StoreConfig.create({
        owner: userId,
        storeName: defaultName,
        name: defaultName,
        slug: `my-store-${Date.now().toString().slice(-4)}`,
        status: "draft",
        sections: getDefaultSections(defaultName),
        theme: getDefaultTheme(),
      });
    }

    res.status(200).json({
      message: "Store configuration fetched successfully",
      store: config,
      stores: [config],
    });
  } catch (error) {
    console.error("Get store config error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Backward compatibility: saveDraftStoreConfig
 */
export const saveDraftStoreConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const targetId = req.body._id || req.body.id;
    let config: IStoreConfig | null = null;

    if (targetId) {
      config = await StoreConfig.findById(targetId);
      if (config && config.owner.toString() !== userId && req.user?.role !== "admin") {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
    } else {
      config = await StoreConfig.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    const { storeName, name, sections, theme } = req.body;
    const finalName = (storeName || name || "My Store").trim();

    if (!config) {
      const entitlement = await canUserCreate(userId);
      if (!entitlement.allowed) {
        res.status(403).json({
          message:
            entitlement.reason ||
            "Creation limit reached on Free plan. Upgrade to Premium to create more websites and stores.",
          limitReached: true,
          currentCount: entitlement.currentCount,
          maxAllowed: entitlement.maxAllowed,
        });
        return;
      }

      config = new StoreConfig({
        owner: userId,
        storeName: finalName,
        name: finalName,
        slug: `store-${Date.now().toString().slice(-4)}`,
        status: "draft",
        sections: sections || getDefaultSections(finalName),
        theme: theme || getDefaultTheme(),
      });
    } else {
      if (storeName !== undefined || name !== undefined) {
        config.storeName = finalName;
        config.name = finalName;
      }
      if (sections !== undefined) config.sections = sections;
      if (theme !== undefined) config.theme = theme;
    }

    await config.save();

    res.status(200).json({
      message: "Store configuration saved successfully",
      store: config,
    });
  } catch (error) {
    console.error("Save store config error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Backward compatibility: publishStoreConfig
 */
export const publishStoreConfig = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const targetId = req.body._id || req.body.id;
    let config: IStoreConfig | null = null;

    if (targetId) {
      config = await StoreConfig.findById(targetId);
      if (config && config.owner.toString() !== userId && req.user?.role !== "admin") {
        res.status(403).json({ message: "Unauthorized" });
        return;
      }
    } else {
      config = await StoreConfig.findOne({ owner: userId }).sort({ updatedAt: -1 });
    }

    const { storeName, name, sections, theme } = req.body;
    const finalName = (storeName || name || "My Store").trim();

    if (!config) {
      const entitlement = await canUserCreate(userId);
      if (!entitlement.allowed) {
        res.status(403).json({
          message:
            entitlement.reason ||
            "Creation limit reached on Free plan. Upgrade to Premium to create more websites and stores.",
          limitReached: true,
          currentCount: entitlement.currentCount,
          maxAllowed: entitlement.maxAllowed,
        });
        return;
      }

      config = new StoreConfig({
        owner: userId,
        storeName: finalName,
        name: finalName,
        slug: `store-${Date.now().toString().slice(-4)}`,
        sections: sections || getDefaultSections(finalName),
        theme: theme || getDefaultTheme(),
      });
    } else {
      if (storeName !== undefined || name !== undefined) {
        config.storeName = finalName;
        config.name = finalName;
      }
      if (sections !== undefined) config.sections = sections;
      if (theme !== undefined) config.theme = theme;
    }

    config.status = "published";
    config.publishedVersion = {
      storeName: config.storeName,
      sections: config.sections,
      theme: config.theme,
      publishedAt: new Date(),
    };

    await config.save();

    res.status(200).json({
      message: "Store published successfully",
      store: config,
    });
  } catch (error) {
    console.error("Publish store config error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
