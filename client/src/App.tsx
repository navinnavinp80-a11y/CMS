import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/Login";
import Dashboard from "./pages/Dashboard/Dashboard";
import Content from "./pages/Content/Content";
import CreateContent from "./pages/Content/CreateContent";
import EditContent from "./pages/Content/EditContent";
import PageBuilder from "./pages/PageBuilder/PageBuilder";
import Media from "./pages/Media/Media";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/content"
          element={<Content />}
        />

        <Route
          path="/content/create"
          element={<CreateContent />}
        />

        <Route
          path="/content/create-page"
          element={<PageBuilder />}
        />

        <Route
          path="/content/edit-page/:id"
          element={<PageBuilder />}
        />

        <Route
          path="/content/edit/:id"
          element={<EditContent />}
        />

        <Route
          path="/media"
          element={<Media />}
        />

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;