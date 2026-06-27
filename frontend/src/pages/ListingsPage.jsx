import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { propertyAPI } from '../utils/api';
import PropertyCard from '../components/property/PropertyCard';
import { Spinner, EmptyState, Pagination } from '../components/common/UI';

export default function ListingsPage() {
  const { t, setSelectedProperty } = useApp();
  const l = t.listings;
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    quarter: searchParams.get('quarter') || '',
    propertyType: searchParams.get('propertyType') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bedrooms: '',
    furnished: '',
  });
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchListings = async (f, p) => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (f.quarter) params.quarter = f.quarter;
      if (f.propertyType) params.propertyType = f.propertyType;
      if (f.minPrice) params.minPrice = f.minPrice;
      if (f.maxPrice) params.maxPrice = f.maxPrice;
      if (f.bedrooms) params.bedrooms = f.bedrooms;
      if (f.furnished !== '') params.furnished = f.furnished;
      params.page = p;
      params.limit = 9;

      const res = await propertyAPI.search(params);
      setData(res.data.data || []);
      setTotal(res.data.total || res.data.count || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings(filters, page);
  }, [JSON.stringify(filters), page]); // eslint-disable-line

  const handleFilter = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
  };

  const hasFilters = Object.values(filters).some(v => v !== '');

  const reset = () => {
    setFilters({ quarter: '', propertyType: '', minPrice: '', maxPrice: '', bedrooms: '', furnished: '' });
    setPage(1);
  };

  return (
    <div className="section">
      <div className="dash-header">
        <h2>
          {l.title}
          <span className="filter-count" style={{ marginLeft: 10 }}>{total}</span>
        </h2>
        <p className="text-muted">{l.subtitle}</p>
      </div>

      <div className="filters-bar">
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500 }}>{l.filters}</span>

        <input
          className="filter-sel"
          list="quarters-search"
          placeholder={l.quarter}
          value={filters.quarter}
          style={{ width: 160 }}
          onChange={e => handleFilter('quarter', e.target.value)}
        />
        <datalist id="quarters-search">
          {t.quarters.map(q => <option key={q} value={q} />)}
        </datalist>

        <select className="filter-sel" value={filters.propertyType}
          onChange={e => handleFilter('propertyType', e.target.value)}>
          <option value="">{l.type}</option>
          {t.types.map(ty => <option key={ty}>{ty}</option>)}
        </select>

        <input className="filter-sel" type="number" placeholder={l.minFCFA}
          value={filters.minPrice} style={{ width: 120 }}
          onChange={e => handleFilter('minPrice', e.target.value)} />

        <input className="filter-sel" type="number" placeholder={l.maxFCFA}
          value={filters.maxPrice} style={{ width: 120 }}
          onChange={e => handleFilter('maxPrice', e.target.value)} />

        <select className="filter-sel" value={filters.bedrooms}
          onChange={e => handleFilter('bedrooms', e.target.value)}>
          <option value="">{l.rooms}</option>
          {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} {l.rooms1}</option>)}
        </select>

        <select className="filter-sel" value={filters.furnished}
          onChange={e => handleFilter('furnished', e.target.value)}>
          <option value="">{l.furnished}</option>
          <option value="true">{l.furnishedYes}</option>
          <option value="false">{l.furnishedNo}</option>
        </select>

        {hasFilters && (
          <button className="filter-reset" onClick={reset}>{l.reset}</button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <EmptyState icon="⚠️" title={t.common.error} desc={error}
          action={<button className="btn btn-primary" onClick={() => fetchListings(filters, page)}>{t.common.retry}</button>} />
      ) : data.length === 0 ? (
        <EmptyState icon="🔍" title={l.noResults} desc={l.noResultsDesc} />
      ) : (
        <>
          <div className="grid-3">
            {data.map(p => (
              <PropertyCard key={p._id} property={p} onClick={() => setSelectedProperty(p)} />
            ))}
          </div>
          <Pagination page={page} pages={pages} onChange={setPage} />
        </>
      )}
    </div>
  );
}