import Reveal from './Reveal.jsx';

const R = 34;
const C = 2 * Math.PI * R;

function Ring({ score }) {
  return (
    <svg viewBox="0 0 80 80" className="ring" aria-label={`${score}% score`}>
      <circle cx="40" cy="40" r={R} className="ring-bg" />
      <circle
        cx="40" cy="40" r={R}
        className="ring-fg"
        strokeDasharray={C}
        style={{ '--offset': C - (C * score) / 100 }}
      />
      <text x="40" y="45" textAnchor="middle" className="ring-text">{score}%</text>
    </svg>
  );
}

export default function Achievements({ profile, achievements: achievementsProp }) {
  const achievements = Array.isArray(achievementsProp)
    ? achievementsProp
    : Array.isArray(profile?.achievements)
      ? profile.achievements
      : [];

  return (
    <section id="achievements" className="section">
      <Reveal>
        <h2 className="section-title"><span className="num mono">04</span> Achievements</h2>
      </Reveal>
      <div className="ach-grid">
        {achievements.length > 0 ? achievements.map((item, index) => {
          if (!item || typeof item !== 'object') return null;

          const certificateUrl = typeof item.certificateUrl === 'string'
            ? item.certificateUrl.trim()
            : '';
          const gotMark = Number(item.gotMark);
          const totalMark = Number(item.totalMark);
          const hasMarks = item.gotMark !== '' && item.gotMark != null && item.totalMark !== '' && item.totalMark != null && Number.isFinite(gotMark) && Number.isFinite(totalMark) && totalMark > 0;
          const numericScore = hasMarks ? (gotMark / totalMark) * 100 : Number(item.score);
          const score = Number.isFinite(numericScore)
            ? Math.min(100, Math.max(0, Math.round(numericScore)))
            : 0;
          const title = item.title || item.name || 'Untitled achievement';
          const category = item.category || (item.provider ? `${item.provider} course` : 'Course');
          const cardProps = certificateUrl
            ? {
                as: 'a',
                href: certificateUrl,
                target: '_blank',
                rel: 'noopener noreferrer',
              }
            : { as: 'article' };

          return (
            <Reveal
              key={item.id ?? `${title}-${index}`}
              {...cardProps}
              className={`card ach ${certificateUrl ? '' : 'ach-disabled'}`}
              delay={index * 100}
            >
              <Ring score={score} />
              <div>
                <span className="badge mono">{category}</span>
                <h4>{title}</h4>
                <span className={`view-certificate${certificateUrl ? '' : ' is-disabled'}`}>
                  {certificateUrl ? 'View Certificate ↗' : 'Certificate unavailable'}
                </span>
              </div>
            </Reveal>
          );
        }) : <p className="muted">No achievements to display yet.</p>}
      </div>
    </section>
  );
}
