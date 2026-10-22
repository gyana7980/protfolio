import Reveal from './Reveal.jsx';

export default function Contact({ profile }) {
  const { email, phone, address, linkedin } = profile.contact;
  const contact = profile.contact;
  return (
    <section id="contact" className="section contact">
      <Reveal>
        <h2 className="section-title"><span className="num mono">05</span> {profile.contactTitle || "Let's build something"}</h2>
        <p className="lead center">
          {profile.contactMessage || 'Open to software engineering opportunities and internships. Say hello!'}
        </p>
      </Reveal>
      <Reveal className="contact-grid" delay={100}>
        <a className="contact-card" href={`mailto:${email[0]}`}>
          <span className="mono">{contact.emailLabel || 'Email'}</span>
          <strong>{email[0]}</strong>
        </a>
        <a className="contact-card" href={`tel:${phone.replace(/\s/g, '')}`}>
          <span className="mono">{contact.phoneLabel || 'Phone'}</span>
          <strong>{phone}</strong>
        </a>
        <a className="contact-card" href={linkedin} target="_blank" rel="noreferrer">
          <span className="mono">{contact.linkedinLabel || 'LinkedIn'}</span>
          <strong>{contact.linkedinName || 'gyana-sethi'} ↗</strong>
        </a>
        <div className="contact-card">
          <span className="mono">{contact.locationHeading || 'Based in'}</span>
          <strong>{address}</strong>
        </div>
      </Reveal>
    </section>
  );
}
