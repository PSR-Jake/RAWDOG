// Exercise the actual browser formatter without a browser or new dependency.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const context={};vm.createContext(context);
vm.runInContext(app.split('\n')[1]+'\n'+app.split('\n').find(l=>l.startsWith('const pretty='))+'\n'+app.slice(app.indexOf('function displayNumber'),app.indexOf('function cmdNote')),context);
const format=(...args)=>context.estimate(...args);
assert.equal(context.tableNumber('9.87973152'),'9.88');
assert.equal(context.tableNumber('199.6'),'199.60');
assert.equal(context.tableNumber('0'),'0.00');
assert.equal(context.tableNumber(''),'—');
assert.equal(context.tableNumber(null),'—');
assert.match(format('91.3424377','0.13150020','0.12361910','','','pc'),/^91\.34.*asymmetric-error.*\+0\.12.*−0\.13.* pc$/);
assert.equal(format('42.7','0.2','0.2','','','G'),'42.7 ± 0.2 G');
assert.equal(format('0','0','0','','','G'),'0 ± 0 G');
assert.match(format('1','', '0.2'),/minus unreported/);
assert.match(format('4','','','0','8'),/interval \[0, 8\]/);
assert.match(format('9.87973152','4.8e-9','4.8e-9','','','h'),/± 4\.8 × 10<sup>−9<\/sup> h/);
assert.equal(format('<img onerror=bad>','','','',''), '&lt;img onerror=bad&gt;');
const catalog=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'))),before=JSON.stringify(catalog);
for(const {summary} of catalog.systems){const html=context.propertyOverview(summary);assert(!/NaN|undefined/.test(html));}
const ar=catalog.systems.find(x=>x.summary.source_name==='AR Sco').summary;
assert.match(context.propertyOverview(ar),/MCSE/);assert.match(context.propertyOverview(ar),/15 MG/);
assert.equal(JSON.stringify(catalog),before);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
assert(!html.includes('SCIENTIFIC CATALOG'));assert(!html.includes('data-sort="white_dwarf_host_confidence"'));
assert(html.includes('id="additional-downloads"'));assert(!html.includes('id="additional-downloads" open'));
assert(html.includes('id="host"'));assert(html.includes('assets/logo.svg'));
console.log('PASS: symmetric/asymmetric errors, scientific notation, zero/missing/bounds, escaping, 59 unchanged summaries and retained host filter.');
