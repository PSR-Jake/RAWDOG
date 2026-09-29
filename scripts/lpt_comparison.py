#!/usr/bin/env python3
"""Build four method-specific placements of two existing members from immutable evidence."""
import csv,hashlib,json,math
import xml.etree.ElementTree as ET
from pathlib import Path
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import build
ROOT=build.ROOT;OUT=ROOT/'data/v1.0.0-web-r1'
PAIRS={'GLEAM-X J0704-37':('M04422','M04418','https://arxiv.org/html/2501.03315v2','§3.3, Table 2 and Appendix A.2'), 'ILT J1101+5521':('M04294','M04298','https://arxiv.org/html/2604.18688v2','§3 and Table 2')}
def rows():
    measurements={r['measurement_id']:r for r in build.read('rawdog_measurements.csv')}
    main={r['source_name']:r for r in build.read('cmd_plot_input.csv')};out=[]
    for name,(gaia,sed,url,location) in PAIRS.items():
        c=main[name]
        for method,mid in [('Gaia geometric',gaia),('Published SED',sed)]:
            m=measurements[mid];d=float(m['value_numeric']);lo=build.number(m['lower_bound']);hi=build.number(m['upper_bound'])
            if lo is None:lo=d-float(m['error_minus'])
            if hi is None:hi=d+float(m['error_plus'])
            r={**c,'comparison_method':method,'photometry_uncertainty_measurement_ids':'M04413; M04414; M04415' if name.startswith('GLEAM') else 'M04285; M04287; M04289','photometry_uncertainty_method':'Approximate magnitude errors from flux_over_error (1.085736 / SNR); GLEAM-X G quoted via SIMBAD; color quadrature assumes independent BP/RP, no covariance or variability model','glyph_token':c['token']+('g' if method=='Gaia geometric' else 's'),'distance_pc':d,'distance_lower_pc':lo,'distance_upper_pc':hi,'distance_measurement_ids':mid,'distance_reference_keys':m['reference_key'],'distance_method':m['method'],'distance_assumptions':m['assumption'],'ledger_uncertainty_convention':m['uncertainty_convention'],'distance_uncertainty_convention':m['uncertainty_convention'] if method=='Gaia geometric' else 'Posterior median with p16/p84 credible endpoints, verified in original paper; not Gaussian errors','uncertainty_verification_url':url if method=='Published SED' else '', 'uncertainty_verification_location':location if method=='Published SED' else '', 'publication_url':url if method=='Published SED' else 'https://doi.org/10.3847/1538-3881/abd806','original_measurement_location':m['location'],'selection':'Comparison only; main Gaia CMD unchanged','adoption_reason':'Author-requested method comparison, not a catalog preferred-distance selection','retained_alternative_ids':'M04296; M04297' if name=='ILT J1101+5521' else '', 'M_G_observed_mag':build.absolute(float(c['G_observed_mag']),d),'M_G_lower_from_distance_upper':build.absolute(float(c['G_observed_mag']),hi),'M_G_upper_from_distance_lower':build.absolute(float(c['G_observed_mag']),lo)}
            if method=='Published SED':r['qualifications']='Model-dependent WD+M-dwarf spectrum fit; observed unresolved Gaia light, not extinction corrected; photometric uncertainty separate; ledger wording retained alongside paper-verified interval convention'
            elif name.startswith('GLEAM'):r['qualifications']='Negative, low-significance Gaia parallax (M04402: −0.2227831463 ± 0.98077434 mas); broad prior-sensitive geometric posterior, not a precise empirical distance constraint'
            out.append(r)
    return out

def check(data):
    main={r['source_name']:r for r in build.read('cmd_plot_input.csv')};ms={r['measurement_id']:r for r in build.read('rawdog_measurements.csv')}
    for c in main.values():
        if c['included']!='true':continue
        assert math.isclose(float(c['BP_RP_observed_mag']),float(c['BP_observed_mag'])-float(c['RP_observed_mag']),abs_tol=1e-12)
        if c['BP_error_mag'] and c['RP_error_mag']:
            assert math.isclose(float(c['BP_RP_error_approx_mag']),math.hypot(float(c['BP_error_mag']),float(c['RP_error_mag'])),abs_tol=1e-12)
        records=[ms[x.strip()] for x in c['photometry_measurement_ids'].split(';')]
        for k in ['G_observed_mag','BP_observed_mag','RP_observed_mag']:
            matched=[m for m in records if m['value_numeric'] and math.isclose(float(m['value_numeric']),float(c[k]),abs_tol=1e-4)]
            assert len(matched)==1 and matched[0]['unit']=='mag' and matched[0]['source_id']==c['source_id']
        m=ms[c['distance_measurement_ids']];assert m['unit']=='pc' and math.isclose(float(m['value_numeric']),float(c['distance_pc']),abs_tol=1e-8)
    assert len(data)==4 and len({r['source_id'] for r in data})==2
    for r in data:
        c=main[r['source_name']];m=ms[r['distance_measurement_ids']]
        assert r['source_id']==c['source_id']==m['source_id'] and r['gaia_dr3_id']==c['gaia_dr3_id'] and m['unit']=='pc'
        for k in ['G_observed_mag','BP_observed_mag','RP_observed_mag','BP_RP_observed_mag','photometry_measurement_ids','token']:assert r[k]==c[k]
        assert math.isclose(float(r['BP_RP_observed_mag']),float(r['BP_observed_mag'])-float(r['RP_observed_mag']),abs_tol=1e-12)
        for mid in r['photometry_measurement_ids'].split(';'):assert ms[mid.strip()]['source_id']==r['source_id']
        d,lo,hi=map(float,[r['distance_pc'],r['distance_lower_pc'],r['distance_upper_pc']]);g=float(r['G_observed_mag'])
        assert 0<lo<d<hi and math.isclose(d,float(m['value_numeric']))
        for k,v in [('M_G_observed_mag',d),('M_G_lower_from_distance_upper',hi),('M_G_upper_from_distance_lower',lo)]:assert math.isclose(float(r[k]),g+5-5*math.log10(v),abs_tol=1e-12)
        assert float(r['M_G_lower_from_distance_upper'])<float(r['M_G_observed_mag'])<float(r['M_G_upper_from_distance_lower'])
        if r['comparison_method']=='Gaia geometric':
            for k in ['distance_pc','distance_lower_pc','distance_upper_pc','M_G_observed_mag']:assert float(r[k])==float(c[k])
        else:assert 'p16/p84' in r['distance_uncertainty_convention'] and r['ledger_uncertainty_convention']==m['uncertainty_convention']
    assert ms['M04296']['value_numeric']=='333' and ms['M04297']['value_numeric']=='337'
    assert math.isclose(float(data[1]['M_G_observed_mag']),12.885594,abs_tol=1e-5)
    assert math.isclose(float(data[3]['M_G_observed_mag']),12.619904,abs_tol=1e-5)
    print('PASS: four evidence-linked LPT placements; two members; Gaia unchanged; nonlinear endpoints and retained alternatives.')

def main():
    data=rows();check(data);OUT.mkdir(exist_ok=True)
    plt.rcParams.update({'svg.fonttype':'none','font.family':'DejaVu Sans','font.size':11})
    with (OUT/'lpt_cmd_comparison.csv').open('w',newline='') as f:
        w=csv.DictWriter(f,fieldnames=list(data[0]));w.writeheader();w.writerows(data)
    fig,ax=plt.subplots(figsize=(10,8));fig.subplots_adjust(top=.84,bottom=.20,left=.10,right=.97)
    color=build.STYLES['long_period_transient'][0]
    for r in data:
        x=float(r['BP_RP_observed_mag']);y=float(r['M_G_observed_mag']);gt=r['glyph_token']
        ax.vlines(x,float(r['M_G_lower_from_distance_upper']),float(r['M_G_upper_from_distance_lower']),color=color,lw=1.7).set_gid('bound-'+gt)
        e=float(r['BP_RP_error_approx_mag']);ax.hlines(y,x-e,x+e,color=color,lw=.8,alpha=.65).set_gid('color-'+gt)
        marker='^' if r['comparison_method']=='Gaia geometric' else 's'
        p=ax.scatter([x],[y],marker=marker,s=100,facecolors='none',edgecolors=color,linewidths=1.7,zorder=5)
        p.set_gid('point-'+gt);p.set_urls(['../../index.html#source='+build.urllib.parse.quote(r['source_id'],safe='')])
        ax.annotate(r['comparison_method']+'\n'+str(round(r['distance_pc']))+' pc', (x,y),xytext=(12,-4),textcoords='offset points',fontsize=10).set_gid('bound-'+gt+'-label')
    for a,b in [data[:2],data[2:]]:
        x=float(a['BP_RP_observed_mag']);ax.plot([x,x],[float(a['M_G_observed_mag']),float(b['M_G_observed_mag'])],color=color,ls=':',alpha=.5,zorder=1)[0].set_gid('bound-'+a['glyph_token']+'-connector')
        ax.text(x,6.15,a['source_name'].replace('J0704-37','J0704−37'),ha='center',fontsize=11,fontweight='bold').set_gid('bound-'+a['glyph_token']+'-title')
    ax.set_xlim(1.35,3.1);ax.set_ylim(13.6,5.9);ax.set_xlabel('Observed Gaia BP − RP (mag)');ax.set_ylabel('Absolute Gaia G magnitude (mag)');ax.grid(alpha=.18)
    fig.suptitle('RAWDOG 1.0.0 · LPT distance-method comparison · web r1',fontsize=14)
    ax.set_title('Two systems, four alternative placements · NOT extinction corrected',fontsize=11,pad=12)
    fig.legend(handles=[Line2D([],[],marker=m,markerfacecolor='none',color=color,ls='',label=l) for m,l in [('^','Gaia geometric posterior (main CMD)'),('s','Published SED posterior (model dependent)')]],loc='lower center',bbox_to_anchor=(.5,.08),frameon=False,ncol=2)
    fig.text(.5,.025,'Vertical: recorded p16/p84 distance endpoints transformed at fixed G; G errors separate.\nGLEAM-X Gaia posterior is strongly prior sensitive; symbols do not add catalog members.',ha='center',fontsize=9)
    build.exports(fig,'rawdog_lpt_comparison',data)
    for name,count in [('rawdog_sky',116),('rawdog_cmd',56),('rawdog_lpt_comparison',4)]:
        root=ET.parse(build.FIG/(name+'.svg')).getroot();ids=[e.get('id') for e in root.iter() if e.get('id')]
        assert len(ids)==len(set(ids))
        points=[e for e in root.iter() if e.get('id','').startswith('point-')];assert len(points)==count
        foreground=[e for e in root.iter() if e.get('id','').startswith(('point-','bound-','color-'))]
        assert all(e.get('data-token') and e.get('data-source') for e in foreground)
        if name=='rawdog_lpt_comparison':assert {e.get('data-token') for e in foreground}=={r['token'] for r in data}
    files=sorted(OUT.glob('*.csv'))+sorted(build.FIG.glob('*'))
    (OUT/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(p.read_bytes()).hexdigest()+'  '+str(p.relative_to(ROOT))+'\n' for p in files))
if __name__=='__main__':main()
