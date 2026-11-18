import { ShoppingCart, X, Minus, Plus, Trash2, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

export default function CartDrawer({ open, onClose, onCheckout }) {
  const { items, updateQty, removeItem, subtotal, tax, delivery, total, count } = useCart();

  return (
    <>
      <div className={`drawer-backdrop ${open ? 'show' : ''}`} onClick={onClose} />
      <aside className={`cart-drawer ${open ? 'open' : ''}`} aria-label="Shopping cart">
        <div className="drawer-header">
          <div>
            <h2>YOUR GARAGE <span>({count})</span></h2>
            <p>Almost yours. Let's finish the deal.</p>
          </div>
          <button className="icon-btn" onClick={onClose} aria-label="Close cart"><X /></button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingCart size={46} />
            <h3>Your garage is empty</h3>
            <p>Pick a bike from the lineup and it'll show up here.</p>
            <button className="btn btn-primary" onClick={onClose}>Browse bikes</button>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div className="cart-item" key={item.id}>
                  <img src={item.image} alt={`${item.brand} ${item.name}`} />
                  <div className="cart-item-info">
                    <p className="bike-brand">{item.brand}</p>
                    <h4>{item.name}</h4>
                    <strong>${item.price.toLocaleString('en-US')}</strong>
                    <div className="qty-row">
                      <div className="qty-control">
                        <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label="Decrease"><Minus size={14} /></button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label="Increase"><Plus size={14} /></button>
                      </div>
                      <button className="remove-btn" onClick={() => removeItem(item.id)} aria-label="Remove">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-summary">
              <div><span>Subtotal</span><strong>${subtotal.toLocaleString('en-US')}</strong></div>
              <div><span>Tax (8%)</span><strong>${tax.toLocaleString('en-US')}</strong></div>
              <div><span>Delivery</span><strong>{delivery === 0 ? 'FREE' : `$${delivery}`}</strong></div>
              {subtotal < 5000 && <p className="delivery-hint">Add ${(5000 - subtotal).toLocaleString('en-US')} more for free delivery</p>}
              <div className="cart-total"><span>Total</span><strong>${total.toLocaleString('en-US')}</strong></div>
              <button className="btn btn-primary checkout-btn" onClick={onCheckout}>
                Checkout securely <ArrowRight size={18} />
              </button>
              <p className="secure-note"><ShieldCheck size={14} /> Encrypted checkout · 2-year warranty included</p>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
