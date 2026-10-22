import Reveal from './Reveal.jsx';

function Column({ title, items, render }) {
  return (
    <div className="timeline">
      <Reveal><h3 className="col-title">{title}</h3></Reveal>
      {items.map((item, i) => (
        <Reveal key={i} delay={i * 90} className="t-item">
          <span className="dot" />
          {render(item)}
        </Reveal>
      ))}
    </div>
  );
}

export default function Journey({ profile }) {
  return (
    <section id="journey" className="section">
      <Reveal>
        <h2 className="section-title"><span className="num mono">02</span> The journey</h2>
      </Reveal>
      <div className="journey-grid">
        <Column
          title="Experience"
          items={profile.experience}
          render={(x) => (
            <>
              <span className="when mono">{x.period} · {x.duration}</span>
              <h4>{x.role}</h4>
              <p className="org">{x.company}, {x.location}</p>
              <p className="muted">{x.outcome}</p>
              {x.certificateUrl && <a className="view-certificate" href={x.certificateUrl} target="_blank" rel="noreferrer">View internship certificate ↗</a>}
            </>
          )}
        />
        <Column
          title="Education"
          items={profile.education}
          render={(x) => (
            <>
              <span className={`when mono ${x.status === 'current' ? 'live' : ''}`}>
                {x.status === 'current' ? '● Pursuing' : x.year}
              </span>
              <h4>{x.level}</h4>
              <p className="org">{x.institution}</p>
              <p className="muted">{x.board}</p>
              {x.certificateUrl && <a className="view-certificate" href={x.certificateUrl} target="_blank" rel="noreferrer">View education certificate ↗</a>}
            </>
          )}
        />
      </div>
    </section>
  );
}
