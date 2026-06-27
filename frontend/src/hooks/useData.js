import { useState, useEffect, useCallback } from 'react';
import { propertyAPI, reviewAPI, messageAPI } from '../utils/api';

// ── useProperties ─────────────────────────────────────────
export function useProperties(params = {}) {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const paramsKey = JSON.stringify(params);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { page, limit, ...searchFilters } = params;
        const hasSearch = Object.values(searchFilters).some(
          v => v !== '' && v !== undefined && v !== null
        );
        const res = hasSearch
          ? await propertyAPI.search(params)
          : await propertyAPI.search({ page, limit });
        setData(res.data.data);
        setTotal(res.data.total || res.data.count);
        setPages(res.data.pages || 1);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load properties');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [paramsKey]); // eslint-disable-line

  const refetch = useCallback(async (overrideParams) => {
    const p = overrideParams || params;
    setLoading(true);
    setError(null);
    try {
      const { page, limit, ...searchFilters } = p;
      const hasSearch = Object.values(searchFilters).some(
        v => v !== '' && v !== undefined && v !== null
      );
     console.log('🔎 hasSearch:', hasSearch, 'params:', params);
const res = hasSearch
  ? await propertyAPI.search(params)
  : await propertyAPI.search({ page, limit });
console.log('📦 results:', res.data.count);
      setData(res.data.data);
      setTotal(res.data.total || res.data.count);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load properties');
    } finally {
      setLoading(false);
    }
  }, [paramsKey]); // eslint-disable-line

  return { data, total, pages, loading, error, refetch };
}
// ── useProperty (single) ──────────────────────────────────
export function useProperty(id) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    propertyAPI.getById(id)
      .then(res => setData(res.data.data))
      .catch(err => setError(err.response?.data?.message || 'Not found'))
      .finally(() => setLoading(false));
  }, [id]);

  return { data, loading, error };
}

// ── useMyProperties ───────────────────────────────────────
export function useMyProperties() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = useCallback(() => {
    setLoading(true);
    propertyAPI.getMyProperties()
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const remove = useCallback(async (id) => {
    await propertyAPI.delete(id);
    setData(prev => prev.filter(p => p._id !== id));
  }, []);

  return { data, loading, refetch: fetch, remove };
}

// ── useReviews ────────────────────────────────────────────
export function useReviews(propertyId) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!propertyId) return;
    setLoading(true);
    reviewAPI.getByProperty(propertyId)
      .then(res => setData(res.data.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propertyId]);

  const submit = useCallback(async (rating, comment) => {
    const res = await reviewAPI.create(propertyId, { rating, comment });
    setData(prev => [res.data.data, ...prev]);
    return res.data.data;
  }, [propertyId]);

  return { data, loading, submit };
}

// ── useMessages ───────────────────────────────────────────
export function useMessages() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    messageAPI.getAll()
      .then(res => {
        setData(res.data.data);
        setUnreadCount(res.data.data.filter(m => !m.isRead).length);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, unreadCount };
}
