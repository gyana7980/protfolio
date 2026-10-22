import { useEffect, useState } from 'react';
import { adminRequest, fetchProfile } from '../api.js';

const sections = [
  ['identity', 'Personal & contact'],
  ['education', 'Education'],
  ['experience', 'Experience'],
  ['skills', 'Skills & tools'],
  ['achievements', 'Achievements'],
  ['about', 'Strengths & interests']
];

const emptyAchievement = { title: '', provider: '', gotMark: '', totalMark: '', score: '', certificateUrl: '' };
const maxUploadSize = 5 * 1024 * 1024;
const defaultHeroRoles = ['Software Engineer', 'Backend Explorer', 'Python Tinkerer', 'Problem Solver'];
const defaultLocationUrl = 'https://www.google.com/maps/search/?api=1&query=20%C2%B017%2703.1%22N%2085%C2%B023%2708.2%22E';

function updateAt(items, index, field, value) {
  return items.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item);
}

function achievementPercentage(item) {
  const gotMark = Number(item.gotMark);
  const totalMark = Number(item.totalMark);
  if (item.gotMark !== '' && item.gotMark != null && item.totalMark !== '' && item.totalMark != null && Number.isFinite(gotMark) && totalMark > 0) {
    return Math.round((gotMark / totalMark) * 100);
  }
  return item.score;
}

function TextField({ label, value = '', onChange, onBlur, multiline = false, type = 'text', placeholder }) {
  const Control = multiline ? 'textarea' : 'input';
  return (
    <label className="admin-field">
      <span>{label}</span>
      <Control type={multiline ? undefined : type} value={value ?? ''} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} onBlur={onBlur} rows={multiline ? 4 : undefined} />
    </label>
  );
}

function ArrayField({ label, values = [], onChange, placeholder }) {
  const [draft, setDraft] = useState(() => values.join('\n'));

  useEffect(() => {
    setDraft(values.join('\n'));
  }, [values]);

  return (
    <TextField
      label={label}
      multiline
      value={draft}
      onChange={setDraft}
      onBlur={() => {
        const nextValues = draft.split(/\r?\n/).map((item) => item.trim()).filter(Boolean);
        setDraft(nextValues.join('\n'));
        onChange(nextValues);
      }}
      placeholder={placeholder || 'One item per line'}
    />
  );
}

export default function AdminDashboard({ onLogout }) {
  const [profile, setProfile] = useState(null);
  const [activeSection, setActiveSection] = useState('identity');
  const [notice, setNotice] = useState(null);
  const [busy, setBusy] = useState(false);
  const [photoFile, setPhotoFile] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [achievementDraft, setAchievementDraft] = useState(emptyAchievement);
  const [editingAchievement, setEditingAchievement] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [educationFiles, setEducationFiles] = useState({});
  const [uploadingEducation, setUploadingEducation] = useState(null);
  const [experienceFiles, setExperienceFiles] = useState({});
  const [uploadingExperience, setUploadingExperience] = useState(null);

  useEffect(() => {
    fetchProfile().then(setProfile).catch((error) => setNotice({ type: 'error', text: error.message }));
  }, []);

  function patchProfile(field, value) {
    setProfile((current) => ({ ...current, [field]: value }));
  }

  function handleUploadFileChange(event, onSelect, imageOnly = false) {
    const file = event.target.files?.[0] || null;
    event.target.value = '';
    if (file && file.size > maxUploadSize) {
      setNotice({ type: 'error', text: 'Files must be 5 MB or smaller.' });
      return;
    }
    if (file && imageOnly && !file.type.startsWith('image/')) {
      setNotice({ type: 'error', text: 'Choose an image file for the profile photo.' });
      return;
    }
    onSelect(file);
  }

  async function uploadProfilePhoto() {
    if (!photoFile) {
      setNotice({ type: 'error', text: 'Choose a profile photo first.' });
      return;
    }
    const formData = new FormData();
    formData.append('photo', photoFile);
    setUploadingPhoto(true);
    try {
      const result = await adminRequest('/api/upload/photo', { method: 'POST', body: formData });
      patchProfile('photo', result.url);
      setPhotoFile(null);
      setNotice({ type: 'success', text: 'Profile photo uploaded. Save changes to publish it.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveProfile() {
    setBusy(true);
    setNotice(null);
    try {
      const saved = await adminRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(profile)
      });
      setProfile(saved);
      setNotice({ type: 'success', text: 'Portfolio changes saved.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function uploadCertificate() {
    if (!certificateFile) {
      setNotice({ type: 'error', text: 'Choose a PDF or image first.' });
      return;
    }
    const formData = new FormData();
    formData.append('certificate', certificateFile);
    setUploading(true);
    try {
      const result = await adminRequest('/api/upload', { method: 'POST', body: formData });
      setAchievementDraft((current) => ({ ...current, certificateUrl: result.url }));
      setNotice({ type: 'success', text: 'Certificate uploaded and attached.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setUploading(false);
    }
  }

  async function uploadExperienceCertificate(index) {
    const file = experienceFiles[index];
    if (!file) {
      setNotice({ type: 'error', text: 'Choose an internship certificate first.' });
      return;
    }
    const formData = new FormData();
    formData.append('certificate', file);
    setUploadingExperience(index);
    try {
      const result = await adminRequest('/api/upload', { method: 'POST', body: formData });
      setProfile((current) => ({
        ...current,
        experience: updateAt(current.experience, index, 'certificateUrl', result.url)
      }));
      setExperienceFiles((current) => {
        const next = { ...current };
        delete next[index];
        return next;
      });
      setNotice({ type: 'success', text: 'Internship certificate uploaded and attached. Save changes to publish the link.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setUploadingExperience(null);
    }
  }

  async function uploadEducationCertificate(index) {
    const file = educationFiles[index];
    if (!file) {
      setNotice({ type: 'error', text: 'Choose an education certificate first.' });
      return;
    }
    const formData = new FormData();
    formData.append('certificate', file);
    setUploadingEducation(index);
    try {
      const result = await adminRequest('/api/upload', { method: 'POST', body: formData });
      setProfile((current) => ({
        ...current,
        education: updateAt(current.education, index, 'certificateUrl', result.url)
      }));
      setEducationFiles((current) => {
        const next = { ...current };
        delete next[index];
        return next;
      });
      setNotice({ type: 'success', text: 'Education certificate uploaded and attached. Save changes to publish the link.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setUploadingEducation(null);
    }
  }

  function removeEducation(index) {
    patchProfile('education', profile.education.filter((_, itemIndex) => itemIndex !== index));
    setEducationFiles((current) => Object.fromEntries(
      Object.entries(current)
        .filter(([itemIndex]) => Number(itemIndex) !== index)
        .map(([itemIndex, file]) => [Number(itemIndex) > index ? Number(itemIndex) - 1 : Number(itemIndex), file])
    ));
  }

  async function submitAchievement(event) {
    event.preventDefault();
    const hasGotMark = achievementDraft.gotMark !== '' && achievementDraft.gotMark != null;
    const hasTotalMark = achievementDraft.totalMark !== '' && achievementDraft.totalMark != null;
    if (hasGotMark !== hasTotalMark) {
      setNotice({ type: 'error', text: 'Enter both marks obtained and total marks.' });
      return;
    }
    const gotMark = hasGotMark ? Number(achievementDraft.gotMark) : null;
    const totalMark = hasTotalMark ? Number(achievementDraft.totalMark) : null;
    if (hasGotMark && (!Number.isFinite(gotMark) || !Number.isFinite(totalMark) || gotMark < 0 || totalMark <= 0 || gotMark > totalMark)) {
      setNotice({ type: 'error', text: 'Marks must be non-negative, and obtained marks cannot exceed the total.' });
      return;
    }
    try {
      const payload = {
        ...achievementDraft,
        gotMark,
        totalMark,
        score: hasGotMark
          ? Math.round((gotMark / totalMark) * 100)
          : achievementDraft.score === '' ? null : Number(achievementDraft.score)
      };
      const updated = await adminRequest(
        editingAchievement === null
          ? '/api/profile/achievements'
          : `/api/profile/achievements/${editingAchievement}`,
        { method: editingAchievement === null ? 'POST' : 'PUT', body: JSON.stringify(payload) }
      );
      setProfile(updated);
      setAchievementDraft(emptyAchievement);
      setEditingAchievement(null);
      setCertificateFile(null);
      setNotice({ type: 'success', text: editingAchievement === null ? 'Achievement added.' : 'Achievement updated.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  async function deleteAchievement(index) {
    if (!window.confirm('Delete this achievement?')) return;
    try {
      const updated = await adminRequest(`/api/profile/achievements/${index}`, { method: 'DELETE' });
      setProfile(updated);
      if (editingAchievement === index) {
        setAchievementDraft(emptyAchievement);
        setEditingAchievement(null);
      }
      setNotice({ type: 'success', text: 'Achievement deleted.' });
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  if (!profile) {
    return (
      <main className="admin-loading">
        {notice?.type === 'error' ? (
          <div className="admin-load-error" role="alert">
            <p>{notice.text}</p>
            <button className="admin-secondary" type="button" onClick={onLogout}>Return to portfolio</button>
          </div>
        ) : <><span className="admin-spinner" /> Loading portfolio…</>}
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-topbar">
        <a className="admin-brand" href="/" onClick={(event) => { event.preventDefault(); onLogout(); }}>
          <span className="admin-brand-mark">GS</span>
          <span>Portfolio editor<small>CONTENT MANAGEMENT</small></span>
        </a>
        <div className="admin-actions">
          <a className="admin-view-link" href="/" onClick={(event) => { event.preventDefault(); onLogout(); }}>View portfolio ↗</a>
          <button className="admin-logout" type="button" onClick={() => { localStorage.removeItem('portfolio-admin-token'); onLogout(); }}>Log out</button>
        </div>
      </header>
      <div className="admin-heading">
        <div><p className="admin-kicker">WORKSPACE / PROFILE</p><h1>Make it yours.</h1><p>Changes update the content shown on your public portfolio.</p></div>
        <span className="admin-status"><i /> Connected</span>
      </div>
      {notice && <div className={`admin-notice ${notice.type}`} role="status">{notice.text}<button type="button" aria-label="Dismiss notification" onClick={() => setNotice(null)}>×</button></div>}
      <div className="admin-layout">
        <nav className="admin-tabs" aria-label="Profile editor sections">
          {sections.map(([key, title], index) => (
            <button key={key} className={activeSection === key ? 'active' : ''} onClick={() => setActiveSection(key)} type="button">
              <span>0{index + 1}</span>{title}<b aria-hidden="true">↗</b>
            </button>
          ))}
        </nav>
        <section className="admin-panel">
          {activeSection === 'identity' && <>
            <div className="panel-heading"><div><p className="admin-kicker">01 / IDENTITY</p><h2>Personal & contact</h2></div></div>
            <div className="admin-grid two">
              <TextField label="Full name" value={profile.name} onChange={(value) => patchProfile('name', value)} />
              <TextField label="Professional title" value={profile.title} onChange={(value) => patchProfile('title', value)} />
              <TextField label="Nationality" value={profile.nationality} onChange={(value) => patchProfile('nationality', value)} />
              <ArrayField label="Email addresses" values={profile.contact?.email || []} onChange={(value) => patchProfile('contact', { ...profile.contact, email: value })} />
              <TextField label="Phone" value={profile.contact?.phone} onChange={(value) => patchProfile('contact', { ...profile.contact, phone: value })} />
              <TextField label="Address" value={profile.contact?.address} onChange={(value) => patchProfile('contact', { ...profile.contact, address: value })} />
              <TextField label="LinkedIn URL" value={profile.contact?.linkedin} onChange={(value) => patchProfile('contact', { ...profile.contact, linkedin: value })} />
            </div>
            <div className="profile-photo-field">
              <span>Profile photo</span>
              <div className="profile-photo-row">
                {profile.photo ? <img className="profile-photo-preview" src={profile.photo} alt="Current profile" /> : <div className="profile-photo-preview is-empty">No photo</div>}
                <label className="file-picker">Choose image<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={(event) => handleUploadFileChange(event, setPhotoFile, true)} /></label>
                <span className="file-name">{photoFile?.name || 'JPEG, PNG, WebP, or GIF, up to 5 MB'}</span>
                <button className="admin-secondary" type="button" disabled={uploadingPhoto} onClick={uploadProfilePhoto}>{uploadingPhoto ? 'Uploading…' : 'Upload photo'}</button>
              </div>
            </div>
            <TextField label="Professional objective" multiline value={profile.objective} onChange={(value) => patchProfile('objective', value)} />
            <div className="panel-heading"><div><p className="admin-kicker">HERO & CONTACT COPY</p><h2>Text and links shown publicly</h2></div></div>
            <div className="admin-grid two">
              <ArrayField label="Rotating hero phrases" values={profile.heroRoles?.length ? profile.heroRoles : defaultHeroRoles} onChange={(value) => patchProfile('heroRoles', value)} placeholder="One phrase per line" />
              <TextField label="Hero contact button" value={profile.heroTalkLabel || "Let's talk"} onChange={(value) => patchProfile('heroTalkLabel', value)} />
              <TextField label="Contact section heading" value={profile.contactTitle || "Let's build something"} onChange={(value) => patchProfile('contactTitle', value)} />
              <TextField label="Contact section message" value={profile.contactMessage || 'Open to software engineering opportunities and internships. Say hello!'} onChange={(value) => patchProfile('contactMessage', value)} />
              <TextField label="Location button text" value={profile.contact?.locationLabel || profile.contact?.address?.split(',').at(-1)?.trim() || 'Odisha'} onChange={(value) => patchProfile('contact', { ...profile.contact, locationLabel: value })} />
              <TextField label="Location map URL" value={profile.contact?.locationUrl || defaultLocationUrl} onChange={(value) => patchProfile('contact', { ...profile.contact, locationUrl: value })} />
              <TextField label="LinkedIn display name" value={profile.contact?.linkedinName || 'gyana-sethi'} onChange={(value) => patchProfile('contact', { ...profile.contact, linkedinName: value })} />
              <TextField label="LinkedIn link label" value={profile.contact?.linkedinLabel || 'LinkedIn'} onChange={(value) => patchProfile('contact', { ...profile.contact, linkedinLabel: value })} />
              <TextField label="Email card label" value={profile.contact?.emailLabel || 'Email'} onChange={(value) => patchProfile('contact', { ...profile.contact, emailLabel: value })} />
              <TextField label="Phone card label" value={profile.contact?.phoneLabel || 'Phone'} onChange={(value) => patchProfile('contact', { ...profile.contact, phoneLabel: value })} />
              <TextField label="Location card label" value={profile.contact?.locationHeading || 'Based in'} onChange={(value) => patchProfile('contact', { ...profile.contact, locationHeading: value })} />
            </div>
          </>}

          {activeSection === 'education' && <>
            <div className="panel-heading"><div><p className="admin-kicker">02 / LEARNING</p><h2>Education</h2></div><button className="admin-add" type="button" onClick={() => patchProfile('education', [...profile.education, { level: '', institution: '', board: '', year: '', status: '' }])}>+ Add education</button></div>
            {profile.education.map((item, index) => <div className="repeat-block" key={`edu-${index}`}>
              <div className="repeat-title"><span>ENTRY {String(index + 1).padStart(2, '0')}</span><button className="admin-remove" type="button" onClick={() => removeEducation(index)}>Remove</button></div>
              <div className="admin-grid two">
                {['level', 'institution', 'board', 'year', 'status'].map((field) => <TextField key={field} label={field[0].toUpperCase() + field.slice(1)} value={item[field]} onChange={(value) => patchProfile('education', updateAt(profile.education, index, field, value))} />)}
              </div>
              <div className="upload-row">
                <label className="file-picker">Choose education certificate<input type="file" accept="application/pdf,image/*" onChange={(event) => handleUploadFileChange(event, (file) => setEducationFiles((current) => ({ ...current, [index]: file })))} /></label>
                <span className="file-name">{educationFiles[index]?.name || (item.certificateUrl ? 'Certificate attached' : 'PDF or image, up to 5 MB')}</span>
                {item.certificateUrl && <a className="certificate-link" href={item.certificateUrl} target="_blank" rel="noreferrer">View current ↗</a>}
                <button className="admin-secondary" type="button" disabled={uploadingEducation === index} onClick={() => uploadEducationCertificate(index)}>{uploadingEducation === index ? 'Uploading…' : 'Upload & attach'}</button>
              </div>
            </div>)}
          </>}

          {activeSection === 'experience' && <>
            <div className="panel-heading"><div><p className="admin-kicker">03 / CAREER</p><h2>Experience</h2></div><button className="admin-add" type="button" onClick={() => patchProfile('experience', [...profile.experience, { role: '', company: '', location: '', period: '', duration: '', outcome: '', certificateUrl: '' }])}>+ Add experience</button></div>
            {profile.experience.map((item, index) => <div className="repeat-block" key={`job-${index}`}>
              <div className="repeat-title"><span>ENTRY {String(index + 1).padStart(2, '0')}</span><button className="admin-remove" type="button" onClick={() => patchProfile('experience', profile.experience.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>
              <div className="admin-grid two">
                {['role', 'company', 'location', 'period', 'duration'].map((field) => <TextField key={field} label={field[0].toUpperCase() + field.slice(1)} value={item[field]} onChange={(value) => patchProfile('experience', updateAt(profile.experience, index, field, value))} />)}
                <TextField label="Outcome / description" multiline value={item.outcome} onChange={(value) => patchProfile('experience', updateAt(profile.experience, index, 'outcome', value))} />
              </div>
              <div className="upload-row">
                <label className="file-picker">Choose internship certificate<input type="file" accept="application/pdf,image/*" onChange={(event) => handleUploadFileChange(event, (file) => setExperienceFiles((current) => ({ ...current, [index]: file })))} /></label>
                <span className="file-name">{experienceFiles[index]?.name || (item.certificateUrl ? 'Certificate attached' : 'PDF or image, up to 5 MB')}</span>
                {item.certificateUrl && <a className="certificate-link" href={item.certificateUrl} target="_blank" rel="noreferrer">View current ↗</a>}
                <button className="admin-secondary" type="button" disabled={uploadingExperience === index} onClick={() => uploadExperienceCertificate(index)}>{uploadingExperience === index ? 'Uploading…' : 'Upload & attach'}</button>
              </div>
            </div>)}
          </>}

          {activeSection === 'skills' && <>
            <div className="panel-heading"><div><p className="admin-kicker">04 / TOOLKIT</p><h2>Skills & tools</h2></div><button className="admin-add" type="button" onClick={() => patchProfile('skills', [...profile.skills, { group: '', items: [] }])}>+ Add group</button></div>
            {profile.skills.map((item, index) => <div className="repeat-block" key={`skill-${index}`}>
              <div className="repeat-title"><span>GROUP {String(index + 1).padStart(2, '0')}</span><button className="admin-remove" type="button" onClick={() => patchProfile('skills', profile.skills.filter((_, itemIndex) => itemIndex !== index))}>Remove</button></div>
              <div className="admin-grid two">
                <TextField label="Category name" value={item.group} onChange={(value) => patchProfile('skills', updateAt(profile.skills, index, 'group', value))} />
                <ArrayField label="Skills / tools" values={item.items || []} onChange={(value) => patchProfile('skills', updateAt(profile.skills, index, 'items', value))} />
              </div>
            </div>)}
          </>}

          {activeSection === 'achievements' && <>
            <div className="panel-heading"><div><p className="admin-kicker">05 / RECOGNITION</p><h2>Achievements</h2></div><span className="admin-count">{profile.achievements.length} ITEMS</span></div>
            <div className="achievement-list">
              {profile.achievements.map((item, index) => <article className="achievement-row" key={`${item.title}-${index}`}>
                <span className="achievement-index">{String(index + 1).padStart(2, '0')}</span>
                <div className="achievement-info"><strong>{item.title}</strong><span>{item.provider || 'No provider'}{achievementPercentage(item) !== undefined && achievementPercentage(item) !== null ? ` · ${achievementPercentage(item)}%` : ''}</span></div>
                {item.certificateUrl && <a className="certificate-link" href={item.certificateUrl} target="_blank" rel="noreferrer">Certificate ↗</a>}
                <button className="admin-text-action" type="button" onClick={() => { setAchievementDraft({ ...emptyAchievement, ...item, gotMark: item.gotMark ?? '', totalMark: item.totalMark ?? '', score: item.score ?? '' }); setEditingAchievement(index); }}>Edit</button>
                <button className="admin-text-action danger" type="button" onClick={() => deleteAchievement(index)}>Delete</button>
              </article>)}
              {!profile.achievements.length && <p className="admin-empty">No achievements added yet.</p>}
            </div>
            <form className="achievement-form" onSubmit={submitAchievement}>
              <p className="admin-kicker">{editingAchievement === null ? 'NEW ENTRY' : `EDIT ENTRY ${String(editingAchievement + 1).padStart(2, '0')}`}</p>
              <div className="admin-grid two">
                <TextField label="Achievement title" value={achievementDraft.title} onChange={(value) => setAchievementDraft((current) => ({ ...current, title: value }))} />
                <TextField label="Provider" value={achievementDraft.provider} onChange={(value) => setAchievementDraft((current) => ({ ...current, provider: value }))} />
                <TextField label="Marks obtained" type="number" value={achievementDraft.gotMark} onChange={(value) => setAchievementDraft((current) => ({ ...current, gotMark: value }))} />
                <TextField label="Total marks" type="number" value={achievementDraft.totalMark} onChange={(value) => setAchievementDraft((current) => ({ ...current, totalMark: value }))} />
              </div>
              <div className="upload-row">
                <label className="file-picker">Choose PDF or image<input type="file" accept="application/pdf,image/*" onChange={(event) => handleUploadFileChange(event, setCertificateFile)} /></label>
                <span className="file-name">{certificateFile?.name || 'PDF or image, up to 5 MB'}</span>
                <button className="admin-secondary" type="button" disabled={uploading} onClick={uploadCertificate}>{uploading ? 'Uploading…' : 'Upload & attach'}</button>
              </div>
              <div className="form-actions">
                {editingAchievement !== null && <button className="admin-secondary" type="button" onClick={() => { setAchievementDraft(emptyAchievement); setEditingAchievement(null); }}>Cancel edit</button>}
                <button className="admin-primary" type="submit">{editingAchievement === null ? 'Add achievement' : 'Save achievement'} <span aria-hidden="true">↗</span></button>
              </div>
            </form>
          </>}

          {activeSection === 'about' && <>
            <div className="panel-heading"><div><p className="admin-kicker">06 / PERSONAL</p><h2>Strengths & interests</h2></div></div>
            <div className="admin-grid two">
              <ArrayField label="Strengths" values={profile.strengths || []} onChange={(value) => patchProfile('strengths', value)} />
              <ArrayField label="Hobbies & interests" values={profile.hobbies || []} onChange={(value) => patchProfile('hobbies', value)} />
              <ArrayField label="Languages" values={profile.languages || []} onChange={(value) => patchProfile('languages', value)} />
            </div>
          </>}
        </section>
      </div>
      <div className="admin-savebar"><span>{notice?.type === 'success' ? 'All changes are up to date.' : 'Remember to save your profile edits.'}</span><button className="admin-primary" type="button" disabled={busy} onClick={saveProfile}>{busy ? 'Saving…' : 'Save changes'} <span aria-hidden="true">↗</span></button></div>
    </main>
  );
}