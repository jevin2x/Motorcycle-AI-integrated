import { useEffect, useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import BikeCard from './BikeCard.jsx';

const CATEGORIES = ['All', 'Sport', 'Cruiser', 'Adventure', 'Naked', 'Electric'];

export default function Inventory() {
  const [bikes, setBikes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ search, category });
    fetch(`/api/motorcycles?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => setBikes(data.motorcycles || []))
      .catch(() => {})
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [search, category]);

  const sorted = [...bikes].sort((a, b) => {
    if (sort === 'low') return a.price - b.price;
    if (sort === 'high') return b.price - a.price;
    if (sort === 'rating') return b.rating - a.rating;
    return a.id - b.id;
  });

  const askAboutBike = (bike) => {
    window.dispatchEvent(new CustomEvent('motobot:ask', {
      detail: `Tell me about the ${bike.brand} ${bike.name} and why it's worth $${bike.price.toLocaleString('en-US')}.`,
    }));
  };

  return (
    <section className="inventory" id="inventory">
      <div className="section-head">
        <div>
          <p className="eyebrow">The lineup</p>
          <h2>BUILT TO <span className="accent">MOVE YOU</span></h2>
          <p className="section-sub">Every bike is inspected, serviced and ready to ride home.</p>
        </div>
        <div className="controls">
          <label className="search-box">
            <Search size={18} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search bikes..."
              aria-label="Search motorcycles"
            />
            {search && <X size={16} className="clear" onClick={() => setSearch('')} />}
          </label>
          <label className="sort-box">
            <SlidersHorizontal size={17} />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort motorcycles">
              <option value="featured">Featured</option>
              <option value="low">Price: low to high</option>
              <option value="high">Price: high to low</option>
              <option value="rating">Top rated</option>
            </select>
          </label>
        </div>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            className={category === c ? 'active' : ''}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid">
          {[1, 2, 3, 4].map((n) => <div key={n} className="bike-card skeleton" />)}
        </div>
      ) : sorted.length ? (
        <div className="grid">
          {sorted.map((bike) => <BikeCard key={bike.id} bike={bike} onAsk={askAboutBike} />)}
        </div>
      ) : (
        <div className="empty">
          <h3>No bikes found</h3>
          <p>Try a different search — or ask MotoBot for a recommendation.</p>
        </div>
      )}
    </section>
  );
}
