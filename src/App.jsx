import { Navigate, Route, Routes } from 'react-router-dom';
import { token as getToken } from './api.js';
import { Banners } from './Banners.jsx';
import { Blogs } from './Blogs.jsx';
import { Categories } from './Categories.jsx';
import { Dashboard } from './Dashboard.jsx';
import { DemoAccess } from './DemoAccess.jsx';
import { Discounts } from './Discounts.jsx';
import { Layout } from './Layout.jsx';
import { Login } from './Login.jsx';
import { Orders } from './Orders.jsx';
import { Pages } from './Pages.jsx';
import { Products } from './Products.jsx';
import { Subscribers } from './Subscribers.jsx';
import { Users } from './Users.jsx';

function Protected({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/client-access" element={<DemoAccess />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="orders" element={<Orders />} />
        <Route path="pages" element={<Pages />} />
        <Route path="categories" element={<Categories />} />
        <Route path="categories/new" element={<Categories />} />
        <Route path="categories/:id/edit" element={<Categories />} />
        <Route path="discounts" element={<Discounts />} />
        <Route path="discounts/new" element={<Discounts />} />
        <Route path="discounts/:id/edit" element={<Discounts />} />
        <Route path="banners" element={<Banners />} />
        <Route path="banners/new" element={<Banners />} />
        <Route path="banners/:id/edit" element={<Banners />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="blogs" element={<Blogs />} />
        <Route path="blogs/new" element={<Blogs />} />
        <Route path="blogs/:id/edit" element={<Blogs />} />
        <Route path="products" element={<Products />} />
        <Route path="products/new" element={<Products />} />
        <Route path="products/:id/edit" element={<Products />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
