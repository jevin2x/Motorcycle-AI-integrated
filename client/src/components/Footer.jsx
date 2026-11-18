import { Bike, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div>
          <a className="brand" href="#top">
            <span className="brand-mark"><Bike size={22} /></span>
            <span className="brand-name">MOTO<span>VELOCITY</span></span>
          </a>
          <p className="footer-copy">Passion on two wheels. Find your next machine with a little help from AI.</p>
        </div>
        <div className="footer-col">
          <h4>Visit</h4>
          <p><MapPin size={15} /> 128 Nightingale Ave, Motor City</p>
          <p>Mon–Sat · 9am – 7pm</p>
        </div>
        <div className="footer-col">
          <h4>Talk to us</h4>
          <p><Phone size={15} /> +1 (555) 010-MOTO</p>
          <p><Mail size={15} /> ride@motovelocity.shop</p>
        </div>
      </div>
      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} MotoVelocity. Ride safe. 🏁</span>
        <span>Made for riders, by riders.</span>
      </div>
    </footer>
  );
}
