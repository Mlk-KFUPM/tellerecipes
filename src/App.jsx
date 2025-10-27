import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./pages/auth/LoginPage.jsx";
import RegisterPage from "./pages/auth/RegisterPage.jsx";
import ProtectedRoute from "./routes/ProtectedRoute.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import HomePage from "./pages/user/HomePage.jsx";
import CollectionsPage from "./pages/user/CollectionsPage.jsx";
import ShoppingListPage from "./pages/user/ShoppingListPage.jsx";
import ProfilePage from "./pages/user/ProfilePage.jsx";
import RecipeDetailPage from "./pages/user/RecipeDetailPage.jsx";

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/auth/login" replace />} />
    <Route path="/auth/login" element={<LoginPage />} />
    <Route path="/auth/register" element={<RegisterPage />} />
    <Route element={<ProtectedRoute />}>
      <Route path="/app" element={<DashboardLayout />}>
        <Route index element={<HomePage />} />
        <Route path="recipes/:id" element={<RecipeDetailPage />} />
        <Route path="collections" element={<CollectionsPage />} />
        <Route path="shopping-list" element={<ShoppingListPage />} />
        <Route path="profile" element={<ProfilePage />} />
      </Route>
    </Route>
    <Route path="*" element={<Navigate to="/auth/login" replace />} />
  </Routes>
);

export default App;
