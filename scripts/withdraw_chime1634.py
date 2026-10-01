"""Create an immutable 1.0.2 snapshot after an author-requested membership withdrawal."""
import csv,json,shutil
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];SOURCE='CHIME/ILT J1634+44';SID='name:chime-ilt-j1634-plus-44'
OLD=ROOT/'data/v1.0.1';NEW=ROOT/'data/v1.0.2'
def main():
 assert not NEW.exists(), 'Published snapshots must not be overwritten.'
 shutil.copytree(OLD,NEW);row_maps={}
 for p in sorted(NEW.glob('*.csv')):
  with p.open(newline='') as f:r=csv.DictReader(f);fields=r.fieldnames;rows=list(r)
  if 'source_name' not in fields and 'source_id' not in fields:continue
  pairs=[(i,r) for i,r in enumerate(rows) if r.get('source_name')!=SOURCE and r.get('source_id')!=SID]
  kept=[r for i,r in pairs]
  row_maps[p.name]={i+1:j+1 for j,(i,r) in enumerate(pairs)}
  with p.open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(kept)
 p=NEW/'public_sanitization.csv'
 with p.open(newline='') as f:r=csv.DictReader(f);fields=r.fieldnames;rows=list(r)
 kept=[]
 for r in rows:
  mapping=row_maps.get(r['file'])
  if mapping is not None:
   if int(r['row']) not in mapping:continue
   r['row']=str(mapping[int(r['row'])])
  kept.append(r)
 with p.open('w',newline='') as f:w=csv.DictWriter(f,fieldnames=fields);w.writeheader();w.writerows(kept)
 p=ROOT/'assets/catalog.json';catalog=json.loads(p.read_text());assert catalog['version']=='1.0.1'
 removed,=[r for r in catalog['systems'] if r['summary']['source_id']==SID]
 catalog['systems']=[r for r in catalog['systems'] if r is not removed];catalog['version']='1.0.2'
 assert len(catalog['systems'])==58
 p.write_text(json.dumps(catalog,ensure_ascii=False,separators=(',',':')))
 # The old membership and evidence remain in the immutable 1.0.1 archive and Git history.
 (ROOT/'assets/sources'/(removed['token']+'.json')).unlink()
 (NEW/'withdrawal_notes.json').write_text(json.dumps({'date':'2026-10-01','source_name':SOURCE,'source_id':SID,'base_version':'1.0.1','decision':'Withdrawn from active membership at author request because source nature and white-dwarf interpretation are unclear.','policy':'Not a rejected counterpart. 117 evidence records and six review items removed from active tables; historical snapshots and the bibliographic manifest remain intact.','preservation':'All surviving source values, IDs, uncertainty conventions and plot rows unchanged.'},indent=2))
 print('Created 1.0.2: 58 members; CHIME source absent from all active source tables and website index.')
if __name__=='__main__':main()
