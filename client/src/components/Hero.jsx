import { ArrowDown, Sparkles, ShieldCheck, Wrench, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow" aria-hidden="true" />
      <div className="hero-inner">
        <div className="hero-copy">
          <div className="eyebrow"><span className="pulse" /> Premium rides · Free AI assistant</div>
          <h1>
            FIND YOUR<br />
            <span className="accent">PERFECT</span> RIDE.
          </h1>
          <p>
            Sport, cruiser, adventure or electric — explore our hand-picked lineup and let
            MotoBot help you choose in seconds. No pushy salespeople, just great bikes.
          </p>
          <div className="hero-actions">
            <a className="btn btn-primary" href="#inventory">
              Explore Inventory <ArrowDown size={18} />
            </a>
            <button className="btn btn-outline" onClick={() => document.querySelector('.chat-launcher')?.click()}>
              <Sparkles size={18} /> Ask the AI
            </button>
          </div>
          <div className="hero-stats">
            <div><strong>40+</strong><span>Models in stock</span></div>
            <div><strong>15 yrs</strong><span>On the road</span></div>
            <div><strong>4.9★</strong><span>Rider rating</span></div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-ring" />
          <img
            src="https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=85"
            alt="Sport motorcycle"
          />
          <div className="floating-card float-top">
            <Zap size={18} /> 0–100 in 3.1s
          </div>
          <div className="floating-card float-bottom">
            <ShieldCheck size={18} /> 2-year warranty
          </div>
        </div>
      </div>

      <div className="feature-strip" id="why-us">
        <div><Wrench size={20} /> Certified technicians</div>
        <div><ShieldCheck size={20} /> Full warranty</div>
        <div><Zap size={20} /> Fast nationwide delivery</div>
        <div><Sparkles size={20} /> Free AI bike matcher</div>
      </div>
    </section>
  );
}
