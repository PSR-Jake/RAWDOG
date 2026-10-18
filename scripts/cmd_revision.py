#!/usr/bin/env python3
"""Build/check the author-approved web-r13 CMD adoption from frozen 1.0.2 evidence."""
import argparse
import csv
import hashlib
import io
import json
import math
import xml.etree.ElementTree as ET
import build

ROOT = build.ROOT
BASE = ROOT / 'data/v1.0.2'
OUT = ROOT / 'data/v1.0.2-web-r13'
FIG = ROOT / 'figures/v1.0.2-web-r13'
SID = 'gaia-dr3:5566254014771398912'
PAPER = 'https://arxiv.org/html/2604.18688v2'

def read(name):
    with (BASE / name).open(newline='') as f:
        return list(csv.DictReader(f))

def inputs():
    original = read('cmd_plot_input.csv')
    ms = {r['measurement_id']: r for r in read('rawdog_measurements.csv')}
    m = ms['M04418']
    assert m['source_id'] == SID and m['unit'] == 'pc'
    assert m['value_numeric'] == '380' and m['error_minus'] == m['error_plus'] == '10'
    extra = ['website_revision','distance_assumptions','publication_url','paper_location',
             'ledger_uncertainty_convention','previous_distance_measurement_ids',
             'previous_distance_pc','previous_M_G_observed_mag']
    rows = [{**r, **dict.fromkeys(extra, ''), 'website_revision': 'web r13'} for r in original]
    c = next(r for r in rows if r['source_id'] == SID)
    d = float(m['value_numeric'])
    lo, hi = d-float(m['error_minus']), d+float(m['error_plus'])
    c.update(previous_distance_measurement_ids=c['distance_measurement_ids'],
             previous_distance_pc=c['distance_pc'], previous_M_G_observed_mag=c['M_G_observed_mag'],
             distance_pc=m['value_numeric'], distance_lower_pc=str(lo), distance_upper_pc=str(hi),
             distance_measurement_ids=m['measurement_id'], distance_reference_keys=m['reference_key'],
             distance_method=m['method'], distance_assumptions=m['assumption'],
             ledger_uncertainty_convention=m['uncertainty_convention'],
             distance_uncertainty_convention='Posterior median and p16/p84 credible endpoints, verified in Rodriguez et al. (2026) section 3/Table 2 and Rodriguez (2025) Appendix A.2; not Gaussian errors',
             publication_url=PAPER, paper_location='Section 2.3; Section 3, Table 2; arXiv v2 (2026-08-18)',
             selection='Author-approved CMD-only published SED distance',
             adoption_reason='Web r13 author decision: use the published spectrum/SED distance for this CMD position; catalog preferred geometric distance and all alternatives remain unchanged.',
             qualifications='Model-dependent WD+M-dwarf spectrum/SED distance; unresolved observed Gaia photometry, not extinction corrected. Catalog preferred geometric distance remains an alternative (M04422); no component magnitudes substituted.')
    g = float(c['G_observed_mag'])
    for key,dist in [('M_G_observed_mag',d),('M_G_lower_from_distance_upper',hi),('M_G_upper_from_distance_lower',lo)]:
        c[key] = str(build.absolute(g,dist))
    assert len(rows) == len({r['source_id'] for r in rows}) == 58
    assert sum(r['included'] == 'true' for r in rows) == 56
    changed = {'distance_pc','distance_lower_pc','distance_upper_pc','distance_measurement_ids',
               'distance_reference_keys','distance_method','distance_uncertainty_convention','selection',
               'adoption_reason','M_G_observed_mag','M_G_lower_from_distance_upper',
               'M_G_upper_from_distance_lower','qualifications'}
    for new,old in zip(rows,original):
        assert new['source_id'] == old['source_id']
        for k,v in old.items():
            if old['source_id'] != SID or k not in changed:
                assert new[k] == v, (old['source_name'],k)
        if new['included'] != 'true':
            assert new['exclusion_reason'] and not new['M_G_observed_mag']
            continue
        g,bp,rp,d,mg = map(float,[new[k] for k in ['G_observed_mag','BP_observed_mag','RP_observed_mag','distance_pc','M_G_observed_mag']])
        assert all(math.isfinite(x) for x in [g,bp,rp,d,mg]) and d > 0
        assert math.isclose(float(new['BP_RP_observed_mag']),bp-rp,abs_tol=1e-12)
        assert math.isclose(mg,g+5-5*math.log10(d),abs_tol=1e-12)
        if new['distance_lower_pc'] and new['distance_upper_pc']:
            lo,hi,ml,mh = map(float,[new[k] for k in ['distance_lower_pc','distance_upper_pc','M_G_lower_from_distance_upper','M_G_upper_from_distance_lower']])
            assert all(math.isfinite(x) for x in [lo,hi,ml,mh])
            assert 0 < lo <= d <= hi and ml <= mg <= mh
            assert math.isclose(ml,build.absolute(g,hi),abs_tol=1e-12)
            assert math.isclose(mh,build.absolute(g,lo),abs_tol=1e-12)
        dm = ms[new['distance_measurement_ids']]
        assert dm['source_id'] == new['source_id'] and dm['unit'] == 'pc'
        assert math.isclose(float(dm['value_numeric']),d,abs_tol=1e-10)
    assert c['gaia_dr3_id'] == '5566254014771398912'
    assert math.isclose(float(c['M_G_observed_mag']),12.885594,abs_tol=1e-6)
    assert c['previous_distance_measurement_ids'] == 'M04422'
    assert float(c['previous_distance_pc']) == 3010.02051
    return rows

def products(rows):
    buf = io.StringIO(newline='')
    writer = csv.DictWriter(buf,fieldnames=list(rows[0]))
    writer.writeheader(); writer.writerows(rows)
    payload = {'catalog_version':'1.0.2','website_revision':'web r13','systems':rows}
    return {'cmd_plot_input.csv':buf.getvalue().encode(),
            'cmd_plot_input.json':json.dumps(payload,ensure_ascii=False,separators=(',',':')).encode()+b'\n'}

def check_figure(rows):
    tree = ET.parse(FIG/'rawdog_cmd.svg')
    elements = list(tree.getroot().iter())
    ids = [e.get('id') for e in elements if e.get('id')]
    assert len(ids) == len(set(ids))
    points = [e for e in elements if e.get('id','').startswith('point-')]
    included = {r['source_id']:r for r in rows if r['included']=='true'}
    assert len(points) == len(included) == 56
    assert {e.get('data-source') for e in points} == set(included)
    assert not any('label' in e.get('id','') for e in elements if e.get('data-source') == SID)
    visible = ' '.join(''.join(e.itertext()) for e in elements if e.tag.endswith('}text'))
    assert 'GLEAM' not in visible and 'prior sensitive' not in visible
    assert 'geometric-distance CMD' not in visible and 'NOT extinction corrected' in visible
    for e in elements:
        if e.get('id','').startswith(('point-','bound-','color-')):
            r = included[e.get('data-source')]
            assert e.get('data-token') == r['token']
    for ext in ['pdf','svg','png']:
        assert (FIG/('rawdog_cmd.'+ext)).stat().st_size > 1000

def checksums():
    files = [OUT/'cmd_plot_input.csv',OUT/'cmd_plot_input.json',*[FIG/('rawdog_cmd.'+ext) for ext in ['pdf','svg','png']]]
    return ''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT))+'\n' for p in files).encode()

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check',action='store_true')
    args = parser.parse_args()
    rows = inputs()
    files = products(rows)
    if args.check:
        for name,content in files.items(): assert (OUT/name).read_bytes() == content,name
    else:
        OUT.mkdir(parents=True,exist_ok=True)
        for name,content in files.items(): (OUT/name).write_bytes(content)
        build.DATA = BASE; build.FIG = FIG
        numeric = ['BP_RP_observed_mag','M_G_observed_mag','M_G_lower_from_distance_upper','M_G_upper_from_distance_lower','BP_RP_error_approx_mag']
        plot_rows = [{**r,**{k:build.number(r[k]) for k in numeric}} for r in rows]
        build.cmd_plot(plot_rows,'1.0.2',annotate_gleam=False,basis='observed Gaia CMD · web r13')
    check_figure(rows)
    if args.check: assert (OUT/'SHA256SUMS.txt').read_bytes() == checksums()
    else: (OUT/'SHA256SUMS.txt').write_bytes(checksums())
    print('PASS: 58 source joins, 56 CMD systems; only GLEAM-X adopts M04418; unchanged photometry, nonlinear endpoints, no visible source label, linked foreground and versioned products.')
