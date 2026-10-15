import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  Plus,
  FileText,
  Check,
  Search,
  AlertCircle,
  Globe,
} from "lucide-react";
import "./PageSelectorDropdown.css";

export interface PageListItem {
  _id: string;
  title: string;
  slug: string;
  status: "draft" | "published";
  updatedAt?: string;
  createdAt?: string;
}

interface PageSelectorDropdownProps {
  currentPageTitle: string;
  currentId?: string;
  pages: PageListItem[];
  loading: boolean;
  error: string;
  onSelectPage: (page: PageListItem) => void;
  onCreateNewPage: () => void;
  onRetry: () => void;
}

export const PageSelectorDropdown: React.FC<PageSelectorDropdownProps> = ({
  currentPageTitle,
  currentId,
  pages,
  loading,
  error,
  onSelectPage,
  onCreateNewPage,
  onRetry,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
    setSearchQuery("");
  };

  const handleSelect = (page: PageListItem) => {
    setIsOpen(false);
    onSelectPage(page);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    onCreateNewPage();
  };

  const filteredPages = pages.filter((page) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase().trim();
    return (
      (page.title && page.title.toLowerCase().includes(query)) ||
      (page.slug && page.slug.toLowerCase().includes(query))
    );
  });

  const displayTitle =
    currentPageTitle.trim() || (currentId ? "Untitled Page" : "New Page");

  return (
    <div className="page-selector-wrapper" ref={dropdownRef}>
      {/* TRIGGER BUTTON (e.g. "Page: Home ⌄") */}
      <button
        type="button"
        className={`page-selector-trigger ${isOpen ? "is-open" : ""}`}
        onClick={toggleDropdown}
        title="Switch page or create a new page"
      >
        <span className="page-selector-label-prefix">Page:</span>
        <span className="page-selector-current-name">{displayTitle}</span>
        <ChevronDown size={14} className="page-selector-chevron" />
      </button>

      {/* DROPDOWN MENU */}
      {isOpen && (
        <div className="page-selector-dropdown">
          {/* CREATE NEW PAGE ACTION */}
          <button
            type="button"
            className="page-dropdown-new-btn"
            onClick={handleCreateNew}
            disabled={loading}
          >
            <Plus size={15} />
            <span>{loading ? "Creating Page..." : "+ New Page"}</span>
          </button>

          {/* SEARCH (visible if 4+ pages or during search) */}
          {(pages.length > 3 || searchQuery) && (
            <div className="page-dropdown-search-wrap">
              <Search size={14} className="page-dropdown-search-icon" />
              <input
                type="text"
                className="page-dropdown-search-input"
                placeholder="Find a page..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
          )}

          {/* HEADER LABEL */}
          <div className="page-dropdown-header-label">
            <span>Pages</span>
            <span className="page-dropdown-badge-count">{pages.length}</span>
          </div>

          {/* LIST / LOADING / ERROR STATES */}
          {loading ? (
            <div className="page-dropdown-state-box">
              <div className="page-dropdown-spinner" />
              <span>Loading pages...</span>
            </div>
          ) : error ? (
            <div className="page-dropdown-state-box">
              <AlertCircle size={18} style={{ color: "#ef4444" }} />
              <span>{error}</span>
              <button
                type="button"
                className="page-dropdown-retry-btn"
                onClick={onRetry}
              >
                Retry
              </button>
            </div>
          ) : filteredPages.length === 0 ? (
            <div className="page-dropdown-state-box">
              {searchQuery ? (
                <span>No pages matching "{searchQuery}"</span>
              ) : (
                <span>No pages found. Click "+ New Page" to create one.</span>
              )}
            </div>
          ) : (
            <div className="page-dropdown-list">
              {filteredPages.map((page) => {
                const isSelected = currentId === page._id;

                return (
                  <button
                    key={page._id}
                    type="button"
                    className={`page-dropdown-item ${isSelected ? "is-selected" : ""}`}
                    onClick={() => handleSelect(page)}
                  >
                    <div className="page-item-info">
                      <div className="page-item-icon">
                        {page.slug === "home" || page.title.toLowerCase() === "home" ? (
                          <Globe size={15} />
                        ) : (
                          <FileText size={15} />
                        )}
                      </div>
                      <div className="page-item-text">
                        <span className="page-item-title">
                          {page.title || "Untitled Page"}
                        </span>
                        <span className="page-item-slug">/{page.slug}</span>
                      </div>
                    </div>

                    <div className="page-item-meta">
                      <span className={`page-status-pill ${page.status}`}>
                        {page.status}
                      </span>
                      {isSelected && (
                        <Check size={15} className="page-item-check" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
