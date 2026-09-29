'use strict';
const $=s=>document.querySelector(s), esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const labels={cataclysmic_variable:'CV',magnetic_cv:'Magnetic-CV tag',white_dwarf_pulsar:'WD pulsar',long_period_transient:'Long-period transient',long_period_radio_transient:'Long-period radio transient',established:'Established',inferred_or_proposed:'Inferred or proposed',unresolved:'Unresolved'};
const styles={magnetic_cv:['#1864ab','●','○'],cataclysmic_variable:['#087f5b','■','□'],white_dwarf_pulsar:['#7048a5','◆','◇'],long_period_transient:['#b95000','▲','△']};
const pretty=k=>({non_magnetic_cv:'Non-magnetic CV',AM:'Polar (AM Her)',IP:'Intermediate polar (IP)'}[k]||k).replaceAll('_',' ').replace(/\bgaia\b/g,'Gaia').replace(/\bwd\b/g,'WD');
let systems=[],shown=[],sortKey='source_name',sortAsc=true,lastFocus=null,detailRequest=0;
const files=['rawdog_source_summary.csv','rawdog_radio_observations.csv','rawdog_measurements.csv','rawdog_references.csv','rawdog_physical_properties.csv','rawdog_gaia_counterparts.csv','rawdog_source_references.csv','rawdog_review_issues.csv','rawdog_excluded_counterparts.csv','rawdog_reference_link_checks.csv'];
$('#download-list').innerHTML=files.map(f=>`<li><a download href="data/v1.0.0/${f}">${esc(pretty(f.replace('rawdog_','').replace('.csv','')))} CSV</a></li>`).join('');
function tags(s){return [...new Set(s.classification_labels.split(';').map(x=>x.trim()).filter(x=>x!=='long_period_transient'))].map(t=>`<span class="tag">${esc(labels[t]||pretty(t))}</span>`).join('');}
function symbol(x){let [c,a,b]=styles[x.sky.display_group];return `<span class="symbol" style="color:${c}" aria-label="${x.sky.qualified_status==='true'?'Qualified':'Established'} ${esc(labels[x.sky.display_group])}">${x.sky.qualified_status==='true'?b:a}</span> `;}
function render(){
 const q=$('#search').value.toLowerCase().trim(),cls=$('#classification').value,host=$('#host').value,radio=$('#radio').value;
 shown=systems.filter(x=>{let s=x.summary;return (!q||[s.source_name,s.aliases,s.gaia_dr3_id,s.source_reference_keys].join(' ').toLowerCase().includes(q))&&(!cls||s.classification_labels.split(';').map(t=>t.trim()).includes(cls))&&(!host||s.white_dwarf_host_confidence===host)&&(!radio||x.radio_labels.includes(radio));});
 const numeric=['preferred_orbital_period_h','preferred_distance_pc','radio_observation_count'].includes(sortKey);
 shown.sort((a,b)=>{let av=a.summary[sortKey],bv=b.summary[sortKey];if(av===''||bv==='')return av===''?(bv===''?0:1):-1;let c=numeric?Number(av)-Number(bv):av.localeCompare(bv,undefined,{numeric:true});return sortAsc?c:-c;});
 $('#systems tbody').innerHTML=shown.map(x=>{let s=x.summary;return `<tr><td><button class="system-link" data-source="${esc(s.source_id)}">${symbol(x)}${esc(s.source_name)}</button></td><td><div class="tags">${tags(s)}</div><span class="subtext">${esc(pretty(s.magnetic_subclass_or_status||s.proposed_or_disputed_interpretation||s.published_subclass_labels))}</span></td><td>${esc(labels[s.white_dwarf_host_confidence])}</td><td>${esc(displayNumber(s.preferred_orbital_period_h,6))}</td><td>${esc(displayNumber(s.preferred_distance_pc))}</td><td>${esc(s.radio_detection_status)}</td><td>${esc(s.radio_observation_count)}</td></tr>`;}).join('');
 $('#count').textContent=`${shown.length} / 58 systems · RAWDOG 1.0.0`;$('#empty').hidden=shown.length!==0;$('#export').disabled=false;updatePlots();
}
function updatePlots(){
 const on=$('#plot-filter').checked,allowed=new Set(shown.map(x=>x.token));
 for(let id of ['sky','cmd','lpt']){
  const obj=$('#'+id),doc=obj.contentDocument;
  if(doc)for(let p of doc.querySelectorAll('[data-token]'))p.style.display=(!on||allowed.has(p.getAttribute('data-token')))?'':'none';
  const eligible=systems.filter(x=>id==='sky'||(id==='lpt'?['GLEAM-X J0704-37','ILT J1101+5521'].includes(x.summary.source_name):x.cmd.included==='true')),matches=eligible.filter(x=>allowed.has(x.token)).length;
  $('#'+id+'-count').textContent=`${on?matches:eligible.length} plotted / ${eligible.length} eligible${id==='lpt'?' systems · two method placements per system':''}${on?' · catalog filters applied':''}${id==='cmd'?' · 2 excluded by scientific inputs':''}`;
 }
}
function setupPlot(obj){const doc=obj.contentDocument;if(!doc)return;for(let g of doc.querySelectorAll('[data-source]')){g.style.cursor='pointer';g.addEventListener('click',ev=>{ev.preventDefault();openSource(g.getAttribute('data-source'));});g.addEventListener('keydown',ev=>{if(ev.key==='Enter'){ev.preventDefault();openSource(g.getAttribute('data-source'));}});}updatePlots();}
for(let obj of document.querySelectorAll('.plot'))obj.addEventListener('load',()=>setupPlot(obj));
$('#filters').addEventListener('input',render);$('#filters').addEventListener('submit',e=>e.preventDefault());$('#filters').addEventListener('reset',()=>setTimeout(render,0));$('#plot-filter').addEventListener('change',updatePlots);
$('#systems').addEventListener('click',ev=>{const s=ev.target.closest('[data-source]');if(s)openSource(s.dataset.source);const b=ev.target.closest('[data-sort]');if(b){sortAsc=sortKey===b.dataset.sort?!sortAsc:true;sortKey=b.dataset.sort;for(let th of $('#systems').querySelectorAll('th'))th.removeAttribute('aria-sort');b.closest('th').setAttribute('aria-sort',sortAsc?'ascending':'descending');render();}});
function exportCSV(){const columns=Object.keys(systems[0].summary),quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';let text=[columns,...shown.map(x=>columns.map(k=>x.summary[k]))].map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=url;a.download='RAWDOG-v1.0.0-filtered-systems.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('#export').addEventListener('click',exportCSV);
function fields(r,keys){return `<dl class="raw-fields">${keys.filter(k=>r[k]!==''&&r[k]!=null).map(k=>`<dt>${esc(pretty(k))}</dt><dd>${esc(k==='component'||k.endsWith('_component')||k==='gaia_match_status'?pretty(r[k]):r[k])}</dd>`).join('')}</dl>`;}
function value(r){let x=r.value_numeric||r.value_text||'No numeric value selected/reported';if(r.error_minus||r.error_plus)x+=` (−${r.error_minus||'?'} / +${r.error_plus||'?'})`;if(r.lower_bound||r.upper_bound)x+=` [${r.lower_bound||'…'}, ${r.upper_bound||'…'}]`;return x+(r.unit?' '+r.unit:'');}
function refLink(r){let url=r.public_reference_url;return /^https?:\/\//.test(url)?`<a href="${esc(url)}" target="_blank" rel="noopener">${esc(r.key)}</a>`:esc(r.key);}
function displayNumber(v,digits=4){if(v===''||v==null)return '—';return Number.isFinite(Number(v))?String(Number(Number(v).toPrecision(digits))):String(v);}
const properties=[
 ['distance_pc','Distance','pc','distance'],['orbital_period_h','Orbital period','h','orbital_period'],['wd_spin_period_s','WD spin period','s','wd_spin'],['ip_beat_period_s','Spin–orbit beat period','s','ip_beat'],['radio_recurrence_period_s','Radio recurrence period','s','radio_recurrence'],
 ['wd_photospheric_teff_k','WD photospheric temperature','K','wd_photospheric_teff'],['wd_mean_photospheric_field_mg','WD mean photospheric field','MG','wd_mean_photospheric_field'],['wd_polar_field_mg','WD polar field','MG','wd_polar_field'],['wd_local_emission_region_field_mg','WD local emission-region field','MG','wd_local_emission_region_field'],['wd_mass_msun','WD mass','M☉','wd_mass'],['companion_spectral_type','Companion spectral type','','companion_spectral_type'],['companion_mass_msun','Companion mass','M☉','companion_mass'],['companion_teff_k','Companion temperature','K','companion_teff'],['radio_emission_region_field_gauss','Radio emission-region field','G','radio_emission_region_field']];
function propertyOverview(s){return properties.filter(([k])=>s['preferred_'+k]!==''&&s['preferred_'+k]!=null).map(([k,label,unit,prefix])=>{
 const get=suffix=>s[prefix+suffix+(unit?'_'+k.split('_').at(-1):'')],val=s['preferred_'+k];let uncertainty='';
 const lo=get('_lower_bound'),hi=get('_upper_bound'),em=get('_error_minus'),ep=get('_error_plus');
 if(lo||hi)uncertainty=` [${displayNumber(lo)}, ${displayNumber(hi)}]`;
 else if(em||ep)uncertainty=em===ep?` ± ${displayNumber(em,2)}`:` −${displayNumber(em,2)} / +${displayNumber(ep,2)}`;
 const convention=s[prefix+'_uncertainty_convention']||((em||ep||lo||hi)?'Interval/confidence convention unspecified; see evidence.':''),component=s[prefix+'_component']||'',method=s[prefix+'_method']||'';
 let central=displayNumber(val,k.includes('period')?6:4);const errors=[em,ep].filter(v=>v!==''&&v!=null&&Number(v)>0).map(Number);if(errors.length&&Number.isFinite(Number(val))){let decimals=Math.max(0,Math.min(12,1-Math.floor(Math.log10(Math.min(...errors)))));central=String(Number(Number(val).toFixed(decimals)));}
 return `<article class="property"><h4>${esc(label)}</h4><p><strong>${esc(central+uncertainty+(unit?' '+unit:''))}</strong></p>${component?'<p>'+esc(pretty(component))+'</p>':''}${/fit|model|infer|synchrotron|mcmc/i.test(method)?'<p>Model dependent / inferred; see methods.</p>':''}${s[prefix+'_assumption']?'<p class="muted">Model/epoch assumptions apply; see methods.</p>':''}${convention?'<p class="muted">'+esc(convention)+'</p>':''}</article>`;
 }).join('');}
function cmdNote(d){let c=d.cmd;if(c.included!=='true')return `Main CMD: excluded. ${c.exclusion_reason}`;
 let note=`Main CMD: geometric distance ${displayNumber(c.distance_pc)} pc, observed BP−RP ${displayNumber(c.BP_RP_observed_mag,3)} mag, M_G ${displayNumber(c.M_G_observed_mag,3)} mag; unresolved light, not extinction corrected.`;
 if(d.summary.source_name==='GLEAM-X J0704-37')note+=' Negative low-significance Gaia parallax; the broad, strongly prior-sensitive posterior is not a precise empirical distance constraint. Published model-dependent SED placement is shown separately.';
 else note+=' '+c.qualifications;
 if(d.summary.source_name==='ILT J1101+5521')note+=' Published model-dependent SED placement is shown separately.';
 return note;}
async function openSource(sid,hash=true){
 const x=systems.find(x=>x.summary.source_id===sid);if(!x)return;let seq=++detailRequest;
 lastFocus=document.activeElement;if(hash)history.pushState(null,'','#source='+encodeURIComponent(sid));$('#detail-body').innerHTML='<p role="status">Loading source evidence…</p>';if(!$('#detail').open)$('#detail').showModal();
 try{const response=await fetch('assets/sources/'+x.token+'.json');if(!response.ok)throw Error('Source evidence unavailable');const d=await response.json();if(seq!==detailRequest)return;let s=d.summary;
 let html=`<h2>${symbol(x)}${esc(s.source_name)}</h2><div class="tags">${tags(s)}</div><p><strong>WD host: ${esc(labels[s.white_dwarf_host_confidence])}.</strong> ${esc(pretty(s.magnetic_subclass_or_status||s.proposed_or_disputed_interpretation||s.published_subclass_labels))}</p>`;
 if(s.aliases||s.gaia_dr3_id)html+=`<details class="record"><summary>Aliases & counterpart identity</summary>${fields(s,['aliases','gaia_dr3_id','system_class_evidence','white_dwarf_host_evidence','proposed_or_disputed_interpretation'])}</details>`;
 if(s.source_name==='AR Sco')html+='<p class="help"><strong>Field interpretation:</strong> 42.7±0.2 G describes the modeled synchrotron region (MCSE, not physical confidence). The separately inferred WD polar field is approximately 15 MG. The abstract’s 43 MG remains in the evidence as a likely unit typo—an inference.</p>';
 const cards=propertyOverview(s);if(cards)html+='<h3>Selected properties & distinct clocks</h3><div class="property-grid">'+cards+'</div>';
 html+='<p class="help"><strong>'+esc(cmdNote(d))+'</strong></p>';
 html+='<h3>Radio observations</h3><p class="muted">'+d.observations.length+' catalog rows. Expand an observation for methods, uncertainty conventions and full metadata.</p>';
 const refs=new Map(d.references.map(r=>[r.key,r]));
 for(let r of d.observations){let cited=r.radio_reference_keys.split(';').map(k=>k.trim()).filter(Boolean).map(k=>refs.has(k)?refLink(refs.get(k)):esc(k)).join('; ');
 html+=`<div class="radio-row"><p><strong>${esc(r.radio_band_ghz_as_reported)} GHz · ${esc(r.flux_quantity_kind==='Missing'?'Flux not selected/reported':(r.reported_flux_text||r.flux_quantity_kind))}${r.reported_flux_text&&r.flux_quantity_kind!=='Missing'?' µJy':''}</strong><br>${esc(r.flux_quantity_kind)} · ${esc(r.radio_evidence_label)} · ${cited}</p><details class="record"><summary>Full observation ${esc(r.observation_id)} — uncertainty & metadata</summary>${fields(r,Object.keys(r).filter(k=>!['source_id','source_name','observational_class_code'].includes(k)))}</details></div>`;}
 html+='<details class="record"><summary><strong>Selected-property methods, assumptions & evidence links</strong></summary>'+fields(s,Object.keys(s).filter(k=>k!=='aliases'&&k!=='source_id'))+'</details>';
 html+='<details class="record"><summary><strong>Plot inputs, coordinate provenance & distance qualifications</strong></summary><h4>Sky coordinates</h4>'+fields(d.sky,Object.keys(d.sky).filter(k=>!['token','display_group'].includes(k)))+'<h4>Main Gaia CMD</h4>'+fields(d.cmd,Object.keys(d.cmd).filter(k=>!['token','display_group'].includes(k)))+'</details>';
 html+='<details class="record"><summary><strong>All measurement evidence & alternatives</strong> · '+d.measurements.length+' records</summary><p class="muted">Original values, components, methods, assumptions and uncertainty conventions retained.</p>';
 const groups={};for(let r of d.measurements)(groups[r.public_property_group]??=[]).push(r);
 for(let [group,records] of Object.entries(groups)){html+=`<details class="record"><summary><strong>${esc(group)}</strong> · ${records.length} records</summary>`;for(let r of records)html+=`<details class="record" id="${esc(r.measurement_id)}"><summary>${esc(r.measurement_id)} · ${esc(pretty(r.parameter))} · ${esc(value(r))}</summary>${fields(r,['component','value_numeric','value_text','unit','error_minus','error_plus','lower_bound','upper_bound','public_limit_label','uncertainty_convention','public_uncertainty_label','method','assumption','epoch_or_state','reference_key','location','evidence_label','is_derived','derived_from','adoption_reason','research_date'])}</details>`;html+='</details>';}
 html+='</details><details class="record"><summary><strong>Unresolved issues & review history</strong> · '+d.issues.length+' records</summary>';for(let r of d.issues)html+=`<details class="issue"><summary>${esc(r.issue_id)} · ${esc(r.parameter)} · ${esc(r.issue_state)}</summary>${fields(r,['competing_evidence','references','why_it_matters','needed_action','public_status','research_date'])}</details>`;
 html+='</details><details class="record"><summary><strong>Complete references</strong> · '+d.references.length+'</summary><ul class="refs">'+d.references.map(r=>`<li>${refLink(r)} · ${esc(r.full_citation||r.short_citation)}${r.public_reference_link_status?'<span class="subtext">'+esc(r.public_reference_link_status)+'</span>':''}</li>`).join('')+'</ul></details><p><a download href="assets/sources/'+x.token+'.json">Download this source’s complete 1.0.0 evidence JSON</a></p>';
 $('#detail-body').innerHTML=html;$('#detail').scrollTop=0;$('#close').focus();
 }catch(e){$('#detail-body').innerHTML='<p role="alert">'+esc(e.message)+'. Download the versioned CSVs for the evidence tables.</p>';}
}
function closeSource(){++detailRequest;$('#detail').close();if(location.hash.startsWith('#source='))history.replaceState(null,'',location.pathname+location.search+'#catalog');if(lastFocus?.isConnected)lastFocus.focus();}
$('#close').addEventListener('click',closeSource);$('#detail').addEventListener('cancel',e=>{e.preventDefault();closeSource();});
function route(){if(location.hash.startsWith('#source=')){try{openSource(decodeURIComponent(location.hash.slice(8)),false);}catch(e){}}else if($('#detail').open){++detailRequest;$('#detail').close();}}
window.addEventListener('hashchange',route);window.addEventListener('popstate',route);
fetch('assets/catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(data=>{systems=data.systems;render();for(let obj of document.querySelectorAll('.plot'))setupPlot(obj);route();}).catch(e=>{$('#count').textContent=e.message+' — use the versioned CSV downloads.';});
