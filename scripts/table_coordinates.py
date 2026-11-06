#!/usr/bin/env python3
"""Build/check FK5/J2000 table coordinates from frozen released epoch-2000 positions."""
import argparse
import csv
import hashlib
import io
import json
from pathlib import Path

import astropy
from astropy import units as u
from astropy.coordinates import FK5, SkyCoord

ROOT = Path(__file__).resolve().parents[1]
CATALOG = 'assets/catalog.json'
COUNTERPARTS = 'data/v1.0.2/rawdog_gaia_counterparts.csv'
OUTPUT = 'assets/table_coordinates_fk5_j2000'
UGEM = 'gaia-dr3:674214551557961984'
RADIO = 'name:askap-j144834-685644'


def products():
    hashes = {p: hashlib.sha256((ROOT / p).read_bytes()).hexdigest()
              for p in [CATALOG, COUNTERPARTS]}
    sources = json.loads((ROOT / CATALOG).read_text())['systems']
    with (ROOT / COUNTERPARTS).open(newline='') as f:
        counterparts = list(csv.DictReader(f))
    by_id = {r['source_id']: r for r in counterparts}
    assert len(by_id) == len(counterparts) == len(sources) == 58
    target = FK5(equinox='J2000')
    rows = []
    for x in sources:
        s = x['summary']
        sid = s['source_id']
        r = by_id[sid]
        assert r['gaia_dr3_id'] == s['gaia_dr3_id'] or (
            sid == RADIO and r['gaia_dr3_id'] == 'NA' and s['gaia_dr3_id'] == '')
        assumed = not bool(s['gaia_dr3_id'])
        if not assumed:
            ra, dec = r['gaia_ra_j2000_deg'], r['gaia_dec_j2000_deg']
            assert ra and dec
            # U Gem's saved VizieR output explicitly declares FK5/J2000.
            already_fk5 = sid == UGEM
            if already_fk5:
                assert 'declares FK5 J2000' in r['supplemental_note']
            input_frame = 'FK5 J2000' if already_fk5 else 'ICRS'
            position_epoch = 'J2000.0 (released propagated position)'
            input_file = COUNTERPARTS
            qualification = ('Released FK5/J2000 position retained without a second frame conversion.'
                             if already_fk5 else
                             'Released ICRS epoch-2000 position transformed to FK5, equinox J2000. '
                             'Original proper-motion propagation and its limitations are inherited; '
                             'no new motion or covariance propagation is applied.')
            coord = SkyCoord(ra=float(ra)*u.deg, dec=float(dec)*u.deg,
                             frame=target if already_fk5 else 'icrs')
        else:
            assert sid == RADIO
            sky = x['sky']
            ra, dec = str(sky['ra_deg']), str(sky['dec_deg'])
            input_frame = sky['coordinate_frame']
            position_epoch = sky['coordinate_epoch']
            input_file = CATALOG
            qualification = ('Published J2000 radio localization retained numerically. FK5/J2000 '
                             'alignment is assumed only for the table and coarse Galactic conversion; '
                             'the exact frame and astrometric reference epoch remain unspecified.')
            coord = SkyCoord(ra=float(ra)*u.deg, dec=float(dec)*u.deg, frame=target)
        fk5 = coord if assumed or input_frame == 'FK5 J2000' else coord.transform_to(target)
        if assumed or input_frame == 'FK5 J2000':
            assert float(fk5.ra.deg) == float(ra) and float(fk5.dec.deg) == float(dec)
        gal = fk5.galactic
        assert coord.separation(fk5.transform_to(coord.frame)).arcsec < 1e-6
        assert fk5.separation(gal.transform_to(target)).arcsec < 1e-6
        rows.append(dict(source_id=sid, source_name=s['source_name'], gaia_dr3_id=s['gaia_dr3_id'],
                         ra_deg=float(fk5.ra.deg), dec_deg=float(fk5.dec.deg),
                         galactic_l_deg=float(gal.l.deg), galactic_b_deg=float(gal.b.deg),
                         coordinate_frame='FK5', coordinate_equinox='J2000',
                         position_epoch=position_epoch, assumed_alignment=assumed,
                         input_ra_deg=ra, input_dec_deg=dec, input_frame=input_frame,
                         input_file=input_file, input_sha256=hashes[input_file],
                         qualification=qualification))
    assert sum(r['assumed_alignment'] for r in rows) == 1
    assert sum(r['input_frame'] == 'ICRS' for r in rows) == 56
    payload = dict(catalog_version='1.0.2', website_revision='web r19',
                   astropy_version=astropy.__version__, input_sha256=hashes, systems=rows)
    buf = io.StringIO(newline='')
    writer = csv.DictWriter(buf, fieldnames=list(rows[0]))
    writer.writeheader()
    writer.writerows(rows)
    return {OUTPUT+'.json': json.dumps(payload, ensure_ascii=False, separators=(',', ':'))+'\n',
            OUTPUT+'.csv': buf.getvalue()}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    args = parser.parse_args()
    for name, content in products().items():
        expected = content.encode()
        if args.check:
            assert (ROOT / name).read_bytes() == expected, name+' needs regeneration'
        else:
            (ROOT / name).write_bytes(expected)
    print('PASS: 58 table positions; 56 ICRS→FK5 conversions, U Gem FK5 retained, '
          'one qualified radio alignment; equatorial/Galactic round trips <1 microarcsecond.')
