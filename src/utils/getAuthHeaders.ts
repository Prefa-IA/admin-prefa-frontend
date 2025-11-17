export function getAuthHeaders(): Record<string, string> {
  try {
    const raw = localStorage.getItem('adminUser');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed?.token) return { Authorization: `Bearer ${parsed.token}` };
    }
  } catch {}
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}
