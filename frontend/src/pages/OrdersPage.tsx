import { Fragment, useEffect, useRef, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api';
import Header from '../components/Header';
import { getUser } from '../auth';

const STATUSES = ['', 'In work', 'New', 'Agree', 'Disagree', 'Dubbing'];
const COURSES = ['', 'FS', 'QACX', 'JCX', 'JSCX', 'FE', 'PCX'];
const COURSE_TYPES = ['', 'pro', 'minimal', 'premium', 'incubator', 'vip'];
const COURSE_FORMATS = ['', 'static', 'online'];

const COLUMNS = [
  'id',
  'name',
  'surname',
  'email',
  'phone',
  'age',
  'course',
  'course_format',
  'course_type',
  'status',
  'sum',
  'alreadyPaid',
  'created_at',
  'manager',
  'group',
];

function getPages(page: number, total: number) {
  if (total <= 1) return [1];
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const arr: (number | string)[] = [];
  const add = (x: number | string) => {
    if (arr[arr.length - 1] !== x) arr.push(x);
  };

  // а) перша сторінка
  if (page === 1) {
    add(1);
    add(2);
    add(3);
    add('...');
    add(total);
    return arr;
  }

  // г) остання сторінка
  if (page === total) {
    add(1);
    add('...');
    add(total - 2);
    add(total - 1);
    add(total);
    return arr;
  }

  // б) перша половина
  if (page <= Math.ceil(total / 2)) {
    if (page === 2) return [1, 2, 3, '...', total];
    return [1, '...', page - 1, page, page + 1, '...', total];
  }

  // в) друга половина
  if (page === total - 1) return [1, '...', total - 2, total - 1, total];
  return [1, '...', page - 1, page, page + 1, total];
}

export default function OrdersPage() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState<any[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [openId, setOpenId] = useState<number | null>(null);
  const [comment, setComment] = useState('');
  const [edit, setEdit] = useState<any>(null);
  const [groups, setGroups] = useState<any[]>([]);
  const [newGroup, setNewGroup] = useState('');
  const user = getUser();

  const page = Number(params.get('page') || 1);
  const order = params.get('order') || '-id';

  const load = async () => {
    const res = await api.get('/orders', { params: Object.fromEntries(params) });
    setData(res.data.data);
    setTotalPages(res.data.totalPages);
  };

  useEffect(() => {
    load();
    api.get('/groups').then((r) => setGroups(r.data));
  }, [params]);

  // debounce для текстових фільтрів
  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.set('page', '1');
    setParams(next);
  };

  const [localFilters, setLocalFilters] = useState({
    name: params.get('name') || '',
    surname: params.get('surname') || '',
    email: params.get('email') || '',
    phone: params.get('phone') || '',
    age: params.get('age') || '',
  });

  const paramsRef = useRef(params);
  paramsRef.current = params;

  const skipDebounce = useRef(true);
  useEffect(() => {
    if (skipDebounce.current) {
      skipDebounce.current = false;
      return;
    }
    const t = setTimeout(() => {
      const next = new URLSearchParams(paramsRef.current);
      (['name', 'surname', 'email', 'phone', 'age'] as const).forEach((k) => {
        if (localFilters[k]) next.set(k, localFilters[k]);
        else next.delete(k);
      });
      next.set('page', '1');
      setParams(next);
    }, 400);
    return () => clearTimeout(t);
  }, [localFilters]);

  const sortBy = (field: string) => {
    const next = new URLSearchParams(params);
    if (order === field) next.set('order', '-' + field);
    else next.set('order', field);
    setParams(next);
  };

  const canEdit = (row: any) => {
    if (!row.manager) return true;
    return row.manager === user.email || row.manager === user.surname;
  };

  const sendComment = async (id: number) => {
    if (!comment.trim()) return;
    await api.post('/orders/' + id + '/comments', { text: comment });
    setComment('');
    load();
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    await api.patch('/orders/' + edit.id, {
      ...edit,
      age: edit.age === '' ? null : Number(edit.age),
      sum: edit.sum === '' ? null : Number(edit.sum),
      alreadyPaid: edit.alreadyPaid === '' ? null : Number(edit.alreadyPaid),
    });
    setEdit(null);
    load();
  };

  const addGroup = async () => {
    if (!newGroup.trim()) return;
    const res = await api.post('/groups', { name: newGroup });
    setGroups([...groups, res.data]);
    setEdit({ ...edit, group: res.data.name });
    setNewGroup('');
  };

  const downloadExcel = async () => {
    const res = await api.get('/orders/excel', {
      params: Object.fromEntries(params),
      responseType: 'blob',
    });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.xlsx';
    a.click();
  };

  const resetFilters = () => {
    skipDebounce.current = true;
    setLocalFilters({ name: '', surname: '', email: '', phone: '', age: '' });
    setParams({ page: '1', order: '-id' });
  };

  return (
    <div>
      <Header />
      <div className="filters">
        <input placeholder="Name" value={localFilters.name} onChange={(e) => setLocalFilters({ ...localFilters, name: e.target.value })} />
        <input placeholder="Surname" value={localFilters.surname} onChange={(e) => setLocalFilters({ ...localFilters, surname: e.target.value })} />
        <input placeholder="Email" value={localFilters.email} onChange={(e) => setLocalFilters({ ...localFilters, email: e.target.value })} />
        <input placeholder="Phone" value={localFilters.phone} onChange={(e) => setLocalFilters({ ...localFilters, phone: e.target.value })} />
        <input placeholder="Age" value={localFilters.age} onChange={(e) => setLocalFilters({ ...localFilters, age: e.target.value })} />
        <select value={params.get('course') || ''} onChange={(e) => setFilter('course', e.target.value)}>
          {COURSES.map((c) => <option key={c} value={c}>{c || 'Course'}</option>)}
        </select>
        <select value={params.get('course_format') || ''} onChange={(e) => setFilter('course_format', e.target.value)}>
          {COURSE_FORMATS.map((c) => <option key={c} value={c}>{c || 'Course format'}</option>)}
        </select>
        <select value={params.get('course_type') || ''} onChange={(e) => setFilter('course_type', e.target.value)}>
          {COURSE_TYPES.map((c) => <option key={c} value={c}>{c || 'Course type'}</option>)}
        </select>
        <select value={params.get('status') || ''} onChange={(e) => setFilter('status', e.target.value)}>
          {STATUSES.map((c) => <option key={c} value={c}>{c || 'Status'}</option>)}
        </select>
        <select value={params.get('group') || ''} onChange={(e) => setFilter('group', e.target.value)}>
          <option value="">Group</option>
          {groups.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
        </select>
        <input type="date" value={params.get('startDate') || ''} onChange={(e) => setFilter('startDate', e.target.value)} />
        <input type="date" value={params.get('endDate') || ''} onChange={(e) => setFilter('endDate', e.target.value)} />
        <label className="my-check">
          <input type="checkbox" checked={params.get('my') === 'true'} onChange={(e) => setFilter('my', e.target.checked ? 'true' : '')} />
          My
        </label>
        <button onClick={resetFilters}>reset</button>
        <button onClick={load}>refresh</button>
        <button onClick={downloadExcel}>excel</button>
      </div>

      <div className="table-wrap">
      <table className="orders-table">
        <thead>
          <tr>
            {COLUMNS.map((col) => (
              <th key={col} onClick={() => sortBy(col)}>
                {col} {order === col ? '▲' : order === '-' + col ? '▼' : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <Fragment key={row.id}>
              <tr onClick={() => setOpenId(openId === Number(row.id) ? null : Number(row.id))}>
                {COLUMNS.map((col) => (
                  <td key={col}>
                    {col === 'created_at' && row[col]
                      ? new Date(row[col]).toLocaleString()
                      : row[col] === null || row[col] === undefined
                        ? ''
                        : String(row[col]).slice(0, 24)}
                  </td>
                ))}
              </tr>
              {openId === Number(row.id) && (
                <tr className="expand">
                  <td colSpan={15}>
                    <p><b>Message:</b> {row.msg || '-'}</p>
                    <p><b>UTM:</b> {row.utm || '-'}</p>
                    <div className="comments">
                      {(row.comments || []).map((c: any) => (
                        <div key={c._id} className="comment">
                          {c.author} {new Date(c.createdAt).toLocaleString()} — {c.text}
                        </div>
                      ))}
                    </div>
                    {canEdit(row) && (
                      <div className="comment-form">
                        <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder="comment" />
                        <button onClick={() => sendComment(Number(row.id))}>submit</button>
                        <button onClick={() => setEdit({ ...row })}>EDIT</button>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
      </div>

      <div className="pager">
        <button disabled={page <= 1} onClick={() => setFilter('page', String(page - 1))}>{'<'}</button>
        {getPages(page, totalPages).map((p, i) =>
          p === '...' ? (
            <span key={'d' + i}>...</span>
          ) : (
            <button key={String(p)} className={p === page ? 'active' : ''} onClick={() => {
              const next = new URLSearchParams(params);
              next.set('page', String(p));
              setParams(next);
            }}>{p}</button>
          ),
        )}
        <button disabled={page >= totalPages} onClick={() => {
          const next = new URLSearchParams(params);
          next.set('page', String(page + 1));
          setParams(next);
        }}>{'>'}</button>
      </div>

      {edit && (
        <div className="modal" onClick={() => setEdit(null)}>
          <form className="modal-box" onClick={(e) => e.stopPropagation()} onSubmit={saveEdit}>
            <h3>EDIT</h3>
            <div className="modal-grid">
            <label>Group
              <select value={edit.group || ''} onChange={(e) => setEdit({ ...edit, group: e.target.value })}>
                <option value=""></option>
                {groups.map((g) => <option key={g._id} value={g.name}>{g.name}</option>)}
              </select>
            </label>
            <label>Status
              <select value={edit.status || ''} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <div className="add-group">
              <input value={newGroup} onChange={(e) => setNewGroup(e.target.value)} placeholder="new group" />
              <button type="button" onClick={addGroup}>ADD GROUP</button>
            </div>
            <label>Name <input value={edit.name || ''} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></label>
            <label>Sum <input value={edit.sum ?? ''} onChange={(e) => setEdit({ ...edit, sum: e.target.value })} /></label>
            <label>Surname <input value={edit.surname || ''} onChange={(e) => setEdit({ ...edit, surname: e.target.value })} /></label>
            <label>Already paid <input value={edit.alreadyPaid ?? ''} onChange={(e) => setEdit({ ...edit, alreadyPaid: e.target.value })} /></label>
            <label>Email <input value={edit.email || ''} onChange={(e) => setEdit({ ...edit, email: e.target.value })} /></label>
            <label>Course
              <select value={edit.course || ''} onChange={(e) => setEdit({ ...edit, course: e.target.value })}>
                {COURSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Phone <input value={edit.phone || ''} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} /></label>
            <label>Course format
              <select value={edit.course_format || ''} onChange={(e) => setEdit({ ...edit, course_format: e.target.value })}>
                {COURSE_FORMATS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            <label>Age <input value={edit.age ?? ''} onChange={(e) => setEdit({ ...edit, age: e.target.value })} /></label>
            <label>Course type
              <select value={edit.course_type || ''} onChange={(e) => setEdit({ ...edit, course_type: e.target.value })}>
                {COURSE_TYPES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </label>
            </div>
            <div className="modal-actions">
              <button type="button" onClick={() => setEdit(null)}>Close</button>
              <button type="submit">Submit</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
