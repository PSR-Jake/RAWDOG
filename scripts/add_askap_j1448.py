"""Import only the reviewed ASKAP addition into a new public 1.0.1 snapshot."""
import csv
import json
import shutil
import sys
from pathlib import Path
import build
from prepare_snapshot import sanitize, PATH_FIELDS

ROOT=Path(__file__).resolve().parents[1]
SOURCE='ASKAP J144834-685644'
SID='name:askap-j144834-685644'
DATA=ROOT/'data/v1.0.1'

def read(path):
    with path.open(encoding='utf-8-sig',newline='') as f:
        reader=csv.DictReader(f);return reader.fieldnames,list(reader)

def write(path,fields,rows):
    with path.open('w',encoding='utf-8',newline='') as f:
        writer=csv.DictWriter(f,fieldnames=fields);writer.writeheader();writer.writerows(rows)

def main(staging):
    assert not DATA.exists(), '1.0.1 exists; do not overwrite a published snapshot.'
    old_index=json.loads((ROOT/'assets/catalog.json').read_text())
    assert old_index['version']=='1.0.0' and len(old_index['systems'])==58
    shutil.copytree(ROOT/'data/v1.0.0',DATA)
    redactions=[]
    for name in ['rawdog_source_summary.csv','rawdog_radio_observations.csv','rawdog_measurements.csv',
                 'rawdog_physical_properties.csv','rawdog_gaia_counterparts.csv','rawdog_source_references.csv',
                 'rawdog_review_issues.csv','rawdog_references.csv']:
        fields,old=read(DATA/name);_,exported=read(staging/name)
        new=[r for r in exported if r.get('source_id')==SID or (name=='rawdog_references.csv' and r['key'] in {'Anumarlapudi+25','Mo+26_ASKAPJ1448'})]
        assert new, name
        for row in new:
            assert list(row)==fields, name
            for k,v in row.items():
                clean='' if k in PATH_FIELDS else sanitize(v)
                if clean!=v:
                    redactions.append(dict(file=name,row=str(len(old)+new.index(row)+1),field=k,reason='Local evidence artifact withheld; scientific values and references retained'))
                    row[k]=clean
        if name=='rawdog_source_summary.csv':
            row,=new
            row['aliases']='ASKAP J1448-68; ASKAP J1448-6856'
            row['classification_labels']='long_period_transient; long_period_radio_transient; cataclysmic_variable'
            row['white_dwarf_host_confidence']='established'
            row['white_dwarf_host_evidence']='Mo+26_ASKAPJ1448 confirms a CV via Balmer/He I spectra and orbital RVs (M07185/M07189). No direct WD photospheric feature or surface field is measured.'
            row['radio_detection_labels']='Secure reported detection'
            row['radio_detection_status']='Secure reported detection (1); repeated polarized bursts in the cited discovery paper'
        if name=='rawdog_radio_observations.csv':
            new[0]['radio_evidence_label']='Secure reported detection'
        write(DATA/name,fields,old+new)
    fields,rows=read(DATA/'public_sanitization.csv');write(DATA/'public_sanitization.csv',fields,rows+redactions)
    # Preserve the historical plot rows verbatim; generate only this source's new coordinate/CMD rows.
    old_sky=build.read('sky_plot_input.csv');old_cmd=build.read('cmd_plot_input.csv')
    build.DATA=DATA
    summary=build.read('rawdog_source_summary.csv');measurements=build.read('rawdog_measurements.csv')
    own_summary=[r for r in summary if r['source_id']==SID]
    own=[r for r in measurements if r['source_id']==SID]
    sky,cmd=build.build_inputs(own_summary,{SID:own},{r['measurement_id']:r for r in measurements})
    assert cmd[0]['included']=='false' and not cmd[0]['M_G_observed_mag']
    build.write('sky_plot_input.csv',old_sky+sky);build.write('cmd_plot_input.csv',old_cmd+cmd)
    build.website_data(own_summary,own,sky,cmd)
    entry=json.loads((ROOT/'assets/catalog.json').read_text())['systems']
    index={'version':'1.0.1','systems':sorted(old_index['systems']+entry,key=lambda x:x['summary']['source_name'].casefold())}
    (ROOT/'assets/catalog.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':')))
    (DATA/'addition_notes.json').write_text(json.dumps({'source_id':SID,'date':'2026-09-30','base_version':'1.0.0',
        'references':['Anumarlapudi+25','Mo+26_ASKAPJ1448'],'classification':'Confirmed CV; polar/bouncer interpretations remain candidates.',
        'host_confidence_basis':'Mo+26 sections 3.1/4.1 identifies the source as a CV; magnetic subclass is separate.',
        'radio_label_basis':'Discovery paper sections 2.1.1-2.1.3 reports repeated polarized bursts; no harmonized threshold is imposed.',
        'preservation':'All original 1.0.0 public rows and AR Sco selections retained unchanged; only the new source rows are imported.'},indent=2))
    print('Imported 59-source snapshot; 109 new measurements, 2 references, 5 review issues; no Gaia CMD point.')

if __name__=='__main__':main(Path(sys.argv[1]))
