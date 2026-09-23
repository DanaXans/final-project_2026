import { useState, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api';

export default function ActivatePage() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('passwords do not match');
      return;
    }
    try {
      await api.post('/auth/activate/' + token, { password, confirmPassword });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'activation failed');
    }
  };

  return (
    <div className="login-page">
      <form className="login-box" onSubmit={submit}>
        <h2>Activate</h2>
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        {error && <p className="error">{String(error)}</p>}
        <button type="submit">Activate</button>
      </form>
    </div>
  );
}
