import { useEffect, useState } from 'react';

const defaultRoles = ['Software Engineer', 'Backend Explorer', 'Python Tinkerer', 'Problem Solver'];

function ContactIcon({ name }) {
  if (name === 'linkedin') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.35V9h3.414v1.561h.049c.476-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    );
  }

  const paths = {
    location: <><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
    phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.96.36 1.9.7 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.84.58 2.8.7A2 2 0 0 1 22 16.92Z" />,
    email: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></>,
  };

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths[name]}
    </svg>
  );
}

function useTypewriter(words) {
  const [i, setI] = useState(0);
  const [text, setText] = useState('');
  const [del, setDel] = useState(false);

  useEffect(() => {
    const word = words[i % words.length];
    const t = setTimeout(
      () => {
        if (!del) {
          setText(word.slice(0, text.length + 1));
          if (text.length + 1 === word.length) setTimeout(() => setDel(true), 1100);
        } else {
          setText(word.slice(0, text.length - 1));
          if (text.length - 1 === 0) {
            setDel(false);
            setI(i + 1);
          }
        }
      },
      del ? 40 : 85
    );
    return () => clearTimeout(t);
  }, [text, del, i, words]);

  return text;
}

export default function Hero({ profile }) {
  const roles = profile.heroRoles?.length ? profile.heroRoles : defaultRoles;
  const typed = useTypewriter(roles);
  const [first, ...rest] = profile.name.split(' ');
  const { email, phone, address, linkedin } = profile.contact;
  const location = profile.contact.locationLabel || address.split(',').at(-1)?.trim() || 'Location';
  const locationUrl = profile.contact.locationUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('20°17\'03.1"N 85°23\'08.2"E')}`;

  return (
    <section id="top" className="hero">
      <div className="hero-copy">
        <h1>
          I'm <span className="grad">{first}</span>
          <br />
          {rest.join(' ')}
        </h1>
        <p className="typed">
          <span>{typed}</span>
          <i className="caret" />
        </p>
        <p className="lead">{profile.objective}</p>
        <div className="cta">
          <a className="btn primary" href="#contact">{profile.heroTalkLabel || "Let's talk"}</a>
          <a className="btn ghost contact-link" href={linkedin} target="_blank" rel="noreferrer">
            <ContactIcon name="linkedin" /> <span>{profile.contact.linkedinLabel || 'LinkedIn'}</span>
          </a>
          <a className="btn ghost contact-link" href={locationUrl} target="_blank" rel="noreferrer">
            <ContactIcon name="location" /> <span>{location}</span>
          </a>
          <a className="btn ghost contact-link" href={`tel:${phone.replace(/\s/g, '')}`}>
            <ContactIcon name="phone" /> <span>{phone}</span>
          </a>
          <a className="btn ghost contact-link" href={`mailto:${email[0]}`}>
            <ContactIcon name="email" /> <span>{email[0]}</span>
          </a>
        </div>
      </div>

    </section>
  );
}
