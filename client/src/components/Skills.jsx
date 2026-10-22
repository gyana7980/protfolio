import Reveal from './Reveal.jsx';

export default function Skills({ profile }) {
  return (
    <section id="skills" className="section">
      <Reveal>
        <h2 className="section-title"><span className="num mono">03</span> Toolbox</h2>
      </Reveal>
      <div className="skill-grid">
        {profile.skills.map((g, i) => (
          <Reveal key={g.group} className="card skill-card" delay={i * 100}>
            <h3>{g.group}</h3>
            <ul>
              {g.items.map((s) => (
                <li key={s}><span className="bullet" />{s}</li>
              ))}
            </ul>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
