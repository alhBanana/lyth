import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import { StoryProvider } from "./contexts/StoryContext";

import Dashboard from "./pages/Dashboard";
import Stories from "./pages/Stories";
import Story from "./pages/Story";
import Calendar from "./pages/Calendar";
import Diary from "./pages/Diary";
import Collection from "./pages/Collection";
import Library from "./pages/Library";
import Bookmarks from "./pages/Bookmarks";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <BrowserRouter>
      <StoryProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/stories" element={<Stories />} />
            <Route path="/stories/:id" element={<Story />} />
            <Route path="/collections/:id" element={<Collection />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/diary" element={<Diary />} />
            <Route path="/library" element={<Library />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </StoryProvider>
    </BrowserRouter>
  );
}