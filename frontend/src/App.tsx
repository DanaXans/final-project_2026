import { Navigate, Route, Routes } from 'react-router-dom';
import { Protected } from './Protected';
import ActivatePage from './pages/ActivatePage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/activate/:token" element={<ActivatePage />} />
      <Route
        path="/orders"
        element={
          <Protected>
            <OrdersPage />
          </Protected>
        }
      />
      <Route
        path="/admin"
        element={
          <Protected>
            <AdminPage />
          </Protected>
        }
      />
    </Routes>
  );
}

export default App;
