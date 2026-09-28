#!/usr/bin/env python3
"""Import an author-reviewed RC3 directory into a separate, sanitized public snapshot."""
import csv, hashlib, json, re, sys
from pathlib import Path
ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / 'data/v1.0.0'
PATH_FIELDS = {'local_path','original_local_path','local_path_candidates','filename'}

def sanitize(value):
    return re.sub(r'(?:file://|/Users/|/home/|/tmp/|tmp/records/|tmp/audit_backups/)[^\s;,\)\]]*', '[local artifact withheld]', value)

def write(path, rows):
    with path.open('w', newline='', encoding='utf-8') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0])); w.writeheader(); w.writerows(rows)

def fingerprint(row):
    return hashlib.sha256(json.dumps(row, sort_keys=True, ensure_ascii=False).encode()).hexdigest()

def main(rc):
    DATA.mkdir(parents=True, exist_ok=True)
    baseline={}; changes=[]; redactions=[]
    for path in sorted(rc.glob('*.csv')):
        rows=list(csv.DictReader(path.open(encoding='utf-8-sig')))
        for i,r in enumerate(rows):
            for k,v in r.items():
                clean='' if k in PATH_FIELDS else sanitize(v)
                if v!=clean:
                    r[k]=clean; redactions.append({'file':path.name,'row':i+1,'field':k,'reason':'Local evidence artifact not distributed; reference keys and printed scientific claims preserved'})
        baseline[path.name]=[fingerprint(r) for r in rows]
        if path.name=='rawdog_source_summary.csv':
            ar=next(r for r in rows if r['source_name']=='AR Sco')
            ledger=list(csv.DictReader((rc/'rawdog_measurements.csv').open()))
            for prefix,preferred,mid,units in [('radio_emission_region_field','preferred_radio_emission_region_field_gauss','M07011','gauss'),('wd_polar_field','preferred_wd_polar_field_mg','M07014','mg')]:
                m=next(r for r in ledger if r['measurement_id']==mid)
                vals={preferred:m['value_numeric'],prefix+'_error_minus_'+units:m['error_minus'],prefix+'_error_plus_'+units:m['error_plus'],prefix+'_uncertainty_convention':m['uncertainty_convention'] or 'Approximate model inference; no statistical uncertainty reported',prefix+'_component':m['component'],prefix+'_method':m['method'],prefix+'_assumption':m['assumption'],prefix+'_reference_keys':m['reference_key'],prefix+'_measurement_ids':mid,prefix+'_status':'Author-accepted model-derived selection; alternatives retained',prefix+'_note':('Table 2 fast-cooling synchrotron-region field: 42.7 ± 0.2 G. Error is MCSE, not a physical confidence interval. Slow-cooling 20 G remains an alternative (M07012). Abstract 43 MG (M07013) is retained; likely unit typo is an inference from the table/body/conclusions, not an author-confirmed correction.' if mid=='M07011' else 'Approximately 15 MG WD polar field inferred by dipole extrapolation; distinct from 42.7 G synchrotron-region field. Alternative WD-field models and bounds retained.')}
                for k,v in vals.items():
                    if ar[k]!=v: changes.append({'source_id':ar['source_id'],'field':k,'rc3':ar[k],'public':v,'measurement_id':mid});ar[k]=v
        write(DATA/path.name,rows)
    (DATA/'rc3_sanitized_baseline.json').write_text(json.dumps(baseline,indent=2))
    (DATA/'summary_changes.json').write_text(json.dumps(changes,indent=2,ensure_ascii=False))
    write(DATA/'public_sanitization.csv',redactions)
    for name in ['DATA_DICTIONARY.md','ONLINE_PRESENTATION.md','RELEASE_DECISIONS.md','CHANGE_REPORT.md','VALIDATION_REPORT.md']:
        (ROOT/'docs'/('RC3_'+name)).write_text(sanitize((rc/name).read_text()))
    print('Imported 58 systems; AR Sco changes:',len(changes),'path redactions:',len(redactions))

if __name__=='__main__':main(Path(sys.argv[1]))
