export function getUser() {
  const raw = localStorage.getItem('user');
  if (!raw) {
    return null;
  }
  return JSON.parse(raw);
}
