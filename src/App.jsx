import { Navigate, Route, Routes } from 'react-router-dom';
import { token as getToken } from './api.js';
import { Layout } from './Layout.jsx';
import { Login } from './Login.jsx';
import { Products } from './Products.jsx';
import { Subscribers } from './Subscribers.jsx';

function Protected({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/subscribers" replace />} />
        <Route path="subscribers" element={<Subscribers />} />
        <Route path="products" element={<Products />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
