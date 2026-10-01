#!/usr/bin/env python3
"""Checksum versioned products and make a deterministic public data/figure/document archive."""
import argparse,hashlib,zipfile
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
def main(version):
    data=ROOT/('data/v'+version);fig=ROOT/('figures/v'+version)
    products=sorted(p for directory in [data,fig] for p in directory.iterdir() if p.is_file() and p.name!='SHA256SUMS.txt')
    (data/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT))+'\n' for p in products))
    archive=ROOT/('data/RAWDOG-v'+version+'.zip')
    with zipfile.ZipFile(archive,'w',compression=zipfile.ZIP_DEFLATED) as z:
        paths=products+[data/'SHA256SUMS.txt']+sorted((ROOT/'docs').glob('*'))+[ROOT/'README.md',ROOT/'requirements.txt']+sorted((ROOT/'scripts').glob('*.py'))
        for p in paths:
            entry=zipfile.ZipInfo('RAWDOG-v'+version+'/'+str(p.relative_to(ROOT)),date_time=((2026,10,1,0,0,0) if version=='1.0.2' else (2026,9,30 if version=='1.0.1' else 28,0,0,0)));entry.compress_type=zipfile.ZIP_DEFLATED;z.writestr(entry,p.read_bytes())
    print('Archive:',archive.name,'products:',len(products),'size:',archive.stat().st_size)
if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--version',default='1.0.0',choices=['1.0.0','1.0.1','1.0.2']);main(parser.parse_args().version)
