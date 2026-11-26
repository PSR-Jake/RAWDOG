#!/usr/bin/env python3
"""One runnable scientific check; fails loudly on altered evidence or invalid plot inputs."""
import csv,json,math,hashlib,re,xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter
from astropy.coordinates import SkyCoord
import astropy.units as u
from build import absolute,wrap,ADOPTIONS,token
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'data/v1.0.4'
def read(n):return list(csv.DictReader((DATA/n).open()))
def fingerprint(r):return hashlib.sha256(json.dumps(r,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
def main():
    s=read('rawdog_source_summary.csv');m=read('rawdog_measurements.csv');o=read('rawdog_radio_observations.csv');sky=read('sky_plot_input.csv');cmd=read('cmd_plot_input.csv');refs=read('rawdog_references.csv')
    ids={r['source_id'] for r in s};byid={r['measurement_id']:r for r in m};ss={r['source_name']:r for r in s}
    assert len(s)==len(ids)==59 and len(o)==100 and len(m)==len(byid)==7219 and len(refs)==672
    assert all(r['source_id'] in ids for r in o)
    assert all(r['source_id'] in ids for r in m if r['source_membership']=='Member')
    rejected=[r for r in m if r['source_membership'].startswith('Excluded')]
    assert len(rejected)==74 and all(r['source_id'] not in ids for r in rejected)
    for r in s:
        gid=r['gaia_dr3_id'];assert isinstance(gid,str) and (not gid or re.fullmatch(r'\d{1,19}',gid))
        assert not gid or r['source_id']=='gaia-dr3:'+gid
        assert int(r['radio_observation_count'])==sum(x['source_id']==r['source_id'] for x in o)
    askap=ss['ASKAP J174508.9-505149'];ar=ss['AR Sco']
    assert 'CHIME/ILT J1634+44' not in ss and 'name:chime-ilt-j1634-plus-44' not in ids
    assert all(x in askap['classification_labels'] for x in ['long_period_radio_transient','magnetic_cv']) and askap['white_dwarf_host_confidence']=='established'
    assert ar['preferred_radio_emission_region_field_gauss']=='42.7' and ar['radio_emission_region_field_error_plus_gauss']=='0.2'
    assert 'MCSE' in ar['radio_emission_region_field_uncertainty_convention'] and ar['preferred_wd_polar_field_mg']=='15' and not ar['preferred_wd_mean_photospheric_field_mg']
    assert 'inference' in ar['radio_emission_region_field_note'] and byid['M07013']['unit']=='MG' and byid['M07013']['value_numeric']=='43'
    new=ss['ASKAP J144834-685644'];sid=new['source_id']
    assert new['white_dwarf_host_confidence']=='established' and 'cataclysmic_variable' in new['classification_labels']
    assert 'candidate polar' in new['magnetic_subclass_or_status'] and not new['gaia_dr3_id']
    assert not any(new[k] for k in ['preferred_distance_pc','preferred_wd_spin_period_s','preferred_wd_mass_msun','preferred_companion_mass_msun','preferred_wd_photospheric_teff_k','preferred_wd_polar_field_mg'])
    assert math.isclose(float(new['preferred_orbital_period_h']),98.6/60)
    assert math.isclose(float(new['orbital_period_error_minus_h']),4.1/60) and math.isclose(float(new['orbital_period_error_plus_h']),4.2/60)
    assert '68%' in new['orbital_period_uncertainty_convention'] and new['orbital_period_measurement_ids']=='M07189'
    assert new['preferred_radio_recurrence_period_s']=='5631.078' and new['radio_recurrence_error_plus_s']=='0.048'
    own=[r for r in m if r['source_id']==sid];assert len(own)==109
    obs,=[r for r in o if r['source_id']==sid]
    assert obs['flux_density_uJy']=='760' and obs['error_plus_uJy']=='40' and obs['measurement_ids']=='M07199'
    assert obs['radio_evidence_label']=='Secure reported detection' and 'integrated' in obs['flux_method_and_state']
    assert len([r for r in own if r['parameter']=='radio_burst_stokes_i_flux_density'])==19
    assert {r['reference_key'] for r in own}<={r['key'] for r in refs}
    source_sky,=[r for r in sky if r['source_id']==sid]
    assert source_sky['coordinate_measurement_ids']=='M07187; M07188' and source_sky['coordinate_reference_keys']=='Anumarlapudi+25'
    assert math.isclose(float(source_sky['ra_deg']),222.142875) and math.isclose(float(source_sky['dec_deg']),-68.9455833333)
    assert 'J2000' in source_sky['coordinate_frame'] and source_sky['fallback_status']=='literature radio position'
    issue_rows=[r for r in read('rawdog_review_issues.csv') if r['source_id']==sid]
    assert len(issue_rows)==5 and all(r['issue_state']=='Open' for r in issue_rows)
    target=askap['source_id'];withdrawn='name:chime-ilt-j1634-plus-44'
    for old_path in sorted((ROOT/'data/v1.0.3').glob('*.csv')):
        old=list(csv.DictReader(old_path.open()))
        assert read(old_path.name)[:len(old)]==old,old_path.name
    gpm=ss['GPM J071507-114153'];gpm_sid=gpm['source_id']
    assert gpm['gaia_dr3_id']=='3045265579628659968' and gpm['white_dwarf_host_confidence']=='established'
    assert gpm['preferred_radio_recurrence_period_s']=='474.059218' and gpm['radio_recurrence_error_plus_s']=='0.000003'
    assert math.isclose(float(gpm['preferred_orbital_period_h']),1.3529*24)
    assert gpm['wd_mass_upper_bound_msun']=='0.68' and gpm['wd_mass_limit_type']=='upper'
    assert not any(gpm[k] for k in ['preferred_distance_pc','preferred_wd_spin_period_s','preferred_wd_mass_msun'])
    source_o=[r for r in o if r['source_id']==gpm_sid]
    assert len(source_o)==4 and len({r['radio_band_ghz_as_reported'] for r in source_o})==4
    for r in source_o:
        row=byid[r['measurement_ids']]
        assert row['parameter']=='radio_fitted_pulse_peak_flux_density' and row['unit']=='uJy'
        assert r['flux_density_uJy']==row['value_numeric'] and not r['error_plus_uJy']
    exclusion,=[r for r in cmd if r['source_id']==gpm_sid]
    assert exclusion['included']=='false' and 'parallax' in exclusion['exclusion_reason']
    assert not any(askap[k] for k in ['preferred_distance_pc','preferred_wd_photospheric_teff_k','preferred_wd_mass_msun','preferred_companion_mass_msun','preferred_wd_spin_period_s'])
    fit={r['parameter']: r for r in m if r['source_id']==target and r['reference_key']=='Knigge+26'}
    assert len(fit)==24 and all('v2' in r['location'] for r in fit.values())
    for parameter,expected in {
        'distance_sed_model':('322','61','70'),
        'wd_temperature_da_sed_model':('14500','1200','5000'),
        'companion_mass_sed_model':('0.052','0.008','0.008'),
        'reddening_sed_model':('0.07','0.02','0.15'),
        'reddening_sed_best_fit':('0.075','',''),
        'companion_mass_sed_moffat_psf':('0.049','',''),
    }.items():
        assert tuple(fit[parameter][k] for k in ('value_numeric','error_minus','error_plus'))==expected
    assert next(r for r in refs if r['key']=='Knigge+26')['public_reference_url']=='https://arxiv.org/abs/2606.28993v2'
    placement,=[r for r in cmd if r['source_id']==target]
    assert placement['included']=='false' and 'blended' in placement['exclusion_reason']
    assert len(read('rawdog_review_issues.csv'))==323
    assert sum(r['issue_state']=='Open' for r in read('rawdog_review_issues.csv'))==315
    assert not any(r['source_id']==withdrawn for r in m)
    assert Counter(r['radio_evidence_label'] for r in o)=={'Reported detection; significance not harmonized':63,'Reported flux; significance not harmonized':17,'Upper limit':8,'Marginal reported signal':5,'Secure reported detection':7}
    assert len(sky)==59 and {r['source_id'] for r in sky}==ids
    assert abs(wrap(0))<1e-12 and abs(wrap(360))<1e-12 and wrap(90)<0 and wrap(270)>0 and abs(abs(wrap(180))-math.pi)<1e-12
    residuals=[]
    for r in sky:
        ra,dec,l,b=map(float,[r['ra_deg'],r['dec_deg'],r['galactic_l_deg'],r['galactic_b_deg']])
        assert 0<=ra<360 and -90<=dec<=90 and 0<=l<360 and -90<=b<=90
        assert -math.pi<=float(r['equatorial_wrapped_rad'])<=math.pi
        gal=SkyCoord(ra=ra*u.deg,dec=dec*u.deg,frame='icrs').galactic
        assert abs(gal.l.deg-l)<1e-10 and abs(gal.b.deg-b)<1e-10
        assert r['coordinate_measurement_ids'] and r['coordinate_reference_keys']
        for k,pnames,calc in [('l',{'galactic_longitude','galactic_longitude_deg','published_galactic_l'},l),('b',{'galactic_latitude','galactic_latitude_deg','published_galactic_b'},b)]:
            old=[float(x['value_numeric']) for x in m if x['source_id']==r['source_id'] and x['parameter'] in pnames and x['value_numeric']]
            if old:
                delta=min(abs((v-calc+180)%360-180) if k=='l' else abs(v-calc) for v in old)
                assert delta<.005,(r['source_name'],k,delta);residuals.append(delta)
    ae=next(r for r in sky if r['source_name']=='AE Aqr');assert abs(float(ae['galactic_l_deg'])-45.28064971049)<1e-5 and abs(float(ae['galactic_b_deg'])+24.41887756883)<1e-5
    assert len(cmd)==59 and {r['source_id'] for r in cmd}==ids and sum(r['included']=='true' for r in cmd)==56
    assert abs(absolute(15,100)-10)<1e-12 and absolute(15,200)<absolute(15,100)
    for r in cmd:
        if r['included']=='false':assert r['exclusion_reason'] and not r['M_G_observed_mag'];continue
        g,bp,rp,d,M=map(float,[r['G_observed_mag'],r['BP_observed_mag'],r['RP_observed_mag'],r['distance_pc'],r['M_G_observed_mag']])
        assert all(math.isfinite(x) for x in [g,bp,rp,d,M]) and d>0
        assert math.isclose(M,absolute(g,d),abs_tol=1e-10) and math.isclose(float(r['BP_RP_observed_mag']),bp-rp,abs_tol=1e-10)
        assert r['photometry_measurement_ids'] and r['distance_measurement_ids']
        for mid in r['distance_measurement_ids'].split(';'):assert mid.strip() in byid and byid[mid.strip()]['source_id']==r['source_id']
        if r['source_name'] in ADOPTIONS:assert r['distance_measurement_ids']==ADOPTIONS[r['source_name']]
        if r['distance_lower_pc'] and r['distance_upper_pc']:
            lo,hi=map(float,[r['distance_lower_pc'],r['distance_upper_pc']]);ml,mh=map(float,[r['M_G_lower_from_distance_upper'],r['M_G_upper_from_distance_lower']])
            assert 0<lo<=d<=hi and ml<=M<=mh and math.isclose(ml,absolute(g,hi),abs_tol=1e-10) and math.isclose(mh,absolute(g,lo),abs_tol=1e-10)
        assert r['distance_uncertainty_convention']
        if r['source_name']=='GLEAM-X J0704-37':
            assert r['distance_measurement_ids']=='M04418' and d==380
        else:
            assert 'geometric' in (r['distance_method']+' '+r['distance_uncertainty_convention']).lower()
    assert {r['source_name'] for r in cmd if r['included']=='false'}=={'ASKAP J174508.9-505149','ASKAP J144834-685644','GPM J071507-114153'}
    for p in DATA.glob('*.csv'):assert not re.search(r'/Users/|/home/|/tmp/|tmp/records/|file://',p.read_text()),p.name
    index=json.loads((ROOT/'assets/catalog.json').read_text());assert index['version']=='1.0.4' and len(index['systems'])==59
    for item in index['systems']:
        detail=json.loads((ROOT/'assets/sources'/(item['token']+'.json')).read_text())
        assert detail['summary']==item['summary'] and detail['summary'] in s
        assert detail['sky']==item['sky'] and detail['cmd']==item['cmd']
        assert len(detail['observations'])==int(item['summary']['radio_observation_count'])
        assert detail['measurements']==[r for r in m if r['source_id']==item['summary']['source_id']]
    for name,count in [('rawdog_sky',118),('rawdog_cmd',56)]:
        root=ET.parse(ROOT/'figures/v1.0.4'/(name+'.svg')).getroot()
        gids=[e.get('id') for e in root.iter() if e.get('id')];assert len(gids)==len(set(gids))
        points=[e for e in root.iter() if e.get('id','').startswith('point-')];assert len(points)==count
        assert all(e.get('data-source') in ids and e.get('data-token') for e in points)
        if name=='rawdog_cmd':
            segments=[e for e in root.iter() if e.get('id','').startswith(('bound-','color-'))]
            assert segments and all(e.get('data-token') for e in segments)
    # Web r26 uses host confidence alone. Historical figure files retain their original fill convention.
    by_source = {row['source_id']: row for row in s}
    sky_sources = Counter({sid: 2 for sid in ids})
    cmd_sources = Counter({row['source_id']: 1 for row in cmd if row['included'] == 'true'})
    for name, expected in [('rawdog_sky', sky_sources), ('rawdog_cmd', cmd_sources)]:
        svg = ET.parse(ROOT/'figures/v1.0.4-web-r26'/(name+'.svg')).getroot()
        points = [e for e in svg.iter() if e.get('id', '').startswith('point-')]
        assert Counter(point.get('data-source') for point in points) == expected
        assert 'WD host established' in ''.join(svg.itertext())
        assert 'WD host inferred or unresolved' in ''.join(svg.itertext())
        for point in points:
            sid = point.get('data-source')
            styles = [node.get('style', '') for node in point.iter()]
            is_open = any('fill: none' in style for style in styles)
            assert is_open == (by_source[sid]['white_dwarf_host_confidence'] != 'established'), (name, sid)
    info={'status':'PASS','systems':59,'observations':100,'measurements':7219,'references':672,'rejected_counterpart_records':74,'sky_included':59,'sky_excluded':0,'cmd_included':56,'cmd_excluded':3,'audited_galactic_components_compared':len(residuals),'max_agreement_difference_deg':max(residuals),'radio_region_selected_coverage':sum(bool(r['preferred_radio_emission_region_field_gauss']) for r in s),'wd_polar_selected_coverage':sum(bool(r['preferred_wd_polar_field_mg']) for r in s)}
    (ROOT/'docs/scientific_check.json').write_text(json.dumps(info,indent=2));print(info)
if __name__=='__main__':main()
