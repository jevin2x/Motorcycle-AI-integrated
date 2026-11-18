import { Star, Gauge, Zap, Fuel, MessageCircle, ShoppingCart, Check } from 'lucide-react';
import { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

export default function BikeCard({ bike, onAsk }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const add = () => {
    addItem(bike);
    setAdded(true);
    setTimeout(() => setAdded(false), 1400);
  };

  return (
    <article className="bike-card">
      <div className="bike-image-wrap">
        <img
          src={bike.image}
          alt={`${bike.brand} ${bike.name}`}
          loading="lazy"
          onError={(e) => { e.currentTarget.style.opacity = '0'; }}
        />
        <span className="tag">{bike.tag}</span>
        <span className="stock">{bike.stock} in stock</span>
      </div>

      <div className="bike-body">
        <div className="bike-head">
          <div>
            <p className="bike-brand">{bike.brand}</p>
            <h3>{bike.name}</h3>
          </div>
          <span className="rating"><Star size={14} fill="currentColor" /> {bike.rating}</span>
        </div>

        <div className="bike-specs">
          <span><Gauge size={15} /> {bike.engine}</span>
          <span><Zap size={15} /> {bike.power}</span>
          <span><Fuel size={15} /> {bike.topSpeed}</span>
        </div>

        <p className="bike-desc">{bike.description}</p>

        <div className="bike-footer">
          <div className="price">
            <small>From</small>
            <strong>${bike.price.toLocaleString('en-US')}</strong>
          </div>
        </div>

        <div className="bike-actions">
          <button className="btn btn-buy" onClick={add}>
            {added ? <><Check size={15} /> Added</> : <><ShoppingCart size={15} /> Add to cart</>}
          </button>
          <button className="btn btn-small" onClick={() => onAsk(bike)}>
            <MessageCircle size={15} /> Ask AI
          </button>
        </div>
      </div>
    </article>
  );
}
