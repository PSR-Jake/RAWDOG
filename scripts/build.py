#!/usr/bin/env python3
"""Build validated source-keyed inputs, figure exports and static source evidence bundles."""
import csv, hashlib, json, math, urllib.parse, xml.etree.ElementTree as ET
from pathlib import Path
from collections import defaultdict
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.lines import Line2D
import numpy as np
from astropy.coordinates import SkyCoord
import astropy.units as u
ROOT=Path(__file__).resolve().parents[1];DATA=ROOT/'data/v1.0.0';FIG=ROOT/'figures/v1.0.0'
STYLES={'magnetic_cv':('#1864ab','o','Magnetic-CV tag'),'cataclysmic_variable':('#087f5b','s','Other CV'),'white_dwarf_pulsar':('#7048a5','D','WD pulsar'),'long_period_transient':('#b95000','^','Long-period transient')}
ADOPTIONS={'CM Phe':'M05626','IX Vel':'M03659','J191213.72-441045.1':'M07093','V1084 Her':'M04045','V347 Pup':'M05703','VV Pup':'M05315'}

def read(name):return list(csv.DictReader((DATA/name).open(encoding='utf-8')))
def write(name,rows):
    with (DATA/name).open('w',newline='',encoding='utf-8') as f:
        w=csv.DictWriter(f,fieldnames=list(rows[0]));w.writeheader();w.writerows(rows)
def number(x):return float(x) if x not in ('',None) else None
def token(sid):return hashlib.sha256(sid.encode()).hexdigest()[:12]
def wrap(lon):return -math.radians((lon+180)%360-180)
def absolute(g,d):return g+5-5*math.log10(d)
def classification(s):
    tags=s['classification_labels'].split('; ')
    group=next(x for x in ['long_period_transient','white_dwarf_pulsar','magnetic_cv','cataclysmic_variable'] if x in tags)
    qualified=s['white_dwarf_host_confidence']!='established' or any(t in (s['magnetic_subclass_or_status']+' '+s['proposed_or_disputed_interpretation']).lower() for t in ['candidate','disputed','unconfirmed','proposed','debated'])
    return group,qualified

def build_inputs(summary,by_source,by_id):
    sky=[];cmd=[]
    for s in summary:
        sid=s['source_id'];records=by_source[sid];group,qualified=classification(s)
        base={'source_id':sid,'source_name':s['source_name'],'gaia_dr3_id':s['gaia_dr3_id'],'token':token(sid),'classification_labels':s['classification_labels'],'display_group':group,'qualified_status':str(qualified).lower(),'white_dwarf_host_confidence':s['white_dwarf_host_confidence']}
        ra=number(s['gaia_ra_icrs_deg']);dec=number(s['gaia_dec_icrs_deg']);fallback=ra is None or dec is None
        if fallback:
            r,d=by_id['M04513'],by_id['M04514'];ra=float(r['value_numeric']);dec=float(d['value_numeric'])
            coord_ids='M04513; M04514';ref=r['reference_key'];frame='Published J2000 coordinates; exact reference-system realization unspecified';epoch=r['epoch_or_state'];note='VLA calibrated radio localization, not a Gaia counterpart. ICRS alignment assumed only for this coarse all-sky transformation; no FK5 or proper-motion propagation asserted. Compare published rounded Galactic position M04521/M04522.'
        else:
            selected=[r for r in records if r['unit'].startswith('deg') and number(r['value_numeric']) is not None and ('ra' in r['parameter'].lower() or 'dec' in r['parameter'].lower() or r['parameter']=='equatorial_position') and (abs(float(r['value_numeric'])-ra)<1e-7 or abs(float(r['value_numeric'])-dec)<1e-7)]
            coord_ids='; '.join(r['measurement_id'] for r in selected);ref='; '.join(sorted(set(r['reference_key'] for r in selected)));frame='ICRS';epoch='J2016.0';note='Audited Gaia DR3 native reference-epoch position; no propagation to epoch 2000.'
        gal=SkyCoord(ra=ra*u.deg,dec=dec*u.deg,frame='icrs').galactic
        sky.append({**base,'included':'true','exclusion_reason':'','ra_deg':ra,'dec_deg':dec,'galactic_l_deg':gal.l.deg,'galactic_b_deg':gal.b.deg,'equatorial_wrapped_rad':wrap(ra),'galactic_wrapped_rad':wrap(gal.l.deg),'coordinate_frame':frame,'coordinate_epoch':epoch,'fallback_status':'literature radio position' if fallback else 'Gaia DR3','coordinate_measurement_ids':coord_ids,'coordinate_reference_keys':ref,'transformation':'Astropy ICRS to Galactic (same selected position); fallback uses declared ICRS-alignment approximation','coordinate_qualification':note})
        g,bp,rp=[number(s[k]) for k in ['gaia_g_mag_observed','gaia_bp_mag_observed','gaia_rp_mag_observed']]
        did=s['distance_measurement_ids'];chosen='Release preferred geometric posterior';reason='Release-selected distance used; no compatibility absolute magnitude consumed.'
        distance=number(s['preferred_distance_pc']);dm=by_id[did.split(';')[0].strip()] if did else None
        if distance is None and s['source_name'] in ADOPTIONS:
            did=ADOPTIONS[s['source_name']];dm=by_id[did];distance=float(dm['value_numeric']);chosen='Plot-specific audited geometric posterior';reason='RC3 scalar withheld by selection rules; source-specific audited geometric posterior selected for this plot only. '+dm['adoption_reason']
        row={**base,'included':'false','exclusion_reason':'','G_observed_mag':g,'BP_observed_mag':bp,'RP_observed_mag':rp,'G_error_mag':number(s['gaia_g_mag_error']),'BP_error_mag':number(s['gaia_bp_mag_error']),'RP_error_mag':number(s['gaia_rp_mag_error']),'BP_RP_observed_mag':None,'BP_RP_error_approx_mag':None,'photometry_measurement_ids':'','photometry_reference_keys':'','distance_pc':distance,'distance_lower_pc':None,'distance_upper_pc':None,'distance_measurement_ids':did,'distance_reference_keys':dm['reference_key'] if dm else '', 'distance_method':dm['method'] if dm else '', 'distance_uncertainty_convention':(s['distance_uncertainty_convention'] or dm['uncertainty_convention'] or 'Uncertainty convention not specified in source') if dm else '', 'selection':chosen if distance else 'No plot distance selected','adoption_reason':reason if distance else '', 'M_G_observed_mag':None,'M_G_lower_from_distance_upper':None,'M_G_upper_from_distance_lower':None,'M_G_photometric_error_mag':number(s['gaia_g_mag_error']),'uncertainty_method':'Recorded distance endpoints transformed nonlinearly at fixed G; retain the recorded interval convention, including unspecified conventions. Posterior quantiles are not Gaussian errors. Photometric error separate. Color error, where both available, approximates independent BP/RP errors in quadrature; covariance and variability ignored.','photometry_status':s['photometry_status'],'qualifications':''}
        phot=[r for r in records if r['unit']=='mag' and 'gaia' in r['reference_key'].lower() and not any(t in r['parameter'].lower() for t in ['absolute','color','colour','minus','error']) and number(r['value_numeric']) is not None and any(abs(float(r['value_numeric'])-v)<1e-4 for v in [g,bp,rp] if v is not None)]
        row['photometry_measurement_ids']='; '.join(r['measurement_id'] for r in phot);row['photometry_reference_keys']='; '.join(sorted(set(r['reference_key'] for r in phot)))
        qual=[]
        if qualified:qual.append('Host/subclass candidate or disputed; inspect source evidence')
        for r in records:
            if r['parameter'].lower()=='ruwe' and number(r['value_numeric']) is not None and float(r['value_numeric'])>1.4:qual.append('Problematic single-source astrometry: RUWE='+r['value_numeric']+' ('+r['measurement_id']+')')
        if distance is not None and dm:
            low=number(dm['lower_bound']);high=number(dm['upper_bound']);em=number(dm['error_minus']);ep=number(dm['error_plus'])
            if low is None and em is not None:low=distance-em
            if high is None and ep is not None:high=distance+ep
            row['distance_lower_pc']=low;row['distance_upper_pc']=high
            qual.append('Bayesian geometric prior; unresolved system photometry and variability')
            if low and high and (high-low)/distance>.5:qual.append('Broad distance posterior; prior sensitivity matters')
        if g is None or bp is None or rp is None:row['exclusion_reason']='No secure Gaia counterpart / complete BP, RP and G photometry; no assumed WD or distance'
        elif distance is None:row['exclusion_reason']='Competing parallax-posterior, photogeometric and SED distances; no preferred scalar. M04666–M04671 retain alternatives; uncertain counterpart and low-significance parallax.'
        elif distance<=0 or any(v is not None and v<=0 for v in [row['distance_lower_pc'],row['distance_upper_pc']]):row['exclusion_reason']='Non-positive distance or endpoint'
        else:
            row['included']='true';row['BP_RP_observed_mag']=bp-rp;row['M_G_observed_mag']=absolute(g,distance)
            for dk,mk in [('distance_upper_pc','M_G_lower_from_distance_upper'),('distance_lower_pc','M_G_upper_from_distance_lower')]:
                if row[dk] is not None:row[mk]=absolute(g,row[dk])
            if row['BP_error_mag'] is not None and row['RP_error_mag'] is not None:row['BP_RP_error_approx_mag']=math.hypot(row['BP_error_mag'],row['RP_error_mag'])
        row['qualifications']='; '.join(qual);cmd.append(row)
    write('sky_plot_input.csv',sky);write('cmd_plot_input.csv',cmd)
    return sky,cmd

def point(ax,row,x,y):
    color,marker,_=STYLES[row['display_group']]
    edge='#1864ab' if row['display_group']=='long_period_transient' and 'magnetic_cv' in row['classification_labels'] else color
    p=ax.scatter([x],[y],s=55,marker=marker,facecolors='none' if row['qualified_status']=='true' else color,edgecolors=edge,linewidths=1.3,zorder=5)
    p.set_gid('point-'+row['token']+'-'+str(len(ax.figure.axes)));p.set_urls(['../../index.html#source='+urllib.parse.quote(row['source_id'],safe='')])

def exports(fig,name,rows):
    FIG.mkdir(parents=True,exist_ok=True)
    for ext in ['svg','pdf','png']:fig.savefig(FIG/(name+'.'+ext),dpi=350)
    plt.close(fig)
    path=FIG/(name+'.svg');tree=ET.parse(path);root=tree.getroot();ns='{http://www.w3.org/2000/svg}';lookup={r['token']:r for r in rows}
    for node in root.iter():
        ident=node.get('id','')
        if ident.startswith(('point-','bound-','color-')):
            r=lookup[ident.split('-')[1]];node.set('data-source',r['source_id']);node.set('data-token',r['token']);title=ET.Element(ns+'title');title.text=r['source_name']+' · '+r['classification_labels']+' · '+r['white_dwarf_host_confidence']+' · '+r.get('qualifications',r.get('coordinate_qualification',''));node.insert(0,title)
            for a in node.iter(ns+'a'):a.set('target','_top');a.set('aria-label','Open '+r['source_name']);a.set('tabindex','0')
    tree.write(path,encoding='unicode',xml_declaration=True)

def legend(fig):
    handles=[Line2D([],[],marker=m,color=c,linestyle='',markersize=7,label=l) for c,m,l in STYLES.values()]
    handles.append(Line2D([],[],marker='o',markerfacecolor='none',color='#333',linestyle='',label='Host/subclass qualified'))
    fig.legend(handles=handles,loc='lower center',ncol=3,frameon=False,fontsize=10)

def plots(sky,cmd):
    plt.rcParams.update({'font.size':11,'svg.fonttype':'none','font.family':'DejaVu Sans','axes.spines.top':False,'axes.spines.right':False})
    fig=plt.figure(figsize=(12,9));fig.subplots_adjust(top=.88,bottom=.14,hspace=.44,left=.08,right=.96)
    for n,(lon,lat,title,label) in enumerate([('ra_deg','dec_deg','Equatorial · Gaia ICRS J2016.0 + one literature radio position','Right ascension (hours; increases leftward)'),('galactic_l_deg','galactic_b_deg','Galactic · transformed from the same selected position','Galactic longitude (degrees; increases leftward)')],1):
        ax=fig.add_subplot(2,1,n,projection='mollweide');ax.grid(alpha=.35,linewidth=.6);ticks=np.arange(-150,180,30);ax.set_xticks(np.radians(ticks));ax.set_xticklabels([str(int((-t)%360/15))+'h' if n==1 else str(int((-t)%360))+'°' for t in ticks]);ax.set_xlabel(label);ax.set_ylabel('Declination' if n==1 else 'Galactic latitude');ax.set_title(title,fontsize=12,pad=16)
        for r in sky:point(ax,r,wrap(r[lon]),math.radians(r[lat]))
    fig.suptitle('RAWDOG 1.0.0 · 58 literature-selected systems',fontsize=16);legend(fig);exports(fig,'rawdog_sky',sky)
    fig,ax=plt.subplots(figsize=(9,9));fig.subplots_adjust(bottom=.18,top=.91,left=.12,right=.96)
    density=read('cmd_background_density.csv');h=np.zeros((220,230))
    for r in density:
        i=round((float(r['bp_rp_left'])+1)/.025);j=round((float(r['M_G_lower'])+5)/.1);h[i,j]=float(r['count'])
    ax.pcolormesh(np.linspace(-1,4.5,221),np.linspace(-5,18,231),np.ma.masked_where(h.T==0,np.log10(h.T+1)),cmap='Greys',vmin=0,vmax=4.5,alpha=.65,rasterized=True)
    used=[r for r in cmd if r['included']=='true']
    for r in used:
        x,y=r['BP_RP_observed_mag'],r['M_G_observed_mag'];color=STYLES[r['display_group']][0]
        if r['M_G_lower_from_distance_upper'] is not None and r['M_G_upper_from_distance_lower'] is not None:ax.vlines(x,r['M_G_lower_from_distance_upper'],r['M_G_upper_from_distance_lower'],color=color,lw=.7,alpha=.6,zorder=4).set_gid('bound-'+r['token'])
        if r['BP_RP_error_approx_mag'] is not None:ax.hlines(y,x-r['BP_RP_error_approx_mag'],x+r['BP_RP_error_approx_mag'],color=color,lw=.7,alpha=.6,zorder=4).set_gid('color-'+r['token'])
        point(ax,r,x,y)
    ax.set_xlim(-1,4.5);ax.set_ylim(18,-5);ax.set_xlabel('Observed Gaia BP − RP (mag)');ax.set_ylabel('Absolute Gaia G magnitude (mag)');ax.grid(alpha=.15);ax.set_title('Unresolved system light · NOT extinction corrected',fontsize=12);fig.suptitle('RAWDOG 1.0.0 · Gaia CMD · 56 / 58 systems',fontsize=16);legend(fig);exports(fig,'rawdog_cmd',used)

def website_data(summary,measurements,sky,cmd):
    out=ROOT/'assets/sources';out.mkdir(parents=True,exist_ok=True)
    tables={name:read(name) for name in ['rawdog_radio_observations.csv','rawdog_review_issues.csv','rawdog_references.csv']}
    refs={r['key']:r for r in tables['rawdog_references.csv']};index=[]
    for s,coord,cm in zip(summary,sky,cmd):
        sid=s['source_id'];record=[r for r in measurements if r['source_id']==sid];obs=[r for r in tables['rawdog_radio_observations.csv'] if r['source_id']==sid];issues=[r for r in tables['rawdog_review_issues.csv'] if r['source_id']==sid]
        keys=set(k.strip() for r in record for k in r['reference_key'].split(';') if k.strip());keys.update(k.strip() for k in s['source_reference_keys'].split(';'))
        data={'summary':s,'observations':obs,'measurements':record,'issues':issues,'references':[refs[k] for k in sorted(keys) if k in refs],'sky':coord,'cmd':cm}
        (out/(coord['token']+'.json')).write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')))
        index.append({'summary':s,'sky':coord,'cmd':cm,'token':coord['token'],'radio_labels':sorted(set(r['radio_evidence_label'] for r in obs))})
    (ROOT/'assets/catalog.json').write_text(json.dumps({'version':'1.0.0','systems':index},ensure_ascii=False,separators=(',',':')))

def main():
    summary=read('rawdog_source_summary.csv');measurements=read('rawdog_measurements.csv');by_source=defaultdict(list)
    for r in measurements:by_source[r['source_id']].append(r)
    sky,cmd=build_inputs(summary,by_source,{r['measurement_id']:r for r in measurements});plots(sky,cmd);website_data(summary,measurements,sky,cmd)
    print('Built sky:',len(sky),'CMD:',sum(r['included']=='true' for r in cmd))
if __name__=='__main__':main()
