const links = [
  ['about', 'About'],
  ['journey', 'Journey'],
  ['skills', 'Skills'],
  ['achievements', 'Wins'],
  ['contact', 'Contact'],
];

export default function Nav({ name, photo }) {
  const initials = name.split(' ').map((n) => n[0]).join('').slice(0, 2);
  return (
    <header className="nav">
      <a href="#top" className="nav-logo">{initials}<span>.</span></a>
      <nav>
        {links.map(([id, label]) => (
          <a key={id} href={`#${id}`}>{label}</a>
        ))}
      </nav>
      <img className="nav-avatar" src={photo} alt={name} />
    </header>
  );
}
