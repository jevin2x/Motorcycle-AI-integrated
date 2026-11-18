import { useState } from 'react';
import { Menu, X, Bike, MessageCircle, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function Navbar({ onCart }) {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="navbar">
      <a className="brand" href="#top" onClick={() => setOpen(false)}>
        <span className="brand-mark"><Bike size={24} strokeWidth={2.2} /></span>
        <span className="brand-name">MOTO<span>VELOCITY</span></span>
      </a>

      <nav className={`nav-links ${open ? 'open' : ''}`}>
        <a href="#inventory" onClick={() => setOpen(false)}>Inventory</a>
        <a href="#why-us" onClick={() => setOpen(false)}>Why Us</a>
        <a href="#contact" onClick={() => setOpen(false)}>Contact</a>
        <button className="btn btn-ghost nav-chat" onClick={() => {
          document.querySelector('.chat-launcher')?.click();
          setOpen(false);
        }}>
          <MessageCircle size={16} /> Ask MotoBot
        </button>
      </nav>

      <div className="nav-actions">
        <button className="nav-cart" onClick={onCart} aria-label="Open cart">
          <ShoppingCart size={19} /> {count > 0 && <span className="cart-badge">{count}</span>}
        </button>
        <button className="menu-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X /> : <Menu />}
        </button>
      </div>
    </header>
  );
}
