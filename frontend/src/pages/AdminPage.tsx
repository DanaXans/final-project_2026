import { useEffect, useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { getUser } from '../auth';

export default function AdminPage() {
  const user = getUser();
  const [stats, setStats] = useState<any>({});
  const [managers, setManagers] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ email: '', name: '', surname: '' });
  const [msg, setMsg] = useState('');

  const load = async () => {
    const s = await api.get('/admin/stats');
    setStats(s.data);
    const m = await api.get('/admin/managers', { params: { page } });
    setManagers(m.data.data);
    setTotalPages(m.data.totalPages);
  };

  useEffect(() => {
    load();
  }, [page]);

  if (user?.role !== 'admin') {
    return <Navigate to="/orders?page=1&order=-id" replace />;
  }

  const create = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/admin/managers', form);
    setOpen(false);
    setForm({ email: '', name: '', surname: '' });
    load();
  };

  const activate = async (id: string) => {
    const res = await api.post('/admin/managers/' + id + '/activate');
    await navigator.clipboard.writeText(res.data.link);
    setMsg('link copied: ' + res.data.link);
  };

  return (
    <div>
      <Header />
      <div className="admin-wrap">
        <div className="stats">
          <div className="stat-box"><span>total</span>{stats.total ?? 0}</div>
          <div className="stat-box"><span>Agree</span>{stats.Agree ?? 0}</div>
          <div className="stat-box"><span>In work</span>{stats['In work'] ?? 0}</div>
          <div className="stat-box"><span>Disagree</span>{stats.Disagree ?? 0}</div>
          <div className="stat-box"><span>Dubbing</span>{stats.Dubbing ?? 0}</div>
          <div className="stat-box"><span>New</span>{stats.New ?? 0}</div>
        </div>
        <button className="create-btn" onClick={() => setOpen(true)}>Create</button>
        {msg && <p className="copied">{msg}</p>}

        {managers.map((m) => (
          <div className="manager-card" key={m.id}>
            <p>id: {m.id}</p>
            <p>email: {m.email}</p>
            <p>name: {m.name} {m.surname}</p>
            <p>is_active: {String(m.is_active)}</p>
            <p>last_login: {m.last_login ? new Date(m.last_login).toLocaleString() : '-'}</p>
            <p>total: {m.stats.total} | Agree {m.stats.Agree} | In work {m.stats['In work']} | Disagree {m.stats.Disagree} | Dubbing {m.stats.Dubbing} | New {m.stats.New}</p>
            <div className="card-actions">
              <button onClick={() => activate(m.id)}>{m.is_active ? 'Recovery password' : 'Activate'}</button>
              <button onClick={() => api.patch('/admin/managers/' + m.id + '/ban').then(load)}>Ban</button>
              <button onClick={() => api.patch('/admin/managers/' + m.id + '/unban').then(load)}>Unban</button>
            </div>
          </div>
        ))}

        <div className="pager">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)}>{'<'}</button>
          <span>{page} / {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>{'>'}</button>
        </div>
      </div>

      {open && (
        <div className="modal" onClick={() => setOpen(false)}>
          <form className="modal-box" onClick={(e) => e.stopPropagation()} onSubmit={create}>
            <h3>Create manager</h3>
            <label>Email <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
            <label>Name <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Surname <input value={form.surname} onChange={(e) => setForm({ ...form, surname: e.target.value })} /></label>
            <div className="modal-actions">
              <button type="button" onClick={() => setOpen(false)}>Cancel</button>
              <button type="submit">Create</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
