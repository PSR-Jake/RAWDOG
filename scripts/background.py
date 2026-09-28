#!/usr/bin/env python3
"""Retain a reproducible density product from a local Gaia cache, without individual stars."""
import csv, hashlib, json, sys
from pathlib import Path
import numpy as np
ROOT=Path(__file__).resolve().parents[1]

def main(path):
    rows=list(csv.DictReader(path.open())); selected=[]
    for r in rows:
        try:g,c,p,s,q=map(float,[r['phot_g_mean_mag'],r['bp_rp'],r['parallax'],r['parallax_over_error'],r['ruwe']])
        except (ValueError,KeyError):continue
        if all(np.isfinite([g,c,p,s,q])) and p>0 and s>=10 and 0<q<1.4:
            selected.append((c,g+5*np.log10(p)-10))
    a=np.array(selected); h,xe,ye=np.histogram2d(a[:,0],a[:,1],bins=[np.linspace(-1,4.5,221),np.linspace(-5,18,231)])
    out=ROOT/'data/v1.0.0';out.mkdir(exist_ok=True,parents=True)
    with (out/'cmd_background_density.csv').open('w',newline='') as f:
        w=csv.writer(f);w.writerow(['bp_rp_left','bp_rp_right','M_G_lower','M_G_upper','count'])
        for i,j in zip(*np.where(h>0)):w.writerow([xe[i],xe[i+1],ye[j],ye[j+1],int(h[i,j])])
    meta={'cache_basename':path.name,'cache_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'cache_rows':len(rows),'quality_selected':len(selected),'within_density_extent':int(h.sum()),'outside_density_extent':len(selected)-int(h.sum()),'cuts':'Finite G, BP−RP, parallax, parallax_over_error, RUWE; parallax > 0 mas; parallax_over_error >= 10; 0 < RUWE < 1.4. No extinction correction. M_G=G+5 log10(parallax_mas)−10.','historical_query':'Not recovered for this cache. Filename and columns identify a Gaia TAP cache, not its original selection or sky coverage. Related Rose analysis uses extinction-corrected aggregation; that query is not attributed to this cache.','product':'220 × 230 fixed bins: BP−RP [−1,4.5], M_G [−5,18]. Counts retained; no source IDs or individual interactive field stars. Inverse parallax used only for high-significance field background, never for RAWDOG.'}
    (out/'cmd_background_provenance.json').write_text(json.dumps(meta,indent=2,ensure_ascii=False));print(meta)
if __name__=='__main__':main(Path(sys.argv[1]))
