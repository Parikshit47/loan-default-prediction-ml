import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BrainCircuit, ChartNoAxesCombined, Code2, Database, ShieldCheck, Workflow } from "lucide-react";

function SignalOrb() {
  return (
    <div className="signal-stage" aria-hidden="true">
      <div className="signal-grid" />
      <div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orbit orbit-three" />
      <div className="data-node node-a" /><div className="data-node node-b" /><div className="data-node node-c" />
      <div className="signal-core">
        <div className="core-face core-front">ML</div><div className="core-face core-back" />
        <div className="core-face core-right" /><div className="core-face core-left" />
        <div className="core-face core-top" /><div className="core-face core-bottom" />
      </div>
      <div className="signal-tag tag-numpy">numpy</div><div className="signal-tag tag-pandas">pandas</div>
      <div className="signal-tag tag-model">decision tree</div>
      <div className="signal-readout"><span>Probability engine</span><strong>Ready for evaluation</strong></div>
    </div>
  );
}

function HomePage() {
  const containerRef = useRef(null);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) {
      // Immediately reveal everything if user prefers reduced motion
      containerRef.current?.querySelectorAll('.reveal').forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    const targets = containerRef.current?.querySelectorAll('.reveal');
    targets?.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-container page-enter" ref={containerRef}>
      <section className="hero-shell">
        <div className="hero-copy">
          <div className="eyebrow"><BrainCircuit size={15} /> Decision intelligence</div>
          <h1>Make each lending decision <span>legible.</span></h1>
          <p>A focused workspace for evaluating loan-default risk with a transparent machine-learning model and a clear applicant workflow.</p>
          <div className="hero-actions"><Link to="/predict" className="btn btn-predict">Start an evaluation <ArrowRight size={18} /></Link><a href="#method" className="text-link">Explore the method</a></div>
          <div className="hero-facts"><div><strong>255K+</strong><span>training records</span></div><div><strong>16</strong><span>applicant inputs</span></div><div><strong>28</strong><span>encoded features</span></div></div>
        </div>
        <SignalOrb />
      </section>

      <section className="capability-grid reveal" aria-label="Platform capabilities">
        <article className="capability-card reveal reveal-delay-1"><div className="capability-icon"><Database size={20} /></div><p className="card-kicker">Data foundation</p><h2>Historical borrower patterns</h2><p>Financial, employment, and credit context are brought together in one consistent evaluation.</p></article>
        <article className="capability-card accent-card reveal reveal-delay-2"><div className="capability-icon"><ChartNoAxesCombined size={20} /></div><p className="card-kicker" style={{color:"white"}}>Risk clarity</p><h2>Probability, not a black box</h2><p style={{ color: 'white' }}>See the modeled default and repayment probabilities alongside the final classification.</p></article>
        <article className="capability-card reveal reveal-delay-3"><div className="capability-icon"><Code2 size={20} /></div><p className="card-kicker">Built for speed</p><h2>From inputs to signal</h2><p>A concise form and real-time model endpoint keep each review moving without unnecessary steps.</p></article>
      </section>

      <section className="method-section reveal" id="method">
        <div className="method-intro"><p className="eyebrow"><Workflow size={15} /> Evaluation flow</p><h2>Structured inputs. Measurable confidence.</h2><p>Every decision starts with the same clear path, making the model easier to use and the output easier to explain.</p></div>
        <div className="method-steps"><article className="method-step"><span>01</span><h3>Capture context</h3><p>Record income, employment, debt, credit, and loan details.</p></article><article className="method-step"><span>02</span><h3>Encode features</h3><p>Normalize the application into model-ready numerical features.</p></article><article className="method-step"><span>03</span><h3>Review risk</h3><p>Use the class and probability split to inform the next conversation.</p></article></div>
        <div className="method-cta"><ShieldCheck size={19} /> Model responses are returned with clear probability context.</div>
      </section>
    </div>
  );
}

export default HomePage;
