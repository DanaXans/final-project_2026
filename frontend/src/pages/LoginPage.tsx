import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await api.post('/auth/login', { email, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/orders');
    } catch (err: any) {
      setError(err.response?.data?.message || 'login failed');
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={submit}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="error">{String(error)}</p>}
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
