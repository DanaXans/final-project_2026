import { Link, useNavigate } from 'react-router-dom';
import { getUser } from '../auth';

export default function Header() {
  const user = getUser();
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <header className="header">
      <Link to="/orders?page=1&order=-id" className="logo">CRM Programming School</Link>
      <div className="header-right">
        <span>{user?.name} {user?.surname}</span>
        {user?.role === 'admin' && (
          <Link to="/admin" className="header-btn">Admin</Link>
        )}
        <button className="header-btn" onClick={logout}>Logout</button>
      </div>
    </header>
  );
}
