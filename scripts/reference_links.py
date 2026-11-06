#!/usr/bin/env python3
"""Build the website's preferred reference links from a frozen ADS metadata lookup."""
import argparse
import csv
import hashlib
import io
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from urllib.parse import quote, urlparse

ROOT = Path(__file__).resolve().parents[1]
REFERENCES = ROOT / 'data/v1.0.2/rawdog_references.csv'
METADATA = ROOT / 'data/v1.0.2-web-r23/reference_metadata.json'
LINKS = ROOT / 'assets/reference_links.json'
AUDIT = METADATA.with_name('reference_links.csv')
ARXIV = re.compile(r'arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5}|[a-z.-]+/\d{7})(?:v\d+)?(?:\.pdf)?(?:[?#].*)?$', re.I)
DATA_HOSTS = ('vizier', 'simbad', 'cdsarc', 'gea.esac', 'heasarc', 'swift.ac',
              'outters.fr', 'britastro', 'github.com', 'aavso')


def select_link(reference, metadata, by_bibcode, by_doi):
    original = reference['public_reference_url']
    host = urlparse(original).netloc.lower()
    doi = reference['doi'].lower()
    if any(name in host for name in DATA_HOSTS) or doi.startswith(('10.26093/', '10.17909/', '10.5281/')):
        return original, '', '', 'data or service endpoint'

    reviewed = metadata['arxiv_link_reviews'].get(reference['key'])
    if reviewed:
        identifier = reviewed['arxiv_id']
        url = 'https://arxiv.org/abs/' + identifier if identifier else original
        return url, identifier, reference['ads_bibcode'], 'primary arXiv title reviewed'

    manual = metadata['manual_citation_matches'].get(reference['key'])
    record = by_bibcode.get(reference['ads_bibcode'])
    matches = by_doi.get(doi, [])
    basis = ''
    if manual:
        record = by_bibcode[manual['bibcode']]
        basis = 'citation checked against ADS after identifier conflict'
    elif record and (not doi or doi in [d.lower() for d in record.get('doi', [])]):
        basis = 'ADS bibcode' + (' and DOI' if doi else '')
    elif len(matches) == 1 and not record:
        record = matches[0]
        basis = 'ADS DOI'
    else:
        record = None

    if record and record.get('doctype') != 'dataset':
        identifiers = {re.sub(r'v\d+$', '', item[6:]) for item in record.get('identifier', []) if item.startswith('arXiv:')}
        if len(identifiers) == 1:
            identifier = next(iter(identifiers))
            assert re.fullmatch(r'\d{4}\.\d{4,5}|[a-z.-]+/\d{7}', identifier)
            return 'https://arxiv.org/abs/' + identifier, identifier, record['bibcode'], basis
        if reference['key'] == 'Hog+00_ZCam':
            # The stored DOI resolves to a different paper. The citation identifies this ADS record.
            return 'https://ui.adsabs.harvard.edu/abs/' + quote(record['bibcode'], safe='') + '/abstract', '', record['bibcode'], basis
        if not original:
            return 'https://ui.adsabs.harvard.edu/abs/' + quote(record['bibcode'], safe='') + '/abstract', '', record['bibcode'], basis

    existing = ARXIV.search(original)
    if existing:
        identifier = existing.group(1)
        return 'https://arxiv.org/abs/' + identifier, identifier, '', 'existing catalog arXiv URL'
    return original, '', record['bibcode'] if record else '', 'existing fallback URL'


def products():
    metadata = json.loads(METADATA.read_text())
    assert hashlib.sha256(REFERENCES.read_bytes()).hexdigest() == metadata['reference_csv_sha256']
    references = list(csv.DictReader(REFERENCES.open()))
    assert len(references) == len({r['key'] for r in references}) == 669
    by_bibcode, by_doi = {}, defaultdict(list)
    for record in metadata['records']:
        for bibcode in [record['bibcode'], *record.get('alternate_bibcode', [])]:
            by_bibcode[bibcode] = record
        for doi in record.get('doi', []):
            by_doi[doi.lower()].append(record)

    links, audit = {}, []
    primary = {record['arxiv_id']: record for record in metadata['arxiv_records']}
    for reference in references:
        url, identifier, bibcode, basis = select_link(reference, metadata, by_bibcode, by_doi)
        assert not url or urlparse(url).scheme in {'http', 'https'}
        if identifier:
            assert identifier in primary and primary[identifier]['title']
        links[reference['key']] = {'url': url, 'arxiv_id': identifier}
        audit.append({'key': reference['key'], 'original_url': reference['public_reference_url'],
                      'preferred_url': url, 'arxiv_id': identifier, 'matched_ads_bibcode': bibcode,
                      'match_basis': basis, 'arxiv_title': primary[identifier]['title'] if identifier else ''})

    output = {'catalog_version': '1.0.2', 'checked_on': metadata['checked_on'],
              'reference_csv_sha256': metadata['reference_csv_sha256'], 'references': links}
    json_text = json.dumps(output, ensure_ascii=False, separators=(',', ':')) + '\n'
    stream = io.StringIO(newline='')
    writer = csv.DictWriter(stream, fieldnames=list(audit[0]))
    writer.writeheader()
    writer.writerows(audit)
    return json_text, stream.getvalue(), audit


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true')
    arguments = parser.parse_args()
    json_text, csv_text, audit = products()
    for path, text in [(LINKS, json_text), (AUDIT, csv_text)]:
        if arguments.check:
            assert path.read_bytes() == text.encode(), 'Reference-link product differs: ' + str(path)
        else:
            path.write_bytes(text.encode())
    counts = Counter('arXiv' if r['arxiv_id'] else 'fallback' for r in audit)
    changed = sum(r['preferred_url'] != r['original_url'] for r in audit)
    print(f'PASS: {len(audit)} reference keys, {counts["arXiv"]} arXiv links, {counts["fallback"]} fallbacks, {changed} updated URLs.')
