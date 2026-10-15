import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Plus,
    Search,
    ShoppingBag,
    ExternalLink,
    Pencil,
    Trash2,
    X,
    Store as StoreIcon,
    AlertCircle,
    CheckCircle,
} from "lucide-react";
import AdminLayout from "../../components/Layout/AdminLayout";
import { getStores, createStore, deleteStore } from "../../services/api";
import type { StoreItem } from "../../services/api";
import "./Stores.css";

const normalizeSlug = (text: string): string => {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
};

const formatDate = (dateString?: string): string => {
    if (!dateString) return "—";
    try {
        return new Date(dateString).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return "—";
    }
};

export default function Stores() {
    const navigate = useNavigate();

    // Stores data state
    const [stores, setStores] = useState<StoreItem[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [success, setSuccess] = useState<string>("");

    // Filtering and search state
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [activeTab, setActiveTab] = useState<"all" | "published" | "draft">("all");

    // Create Store Modal state
    const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
    const [newStoreName, setNewStoreName] = useState<string>("");
    const [newStoreSlug, setNewStoreSlug] = useState<string>("");
    const [slugManuallyEdited, setSlugManuallyEdited] = useState<boolean>(false);
    const [creating, setCreating] = useState<boolean>(false);
    const [createError, setCreateError] = useState<string>("");

    // Delete Store Modal state
    const [deleteConfirmStore, setDeleteConfirmStore] = useState<StoreItem | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);

    // Load stores from API
    const fetchStores = useCallback(async () => {
        try {
            setLoading(true);
            setError("");
            const storesList = await getStores();
            setStores(Array.isArray(storesList) ? storesList : []);
        } catch (err: unknown) {
            console.error("Failed to load stores:", err);
            const errObj = err as { status?: number; message?: string };
            if (errObj.status === 401 || errObj.message?.includes("token")) {
                try {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                } catch {
                    /* ignore storage errors */
                }
                navigate("/login", { replace: true });
                return;
            }
            setError(errObj.message || "Failed to fetch stores from server");
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        void fetchStores();
    }, [fetchStores]);

    // Tab counts
    const publishedCount = useMemo(
        () => stores.filter((s) => s.status === "published").length,
        [stores]
    );
    const draftCount = useMemo(
        () => stores.filter((s) => s.status === "draft").length,
        [stores]
    );

    // Filtered stores based on active tab and search term
    const filteredStores = useMemo(() => {
        return stores.filter((store) => {
            if (activeTab === "published" && store.status !== "published") return false;
            if (activeTab === "draft" && store.status !== "draft") return false;

            const q = searchTerm.toLowerCase().trim();
            if (!q) return true;

            const name = (store.storeName || store.name || "").toLowerCase();
            const slug = (store.slug || "").toLowerCase();
            return name.includes(q) || slug.includes(q);
        });
    }, [stores, activeTab, searchTerm]);

    // Create store handlers
    const handleNameChange = (val: string) => {
        setNewStoreName(val);
        if (!slugManuallyEdited) {
            setNewStoreSlug(normalizeSlug(val));
        }
    };

    const handleSlugChange = (val: string) => {
        setSlugManuallyEdited(true);
        setNewStoreSlug(normalizeSlug(val));
    };

    const handleOpenCreateModal = () => {
        setNewStoreName("");
        setNewStoreSlug("");
        setSlugManuallyEdited(false);
        setCreateError("");
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        if (creating) return;
        setShowCreateModal(false);
        setCreateError("");
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = newStoreName.trim();
        const cleanSlug = normalizeSlug(newStoreSlug);

        if (!trimmedName) {
            setCreateError("Store name is required.");
            return;
        }
        if (!cleanSlug) {
            setCreateError("A valid URL slug is required (letters, numbers, hyphens).");
            return;
        }

        try {
            setCreating(true);
            setCreateError("");
            const createdStore = await createStore({
                storeName: trimmedName,
                slug: cleanSlug,
            });

            setShowCreateModal(false);
            setNewStoreName("");
            setNewStoreSlug("");
            setSlugManuallyEdited(false);

            // Navigate straight to the store editor for this new store
            navigate(`/store-editor/${createdStore._id}`);
        } catch (err: unknown) {
            console.error("Create store failed:", err);
            const errObj = err as { message?: string };
            setCreateError(errObj.message || "Failed to create store.");
        } finally {
            setCreating(false);
        }
    };

    // Delete store handler
    const handleDeleteStore = async () => {
        if (!deleteConfirmStore) return;
        try {
            setDeleting(true);
            await deleteStore(deleteConfirmStore._id);
            setStores((prev) => prev.filter((s) => s._id !== deleteConfirmStore._id));
            setSuccess(
                `Store "${deleteConfirmStore.storeName || deleteConfirmStore.name || "Store"}" has been deleted.`
            );
            setDeleteConfirmStore(null);
            setTimeout(() => setSuccess(""), 4000);
        } catch (err: unknown) {
            console.error("Delete store error:", err);
            const errObj = err as { message?: string };
            setError(errObj.message || "Failed to delete store.");
            setDeleteConfirmStore(null);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <AdminLayout contentCount={stores.length}>
            <div className="stores-page-wrapper">
                {/* Page Header */}
                <div className="stores-page-header">
                    <div className="stores-header-title-group">
                        <h1>Stores</h1>
                        <p>Manage, customize, and publish your online storefronts.</p>
                    </div>

                    <div className="stores-header-actions">
                        <button
                            type="button"
                            className="cms-btn-primary"
                            onClick={handleOpenCreateModal}
                        >
                            <Plus size={16} />
                            <span>Create Store</span>
                        </button>
                    </div>
                </div>

                {/* Global Feedback Banners */}
                {error && (
                    <div className="stores-error-banner">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <AlertCircle size={16} />
                            <span>{error}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setError("")}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "inherit",
                                display: "flex",
                                alignItems: "center",
                            }}
                            title="Dismiss error"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {success && (
                    <div className="stores-success-banner">
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <CheckCircle size={16} />
                            <span>{success}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSuccess("")}
                            style={{
                                border: "none",
                                background: "transparent",
                                cursor: "pointer",
                                color: "inherit",
                                display: "flex",
                                alignItems: "center",
                            }}
                            title="Dismiss message"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {/* Toolbar & Filters Card */}
                <div className="stores-toolbar-card">
                    <div className="stores-filter-tabs">
                        <button
                            type="button"
                            className={`stores-tab-btn ${activeTab === "all" ? "active" : ""}`}
                            onClick={() => setActiveTab("all")}
                        >
                            All <span className="stores-tab-count">{stores.length}</span>
                        </button>
                        <button
                            type="button"
                            className={`stores-tab-btn ${activeTab === "published" ? "active" : ""
                                }`}
                            onClick={() => setActiveTab("published")}
                        >
                            Published <span className="stores-tab-count">{publishedCount}</span>
                        </button>
                        <button
                            type="button"
                            className={`stores-tab-btn ${activeTab === "draft" ? "active" : ""}`}
                            onClick={() => setActiveTab("draft")}
                        >
                            Draft <span className="stores-tab-count">{draftCount}</span>
                        </button>
                    </div>

                    <div className="stores-search-input-box">
                        <Search size={15} className="stores-search-icon" />
                        <input
                            type="text"
                            placeholder="Search stores by name or URL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                className="stores-search-clear-btn"
                                onClick={() => setSearchTerm("")}
                                title="Clear search"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Stores Table or Empty/Loading States */}
                {loading ? (
                    <div className="stores-table-card">
                        <div className="stores-loading-state">
                            <div className="stores-spinner" />
                            <p>Loading stores from database...</p>
                        </div>
                    </div>
                ) : filteredStores.length === 0 ? (
                    <div className="stores-table-card">
                        <div className="stores-empty-state">
                            <div className="stores-empty-icon-box">
                                <StoreIcon size={32} />
                            </div>
                            <h3>
                                {searchTerm || activeTab !== "all"
                                    ? "No matching stores found"
                                    : "No stores yet"}
                            </h3>
                            <p>
                                {searchTerm || activeTab !== "all"
                                    ? "Try adjusting your search query or filter tab to view other stores."
                                    : "Create your first online store and start customizing sections with the visual store editor."}
                            </p>
                            {searchTerm || activeTab !== "all" ? (
                                <button
                                    type="button"
                                    className="cms-btn-secondary"
                                    onClick={() => {
                                        setSearchTerm("");
                                        setActiveTab("all");
                                    }}
                                >
                                    Clear Filters
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className="cms-btn-primary"
                                    onClick={handleOpenCreateModal}
                                >
                                    <Plus size={16} />
                                    <span>Create First Store</span>
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="stores-table-card">
                        <div className="stores-table-container">
                            <table className="stores-table">
                                <thead>
                                    <tr>
                                        <th>Store Name</th>
                                        <th>Storefront URL</th>
                                        <th>Status</th>
                                        <th>Last Updated</th>
                                        <th style={{ textAlign: "right" }}>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredStores.map((store) => {
                                        const displayName =
                                            store.storeName || store.name || "Untitled Store";
                                        const isPublished = store.status === "published";
                                        const publicUrl = `/store/${store.slug}`;

                                        return (
                                            <tr key={store._id}>
                                                <td>
                                                    <div className="store-name-cell">
                                                        <div className="store-avatar-box">
                                                            <ShoppingBag size={20} />
                                                        </div>
                                                        <div className="store-name-info">
                                                            <span
                                                                className="store-title-link"
                                                                onClick={() => navigate(`/store-editor/${store._id}`)}
                                                                title={`Open ${displayName} in Store Editor`}
                                                            >
                                                                {displayName}
                                                            </span>
                                                            <span className="store-slug-hint">
                                                                /store/{store.slug}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                <td>
                                                    <a
                                                        href={publicUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="store-slug-badge"
                                                        title={`Open live storefront at ${publicUrl}`}
                                                    >
                                                        <span>{publicUrl}</span>
                                                        <ExternalLink size={12} />
                                                    </a>
                                                </td>

                                                <td>
                                                    <span
                                                        className={`store-status-badge ${isPublished ? "published" : "draft"
                                                            }`}
                                                    >
                                                        <span className="status-dot" />
                                                        {isPublished ? "Published" : "Draft"}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="store-date-cell">
                                                        {formatDate(store.updatedAt || store.createdAt)}
                                                    </span>
                                                </td>

                                                <td className="store-actions-cell">
                                                    <div className="store-action-buttons">
                                                        <button
                                                            type="button"
                                                            className="store-action-btn edit"
                                                            onClick={() => navigate(`/store-editor/${store._id}`)}
                                                            title="Edit store sections & theme"
                                                        >
                                                            <Pencil size={13} />
                                                            <span>Edit</span>
                                                        </button>

                                                        <a
                                                            href={publicUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="store-action-btn view-live"
                                                            title="Open public storefront in a new tab"
                                                        >
                                                            <ExternalLink size={13} />
                                                            <span>Live</span>
                                                        </a>

                                                        <button
                                                            type="button"
                                                            className="store-action-btn delete"
                                                            onClick={() => setDeleteConfirmStore(store)}
                                                            title="Delete store permanently"
                                                        >
                                                            <Trash2 size={13} />
                                                            <span>Delete</span>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Modal: Create Store */}
                {showCreateModal && (
                    <div
                        className="stores-modal-overlay"
                        onClick={handleCloseCreateModal}
                    >
                        <div
                            className="stores-modal-dialog"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="stores-modal-header">
                                <div className="stores-modal-title-group">
                                    <div className="stores-modal-icon-badge">
                                        <ShoppingBag size={20} />
                                    </div>
                                    <div>
                                        <h2>Create New Store</h2>
                                        <p>Set up a storefront with your custom name and URL slug.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="stores-modal-close-btn"
                                    onClick={handleCloseCreateModal}
                                    disabled={creating}
                                    title="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateSubmit}>
                                <div className="stores-modal-body">
                                    {createError && (
                                        <div className="stores-form-error">{createError}</div>
                                    )}

                                    <div className="stores-form-group">
                                        <label htmlFor="modal-store-name">
                                            Store Name <span className="required-star">*</span>
                                        </label>
                                        <input
                                            id="modal-store-name"
                                            type="text"
                                            className="stores-form-input"
                                            placeholder="e.g. Nordic Apparel, Artisanal Ceramics"
                                            value={newStoreName}
                                            onChange={(e) => handleNameChange(e.target.value)}
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    <div className="stores-form-group">
                                        <label htmlFor="modal-store-slug">
                                            Store URL Slug <span className="required-star">*</span>
                                        </label>
                                        <div className="stores-slug-input-wrapper">
                                            <span className="stores-slug-prefix">/store/</span>
                                            <input
                                                id="modal-store-slug"
                                                type="text"
                                                placeholder="nordic-apparel"
                                                value={newStoreSlug}
                                                onChange={(e) => handleSlugChange(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <span className="stores-form-hint">
                                            The public URL where your storefront will be accessible.
                                            Use lowercase letters, numbers, and hyphens.
                                        </span>
                                    </div>
                                </div>

                                <div className="stores-modal-footer">
                                    <button
                                        type="button"
                                        className="cms-btn-secondary"
                                        onClick={handleCloseCreateModal}
                                        disabled={creating}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        type="submit"
                                        className="cms-btn-primary"
                                        disabled={
                                            creating || !newStoreName.trim() || !newStoreSlug.trim()
                                        }
                                    >
                                        {creating ? (
                                            <span>Creating...</span>
                                        ) : (
                                            <>
                                                <Plus size={16} />
                                                <span>Create & Open Editor</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Modal: Delete Confirmation */}
                {deleteConfirmStore && (
                    <div
                        className="stores-modal-overlay"
                        onClick={() => !deleting && setDeleteConfirmStore(null)}
                    >
                        <div
                            className="stores-modal-dialog"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="stores-modal-header">
                                <div className="stores-modal-title-group">
                                    <div className="stores-modal-icon-badge danger">
                                        <Trash2 size={20} />
                                    </div>
                                    <div>
                                        <h2>Delete Store</h2>
                                        <p>This action is permanent and cannot be undone.</p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    className="stores-modal-close-btn"
                                    onClick={() => !deleting && setDeleteConfirmStore(null)}
                                    disabled={deleting}
                                    title="Close modal"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            <div className="stores-modal-body">
                                <p
                                    style={{
                                        margin: 0,
                                        fontSize: "13.5px",
                                        color: "var(--cms-text-body)",
                                        lineHeight: 1.6,
                                    }}
                                >
                                    Are you sure you want to delete{" "}
                                    <strong>
                                        {deleteConfirmStore.storeName ||
                                            deleteConfirmStore.name ||
                                            "this store"}
                                    </strong>{" "}
                                    (<code>/store/{deleteConfirmStore.slug}</code>)?
                                </p>
                                <p
                                    style={{
                                        margin: "8px 0 0",
                                        fontSize: "12.5px",
                                        color: "var(--cms-text-muted)",
                                    }}
                                >
                                    All custom section blocks, theme configurations, and published
                                    storefront data will be permanently deleted from the database.
                                </p>
                            </div>

                            <div className="stores-modal-footer">
                                <button
                                    type="button"
                                    className="cms-btn-secondary"
                                    onClick={() => setDeleteConfirmStore(null)}
                                    disabled={deleting}
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className="stores-danger-btn"
                                    onClick={handleDeleteStore}
                                    disabled={deleting}
                                >
                                    {deleting ? (
                                        <span>Deleting...</span>
                                    ) : (
                                        <>
                                            <Trash2 size={16} />
                                            <span>Confirm Delete</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
