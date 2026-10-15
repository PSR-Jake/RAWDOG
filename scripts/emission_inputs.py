#!/usr/bin/env python3
"""Expose frozen observation/ledger evidence; do not select or recalculate source luminosities."""
import argparse
import csv
import hashlib
import json
import re
from decimal import Decimal
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/v1.0.2'
OUT = ROOT / 'data/v1.0.2-web-r10'
# These five ledger records contain explicit ranges/scalings/limits only as text.
TEXT_VALUES = {'M00772', 'M02093', 'M02188', 'M04373', 'M04374'}
NUMERIC_FIELDS = ['value_numeric', 'error_minus', 'error_plus', 'lower_bound', 'upper_bound']

def read(name):
    with (DATA / name).open(newline='') as f:
        return list(csv.DictReader(f))

def luminosity_record(r):
    text = ' '.join(r[k] for k in ['parameter', 'component', 'method', 'assumption', 'epoch_or_state', 'location', 'derived_from', 'value_text'])
    band = re.search(r'(\d+(?:[.p]\d+)?)[ _–−-](\d+(?:[.p]\d+)?)\s*(?:_?ke[Vv])', text, re.I)
    band_label = (band[1].replace('p', '.') + '–' + band[2].replace('p', '.') + ' keV') if band else ('bolometric' if 'bolometric' in text.lower() else 'band unspecified in record')
    distance = re.search(r'(\d+(?:\.\d+)?)(?:\s*(?:±|\+/-)\s*\d+(?:\.\d+)?)?\s*-?\s*(k?pc)\b', ' '.join(r[k] for k in ['assumption', 'method', 'derived_from', 'value_text']), re.I)
    normalization = re.search(r'\([Dd]\s*/\s*(\d+(?:\.\d+)?)\s*pc\)\s*(?:\^?2|²)', text)
    scale = Decimal('1e30') if r['unit'] == '10^30 erg s-1' else Decimal(1)
    log = r['unit'] == 'log10(erg s-1)'
    available = any(r[k] for k in ['value_numeric', 'lower_bound', 'upper_bound']) or r['measurement_id'] in TEXT_VALUES
    assert not available or r['unit'] in {'erg s-1', 'erg s^-1', '10^30 erg s-1', 'log10(erg s-1)'}
    return {**r, 'available': available, 'band_label': band_label,
            'distance_label': 'paper d=' + distance[1] + ' ' + distance[2] if distance else '',
            'distance_normalization_pc': normalization[1] if normalization else '',
            'upper_limit': 'upper' in (r['parameter'] + ' ' + r['limit_type']).lower(),
            'lower_limit': 'lower' in r['limit_type'].lower(),
            'log10_luminosity': log, 'unit_scale': str(scale),
            **{'display_' + k: str(Decimal(r[k]) * scale) if r[k] else '' for k in NUMERIC_FIELDS}}

def products():
    summaries = read('rawdog_source_summary.csv')
    radio = read('rawdog_radio_observations.csv')
    measurements = read('rawdog_measurements.csv')
    ids = {s['source_id'] for s in summaries}
    lx = [luminosity_record(r) for r in measurements if r['source_id'] in ids and 'xray' in r['parameter'].lower() and 'luminosity' in r['parameter'].lower() and r['unit'] != 'dimensionless']
    systems = [{'source_id': s['source_id'], 'radio': [r for r in radio if r['source_id'] == s['source_id']],
                'xray': [r for r in lx if r['source_id'] == s['source_id']],
                'xray_flux_record_count': sum(r['source_id'] == s['source_id'] and r['public_property_group'] == 'X-ray flux' for r in measurements)} for s in summaries]
    assert len(systems) == len(ids) == 58 and len(radio) == 96 and len(lx) == 58
    assert sum(r['available'] for r in lx) == 52
    assert sum(any(r['available'] for r in s['xray']) for s in systems) == 26
    assert all(r['source_id'] in ids for r in radio + lx)
    byid = {r['measurement_id']: r for r in measurements}
    assert byid['M04345']['unit'] == byid['M07166']['unit'] == 'mJy beam-1'
    assert {r['source_name'] for r in radio if 'Peak' in r['flux_quantity_kind']} == {'ILT J1101+5521', 'J191213.72-441045.1'}
    refs = {r['key'] for r in read('rawdog_references.csv')}
    for r in lx:
        assert all(r[k] == v for k, v in byid[r['measurement_id']].items())
        assert all(k.strip() in refs for k in r['reference_key'].split(';') if k.strip())
        for k in NUMERIC_FIELDS:
            if r[k]:
                assert Decimal(r['display_' + k]) == Decimal(r[k]) * Decimal(r['unit_scale'])
    out = {r['measurement_id']: r for r in lx}
    assert out['M04492']['upper_limit'] and out['M04493']['upper_limit']
    assert out['M04490']['distance_label'] == 'paper d=1.5 kpc'
    assert out['M03056']['band_label'] == '0.1–3.5 keV' and out['M03056']['distance_label'] == 'paper d=80 pc'
    assert Decimal(out['M07159']['display_value_numeric']) == Decimal('1.4e30')
    assert out['M06586']['log10_luminosity'] and out['M02358']['distance_normalization_pc'] == '100'
    assert out['M06209']['distance_normalization_pc'] == '260'
    assert not next(s for s in systems if s['source_id'] == 'name:askap-j144834-685644')['xray']
    payload = {'catalog_version': '1.0.2', 'website_revision': 'web r10', 'systems': systems}
    csv_columns = list(lx[0])
    import io
    buf = io.StringIO(newline='')
    writer = csv.DictWriter(buf, fieldnames=csv_columns)
    writer.writeheader()
    writer.writerows(lx)
    return {'emission_evidence.json': json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode() + b'\n',
            'xray_luminosity_input.csv': buf.getvalue().encode()}

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='Verify generated products without writing them')
    args = parser.parse_args()
    files = products()
    checksums = ''.join(hashlib.sha256(v).hexdigest() + '  ' + k + '\n' for k, v in files.items()).encode()
    files['SHA256SUMS.txt'] = checksums
    for name, content in files.items():
        if args.check:
            assert (OUT / name).read_bytes() == content, name
        else:
            OUT.mkdir(parents=True, exist_ok=True)
            (OUT / name).write_bytes(content)
    print('PASS: 58 source joins, 96 radio rows, 52 available luminosity records in 26 systems; units, limits, distances, references and original values preserved.')
