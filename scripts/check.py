#!/usr/bin/env python3
"""One runnable scientific check; fails loudly on altered evidence or invalid plot inputs."""
import csv,json,math,hashlib,re,xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter
from astropy.coordinates import SkyCoord
import astropy.units as u
from build import absolute,wrap,ADOPTIONS,token
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'data/v1.0.0'
def read(n):return list(csv.DictReader((DATA/n).open()))
def fingerprint(r):return hashlib.sha256(json.dumps(r,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
def main():
    s=read('rawdog_source_summary.csv');m=read('rawdog_measurements.csv');o=read('rawdog_radio_observations.csv');sky=read('sky_plot_input.csv');cmd=read('cmd_plot_input.csv');refs=read('rawdog_references.csv')
    ids={r['source_id'] for r in s};byid={r['measurement_id']:r for r in m};ss={r['source_name']:r for r in s}
    assert len(s)==len(ids)==58 and len(o)==96 and len(m)==len(byid)==7183 and len(refs)==667
    assert all(r['source_id'] in ids for r in o)
    assert all(r['source_id'] in ids for r in m if r['source_membership']=='Member')
    rejected=[r for r in m if r['source_membership'].startswith('Excluded')]
    assert len(rejected)==74 and all(r['source_id'] not in ids for r in rejected)
    for r in s:
        gid=r['gaia_dr3_id'];assert isinstance(gid,str) and (not gid or re.fullmatch(r'\d{1,19}',gid))
        assert not gid or r['source_id']=='gaia-dr3:'+gid
        assert int(r['radio_observation_count'])==sum(x['source_id']==r['source_id'] for x in o)
    chime=ss['CHIME/ILT J1634+44'];askap=ss['ASKAP J174508.9-505149'];ar=ss['AR Sco']
    assert chime['white_dwarf_host_confidence']=='unresolved' and not chime['gaia_dr3_id'] and not chime['preferred_wd_mass_msun']
    assert all(x in askap['classification_labels'] for x in ['long_period_radio_transient','magnetic_cv']) and askap['white_dwarf_host_confidence']=='inferred_or_proposed'
    assert ar['preferred_radio_emission_region_field_gauss']=='42.7' and ar['radio_emission_region_field_error_plus_gauss']=='0.2'
    assert 'MCSE' in ar['radio_emission_region_field_uncertainty_convention'] and ar['preferred_wd_polar_field_mg']=='15' and not ar['preferred_wd_mean_photospheric_field_mg']
    assert 'inference' in ar['radio_emission_region_field_note'] and byid['M07013']['unit']=='MG' and byid['M07013']['value_numeric']=='43'
    baseline=json.loads((DATA/'rc3_sanitized_baseline.json').read_text());changes=json.loads((DATA/'summary_changes.json').read_text())
    # Reverse only documented AR Sco summary changes; every other sanitized field must match RC3.
    for name,expected in baseline.items():
        rows=read(name)
        if name=='rawdog_source_summary.csv':
            row=next(r for r in rows if r['source_name']=='AR Sco')
            for c in changes:
                assert row[c['field']]==c['public'];row[c['field']]=c['rc3']
        assert [fingerprint(r) for r in rows]==expected, 'Unrelated RC3 values changed: '+name
    assert Counter(r['radio_evidence_label'] for r in o)=={'Reported detection; significance not harmonized':63,'Reported flux; significance not harmonized':17,'Upper limit':8,'Marginal reported signal':5,'Secure reported detection':3}
    assert len(sky)==58 and {r['source_id'] for r in sky}==ids
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
    cc=next(r for r in sky if r['source_name']=='CHIME/ILT J1634+44');assert abs(float(cc['galactic_l_deg'])-70.17)<.005 and abs(float(cc['galactic_b_deg'])-42.58)<.005 and cc['fallback_status']=='literature radio position'
    assert len(cmd)==58 and {r['source_id'] for r in cmd}==ids and sum(r['included']=='true' for r in cmd)==56
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
        assert r['distance_uncertainty_convention'] and ('geometric' in (r['distance_method']+' '+r['distance_uncertainty_convention']).lower())
    assert {r['source_name'] for r in cmd if r['included']=='false'}=={'CHIME/ILT J1634+44','ASKAP J174508.9-505149'}
    for p in DATA.glob('*.csv'):assert not re.search(r'/Users/|/home/|/tmp/|tmp/records/|file://',p.read_text()),p.name
    index=json.loads((ROOT/'assets/catalog.json').read_text());assert index['version']=='1.0.0' and len(index['systems'])==58
    for item in index['systems']:
        detail=json.loads((ROOT/'assets/sources'/(item['token']+'.json')).read_text())
        assert detail['summary']==item['summary'] and detail['summary'] in s
        assert detail['sky']==item['sky'] and detail['cmd']==item['cmd']
        assert len(detail['observations'])==int(item['summary']['radio_observation_count'])
        assert detail['measurements']==[r for r in m if r['source_id']==item['summary']['source_id']]
    for name,count in [('rawdog_sky',116),('rawdog_cmd',56)]:
        root=ET.parse(ROOT/'figures/v1.0.0'/(name+'.svg')).getroot()
        gids=[e.get('id') for e in root.iter() if e.get('id')];assert len(gids)==len(set(gids))
        points=[e for e in root.iter() if e.get('id','').startswith('point-')];assert len(points)==count
        assert all(e.get('data-source') in ids and e.get('data-token') for e in points)
        if name=='rawdog_cmd':
            segments=[e for e in root.iter() if e.get('id','').startswith(('bound-','color-'))]
            assert segments and all(e.get('data-token') for e in segments)
    info={'status':'PASS','systems':58,'observations':96,'measurements':7183,'references':667,'rejected_counterpart_records':74,'sky_included':58,'sky_excluded':0,'cmd_included':56,'cmd_excluded':2,'audited_galactic_components_compared':len(residuals),'max_agreement_difference_deg':max(residuals),'radio_region_selected_coverage':sum(bool(r['preferred_radio_emission_region_field_gauss']) for r in s),'wd_polar_selected_coverage':sum(bool(r['preferred_wd_polar_field_mg']) for r in s)}
    (ROOT/'docs/scientific_check.json').write_text(json.dumps(info,indent=2));print(info)
if __name__=='__main__':main()
