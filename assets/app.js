'use strict';
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={cataclysmic_variable:'CV',magnetic_cv:'Magnetic-CV tag',white_dwarf_pulsar:'WD pulsar',long_period_transient:'Long-period transient',long_period_radio_transient:'Long-period radio transient',established:'Established',inferred_or_proposed:'Inferred or proposed',unresolved:'Unresolved'};
const styles={magnetic_cv:['#1864ab','●','○'],cataclysmic_variable:['#087f5b','■','□'],white_dwarf_pulsar:['#7048a5','◆','◇'],long_period_transient:['#b95000','▲','△']};
const pretty=k=>({non_magnetic_cv:'Non-magnetic CV',AM:'Polar (AM Her)',IP:'Intermediate polar (IP)'}[k]||k).replaceAll('_',' ').replace(/\bgaia\b/g,'Gaia').replace(/\bwd\b/g,'WD');
let systems=[],shown=[],sortKey='source_name',sortAsc=true,lastFocus=null,detailRequest=0;
const files=['rawdog_source_summary.csv','rawdog_radio_observations.csv','rawdog_measurements.csv','rawdog_references.csv','rawdog_physical_properties.csv','rawdog_gaia_counterparts.csv','rawdog_source_references.csv','rawdog_review_issues.csv','rawdog_excluded_counterparts.csv','rawdog_reference_link_checks.csv'];
$('#download-list').innerHTML=files.slice(2).map(f=>`<li><a download href="data/v1.0.2/${f}">${esc(pretty(f.replace('rawdog_','').replace('.csv','')))} CSV</a></li>`).join('');
const columnDefinitions=[
 {key:'source_name',label:'System',sort:true},
 {key:'gaia_dr3_id',label:'Gaia DR3 ID',sort:true},
 {key:'classification_labels',label:'Class',sort:true},
 {key:'preferred_distance_pc',label:'Distance',unit:'pc',sort:true,numeric:true},
 {key:'preferred_orbital_period_h',label:'Orbital period',unit:'h',sort:true,numeric:true},
 {key:'preferred_wd_spin_period_s',label:'WD spin',unit:'s',sort:true,numeric:true},
 {key:'preferred_radio_recurrence_period_s',label:'Radio recurrence',unit:'s',sort:true,numeric:true},
 {key:'radio_preview',label:'Radio Sν',unit:'µJy · recorded band'},
 {key:'xray_preview',label:'X-ray Lₓ',unit:'erg s⁻¹ · recorded band'},
 {key:'preferred_wd_photospheric_teff_k',label:'WD photospheric temperature',unit:'K',sort:true,numeric:true},
 {key:'preferred_wd_mass_msun',label:'WD mass',unit:'M☉',sort:true,numeric:true},
 {key:'preferred_companion_spectral_type',label:'Companion spectral type',sort:true},
 {key:'radio_observation_count',label:'Radio observations',unit:'rows',sort:true,numeric:true},
 {key:'radio_detection_status',label:'Radio evidence'}
];
const columnPresets={
 essentials:['source_name','classification_labels','preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s','preferred_radio_recurrence_period_s','radio_observation_count'],
 physical:['source_name','gaia_dr3_id','classification_labels','preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s','preferred_radio_recurrence_period_s','preferred_wd_photospheric_teff_k','preferred_wd_mass_msun','preferred_companion_spectral_type'],
 emission:['source_name','classification_labels','preferred_distance_pc','radio_observation_count','radio_detection_status','radio_preview','xray_preview'],
 all:columnDefinitions.map(c=>c.key)
};
function tableHead(keys,key='source_name',ascending=true){return '<tr>'+keys.map(k=>{
 const c=columnDefinitions.find(c=>c.key===k),label=esc(c.label)+(c.unit?'<span class="column-unit">'+esc(c.unit)+'</span>':'');
 return '<th scope="col"'+(c.numeric?' class="numeric"':'')+(c.sort&&k===key?' aria-sort="'+(ascending?'ascending':'descending')+'"':'')+'>'+(c.sort?'<button data-sort="'+k+'">'+label+'<span aria-hidden="true"> ↕</span></button>':label)+'</th>';
}).join('')+'</tr>';}
function tags(s){return displayClassCodes(s).map(t=>`<span class="tag">${esc(labels[t]||pretty(t))}</span>`).join('');}
function displayClassCodes(s){const codes=[...new Set(s.classification_labels.split(';').map(t=>t.trim()).filter(Boolean))];return codes.filter(t=>t!=='long_period_transient'&&(t!=='cataclysmic_variable'||!codes.includes('magnetic_cv')));}
function symbol(x){let [c,a,b]=styles[x.sky.display_group];return `<span class="symbol" style="color:${c}" aria-label="${x.sky.qualified_status==='true'?'Qualified':'Established'} ${esc(labels[x.sky.display_group])}">${x.sky.qualified_status==='true'?b:a}</span> `;}
function compareSystems(a,b,key,ascending){
 const av=a.summary[key],bv=b.summary[key];
 if(!present(av)||!present(bv))return !present(av)?(!present(bv)?0:1):-1;
 const numeric=columnDefinitions.some(c=>c.key===key&&c.numeric);
 const c=numeric?Number(av)-Number(bv):av.localeCompare(bv,undefined,{numeric:true});return ascending?c:-c;
}
function tableConstraint(s,prefix,unit,digits){
 const format=v=>Number(v).toFixed(digits),val=s['preferred_'+prefix+'_'+unit],lo=s[prefix+'_lower_bound_'+unit],hi=s[prefix+'_upper_bound_'+unit];
 if(present(val))return format(val);
 if(present(lo)&&present(hi))return '['+format(lo)+', '+format(hi)+']';
 if(present(hi))return '≤ '+format(hi);
 if(present(lo))return '≥ '+format(lo);
 return '—';
}
function tableRow(x,keys=columnPresets.all,radioLabel=''){
 const s=x.summary,classes=displayClassCodes(s).map(t=>({cataclysmic_variable:'CV',magnetic_cv:'mCV',white_dwarf_pulsar:'WD pulsar',long_period_radio_transient:'LPT'}[t]||pretty(t))).join(' · ');
 const cells={
 source_name:`<td><button class="system-link" data-source="${esc(s.source_id)}">${symbol(x)}${esc(s.source_name)}</button>${radioLabel?`<button class="matching-radio-link" data-source="${esc(s.source_id)}" data-section="radio-observations" data-match-radio="${esc(radioLabel)}">View matching radio observations</button>`:''}</td>`,
 gaia_dr3_id:`<td class="gaia-id">${s.gaia_dr3_id?`<a href="https://vizier.cds.unistra.fr/viz-bin/VizieR-5?-source=I%2F355%2Fgaiadr3&amp;Source=${encodeURIComponent(s.gaia_dr3_id)}" target="_blank" rel="noopener" title="View this Gaia DR3 source in VizieR (opens in a new tab)">${esc(s.gaia_dr3_id)}</a>`:'—'}</td>`,
 classification_labels:`<td class="table-class" title="${esc(pretty(s.magnetic_subclass_or_status||s.proposed_or_disputed_interpretation||s.published_subclass_labels))}">${esc(classes)}</td>`,
 radio_preview:emissionCell(x,'radio'),xray_preview:emissionCell(x,'xray'),
 preferred_wd_photospheric_teff_k:'<td class="numeric">'+esc(tableConstraint(s,'wd_photospheric_teff','k',0))+'</td>',
 preferred_wd_mass_msun:'<td class="numeric">'+esc(tableConstraint(s,'wd_mass','msun',2))+'</td>',
 preferred_companion_spectral_type:'<td>'+esc(s.preferred_companion_spectral_type||'—')+'</td>',
 radio_observation_count:`<td class="numeric"><button class="emission-link" data-source="${esc(s.source_id)}" data-section="radio-observations" aria-label="${esc(s.source_name)}: ${esc(s.radio_observation_count)} radio observation ${s.radio_observation_count==='1'?'row':'rows'}">${esc(s.radio_observation_count)}</button></td>`,
 radio_detection_status:'<td class="radio-status">'+esc(s.radio_detection_status||'Not reported')+'</td>'
 };
 for(const key of ['preferred_distance_pc','preferred_orbital_period_h','preferred_wd_spin_period_s','preferred_radio_recurrence_period_s'])cells[key]='<td class="numeric">'+esc(tableNumber(s[key]))+'</td>';
 return '<tr>'+keys.map(k=>cells[k]).join('')+'</tr>';
}
function luminosityValue(r){
 if(!r.display_value_numeric&&!r.display_lower_bound&&!r.display_upper_bound)return esc(r.value_text);
 if(r.log10_luminosity)return 'log₁₀[Lₓ / (erg s⁻¹)] = '+numberMarkup(r.display_value_numeric,3);
 if(r.distance_normalization_pc&&r.display_value_numeric)return numberMarkup(r.display_value_numeric,3)+' × (d / '+esc(r.distance_normalization_pc)+' pc)²';
 if(r.upper_limit)return '≤ '+numberMarkup(r.display_upper_bound||r.display_value_numeric,3);
 if(r.lower_limit)return '≥ '+numberMarkup(r.display_lower_bound||r.display_value_numeric,3);
 return estimate(r.display_value_numeric,r.display_error_minus,r.display_error_plus,r.display_lower_bound,r.display_upper_bound,'',3);
}
function xrayContext(r){const model=/powerlaw/i.test(r.parameter)?'power law':/blackbody/i.test(r.parameter)?'blackbody':/_model/i.test(r.parameter)?'model dependent':null;return [r.band_label,r.distance_label,model,r.component&&!/^(system|unresolved)/i.test(r.component)?pretty(r.component):null,/^(yes|true)$/i.test(r.is_derived)?'derived':null].filter(Boolean).join(' · ');}
function radioUnit(r){return r.flux_quantity_kind.includes('Peak')?'µJy beam⁻¹':'µJy';}
function emissionCell(x,kind){
 const e=x.emission||{radio:[],xray:[]},rows=kind==='radio'?e.radio:e.xray.filter(r=>r.available),r=rows[0],section=kind==='radio'?'radio-observations':'xray-luminosity';
 const val=!r?'—':kind==='radio'?(r.flux_quantity_kind==='Missing'?'—':esc(r.reported_flux_text.replace(/\+\/-/g,'±'))):luminosityValue(r);
 const context=!r?(kind==='xray'&&e.xray_flux_record_count?'flux records only':'no recorded value'):kind==='radio'?((r.radio_band_ghz_as_reported||'band unspecified')+(r.radio_band_ghz_as_reported?' GHz':'')+(r.flux_quantity_kind.includes('Peak')?' · peak brightness ('+radioUnit(r)+')':'')+(/^Marginal/.test(r.radio_evidence_label)?' · marginal':'')+(r.flux_quantity_kind==='Missing'?' · no selected flux':'')):xrayContext(r);
 return `<td class="emission-cell"><button class="emission-link" data-source="${esc(x.summary.source_id)}" data-section="${section}" aria-label="${esc(x.summary.source_name)}: ${kind==='radio'?'radio observations':'X-ray luminosity evidence'}">${val}</button><span class="emission-note">${esc(context)}</span>${r?'<span class="emission-note">'+(rows.length>1?'first of '+rows.length+' records':'1 record')+' · view evidence</span>':''}</td>`;
}
function matchesFilters(x,q,cls,host,radio){const s=x.summary;return (!q||[s.source_name,s.aliases,s.gaia_dr3_id,s.source_reference_keys].join(' ').toLowerCase().includes(q))&&(!cls||s.classification_labels.split(';').map(t=>t.trim()).includes(cls))&&(!host||s.white_dwarf_host_confidence===host)&&(!radio||x.radio_labels.includes(radio));}
function csvText(rows,columns){const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';return [columns,...rows.map(x=>columns.map(k=>x.summary[k]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';}
function render(){
 const q=$('#search').value.toLowerCase().trim(),cls=$('#classification').value,host=$('#host').value,radio=$('#radio').value;
 shown=systems.filter(x=>matchesFilters(x,q,cls,host,radio));
 shown.sort((a,b)=>compareSystems(a,b,sortKey,sortAsc));
 const keys=columnPresets[$('#columns').value];
 $('#systems thead').innerHTML=tableHead(keys,sortKey,sortAsc);
 $('#systems tbody').innerHTML=shown.map(x=>tableRow(x,keys,radio)).join('');
 $('#sort-state').textContent='Sorted by '+columnDefinitions.find(c=>c.key===sortKey).label+' · '+(sortAsc?'ascending':'descending')+(keys.includes(sortKey)?'':' · column hidden in this view');
 $('#active-filters').innerHTML=['search','classification','host','radio'].filter(id=>$('#'+id).value).map(id=>{const el=$('#'+id),label=id==='search'?'Search: '+el.value:el.selectedOptions[0].textContent;return '<button type="button" data-clear-filter="'+id+'" aria-label="Remove '+esc(label)+' filter">'+esc(label)+' <span aria-hidden="true">×</span></button>';}).join('')||'<span>No active filters</span>';
 $('#radio-filter-note').hidden=!radio;
 $('#active-filters').hidden=![q,cls,host,radio].some(Boolean);$('#emission-note').hidden=!keys.includes('radio_preview');
 $('#count').textContent=`${shown.length} / ${systems.length} systems · RAWDOG 1.0.2`;$('#empty').hidden=shown.length!==0;$('#export').disabled=false;updatePlots();
}
function updatePlots(){
 const on=$('#plot-filter').checked,allowed=new Set(shown.map(x=>x.token));
 for(let id of ['sky','cmd']){
  const obj=$('#'+id),doc=obj.contentDocument;
  if(doc)for(let p of doc.querySelectorAll('[data-token]'))p.style.display=(!on||allowed.has(p.getAttribute('data-token')))?'':'none';
  const eligible=systems.filter(x=>id==='sky'||x.cmd.included==='true'),matches=eligible.filter(x=>allowed.has(x.token)).length;
  $('#'+id+'-count').textContent=`${on?matches:eligible.length} plotted / ${eligible.length} eligible${on?' · catalog filters applied':''}${id==='cmd'?' · '+(systems.length-eligible.length)+' excluded by scientific inputs':''}`;
 }
}
function setupPlot(obj){const doc=obj.contentDocument;if(!doc)return;for(let g of doc.querySelectorAll('[data-source]')){g.style.cursor='pointer';g.addEventListener('click',ev=>{ev.preventDefault();openSource(g.getAttribute('data-source'));});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();openSource(g.getAttribute('data-source'));}});}updatePlots();}
for(let obj of document.querySelectorAll('.plot'))obj.addEventListener('load',()=>setupPlot(obj));
$('#filters').addEventListener('input',render);$('#filters').addEventListener('submit',e=>e.preventDefault());$('#filters').addEventListener('reset',()=>setTimeout(render,0));$('#plot-filter').addEventListener('change',updatePlots);
$('#columns').addEventListener('change',render);
$('#active-filters').addEventListener('click',ev=>{const b=ev.target.closest('[data-clear-filter]');if(b){const el=$('#'+b.dataset.clearFilter);el.value='';render();el.focus();}});
$('#systems').addEventListener('click',ev=>{const s=ev.target.closest('[data-source]');if(s)openSource(s.dataset.source,true,s.dataset.section,s.dataset.matchRadio);const b=ev.target.closest('[data-sort]');if(b){sortAsc=sortKey===b.dataset.sort?!sortAsc:true;sortKey=b.dataset.sort;render();$('#systems [data-sort="'+sortKey+'"]').focus();}});
function exportCSV(){const text=csvText(shown,Object.keys(systems[0].summary));const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='RAWDOG-v1.0.2-filtered-systems.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export').addEventListener('click',exportCSV);
function fields(r,keys){return `<dl class="raw-fields">${keys.filter(k=>r[k]!==''&&r[k]!=null).map(k=>`<dt>${esc(pretty(k))}</dt><dd>${esc(k==='component'||k.endsWith('_component')||k==='gaia_match_status'?pretty(r[k]):r[k])}</dd>`).join('')}</dl>`;}
function value(r){return estimate(r.value_numeric!==''&&r.value_numeric!=null?r.value_numeric:r.value_text||'No numeric value selected/reported',r.error_minus,r.error_plus,r.lower_bound,r.upper_bound,r.unit);}
function refLink(r){let url=r.public_reference_url;return /^https?:\/\//.test(url)?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(r.key)}</a>`:esc(r.key);}
function displayNumber(v,digits=4){if(v===''||v==null)return '—';return Number.isFinite(Number(v))?String(Number(Number(v).toPrecision(digits))):String(v);}
function tableNumber(v){return v===''||v==null?'—':Number.isFinite(Number(v))?Number(v).toFixed(2):String(v);}
function present(v){return v!==''&&v!=null;}
function evidenceLinks(ids){return String(ids||'').split(';').map(id=>id.trim()).filter(Boolean).map(id=>'<button type="button" class="evidence-link" data-measurement="'+esc(id)+'">Evidence '+esc(id)+'</button>').join(' ');}
function numberMarkup(v,digits=4){
 const text=displayNumber(v,digits),match=text.match(/^(.+)e([+-]?\d+)$/i);
 return match?`${esc(match[1])} × 10<sup>${Number(match[2])<0?'−':''}${Math.abs(Number(match[2]))}</sup>`:esc(text);
}
function estimate(val,em,ep,lo,hi,unit='',digits=4){
 const errors=[em,ep].filter(v=>present(v)&&Number.isFinite(Number(v))&&Number(v)>0).map(Number);
 let central=numberMarkup(val,digits);
 if(errors.length&&present(val)&&Number.isFinite(Number(val))){
  const place=10**(Math.floor(Math.log10(Math.min(...errors)))-1);
  central=numberMarkup(Number((Math.round(Number(val)/place)*place).toPrecision(15)),15);
 }
 let uncertainty='';
 if(present(em)||present(ep)){
  const lower=present(em)?numberMarkup(em,2):'?',upper=present(ep)?numberMarkup(ep,2):'?';
  uncertainty=present(em)&&present(ep)&&Number(em)===Number(ep)?` ± ${lower}`:
   `<span class="asymmetric-error" role="img" aria-label="plus ${esc(present(ep)?displayNumber(ep,2):'unreported')}, minus ${esc(present(em)?displayNumber(em,2):'unreported')}"><span aria-hidden="true">+${upper}</span><span aria-hidden="true">−${lower}</span></span>`;
 }else if(present(lo)||present(hi))uncertainty=` · interval [${present(lo)?numberMarkup(lo):'…'}, ${present(hi)?numberMarkup(hi):'…'}]`;
 return central+uncertainty+(unit?' '+esc(unit):'');
}
const properties=[
 ['distance_pc','Distance','pc','distance'],['orbital_period_h','Orbital period','h','orbital_period'],['wd_spin_period_s','WD spin period','s','wd_spin'],['ip_beat_period_s','Spin–orbit beat period','s','ip_beat'],['radio_recurrence_period_s','Radio recurrence period','s','radio_recurrence'],
 ['wd_photospheric_teff_k','WD photospheric temperature','K','wd_photospheric_teff'],['wd_mean_photospheric_field_mg','WD mean photospheric field','MG','wd_mean_photospheric_field'],['wd_polar_field_mg','WD polar field','MG','wd_polar_field'],['wd_local_emission_region_field_mg','WD local emission-region field','MG','wd_local_emission_region_field'],['wd_mass_msun','WD mass','M☉','wd_mass'],['companion_spectral_type','Companion spectral type','','companion_spectral_type'],['companion_mass_msun','Companion mass','M☉','companion_mass'],['companion_teff_k','Companion temperature','K','companion_teff'],['radio_emission_region_field_gauss','Radio emission-region field','G','radio_emission_region_field']];
function propertyOverview(s){
 const notes=[];
 const rows=properties.filter(([k])=>present(s['preferred_'+k])).map(([k,label,unit,prefix])=>{
 const get=suffix=>s[prefix+suffix+(unit?'_'+k.split('_').at(-1):'')],val=s['preferred_'+k];
 const lo=get('_lower_bound'),hi=get('_upper_bound'),em=get('_error_minus'),ep=get('_error_plus');
 const convention=s[prefix+'_uncertainty_convention']||((em||ep||lo||hi)?'Interval/confidence convention unspecified; see evidence.':''),component=s[prefix+'_component']||'',method=s[prefix+'_method']||'';
 const metadataKey=k.replace(/_(pc|h|s|k|mg|msun|gauss)$/,''),measurementIds=s[prefix+'_measurement_ids']||s[metadataKey+'_measurement_ids'],referenceKeys=s[prefix+'_reference_keys']||s[metadataKey+'_reference_keys'];
 const hints=[];
 if(/approximate/i.test(convention))hints.push('approximate');
 if(/fit|model|infer|synchrotron|mcmc/i.test(method)||s[prefix+'_assumption'])hints.push('model / assumptions');
 if(/MCSE/i.test(convention))hints.push('MCSE');
 else if(/p16|16th/i.test(convention)&&/p84|84th/i.test(convention))hints.push('p16–p84');
 else if(/68% credible/i.test(convention))hints.push('68% credible');
 if(Number.isFinite(Number(val))&&![em,ep,lo,hi].some(present))hints.push('no adopted error');
 notes.push(`<div class="property-note"><h4>${esc(label)}</h4>${fields({component,uncertainty:convention||'Not reported.',method,assumptions:s[prefix+'_assumption'],measurement_ids:measurementIds,reference_keys:referenceKeys},['component','uncertainty','method','assumptions','measurement_ids','reference_keys'])}</div>`);
 return `<div class="property-row"><dt>${esc(label)}</dt><dd><strong>${estimate(val,em,ep,lo,hi,unit,k.includes('period')?6:4)}</strong>${hints.length?'<span class="property-qualification">'+esc(hints.join(' · '))+'</span>':''}${evidenceLinks(measurementIds)}</dd></div>`;
 }).join('');
 const missing=properties.filter(([k])=>!present(s['preferred_'+k])).map(([k,label,unit,prefix])=>{
 const status=s[prefix+'_status']||s[k.replace(/_(pc|h|s|k|mg|msun|gauss)$/,'')+'_status'],note=s[prefix+'_note']||s[k.replace(/_(pc|h|s|k|mg|msun|gauss)$/,'')+'_note'];
 return status||note?'<dt>'+esc(label)+'</dt><dd>'+esc([status,note].filter(Boolean).join(' '))+'</dd>':'';
 }).join('');
 return (rows?'<dl class="property-list">'+rows+'</dl><details class="record property-notes"><summary>Property notes & uncertainty conventions</summary>'+notes.join('')+'</details>':(missing?'<p class="muted">No selected physical properties or periods. Published alternatives remain in the evidence below.</p>':''))+(missing?'<details class="record"><summary>Unselected quantities — recorded reasons</summary><dl class="raw-fields">'+missing+'</dl></details>':'');
}
function cmdNote(d,c=d.cmd){if(c.included!=='true')return `Main CMD: excluded. ${c.exclusion_reason}`;
 let note=`Main CMD: ${/SED/.test(c.distance_method)?'published spectrum/SED distance (model dependent)':'geometric distance'} ${displayNumber(c.distance_pc)} pc, observed BP−RP ${displayNumber(c.BP_RP_observed_mag,3)} mag, M_G ${displayNumber(c.M_G_observed_mag,3)} mag; unresolved light, not extinction corrected.`;
 note+=' '+c.qualifications;
 if(!present(d.summary.preferred_distance_pc))note+=' This is a CMD-only distance adoption; no catalog preferred distance is selected.';
 if(d.summary.source_name==='ILT J1101+5521')note+=' Published model-dependent SED placement is available in supplementary downloads.';
 return note;}
function observationCell(label,html){return '<td role="cell"><span class="cell-label" aria-hidden="true">'+esc(label)+'</span>'+html+'</td>';}
function observationTable(kind,headings,rows){return '<table id="'+kind+'-table" class="observation-table" role="table"><caption class="sr-only">'+(kind==='radio'?'Radio observations':'X-ray luminosity records')+'</caption><thead role="rowgroup"><tr role="row">'+headings.map(h=>'<th scope="col" role="columnheader">'+esc(h)+'</th>').join('')+'</tr></thead>'+rows.join('')+'</table>';}
function radioOverview(d,refs,radioLabel){
 const rows=d.observations.map(r=>{
 const cited=r.radio_reference_keys.split(';').map(k=>k.trim()).filter(Boolean).map(k=>refs.has(k)?refLink(refs.get(k)):esc(k)).join('; '),matching=radioLabel&&r.radio_evidence_label===radioLabel;
 const flux=esc(r.flux_quantity_kind==='Missing'?'Not selected/reported':(r.reported_flux_text||r.flux_quantity_kind).replace(/\+\/-/g,'±'))+(r.reported_flux_text&&r.flux_quantity_kind!=='Missing'?' '+radioUnit(r):'');
 return '<tbody role="rowgroup" class="radio-row'+(matching?' radio-match':'')+'" id="observation-'+esc(r.observation_id)+'" tabindex="-1" aria-label="'+esc(r.observation_id)+'"><tr role="row">'+
 observationCell('Observation ID','<strong>'+esc(r.observation_id)+'</strong>'+(matching?'<span class="record-context radio-match-label">Matches selected radio evidence</span>':''))+
 observationCell('Band / method & state',(r.radio_band_ghz_as_reported?esc(r.radio_band_ghz_as_reported)+' GHz':'Not reported')+'<span class="record-context">'+esc(r.flux_method_and_state||'Method / epoch / state not specified in this observation summary; see full metadata.')+'</span>')+
 observationCell('Observable',esc(r.flux_quantity_kind==='Missing'?'Not selected/reported':r.flux_quantity_kind))+
 observationCell('Reported flux or limit','<strong>'+flux+'</strong><span class="record-context">Uncertainty: '+esc(r.flux_uncertainty_convention||'Not reported; see full metadata.')+'</span>')+
 observationCell('Radio evidence',esc(r.radio_evidence_label||'Not reported'))+observationCell('Reference',cited||'Not reported')+
 '</tr><tr role="row" class="observation-metadata"><td role="cell" colspan="6"><details class="record"><summary>Full observation '+esc(r.observation_id)+' — uncertainty & metadata</summary>'+fields(r,Object.keys(r).filter(k=>!['source_id','source_name','observational_class_code'].includes(k)))+evidenceLinks(r.measurement_ids)+'</details></td></tr></tbody>';
 });
 return observationTable('radio',['Observation ID','Band / method & state','Observable','Reported flux or limit','Radio evidence','Reference'],rows);
}
function xrayOverview(x,refs){
 const e=x.emission||{xray:[]},rows=e.xray.filter(r=>r.available);
 let html='<p class="help">Recorded estimates, limits and distance scalings; no new flux-to-luminosity calculation or rescaling to the catalog distance. Bands, components, states and assumptions differ.</p>';
 if(!rows.length)html+='<p>No luminosity estimate recorded in this release.'+(e.xray_flux_record_count?' '+e.xray_flux_record_count+' flux records remain in the full measurement evidence.':'')+'</p>';
 if(rows.length)html+=observationTable('xray',['Record','Band / epoch / state','Luminosity / limit','Component / model / distance','Evidence','Reference'],rows.map(r=>{
 const cited=r.reference_key.split(';').map(k=>k.trim()).filter(Boolean).map(k=>refs.has(k)?refLink(refs.get(k)):esc(k)).join('; ');
 const val=luminosityValue(r)+(r.log10_luminosity||(!r.display_value_numeric&&!r.display_lower_bound&&!r.display_upper_bound&&/erg/i.test(r.value_text))?'':' erg s⁻¹');
 return '<tbody class="xray-record" role="rowgroup"><tr role="row">'+observationCell('Record',esc(r.measurement_id))+
 observationCell('Band / epoch / state',esc(r.band_label)+'<span class="record-context">'+esc(r.epoch_or_state||'Epoch/state unspecified')+'</span>')+
 observationCell('Luminosity / limit','<strong>'+val+'</strong>'+(r.upper_limit&&r.public_limit_label==='No limit flag'?'<span class="record-context">Upper limit identified by the recorded parameter name; a bound, not a detection.</span>':''))+
 observationCell('Component / model / distance',esc(xrayContext(r))+'<span class="record-context">'+esc(r.component||'Component unspecified')+'</span>')+
 observationCell('Evidence',esc(r.evidence_label||'See recorded method'))+observationCell('Reference',cited||'Not reported')+
 '</tr><tr role="row" class="observation-metadata"><td role="cell" colspan="6"><details class="record"><summary>'+esc(r.measurement_id)+' · method, distance & uncertainty</summary>'+fields(r,['parameter','component','value_numeric','value_text','unit','error_minus','error_plus','lower_bound','upper_bound','limit_type','uncertainty_convention','method','assumption','epoch_or_state','reference_key','location','evidence_label','is_derived','derived_from','adoption_reason'])+evidenceLinks(r.measurement_id)+'</details></td></tr></tbody>';
 }));
 for(const r of e.xray.filter(r=>!r.available))html+='<details class="record"><summary>'+esc(r.measurement_id)+' · recorded luminosity status</summary>'+fields(r,['value_text','method','assumption','reference_key','location'])+'</details>';
 return html;
}
function sourceDetail(d,x,radioLabel=''){
 const s=d.summary;
 let html=`<h2>${symbol(x)}${esc(s.source_name)}</h2><h3 id="source-overview" tabindex="-1">Source overview</h3><div class="tags">${tags(s)}</div><p><strong>WD host: ${esc(labels[s.white_dwarf_host_confidence])}.</strong> ${esc(pretty(s.magnetic_subclass_or_status||s.proposed_or_disputed_interpretation||s.published_subclass_labels))}</p>`;
 if(s.gaia_dr3_id)html+=`<p class="source-identity">Gaia DR3 <a href="https://vizier.cds.unistra.fr/viz-bin/VizieR-5?-source=I%2F355%2Fgaiadr3&amp;Source=${encodeURIComponent(s.gaia_dr3_id)}" target="_blank" rel="noopener">${esc(s.gaia_dr3_id)}</a></p>`;
 html+=`<details class="record"><summary>Aliases & counterpart identity</summary>${fields(s,['aliases','gaia_dr3_id','system_class_evidence','white_dwarf_host_evidence','proposed_or_disputed_interpretation'])}${s.gaia_dr3_id?'':'<p class="muted">No selected Gaia counterpart.</p>'}</details>`;
 const overview=propertyOverview(s);html+='<h3 id="selected-properties" tabindex="-1">Selected properties & periods</h3>'+(overview||'<p class="muted">No selected physical properties or periods. Published alternatives remain in the evidence below.</p>');
 if(s.source_name==='AR Sco')html+='<p class="help"><strong>Field interpretation:</strong> 42.7±0.2 G describes the modeled synchrotron region (MCSE, not physical confidence). The separately inferred WD polar field is approximately 15 MG. The abstract’s 43 MG remains in the evidence as a likely unit typo—an inference.</p>';
 html+='<h3 id="cmd-placement" tabindex="-1">CMD placement</h3><p class="help">'+esc(cmdNote(d,x.cmd))+'</p>';
 html+='<h3 id="radio-observations" tabindex="-1">Radio observations</h3><p class="muted">'+d.observations.length+' observation '+(d.observations.length===1?'row':'rows')+'. Expand an observation for methods and full metadata.</p><button type="button" data-collapse-observations>Collapse observation details</button>';
 if(radioLabel)html+='<p id="radio-match-note" class="help">Matching '+esc(radioLabel)+' records are highlighted. All observations remain shown. <button type="button" data-show-all-radio>Show all observations</button></p>';
 const refs=new Map(d.references.map(r=>[r.key,r]));
 html+=radioOverview(d,refs,radioLabel);
 html+='<h3 id="xray-luminosity" tabindex="-1">X-ray luminosity</h3>'+xrayOverview(x,refs);
 html+='<h3 id="source-evidence" tabindex="-1">Evidence & references</h3><details class="record"><summary><strong>Selected-property methods, assumptions & evidence links</strong></summary>'+fields(s,Object.keys(s).filter(k=>k!=='aliases'&&k!=='source_id'))+'</details>';
 html+='<details class="record"><summary><strong>Plot inputs, coordinate provenance & distance qualifications</strong></summary><h4>Sky coordinates</h4>'+fields(d.sky,Object.keys(d.sky).filter(k=>!['token','display_group'].includes(k)))+'<h4>Main Gaia CMD</h4>'+fields(x.cmd,Object.keys(x.cmd).filter(k=>!['token','display_group'].includes(k)))+'</details>';
 html+='<details class="record"><summary><strong>All measurement evidence & alternatives</strong> · '+d.measurements.length+' records</summary><p class="muted">Original values, components, methods, assumptions and uncertainty conventions retained.</p>';
 const groups={};for(let r of d.measurements)(groups[r.public_property_group]??=[]).push(r);
 for(let [group,records] of Object.entries(groups).sort(([a],[b])=>a.localeCompare(b))){html+=`<details class="record"><summary><strong>${esc(group)}</strong> · ${records.length} records</summary>`;for(let r of records)html+=`<details class="record" id="${esc(r.measurement_id)}"><summary>${esc(r.measurement_id)} · ${esc(pretty(r.parameter))} · ${value(r)}</summary>${fields(r,['component','value_numeric','value_text','unit','error_minus','error_plus','lower_bound','upper_bound','public_limit_label','uncertainty_convention','public_uncertainty_label','method','assumption','epoch_or_state','reference_key','location','evidence_label','is_derived','derived_from','adoption_reason','research_date'])}</details>`;html+='</details>';}
 html+='</details><details class="record"><summary><strong>Unresolved issues & review history</strong> · '+d.issues.length+' records</summary>';for(let r of d.issues)html+=`<details class="issue"><summary>${esc(r.issue_id)} · ${esc(r.parameter)} · ${esc(r.issue_state)}</summary>${fields(r,['competing_evidence','references','why_it_matters','needed_action','public_status','research_date'])}</details>`;
 html+='</details><details class="record"><summary><strong>Complete references</strong> · '+d.references.length+'</summary><ul class="refs">'+d.references.map(r=>`<li>${refLink(r)} · ${esc(r.full_citation||r.short_citation)}${r.public_reference_link_status?'<span class="subtext">'+esc(r.public_reference_link_status)+'</span>':''}</li>`).join('')+'</ul></details><p><a download href="assets/sources/'+x.token+'.json">Download catalog 1.0.2 source evidence JSON</a></p>';
 return html;
}
function jumpToEvidence(target){
 if(!target)return;
 for(let p=target;p&&p!==$('#detail');p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
 $('#detail').style.setProperty('--detail-header-height',$('.detail-toolbar').offsetHeight+'px');
 target.scrollIntoView({block:'start'});(target.tagName==='DETAILS'?target.querySelector('summary'):target).focus({preventScroll:true});
}
async function openSource(sid,hash=true,section='',radioLabel=''){
 const x=systems.find(x=>x.summary.source_id===sid);let seq=++detailRequest;
 if(!$('#detail').open)lastFocus=document.activeElement;
 if(hash)history.pushState(null,'','#source='+encodeURIComponent(sid));
 $('#detail-name').textContent=x?x.summary.source_name:'Source not found';$('.detail-nav').hidden=true;$('#detail-status').hidden=true;
 $('#detail-body').innerHTML='<p role="status">Loading source evidence…</p>';if(!$('#detail').open)$('#detail').showModal();$('#close').focus();
 if(!x){$('#detail-body').innerHTML='<p role="alert">No source in catalog 1.0.2 matches '+esc(sid)+'. Close this view and search the catalog.</p>';return;}
 try{const response=await fetch('assets/sources/'+x.token+'.json?v=1.0.2');if(!response.ok)throw Error('Source evidence unavailable');const d=await response.json();if(seq!==detailRequest)return;
 $('#detail-body').innerHTML=sourceDetail(d,x,radioLabel);$('.detail-nav').hidden=false;$('#detail').scrollTop=0;$('#close').focus();if(section)jumpToEvidence((radioLabel&&$('#detail-body .radio-match'))||$('#'+section));
 }catch(e){if(seq!==detailRequest)return;$('.detail-nav').hidden=true;$('#detail-body').innerHTML='<p role="alert">Source evidence could not be loaded. Try reopening this source or <a download href="data/v1.0.2/rawdog_measurements.csv">download the versioned evidence CSV</a>.</p>';}
}
function closeSource(updateHash=true){++detailRequest;$('#detail').close();if(updateHash&&location.hash.startsWith('#source='))history.replaceState(null,'',location.pathname+location.search+'#catalog');if(lastFocus?.isConnected&&lastFocus!==document.body)lastFocus.focus();else $('#search').focus();}
$('#close').addEventListener('click',()=>closeSource());$('#detail').addEventListener('cancel',e=>{e.preventDefault();closeSource();});
$('.detail-nav').addEventListener('click',ev=>{const b=ev.target.closest('[data-jump]');if(b)jumpToEvidence($('#'+b.dataset.jump));});
$('#detail-body').addEventListener('click',ev=>{
 const evidence=ev.target.closest('[data-measurement]');if(evidence){const target=document.getElementById(evidence.dataset.measurement);if(target&&$('#detail-body').contains(target))jumpToEvidence(target);else{$('#detail-status').textContent='Linked measurement unavailable in this source bundle; use the versioned evidence download.';$('#detail-status').hidden=false;}}
 const collapse=ev.target.closest('[data-collapse-observations]');if(collapse){for(const detail of document.querySelectorAll('.observation-table details[open]'))detail.open=false;collapse.focus();}
 if(ev.target.closest('[data-show-all-radio]')){for(const row of document.querySelectorAll('.radio-match')){row.classList.remove('radio-match');row.querySelector('.radio-match-label')?.remove();}$('#radio-match-note').hidden=true;jumpToEvidence($('#radio-observations'));}
});
function route(){if(location.hash.startsWith('#source=')){let sid=location.hash.slice(8);try{sid=decodeURIComponent(sid);}catch(e){}openSource(sid,false);}else if($('#detail').open)closeSource(false);}
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
Promise.all(['assets/catalog.json?v=1.0.2','data/v1.0.2-web-r10/emission_evidence.json','data/v1.0.2-web-r13/cmd_plot_input.json'].map(url=>fetch(url).then(r=>{if(!r.ok)throw Error('Catalog/evidence unavailable');return r.json();}))).then(([data,evidence,currentCmd])=>{const cmdById=new Map(currentCmd.systems.map(c=>[c.source_id,c]));const byid=new Map(evidence.systems.map(e=>[e.source_id,e]));systems=data.systems.map(x=>({...x,cmd:cmdById.get(x.summary.source_id),emission:byid.get(x.summary.source_id)}));render();for(let obj of document.querySelectorAll('.plot'))setupPlot(obj);route();}).catch(e=>{$('#count').textContent=e.message+' — use the versioned CSV downloads.';});
