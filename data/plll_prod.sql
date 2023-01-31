set search_path=plll_prod,public;

drop table if exists cbs_buurten;
create table cbs_buurten (like plllbronnen.cbs_buurten);
insert into cbs_buurten 
  select * from plllbronnen.cbs_buurten;

drop table if exists verblijfsobject;

create table verblijfsobject as
select
    v.id,
    v.identificatie,
	openbareruimtenaam,
	huisnummer,
	huisletter,
	huisnummertoevoeging,
	postcode,
	woonplaatsnaam,
	typeadresseerbaarobject,
	v.verblijfsobjectstatus::text,
	string_agg(distinct d."gebruiksdoelverblijfsobject"::text,',' order by d."gebruiksdoelverblijfsobject"::text ASC) gebruiksdoel,
	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	geopunt geom,
	null::geometry(point,28992) geom2
  from plllbronnen.verblijfsobject v   
    join plllbronnen.nummeraanduiding n on (v.hoofdadres = n.identificatie)
     join plllbronnen.openbareruimte o on (n.gerelateerdeopenbareruimte=o.identificatie)
      join plllbronnen.woonplaats w on (o.gerelateerdewoonplaats=w.identificatie)
       join plllbronnen.verblijfsobjectgebruiksdoel d on (v.identificatie=d.identificatie)
		left join plllbronnen.v20230101_v2_csv vvc on (v.identificatie = vvc.pand_bagverblijfsobjectid)
  group by 
  	v.id,
  	v.identificatie,
  	o.openbareruimtenaam,
  	n.huisnummer,
  	n.huisletter,
  	n.huisnummertoevoeging,
  	n.postcode,
  	w.woonplaatsnaam,
  	typeadresseerbaarobject,
  	v."verblijfsobjectstatus", 
  	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
  	geom,
  	geom2
 union
select
    s.id,
    s.identificatie,
	openbareruimtenaam,
	huisnummer,
	huisletter,
	huisnummertoevoeging,
	postcode,
	woonplaatsnaam,
	typeadresseerbaarobject,
	standplaatsstatus::text,
	'woonfunctie' gebruiksdoel,
	st_area(s.geovlak) oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
	st_centroid(s.geovlak) geom,
	st_centroid(s.geovlak) geom2
  from plllbronnen.standplaats s  
    join plllbronnen.nummeraanduiding n2 on (s.hoofdadres = n2.identificatie)
     join plllbronnen.openbareruimte o2 on (n2.gerelateerdeopenbareruimte=o2.identificatie)
      join plllbronnen.woonplaats w2 on (o2.gerelateerdewoonplaats=w2.identificatie)
       left join plllbronnen.v20230101_v2_csv vvc2 on (s.identificatie =vvc2.pand_bagstandplaatsid)
  group by 
  	s.id,
  	s.identificatie,
  	o2.openbareruimtenaam,
  	n2.huisnummer,
  	n2.huisletter,
  	n2.huisnummertoevoeging,
  	n2.postcode,
  	w2.woonplaatsnaam,
  	typeadresseerbaarobject,
  	standplaatsstatus,
  	oppervlakteverblijfsobject,
	pand_opnamedatum,
	pand_opnametype, 
	pand_status, 
	pand_berekeningstype, 
	pand_energieindex, 
	pand_energieklasse, 
	pand_energielabel_is_prive, 
	pand_is_op_basis_van_referentie_gebouw, 
	pand_gebouwklasse, 
	meting_geldig_tot, 
	pand_registratiedatum, 
	pand_detailaanduiding, 
	pand_gebouwtype, 
	pand_gebouwsubtype, 
	pand_projectnaam, 
	pand_projectobject, 
	pand_sbicode, 
	pand_gebruiksoppervlakte_thermische_zone, 
	pand_energiebehoefte, 
	pand_eis_energiebehoefte, 
	pand_primaire_fossiele_energie, 
	pand_eis_primaire_fossiele_energie, 
	pand_primaire_fossiele_energie_emg_forfaitair, 
	pand_aandeel_hernieuwbare_energie, 
	pand_eis_aandeel_hernieuwbare_energie, 
	pand_aandeel_hernieuwbare_energie_emg_forfaitair, 
	pand_temperatuuroverschrijding, 
	pand_eis_temperatuuroverschrijding, 
	pand_warmtebehoefte, 
	pand_energieindex_met_emg_forfaitair,
  	geom,
  	geom2
;

drop table if exists tempspreadpoints;
create table tempspreadpoints as
with pointdump as
(select 
    vp.gerelateerdpand, 
    array_agg(v.identificatie order by v.openbareruimtenaam,v.huisnummer) verblijfsobjecten,  
    st_dump(st_generatepoints(st_buffer(p.geovlak,-1),count(v.identificatie)::int,1234)) dump 
  from plllbronnen.verblijfsobjectpand vp 
    join verblijfsobject v on (vp.identificatie=v.identificatie)
      join plllbronnen.pand p on (vp.gerelateerdpand=p.identificatie and st_intersects(v.geom,p.geovlak))
		group by p.geovlak,vp.gerelateerdpand
			having count(vp.gerelateerdpand) > 1)
select 
    row_number() over (partition by gerelateerdpand order by st_y((dump).geom),st_x((dump).geom)),
    gerelateerdpand, 
	(dump).geom, 
	(verblijfsobjecten)[row_number() over (partition by gerelateerdpand)] verblijfsobject
  from pointdump;
update verblijfsobject set geom2=geom where geom2 is null;
update verblijfsobject v set geom2=s.geom from tempspreadpoints s where v.identificatie = s.verblijfsobject;
drop table tempspreadpoints;

CREATE INDEX verblijfsobjectgeomidx ON plllbronnen.verblijfsobject USING gist (geom);
CREATE INDEX verblijfsobjectgeom2idx ON plllbronnen.verblijfsobject USING gist (geom2);


--- pc6
drop table if exists pc6;
--create table pc6 as

with nummerreeksen as 
(select v2.postcode, v2.openbareruimtenaam || ' ' || min(v2.huisnummer)::text || ' - ' || max(v2.huisnummer) reeks
   from verblijfsobject v2 
     group by v2.postcode, v2.openbareruimtenaam
)
, energielabels as 
(
select v3.postcode, count(v3.pand_energieklasse) aantallabels, v3.pand_energieklasse || '(' || count(v3.pand_energieklasse) ||')' energielabel
  from verblijfsobject v3 
    group by v3.postcode, v3.pand_energieklasse 
      order by v3.postcode
)
select 
 v.postcode,
 count(v.identificatie) verblijfsobjecten,
 string_agg(distinct nr.reeks, ',' order by nr.reeks asc) nummerreeks,
 sum(v.oppervlakteverblijfsobject) verblijfsobjectoppervlak,
 string_agg(distinct el.energielabel, ',' order by el.energielabel desc) labels
  from 
   verblijfsobject v
    join nummerreeksen nr on (v.postcode = nr.postcode)
     join energielabels el on (v.postcode = el.postcode)
      group by v.postcode 

  
-- pand