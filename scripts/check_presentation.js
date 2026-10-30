// Exercise the actual browser formatter without a browser or new dependency.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),app=fs.readFileSync(path.join(root,'assets/app.js'),'utf8');
const context={};vm.createContext(context);
vm.runInContext(app.split('\n').filter(l=>/^const (\$|labels=|styles=|pretty=)/.test(l)).join('\n')+'\n'+app.slice(app.indexOf('const columnDefinitions'),app.indexOf('function render'))+'\n'+app.slice(app.indexOf('function fields'),app.indexOf('async function openSource')),context);
const format=(...args)=>context.estimate(...args);
const escapeText=vm.runInContext('esc',context);
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
const rawCatalog=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'))),rawBefore=JSON.stringify(rawCatalog);
const emissions=JSON.parse(fs.readFileSync(path.join(root,'data/v1.0.2-web-r10/emission_evidence.json'))),emissionMap=new Map(emissions.systems.map(e=>[e.source_id,e]));
const cmd=JSON.parse(fs.readFileSync(path.join(root,'data/v1.0.2-web-r13/cmd_plot_input.json'))),cmdMap=new Map(cmd.systems.map(c=>[c.source_id,c]));
const catalog={...rawCatalog,systems:rawCatalog.systems.map(x=>({...x,cmd:cmdMap.get(x.summary.source_id),emission:emissionMap.get(x.summary.source_id)}))},before=JSON.stringify(catalog);
const numericColumns=['preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s','preferred_radio_recurrence_period_s','preferred_wd_photospheric_teff_k','preferred_wd_mass_msun'];
for(const key of numericColumns)for(const ascending of [true,false]){
 const sorted=[...catalog.systems].sort((a,b)=>context.compareSystems(a,b,key,ascending));
 let missing=false,previous=null;
 for(const x of sorted){const v=x.summary[key];if(v===''||v==null){missing=true;continue;}assert(!missing,key);if(previous!==null)assert(ascending?Number(v)>=previous:Number(v)<=previous,key);previous=Number(v);}
}
for(const x of catalog.systems){
 const row=context.tableRow(x),cells=Array.from(row.matchAll(/<td\b[^>]*>(.*?)<\/td>/g),m=>m[1]);
 assert.equal(cells.length,14);assert(!/NaN|undefined/.test(row));assert(row.includes(x.summary.source_id));
 assert.equal(typeof x.summary.gaia_dr3_id,'string');assert.equal(cells[1].replace(/<[^>]*>/g,''),x.summary.gaia_dr3_id||'—');
 if(x.summary.gaia_dr3_id){
  const url=new URL(cells[1].match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));
  assert.equal(url.origin,'https://vizier.cds.unistra.fr');assert.equal(url.pathname,'/viz-bin/VizieR-5');
  assert.equal(url.searchParams.get('-source'),'I/355/gaiadr3');assert.equal(url.searchParams.get('Source'),x.summary.gaia_dr3_id);
  assert.match(cells[1],/target="_blank" rel="noopener"/);
 }else assert(!cells[1].includes('<a'));
 if(x.summary.classification_labels.includes('magnetic_cv')){assert(cells[2].includes('mCV'));assert(!cells[2].includes('CV · mCV'));}
 for(let i=0;i<4;i++)assert.equal(cells[i+3],escapeText(context.tableNumber(x.summary[numericColumns[i]])));
}
for(const ascending of [true,false]){
 const sorted=[...catalog.systems].sort((a,b)=>context.compareSystems(a,b,'gaia_dr3_id',ascending));
 assert.equal(sorted.at(-1).summary.gaia_dr3_id,'');
 const ids=sorted.map(x=>x.summary.gaia_dr3_id).filter(Boolean).map(BigInt);
 for(let i=1;i<ids.length;i++)assert(ascending?ids[i]>=ids[i-1]:ids[i]<=ids[i-1]);
}
assert(context.compareSystems({summary:{gaia_dr3_id:'6050296829033196032'}},{summary:{gaia_dr3_id:'6050296829033196033'}},'gaia_dr3_id',true)<0);
assert.equal(context.tableConstraint({wd_mass_lower_bound_msun:'0.81',wd_mass_upper_bound_msun:'1.29'},'wd_mass','msun',2),'[0.81, 1.29]');
assert.equal(context.tableConstraint({wd_photospheric_teff_upper_bound_k:'9750'},'wd_photospheric_teff','k',0),'≤ 9750');
assert.equal(context.tableConstraint({wd_mass_lower_bound_msun:'0'},'wd_mass','msun',2),'≥ 0.00');
assert.equal(context.tableConstraint({preferred_wd_mass_msun:'0'},'wd_mass','msun',2),'0.00');
assert.equal(context.tableConstraint({},'wd_mass','msun',2),'—');
const gleamRow=context.tableRow(catalog.systems.find(x=>x.summary.source_name==='GLEAM-X J0704-37'));
assert.match(gleamRow,/3010\.02/);assert.match(gleamRow,/<td class="numeric">—<\/td><td class="numeric">10496\.55<\/td>/);
const gleam=catalog.systems.find(x=>x.summary.source_name==='GLEAM-X J0704-37');
assert.match(context.cmdNote({summary:gleam.summary},gleam.cmd),/spectrum\/SED distance \(model dependent\) 380 pc/);
assert.match(context.cmdNote({summary:gleam.summary},gleam.cmd),/M_G 12\.9/);
assert.equal(gleam.cmd.distance_measurement_ids,'M04418');
const sections=['Source overview','Selected properties & periods','CMD placement','Radio observations','X-ray luminosity','Evidence & references'];
const observationLabels=['Band','Reported flux or limit','Observable','Radio evidence','Uncertainty','Reference'];
for(const x of catalog.systems){
 const d=JSON.parse(fs.readFileSync(path.join(root,'assets/sources',x.token+'.json'))),original=JSON.stringify(d),html=context.sourceDetail(d,x);
 assert.deepEqual(Array.from(html.matchAll(/<h3(?: [^>]*)?>([^<]+)<\/h3>/g),m=>m[1]),sections);
 assert(!/NaN|undefined/.test(html),x.summary.source_name);
 assert(html.includes('class="property-list"'));assert(!html.includes('class="property-grid"'));
 assert.equal((html.match(/class="property-row"/g)||[]).length,(html.match(/class="property-note"/g)||[]).length);
 for(const [key,v] of Object.entries(d.summary))if(key.endsWith('_uncertainty_convention')&&v)assert(html.includes(escapeText(v)),key);
 assert.equal((html.match(/class="radio-row"/g)||[]).length,d.observations.length);
 for(const row of html.matchAll(/<dl class="raw-fields observation-summary">(.*?)<\/dl>/g))assert.deepEqual(Array.from(row[1].matchAll(/<dt>([^<]+)<\/dt>/g),m=>m[1]),observationLabels);
 assert(!/<details[^>]*\sopen(?:\s|>)/.test(html),'Evidence should start collapsed');
 for(const r of d.measurements)assert.equal(html.split('id="'+r.measurement_id+'"').length-1,1,r.measurement_id);
 for(const r of d.references)assert(html.includes(escapeText(r.key)));
 assert(html.includes('Unresolved issues & review history'));
 assert.equal(JSON.stringify(d),original,'Presentation must not mutate source data');
}
const added=catalog.systems.find(x=>x.summary.source_name==='ASKAP J144834-685644');
const addedData=JSON.parse(fs.readFileSync(path.join(root,'assets/sources',added.token+'.json')));
const addedHTML=context.sourceDetail(addedData,added);
assert.match(addedHTML,/No selected Gaia counterpart/);assert.match(addedHTML,/Main CMD: excluded/);
assert.match(addedHTML,/68% credible/);assert.match(addedHTML,/Radio recurrence period/);
const empty=JSON.parse(JSON.stringify(addedData));
for(const key of Object.keys(empty.summary))if(key.startsWith('preferred_'))empty.summary[key]='';
empty.observations[0].radio_band_ghz_as_reported='';empty.observations[0].flux_quantity_kind='Missing';
const emptyHTML=context.sourceDetail(empty,added);
assert(!emptyHTML.includes('class="property-list"'));assert.match(emptyHTML,/No selected physical properties or periods/);
assert.match(emptyHTML,/<dt>Band<\/dt><dd>Not reported<\/dd>/);assert.match(emptyHTML,/<dt>Reported flux or limit<\/dt><dd>Not selected\/reported<\/dd>/);
const ar=catalog.systems.find(x=>x.summary.source_name==='AR Sco').summary;
assert.match(context.propertyOverview(ar),/MCSE/);assert.match(context.propertyOverview(ar),/15 MG/);
const ae=catalog.systems.find(x=>x.summary.source_name==='AE Aqr').summary,aeOverview=context.propertyOverview(ae);
assert.equal((aeOverview.match(/class="property-row"/g)||[]).length,5);
assert.match(aeOverview,/Property notes & uncertainty conventions/);assert.match(aeOverview,/p16–p84/);
assert.match(aeOverview,/M02945/);assert.match(aeOverview,/no adopted error/);
assert(!context.propertyOverview({preferred_wd_mass_msun:'0',wd_mass_error_minus_msun:'0',wd_mass_error_plus_msun:'0'}).includes('no adopted error'));
const lx=emissions.systems.flatMap(e=>e.xray),byid=new Map(lx.map(r=>[r.measurement_id,r]));
assert.match(context.luminosityValue(byid.get('M04492')),/^≤ /);assert(!context.luminosityValue(byid.get('M04492')).includes('±'));
assert.match(context.luminosityValue(byid.get('M07159')),/1\.4 × 10<sup>30<\/sup>/);
assert.match(context.luminosityValue(byid.get('M06586')),/^log₁₀/);
assert.match(context.luminosityValue(byid.get('M02358')),/× \(d \/ 100 pc\)²/);
assert.match(context.luminosityValue(byid.get('M04373')),/L_X &lt;/);
assert.match(context.xrayContext(byid.get('M04490')),/power law/);assert.match(context.xrayContext(byid.get('M04491')),/blackbody/);
assert.match(context.emissionCell(catalog.systems.find(x=>x.summary.source_name==='AE Aqr'),'radio'),/5123 ± 9/);
assert.match(context.emissionCell(catalog.systems.find(x=>x.summary.source_name==='J191213.72-441045.1'),'radio'),/peak brightness/);
assert.match(context.emissionCell(catalog.systems.find(x=>x.summary.source_name==='ILT J1101+5521'),'radio'),/µJy beam⁻¹/);
assert.match(context.emissionCell(added,'xray'),/flux records only/);
assert.equal(JSON.stringify(catalog),before);
assert.equal(JSON.stringify(rawCatalog),rawBefore);
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
for(const [,target] of html.matchAll(/\b(?:href|src|data)="([^"]+)"/g)){
 if(target.startsWith('#')||/^[a-z]+:/i.test(target))continue;
 assert(fs.existsSync(path.join(root,target.split(/[?#]/)[0])),'Missing relative asset: '+target);
}
assert(!html.includes('SCIENTIFIC CATALOG'));assert(!html.includes('data-sort="white_dwarf_host_confidence"'));
assert(html.includes('id="additional-downloads"'));assert(!html.includes('id="additional-downloads" open'));
assert(html.includes('id="host"'));assert(html.includes('assets/logo.svg'));
const presets=vm.runInContext('columnPresets',context),definitions=vm.runInContext('columnDefinitions',context);
assert.deepEqual(Object.values(presets).map(p=>p.length),[7,10,7,14]);
assert.equal(new Set(Object.values(presets).flat()).size,14);
for(const keys of Object.values(presets)){
 assert.equal((context.tableHead(keys).match(/<th\b/g)||[]).length,keys.length);
 for(const x of catalog.systems)assert.equal((context.tableRow(x,keys).match(/<td\b/g)||[]).length,keys.length);
}
assert.equal((context.tableHead(presets.all).match(/data-sort=/g)||[]).length,11);
assert(!context.tableHead(presets.all).includes('data-sort="radio_detection_status"'));
for(const c of definitions.filter(c=>c.unit))assert(context.tableHead([c.key]).includes(c.unit));
const qs=catalog.systems.find(x=>x.summary.source_name==='QS Vir'),qsData=JSON.parse(fs.readFileSync(path.join(root,'assets/sources',qs.token+'.json'))),radioLabel='Reported flux; significance not harmonized';
assert(context.matchesFilters(qs,'qs vir','cataclysmic_variable','established',radioLabel));
assert(!context.matchesFilters(qs,'qs vir','white_dwarf_pulsar','established',radioLabel));
assert.equal((context.sourceDetail(qsData,qs,radioLabel).match(/radio-row radio-match/g)||[]).length,9);
assert.match(context.tableRow(qs,presets.emission,radioLabel),/970 ± 160/);
assert.match(context.tableRow(qs,presets.essentials,radioLabel),/View matching radio observations/);
const columns=Object.keys(catalog.systems[0].summary),csv=context.csvText([qs],columns);
assert(csv.includes('"3612227169936143360"'));assert(csv.includes('"50.1018677"'));
assert.equal(context.csvText([],columns),csv.split('\r\n')[0]+'\r\n');
assert.equal(context.csvText([{summary:{name:'a,"b\nc'}}],['name']),'"name"\r\n"a,""b\nc"\r\n');
console.log('PASS: 58 systems in four column presets, exact Gaia strings/links/sorting, full-precision CSV, matching radio rows and unchanged scientific data.');
