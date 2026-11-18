import { useState } from 'react';
import { X, CheckCircle2, Loader2, Bike, Mail, Phone, MapPin } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';

const EMPTY = { name: '', email: '', phone: '', address: '', city: '', zip: '' };

export default function Checkout({ open, onClose }) {
  const { items, subtotal, tax, delivery, total, clear } = useCart();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState(null);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, customer: form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Could not place order');
      setOrder(data);
      clear();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const close = () => {
    onClose();
    setTimeout(() => { setOrder(null); setForm(EMPTY); setError(''); }, 250);
  };

  if (!open) return null;

  return (
    <div className="modal-backdrop">
      <div className="checkout-modal" role="dialog" aria-label="Checkout">
        <button className="icon-btn modal-close" onClick={close} aria-label="Close"><X /></button>

        {order ? (
          <div className="order-done">
            <div className="success-icon"><CheckCircle2 size={52} /></div>
            <p className="eyebrow">Order confirmed</p>
            <h2>YOU'RE GOING RIDING! 🏁</h2>
            <p className="order-thanks">Thanks, {order.customer.name.split(' ')[0]}! Your order is confirmed and our team will call you to arrange delivery.</p>
            <div className="order-receipt">
              <div><span>Order number</span><strong>{order.id}</strong></div>
              <div><span>Bikes</span><strong>{order.items.map((i) => `${i.brand} ${i.name} ×${i.qty}`).join(', ')}</strong></div>
              <div><span>Total paid</span><strong>${order.total.toLocaleString('en-US')}</strong></div>
              <div><span>Confirmation</span><strong>Sent to {order.customer.email}</strong></div>
            </div>
            <button className="btn btn-primary" onClick={close}>Continue shopping</button>
          </div>
        ) : (
          <>
            <div className="checkout-head">
              <p className="eyebrow">Almost there</p>
              <h2>SECURE CHECKOUT</h2>
              <p>Enter your delivery details — no payment card needed for this demo order.</p>
            </div>

            <div className="checkout-grid">
              <form onSubmit={submit} className="checkout-form">
                <label>Full name
                  <input name="name" value={form.name} onChange={change} placeholder="Alex Rider" required />
                </label>
                <label>Email address
                  <input type="email" name="email" value={form.email} onChange={change} placeholder="alex@example.com" required />
                </label>
                <label>Phone
                  <input name="phone" value={form.phone} onChange={change} placeholder="+1 555 010 1234" />
                </label>
                <label>Delivery address
                  <input name="address" value={form.address} onChange={change} placeholder="128 Nightingale Ave" required />
                </label>
                <div className="form-row">
                  <label>City
                    <input name="city" value={form.city} onChange={change} placeholder="Motor City" />
                  </label>
                  <label>ZIP
                    <input name="zip" value={form.zip} onChange={change} placeholder="10001" />
                  </label>
                </div>
                {error && <p className="form-error">{error}</p>}
                <button className="btn btn-primary place-order" disabled={busy || !items.length}>
                  {busy ? <><Loader2 size={18} className="spin" /> Placing order...</> : <>Place order · ${total.toLocaleString('en-US')}</>}
                </button>
              </form>

              <aside className="order-summary">
                <h3>Order summary</h3>
                {items.map((i) => (
                  <div className="summary-item" key={i.id}>
                    <img src={i.image} alt="" />
                    <div><strong>{i.brand} {i.name}</strong><span>Qty {i.qty}</span></div>
                    <span>${(i.price * i.qty).toLocaleString('en-US')}</span>
                  </div>
                ))}
                <div className="summary-line"><span>Subtotal</span><span>${subtotal.toLocaleString('en-US')}</span></div>
                <div className="summary-line"><span>Tax</span><span>${tax.toLocaleString('en-US')}</span></div>
                <div className="summary-line"><span>Delivery</span><span>{delivery === 0 ? 'FREE' : `$${delivery}`}</span></div>
                <div className="summary-line grand"><span>Total</span><strong>${total.toLocaleString('en-US')}</strong></div>
                <div className="contact-mini"><Phone size={14} /> Questions? +1 (555) 010-MOTO</div>
                <div className="contact-mini"><Mail size={14} /> ride@motovelocity.shop</div>
                <div className="contact-mini"><MapPin size={14} /> <Bike size={14} /> Free delivery over $5,000</div>
              </aside>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
