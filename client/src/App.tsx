import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AuthProvider, isTokenValid } from "./context/AuthContext";
import { ProtectedRoute, PublicOnlyRoute } from "./components/Auth/ProtectedRoute";
import Login from "./pages/Login/Login";
import Signup from "./pages/Signup/Signup";
import Dashboard from "./pages/Dashboard/Dashboard";
import Content from "./pages/Content/Content";
import CreateContent from "./pages/Content/CreateContent";
import EditContent from "./pages/Content/EditContent";
import PageBuilder from "./pages/PageBuilder/PageBuilder";
import Media from "./pages/Media/Media";
import Users from "./pages/Users/Users";
import Analytics from "./pages/Analytics/Analytics";
import Settings from "./pages/Settings/Settings";
import PublicPageViewer from "./pages/PublicPageViewer/PublicPageViewer";
import Stores from "./pages/Stores/Stores";
import StoreEditor from "./pages/StoreEditor/StoreEditor";
import PublicStorefront from "./pages/PublicStorefront/PublicStorefront";
import PremiumPayment from "./pages/Premium/PremiumPayment";


function NotFound() {
  const token = localStorage.getItem("token");
  const hasValidAuth = isTokenValid(token);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F3F6FA",
        padding: "20px",
        fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "460px",
          width: "100%",
          textAlign: "center",
          padding: "40px 24px",
          background: "#ffffff",
          borderRadius: "16px",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.06)",
          border: "1px solid #E8EEF5",
        }}
      >
        <h1 style={{ fontSize: "56px", margin: "0 0 8px", color: "#2563EB", fontWeight: 800 }}>
          404
        </h1>
        <h2 style={{ fontSize: "20px", margin: "0 0 10px", color: "#0F172A", fontWeight: 700 }}>
          Page Not Found
        </h2>
        <p style={{ fontSize: "14px", color: "#64748B", margin: "0 0 24px", lineHeight: 1.6 }}>
          The page you requested does not exist or has not been published yet.
        </p>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
          <Link
            to="/home"
            style={{
              padding: "9px 18px",
              background: "#2563EB",
              color: "#ffffff",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            Go to Website
          </Link>
          {hasValidAuth ? (
            <Link
              to="/dashboard"
              style={{
                padding: "9px 18px",
                background: "#EFF6FF",
                color: "#2563EB",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              CMS Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              style={{
                padding: "9px 18px",
                background: "#EFF6FF",
                color: "#2563EB",
                borderRadius: "8px",
                textDecoration: "none",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              CMS Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Initial Application Route: Displays the CMS Login page by default */}
          <Route
            path="/"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />

          {/* Public Auth Routes: Accessible only when NOT authenticated; redirects to /dashboard if logged in */}
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <Login />
              </PublicOnlyRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicOnlyRoute>
                <Signup />
              </PublicOnlyRoute>
            }
          />

          {/* Protected CMS Admin Routes: Accessible ONLY after successful authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content"
            element={
              <ProtectedRoute>
                <Content />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content/create"
            element={
              <ProtectedRoute>
                <CreateContent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content/create-page"
            element={
              <ProtectedRoute>
                <PageBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content/edit-page/:id"
            element={
              <ProtectedRoute>
                <PageBuilder />
              </ProtectedRoute>
            }
          />

          <Route
            path="/content/edit/:id"
            element={
              <ProtectedRoute>
                <EditContent />
              </ProtectedRoute>
            }
          />

          <Route
            path="/media"
            element={
              <ProtectedRoute>
                <Media />
              </ProtectedRoute>
            }
          />

          <Route
            path="/users"
            element={
              <ProtectedRoute>
                <Users />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />


          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <Stores />
              </ProtectedRoute>
            }
          />

          <Route
            path="/store-editor/:storeId"
            element={
              <ProtectedRoute>
                <StoreEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/store-editor"
            element={
              <ProtectedRoute>
                <StoreEditor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/premium"
            element={
              <ProtectedRoute>
                <PremiumPayment />
              </ProtectedRoute>
            }
          />

          {/* Public Website Routes: Completely accessible without CMS authentication */}
          <Route path="/home" element={<PublicPageViewer isHome />} />
          <Route path="/store/:slug" element={<PublicStorefront />} />
          <Route path="/store" element={<PublicStorefront />} />
          {/* Legacy /p/:slug route alias for backwards compatibility */}
          <Route path="/p/:slug" element={<PublicPageViewer />} />

          {/* Dynamic Public Page Route: Automatically loads any published CMS page by slug */}
          <Route path="/:slug" element={<PublicPageViewer />} />

          {/* Catch-all 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;