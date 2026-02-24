const r = require('./lighthouse-seo-report.json');
console.log('=== SEO AUDIT RESULTS ===\n');
console.log('SEO Score:', Math.round(r.categories.seo.score * 100) + '%\n');

const audits = r.audits;
const passed = [];
const failed = [];

Object.keys(audits).forEach(k => {
  const a = audits[k];
  if (a.score !== null && a.scoreDisplayMode !== 'notApplicable' && a.scoreDisplayMode !== 'informative') {
    if (a.score === 1) {
      passed.push(a.title);
    } else {
      failed.push({ title: a.title, description: a.description, details: a.details });
    }
  }
});

console.log('--- PASSED AUDITS ---');
passed.forEach(p => console.log('PASS: ' + p));

console.log('\n--- FAILED AUDITS ---');
if (failed.length === 0) {
  console.log('None! All SEO audits passed.');
} else {
  failed.forEach(f => {
    console.log('FAIL: ' + f.title);
    if (f.details && f.details.items) {
      f.details.items.forEach((item, i) => {
        if (item.node && item.node.snippet) {
          console.log('  Item ' + (i+1) + ': ' + item.node.snippet.substring(0, 100));
        } else if (item.href) {
          console.log('  Link: ' + item.href + ' - Text: "' + (item.text || '') + '"');
        }
      });
    }
  });
}
