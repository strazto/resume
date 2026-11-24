const fs = require('fs');
const path = require('path');
const markdown = require('micromark');

const root = path.resolve(__dirname, '..');
const resume = JSON.parse(fs.readFileSync(path.join(root, 'resume.json'), 'utf8'));
const { basics } = resume;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function escape(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  }[char]));
}

function prose(value) {
  if (!value) return '';
  return markdown(value
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/[\u{1f300}-\u{1faff}]/gu, '')
    .replace(/[\u2010-\u2015]/g, '-')
    .replace(/\u2192/g, ' to '));
}

function date(value) {
  if (!value) return '';
  const [year, month] = value.split('-');
  return month ? `${months[Number(month) - 1]} ${year}` : year;
}

function period(item) {
  if (!item.startDate) return '';
  return `${date(item.startDate)} - ${item.endDate ? date(item.endDate) : 'Present'}`;
}

function visible(key) {
  return resume.meta && resume.meta.skip && resume.meta.skip[key]
    ? [] : (resume[key] || []).filter(item => !item.hide);
}

function link(url, label) {
  if (!/^https?:\/\//i.test(url)) throw new Error(`Unsupported resume link: ${url}`);
  return `<a href="${escape(url)}">${escape(label)}</a>`;
}

function metadata(parts) {
  const values = parts.filter(Boolean);
  return values.length ? `<p class="metadata">${values.map(escape).join(' | ')}</p>` : '';
}

function highlights(items) {
  return items && items.length
    ? `<ul>${items.map(item => `<li>${prose(item)}</li>`).join('\n')}</ul>` : '';
}

function keywords(items) {
  return items && items.length
    ? `<p class="technologies"><strong>Technologies:</strong> ${escape([...new Set(items)].join(', '))}</p>` : '';
}

function section(title, items) {
  return items.length ? `<section><h2>${escape(title)}</h2>\n${items.join('\n')}</section>` : '';
}

const work = visible('work').sort((a, b) =>
  (b.endDate || '9999').localeCompare(a.endDate || '9999') || b.startDate.localeCompare(a.startDate));

const sections = [
  section('Summary', [prose(basics.summary)].filter(Boolean)),
  section('Work Experience', work.map(item => `<article>
    <h3>${escape(item.position)}</h3>
    <p class="organisation">${escape(item.company)}</p>
    ${metadata([period(item), item.location])}
    ${prose(item.summary)}
    ${highlights(item.highlights)}
    ${keywords(item.keywords)}
  </article>`)),
  section('Education', visible('education').map(item => `<article>
    <h3>${escape(item.studyType)}${item.area ? ` - ${escape(item.area)}` : ''}</h3>
    <p class="organisation">${escape(item.institution)}</p>
    ${metadata([period(item), item.location])}
    ${prose(item.summary)}
    ${item.gpa ? `<p>GPA: ${escape(item.gpa)}</p>` : ''}
  </article>`)),
  section('Projects', visible('projects').map(item => `<article>
    <h3>${item.url ? link(item.url, item.name) : escape(item.name)}</h3>
    ${metadata([item.entity, (item.roles || []).join(', '), period(item)])}
    ${prose(item.description || item.summary)}
    ${highlights(item.highlights)}
    ${keywords(item.keywords)}
  </article>`)),
  section('Technical Skills', visible('skills').map(item =>
    `<p class="skill"><strong>${escape(item.name)}:</strong> ${escape(item.keywords.join(', '))}</p>`)),
  section('Awards', visible('awards').map(item => `<article>
    <h3>${escape(item.title)}</h3>
    ${metadata([item.awarder, date(item.date)])}
    ${prose(item.summary)}
  </article>`)),
];

const email = basics.email;
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error('The application resume needs a readable email address.');
}
const { city, region, countryCode, traditionalCountry } = basics.location;
const cityRegion = [city, region].filter(Boolean).join(', ');
const location = traditionalCountry
  ? [cityRegion, `(${traditionalCountry})`].filter(Boolean).join(' ')
  : [cityRegion, countryCode].filter(Boolean).join(', ');
const contactLinks = [
  basics.website && link(basics.website, basics.website.replace(/^https?:\/\//, '')),
  ...(basics.profiles || []).map(profile => link(profile.url, profile.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''))),
].filter(Boolean);
const css = fs.readFileSync(path.join(root, 'styles/application.css'), 'utf8');
const html = `<!doctype html>
<html lang="en-AU">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escape(basics.name)} - Resume</title>
  <style>${css}</style>
</head>
<body>
  <main>
    <div class="contact">
      <h1>${escape(basics.name)}</h1>
      <p class="title">${escape(basics.label)}</p>
      <p>${escape(location)} | <a href="mailto:${escape(email)}">${escape(email)}</a></p>
      <p>${contactLinks.join(' | ')}</p>
    </div>
    ${sections.filter(Boolean).join('\n')}
  </main>
</body>
</html>
`;

fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.writeFileSync(path.join(root, 'public/application.html'), html);
console.log('Built the single-column application resume from resume.json.');
