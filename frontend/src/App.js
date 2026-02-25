import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import HomePage from "./pages/HomePage";
import NewsPage from "./pages/NewsPage";
import LibraryPage from "./pages/LibraryPage";

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/library" element={<LibraryPage />} />
          <Route
            path="/settings"
            element={
              <div className="p-8">
                <h1 className="text-2xl text-white">
                  Settings Page (Coming Soon)
                </h1>
              </div>
            }
          />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
