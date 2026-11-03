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
assert.equal(context.sexagesimal(15,true),'01:00:00.000');
assert.equal(context.sexagesimal(359.9999999,true),'00:00:00.000');
assert.equal(context.sexagesimal(360,true),'00:00:00.000');
assert.equal(context.sexagesimal(-15,true),'23:00:00.000');
assert.equal(context.sexagesimal(15*(1+59/60+59.9996/3600),true),'02:00:00.000');
assert.equal(context.sexagesimal(-0.5),'−00:30:00.00');
assert.equal(context.sexagesimal(-0),'−00:00:00.00');
assert.equal(context.sexagesimal(0),'+00:00:00.00');
assert.equal(context.sexagesimal(89+59/60+59.999/3600),'+90:00:00.00');
assert.equal(context.sexagesimal(-90),'−90:00:00.00');
for(const v of ['',null,undefined,NaN,'not a coordinate'])assert.equal(context.sexagesimal(v),'—');
assert.match(format('91.3424377','0.13150020','0.12361910','','','pc'),/^91\.34.*asymmetric-error.*\+0\.12.*−0\.13.* pc$/);
assert.equal(format('42.7','0.2','0.2','','','G'),'42.7 ± 0.2 G');
assert.equal(format('0','0','0','','','G'),'0 ± 0 G');
assert.match(format('1','', '0.2'),/minus unreported/);
assert.match(format('4','','','0','8'),/interval \[0, 8\]/);
assert.match(format('9.87973152','4.8e-9','4.8e-9','','','h'),/± 4\.8 × 10<sup>−9<\/sup> h/);
assert.equal(format('<img onerror=bad>','','','',''), '&lt;img onerror=bad&gt;');
assert.equal(format('','','','0.81','1.29','M☉'),'[0.81, 1.29] M☉');
assert.equal(format('','','','','9750','K'),'≤ 9750 K');
assert.equal(format('','','','0','','M☉'),'≥ 0 M☉');
const rawCatalog=JSON.parse(fs.readFileSync(path.join(root,'assets/catalog.json'))),rawBefore=JSON.stringify(rawCatalog);
const emissions=JSON.parse(fs.readFileSync(path.join(root,'data/v1.0.2-web-r10/emission_evidence.json'))),emissionMap=new Map(emissions.systems.map(e=>[e.source_id,e]));
const cmd=JSON.parse(fs.readFileSync(path.join(root,'data/v1.0.2-web-r13/cmd_plot_input.json'))),cmdMap=new Map(cmd.systems.map(c=>[c.source_id,c]));
const positions=JSON.parse(fs.readFileSync(path.join(root,'assets/table_coordinates_fk5_j2000.json'))),positionMap=new Map(positions.systems.map(p=>[p.source_id,p]));
assert.equal(positionMap.size,58);assert.equal(positions.systems.filter(p=>p.assumed_alignment).length,1);
const catalog={...rawCatalog,systems:rawCatalog.systems.map(x=>({...x,position:positionMap.get(x.summary.source_id),cmd:cmdMap.get(x.summary.source_id),emission:emissionMap.get(x.summary.source_id)}))},before=JSON.stringify(catalog);
const numericColumns=['preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s'];
for(const key of numericColumns)for(const ascending of [true,false]){
 const sorted=[...catalog.systems].sort((a,b)=>context.compareSystems(a,b,key,ascending));
 let missing=false,previous=null;
 for(const x of sorted){const v=x.summary[key];if(v===''||v==null){missing=true;continue;}assert(!missing,key);if(previous!==null)assert(ascending?Number(v)>=previous:Number(v)<=previous,key);previous=Number(v);}
}
for(const x of catalog.systems){
 const row=context.tableRow(x),cells=Array.from(row.matchAll(/<td\b[^>]*>(.*?)<\/td>/g),m=>m[1]);
 assert.equal(cells.length,10);assert(!/NaN|undefined/.test(row));assert(row.includes(x.summary.source_id));
 assert.equal(x.position.gaia_dr3_id,x.summary.gaia_dr3_id);
 assert.equal(cells[9].replace(/<[^>]*>/g,''),x.summary.gaia_dr3_id||'—');
 if(x.summary.gaia_dr3_id){
  const url=new URL(cells[9].match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));
  assert.equal(url.origin,'https://vizier.cds.unistra.fr');assert.equal(url.searchParams.get('-source'),'I/355/gaiadr3');assert.equal(url.searchParams.get('Source'),x.summary.gaia_dr3_id);
  assert.match(cells[9],/target="_blank" rel="noopener"/);
 }else assert(!cells[9].includes('<a'));
 if(x.summary.classification_labels.includes('magnetic_cv')){assert(cells[1].includes('mCV'));assert(!cells[1].includes('CV · mCV'));}
 for(let i=0;i<3;i++)assert.equal(cells[i+6],escapeText(context.tableNumber(x.summary[numericColumns[i]])));
}
for(const ascending of [true,false]){
 const sorted=[...catalog.systems].sort((a,b)=>context.compareSystems(a,b,'gaia_dr3_id',ascending));
 assert.equal(sorted.at(-1).summary.gaia_dr3_id,'');
 const ids=sorted.map(x=>x.summary.gaia_dr3_id).filter(Boolean).map(BigInt);
 for(let i=1;i<ids.length;i++)assert(ascending?ids[i]>=ids[i-1]:ids[i]<=ids[i-1]);
}
assert(context.compareSystems({summary:{gaia_dr3_id:'6050296829033196032'}},{summary:{gaia_dr3_id:'6050296829033196033'}},'gaia_dr3_id',true)<0);
const gleamRow=context.tableRow(catalog.systems.find(x=>x.summary.source_name==='GLEAM-X J0704-37'));
assert.match(gleamRow,/3010\.02/);assert(!gleamRow.includes('10496.55'));
const gleam=catalog.systems.find(x=>x.summary.source_name==='GLEAM-X J0704-37');
assert.match(context.cmdNote({summary:gleam.summary},gleam.cmd),/spectrum\/SED distance \(model dependent\) 380 pc/);
assert.match(context.cmdNote({summary:gleam.summary},gleam.cmd),/M_G 12\.9/);
assert.equal(gleam.cmd.distance_measurement_ids,'M04418');
assert.match(context.propertyOverview(gleam.summary),/Radio recurrence period/);
const sections=['Source overview','Selected properties & periods','CMD placement','Radio observations','X-ray luminosity','Evidence & references'];
const observationLabels=['Observation ID','Band / method &amp; state','Observable','Reported flux or limit','Radio evidence','Reference'];
for(const x of catalog.systems){
 const d=JSON.parse(fs.readFileSync(path.join(root,'assets/sources',x.token+'.json'))),original=JSON.stringify(d),html=context.sourceDetail(d,x);
 assert.deepEqual(Array.from(html.matchAll(/<h3(?: [^>]*)?>([^<]+)<\/h3>/g),m=>m[1]),sections);
 assert(!/NaN|undefined/.test(html),x.summary.source_name);
 assert(html.includes('Table coordinates — FK5/J2000 & provenance'));assert(html.includes(x.position.input_sha256));
 assert.equal(typeof d.summary.gaia_dr3_id,'string');
 if(d.summary.gaia_dr3_id){
  assert(context.matchesFilters(x,d.summary.gaia_dr3_id,'','',''),'Gaia ID remains searchable from the fixed table');
  const identity=html.match(/<p class="source-identity">(.*?)<\/p>/)[1],url=new URL(identity.match(/href="([^"]+)"/)[1].replaceAll('&amp;','&'));
  assert(identity.includes('>'+d.summary.gaia_dr3_id+'</a>'));
  assert.equal(url.origin,'https://vizier.cds.unistra.fr');assert.equal(url.pathname,'/viz-bin/VizieR-5');
  assert.equal(url.searchParams.get('-source'),'I/355/gaiadr3');assert.equal(url.searchParams.get('Source'),d.summary.gaia_dr3_id);
  assert.match(identity,/target="_blank" rel="noopener"/);
 }
 assert(html.includes('class="property-list"'));assert(!html.includes('class="property-grid"'));
 assert.equal((html.match(/class="property-row"/g)||[]).length,(html.match(/class="property-note"/g)||[]).length);
 for(const row of html.matchAll(/<div class="property-row">(.*?)<\/div>/g))assert(row[1].includes('data-measurement='),x.summary.source_name+': selected property has a direct evidence link');
 for(const [key,v] of Object.entries(d.summary))if(key.endsWith('_uncertainty_convention')&&v)assert(html.includes(escapeText(v)),key);
 assert.equal((html.match(/class="radio-row"/g)||[]).length,d.observations.length);
 const radioHTML=context.radioOverview(d,new Map(d.references.map(r=>[r.key,r])),''),headings=Array.from(radioHTML.matchAll(/<th\b[^>]*>([^<]+)<\/th>/g),m=>m[1]);
 assert.deepEqual(headings,observationLabels);
 assert.deepEqual(Array.from(radioHTML.matchAll(/id="observation-([^"]+)"/g),m=>m[1]),d.observations.map(r=>r.observation_id));
 assert.equal((html.match(/class="xray-record"/g)||[]).length,x.emission.xray.filter(r=>r.available).length);
 const ids=new Set(d.measurements.map(r=>r.measurement_id));
 for(const [,id] of html.matchAll(/data-measurement="([^"]+)"/g))assert(ids.has(id),'Evidence link must resolve within source: '+id);
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
assert(emptyHTML.includes('Band / method &amp; state</span>Not reported'),'Missing band stays explicit');assert(emptyHTML.includes('Reported flux or limit</span><strong>Not selected/reported</strong>'),'Missing flux is not invented');
const ar=catalog.systems.find(x=>x.summary.source_name==='AR Sco').summary;
assert.match(context.propertyOverview(ar),/MCSE/);assert.match(context.propertyOverview(ar),/15 MG/);
assert.match(context.propertyOverview(ar),/\[0\.81, 1\.29\] M☉/);assert.match(context.propertyOverview(ar),/≤ 9750 K/);
for(const x of catalog.systems)for(const [prefix,unit] of [['wd_mass','msun'],['wd_photospheric_teff','k']]){
 const s=x.summary,lo=s[prefix+'_lower_bound_'+unit],hi=s[prefix+'_upper_bound_'+unit];
 if(!s['preferred_'+prefix+'_'+unit]&&(lo||hi)){
  const overview=context.propertyOverview(s);
  assert(overview.includes('no selected central value'));assert(overview.includes(s[prefix+'_measurement_ids']));
  assert(overview.includes(escapeText(s[prefix+'_note'])));assert(overview.includes(escapeText(s[prefix+'_uncertainty_convention'])));
 }
}
assert.match(context.propertyOverview(catalog.systems.find(x=>x.summary.source_name==='AP CrB').summary),/\[17000, 23000\] K/);
const ae=catalog.systems.find(x=>x.summary.source_name==='AE Aqr').summary,aeOverview=context.propertyOverview(ae);
assert.equal((aeOverview.match(/class="property-row"/g)||[]).length,5);
assert.match(aeOverview,/Property notes & uncertainty conventions/);assert.match(aeOverview,/p16–p84/);
assert.match(aeOverview,/M02945/);assert.match(aeOverview,/no adopted error/);
assert(!context.propertyOverview({preferred_wd_mass_msun:'0',wd_mass_error_minus_msun:'0',wd_mass_error_plus_msun:'0'}).includes('no adopted error'));
const j1912=catalog.systems.find(x=>x.summary.source_name==='J191213.72-441045.1'),j1912Overview=context.propertyOverview(j1912.summary);
assert.equal(j1912.summary.preferred_distance_pc,'');assert.equal(j1912.cmd.distance_pc,'236.729919');
assert(j1912Overview.includes(escapeText(j1912.summary.distance_status)));
assert(!j1912Overview.match(/<dl class="property-list">(.*?)<\/dl>/)[1].includes('<dt>Distance</dt>'));
assert.match(context.cmdNote({summary:j1912.summary},j1912.cmd),/CMD-only distance adoption/);
const lx=emissions.systems.flatMap(e=>e.xray),byid=new Map(lx.map(r=>[r.measurement_id,r]));
assert.match(context.luminosityValue(byid.get('M04492')),/^≤ /);assert(!context.luminosityValue(byid.get('M04492')).includes('±'));
assert.match(context.luminosityValue(byid.get('M07159')),/1\.4 × 10<sup>30<\/sup>/);
assert.match(context.luminosityValue(byid.get('M06586')),/^log₁₀/);
assert.match(context.luminosityValue(byid.get('M02358')),/× \(d \/ 100 pc\)²/);
assert.match(context.luminosityValue(byid.get('M04373')),/L_X &lt;/);
assert.match(context.xrayContext(byid.get('M04490')),/power law/);assert.match(context.xrayContext(byid.get('M04491')),/blackbody/);
assert.match(context.radioUnit(emissionMap.get(j1912.summary.source_id).radio[0]),/µJy beam⁻¹/);
assert.match(context.radioUnit(emissionMap.get(catalog.systems.find(x=>x.summary.source_name==='ILT J1101+5521').summary.source_id).radio[0]),/µJy beam⁻¹/);
assert.match(context.xrayOverview(added,new Map()),/flux records remain/);
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
assert(html.includes('aria-labelledby="detail-name"'));
assert.equal((html.match(/data-jump=/g)||[]).length,6);
const definitions=vm.runInContext('columnDefinitions',context);
assert.deepEqual(Array.from(definitions,c=>c.key),['source_name','classification_labels','ra_deg','dec_deg','galactic_l_deg','galactic_b_deg','preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s','gaia_dr3_id']);
assert.equal((context.tableHead().match(/<th\b/g)||[]).length,10);
assert.equal((context.tableHead().match(/data-sort=/g)||[]).length,10);
assert.equal((context.tableHead().match(/FK5 · J2000\*/g)||[]).length,2);
assert(!context.tableHead().includes('Radio recurrence'));assert(!context.tableHead().includes('Radio observations'));
assert(!html.includes('id="columns"'));assert(!app.includes('columnPresets'));assert(!app.includes('column hidden'));
for(const c of definitions.filter(c=>c.unit))assert(context.tableHead().includes(c.unit));
const coordinateKeys=['ra_deg','dec_deg','galactic_l_deg','galactic_b_deg'];
for(const x of catalog.systems){
 const row=context.tableRow(x),cells=Array.from(row.matchAll(/<td\b[^>]*>(.*?)<\/td>/g),m=>m[1]);
 const ra=cells[2].split('<')[0],dec=cells[3].split('<')[0];
 assert.match(ra,/^\d{2}:\d{2}:\d{2}\.\d{3}$/);assert.match(dec,/^[+−]\d{2}:\d{2}:\d{2}\.\d{2}$/);
 const parsedRA=ra.split(':').map(Number),parsedDec=dec.slice(1).split(':').map(Number);
 assert(parsedRA[0]<24&&parsedRA[1]<60&&parsedRA[2]<60);assert(parsedDec[1]<60&&parsedDec[2]<60);
 const raDeg=15*(parsedRA[0]+parsedRA[1]/60+parsedRA[2]/3600),decDeg=(dec[0]==='−'?-1:1)*(parsedDec[0]+parsedDec[1]/60+parsedDec[2]/3600),raError=Math.abs(raDeg-x.position.ra_deg);
 assert(Math.min(raError,360-raError)<=0.0005*15/3600+1e-12,'RA rounding: '+x.summary.source_name);
 assert(Math.abs(decDeg-x.position.dec_deg)<=0.005/3600+1e-12,'Dec rounding: '+x.summary.source_name);
 coordinateKeys.slice(2).forEach((key,i)=>assert.equal(cells[i+4],Number(x.position[key]).toFixed(4)));
 if(!x.position.assumed_alignment)assert(!cells[2].includes('coordinate-origin'));
 else {assert(cells[2].includes('Frame assumed*'));assert(cells[3].includes('Frame assumed*'));}
}
for(const key of coordinateKeys)for(const ascending of [true,false]){
 const sorted=[...catalog.systems].sort((a,b)=>context.compareSystems(a,b,key,ascending));
 for(let i=1;i<sorted.length;i++)assert(ascending?sorted[i].position[key]>=sorted[i-1].position[key]:sorted[i].position[key]<=sorted[i-1].position[key],key);
 const zero={summary:{},position:{[key]:0}},missing={summary:{},position:{[key]:''}};
 assert(context.compareSystems(zero,missing,key,ascending)<0,'Missing coordinate stays last');
 assert(context.compareSystems(missing,zero,key,ascending)>0);
 const a={summary:{},position:{[key]:1.0000001}},b={summary:{},position:{[key]:1.0000002}};
 assert(context.compareSystems(a,b,key,true)<0,'Sort retains sub-display precision');
}
const zeroPosition={...added,position:{...added.position,ra_deg:0,dec_deg:0,galactic_l_deg:0,galactic_b_deg:0}};
assert.match(context.tableRow(zeroPosition),/00:00:00\.000/);assert.match(context.tableRow(zeroPosition),/\+00:00:00\.00/);
assert.equal((context.tableRow(zeroPosition).match(/0\.0000/g)||[]).length,2);
const missingPosition={...added,position:{...added.position,ra_deg:'',dec_deg:null,galactic_l_deg:undefined,galactic_b_deg:''}};
assert(Array.from(context.tableRow(missingPosition).matchAll(/<td\b[^>]*>(.*?)<\/td>/g),m=>m[1]).slice(2,6).every(c=>c==='—'));
assert(html.includes('id="coordinate-note"'));assert(!html.includes('id="coordinate-note" class="help" hidden'));
assert(html.includes('data/v1.0.2/sky_plot_input.csv'));
assert(html.includes('assets/table_coordinates_fk5_j2000.csv'));
const qs=catalog.systems.find(x=>x.summary.source_name==='QS Vir'),qsData=JSON.parse(fs.readFileSync(path.join(root,'assets/sources',qs.token+'.json'))),radioLabel='Reported flux; significance not harmonized';
assert(context.matchesFilters(qs,'qs vir','cataclysmic_variable','established',radioLabel));
assert(!context.matchesFilters(qs,'qs vir','white_dwarf_pulsar','established',radioLabel));
assert.equal((context.sourceDetail(qsData,qs,radioLabel).match(/radio-row radio-match/g)||[]).length,9);
assert(!context.tableRow(qs).includes('970 ± 160'));
assert.match(context.sourceDetail(qsData,qs,radioLabel),/970 ± 160 µJy/);
assert.match(context.tableRow(qs,radioLabel),/View matching radio observations/);
const columns=Object.keys(catalog.systems[0].summary),csv=context.csvText([qs],columns);
assert(csv.includes('"3612227169936143360"'));assert(csv.includes('"50.1018677"'));
assert.equal(context.csvText([],columns),csv.split('\r\n')[0]+'\r\n');
assert.equal(context.csvText([{summary:{name:'a,"b\nc'}}],['name']),'"name"\r\n"a,""b\nc"\r\n');
async function checkSourceFailures(){
 // A delayed failed request must not replace a newer source's evidence.
 const nodes=Object.fromEntries(['#detail','#detail-name','.detail-nav','#detail-status','#detail-body','#close'].map(k=>[k,{focus(){},showModal(){this.open=true;}}]));
 const pending=new Map(),sourceContext={document:{activeElement:{}},nodes,fetch:url=>new Promise((resolve,reject)=>pending.set(url,{resolve,reject}))};
 vm.createContext(sourceContext);
 vm.runInContext(`const $=s=>nodes[s],esc=s=>String(s).replaceAll('<','&lt;');let detailRequest=0,lastFocus;const systems=['older','newer'].map(id=>({token:id,summary:{source_id:id,source_name:id}}));function sourceDetail(d,x){return x.summary.source_name;}`+app.slice(app.indexOf('async function openSource'),app.indexOf('function closeSource')),sourceContext);
 const older=sourceContext.openSource('older',false),newer=sourceContext.openSource('newer',false);
 pending.get('assets/sources/newer.json?v=1.0.2').resolve({ok:true,json:async()=>({})});await newer;
 pending.get('assets/sources/older.json?v=1.0.2').reject(new Error('Delayed failure'));await older;
 assert.equal(nodes['#detail-body'].innerHTML,'newer');assert.equal(nodes['.detail-nav'].hidden,false);
 const broken=sourceContext.openSource('older',false);
 pending.get('assets/sources/older.json?v=1.0.2').resolve({ok:true,json:async()=>{throw new SyntaxError('Invalid JSON');}});await broken;
 assert(nodes['#detail-body'].innerHTML.includes('download the versioned evidence CSV'));assert.equal(nodes['.detail-nav'].hidden,true);
 await sourceContext.openSource('<unknown>',false);assert(nodes['#detail-body'].innerHTML.includes('&lt;unknown>'));
}
checkSourceFailures().then(()=>console.log('PASS: 58 systems, fixed 10-column FK5/J2000 table, exact Gaia ID links/sorting, sexagesimal display, coordinate joins/provenance, source evidence and unchanged released data.')).catch(e=>{console.error(e);process.exitCode=1;});
