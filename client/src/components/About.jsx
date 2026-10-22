import Reveal from './Reveal.jsx';

export default function About({ profile }) {
  return (
    <section id="about" className="section">
      <Reveal>
        <h2 className="section-title"><span className="num mono">01</span> About me</h2>
      </Reveal>
      <div className="about-grid">
        <Reveal className="card">
          <h3>Strengths</h3>
          <div className="tags">
            {profile.strengths.map((s) => <span key={s} className="tag">{s}</span>)}
          </div>
        </Reveal>
        <Reveal className="card" delay={100}>
          <h3>Outside the code</h3>
          <div className="tags">
            {profile.hobbies.map((h) => (
              <span key={h} className="tag alt">{h === 'Cooking' ? '🍳 ' : h === 'Sketching' ? '✏️ ' : ''}{h}</span>
            ))}
          </div>
        </Reveal>
        <Reveal className="card" delay={200}>
          <h3>Languages</h3>
          <div className="tags">
            {profile.languages.map((l) => <span key={l} className="tag">{l}</span>)}
          </div>
          <p className="muted small">Nationality: {profile.nationality}</p>
        </Reveal>
      </div>
    </section>
  );
}
