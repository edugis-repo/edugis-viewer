-- pc6 locations
-- host: leda.geodan.nl
-- db: research
create table plll.pc6points as
with pc6centroids as
(select st_centroid(st_union(st_force2d(a.geopunt))) punt, count(postcode) adressen, postcode 
  from bag_laatst.adres a join plll.wijken w2 on (st_intersects(a.geopunt, w2.geom ))
 	group by postcode)
select c.postcode, c.adressen,a3.geom 
  from pc6centroids c 
cross join lateral (select 
    st_force2d(a2.geopunt) geom from 
      bag_laatst.adres a2 order by a2.geopunt <-> c.punt limit 1) a3;


-- dakdelen
create table dakdelen_pll as 
  select * 
    from dakdelen d 
      where st_intersects(d.geom, st_transform(st_union(
        -- het lage land
        st_geomfromgeojson('{"coordinates": [[[4.535422325134277,51.93732672638376],[4.532154387019631,51.94660245519745],[4.532303880153506,51.95053388439783],[4.550741366665449,51.95326725314072],
[4.556246995925903,51.94054790877274],[4.535422325134277,51.93732672638376]]],"type": "Polygon"}'),
        -- prinsenland
        st_geomfromgeojson('{"coordinates": [[[4.535420306137098,51.93732575720483],[4.539101895589852,51.92819196529314],[4.562934196549065,51.931832272836516],
[4.561932107112284,51.93407541493622],[4.561082509545969,51.93463954081136],[4.558228733106091,51.93617070386449],[4.556246338784803,51.94054900459233],
[4.535420306137098,51.93732575720483]]],"type": "Polygon"}')
      ),28992));

-- export using qgis wfs https://ows.gis.rotterdam.nl/cgi-bin/mapserv.exe?map=d:%5Cgwr%5Cwebdata%5Cmapserver%5Cmap%5Cbbdwh_pub.map,
-- layer 'bomen naar geslacht' using map extent for Prinsenland / Het Lage Land
-- import into database using https://leda.geodan.nl:8090/admin/upload.html
-- then
drop table if exists plll.bomengeslacht;
create table plll.bomengeslacht as select id, st_transform(geom,28992) geom, geslacht,ontwikkelingsfase,wijk,straat,beheerder,eigenaar,
boomstatus,bestemming,aanlegjaar::int,diameter::float,kroonomvang::int,hoogte,takvrije_zone,conditie,boombeeld,ontwikkeling,verwachte_levensduur,herstelvermogen
from anneb.rotterdambomengeslacht r where st_intersects(geom, st_union(
          -- het lage land
        st_geomfromgeojson('{"coordinates": [[[4.535422325134277,51.93732672638376],[4.532154387019631,51.94660245519745],[4.532303880153506,51.95053388439783],[4.550741366665449,51.95326725314072],
[4.556246995925903,51.94054790877274],[4.535422325134277,51.93732672638376]]],"type": "Polygon"}'),
        -- prinsenland
        st_geomfromgeojson('{"coordinates": [[[4.535420306137098,51.93732575720483],[4.539101895589852,51.92819196529314],[4.562934196549065,51.931832272836516],
[4.561932107112284,51.93407541493622],[4.561082509545969,51.93463954081136],[4.558228733106091,51.93617070386449],[4.556246338784803,51.94054900459233],
[4.535420306137098,51.93732575720483]]],"type": "Polygon"}')
));

--- view verblijfsobjecten
CREATE OR REPLACE VIEW plll.verblijfsobjecten
AS SELECT DISTINCT vg.identifica AS identificatie,
    vg.oppervlakt AS oppervlakte,
    vg.status,
    vg.gebruiksdo AS gebruiksdoel,
    vg.openbare_r AS straat,
    vg.huisnummer,
    vg.huisletter,
    vg.toevoeging,
    vg.postcode,
    vg.bouwjaar,
    vg.pandidenti AS pandidentificatie,
    vg.gas21,
    vg.gas21_cor,
    vg.elek21,
    vg.label,
    vg.gebouwtype,
    bv.wkb_geometry AS geom
   FROM plll.bag_verblijfsobjecten bv
     LEFT JOIN plll.vrblfobj_geodata vg ON bv.identifica::text = vg.identifica::text;


-- pc6_energverbruik21_2
drop table if exists pc6_energverbruik21_2; 
create table pc6_energverbruik21_2 as
  select  
  	postcode,
  	count(v.postcode) aantal_adres,
  	sum(v.oppervlakte) opp_totaal,
  	avg(v.oppervlakte) opp_gem,
	string_agg(distinct v.gebruiksdoel, ', ') gebruiksdoelen,
	string_agg(distinct v.bouwjaar::text,', ') bouwjaren,
	avg(v.gas21::float) gas21_gem,
	sum(v.gas21::float) gas21_totaal,
	sum(v.gas21::float) / sum(v.oppervlakte) gas21_m2,
	avg(v.gas21_cor::float) gas21_cor_gem,
	sum(v.gas21_cor::float) gas21_cor_totaal,
	sum(v.gas21_cor::float) / sum(v.oppervlakte) gas21_cor_m2,
	avg(v.elek21::float) elek21_gem,
	sum(v.elek21::float) elek21_totaal,
	sum(v.elek21::float) / sum(v.oppervlakte) elek21_m2,
	string_agg(distinct v."label", ', ') labels,
	string_agg(distinct v.gebouwtype, ', ') gebouwtypes,
    p.geom
  	  from verblijfsobjecten v join pc6_energverbruik21 p on (v.postcode=p.pc6)
  	   where not v.gas21='.'
    group by postcode,p.geom;


-- group verblijfsobjecten by building, postcode, street
select 
	openbareruimtenaam, 
	count(huisnummer) aantaladressen, 
	min(huisnummer) huisnummervanaf,
	max(huisnummer) huisnummertot,
	--huisnummertoevoeging , 
	postcode, 
	string_agg(distinct woonplaatsnaam, ';') wonoplaatsnaam, 
	string_agg(distinct gemeentenaam, ';') gemeentenaam , 
	min(provincienaam) provincienaam, 
	string_agg(distinct verblijfsobjectgebruiksdoel,';') gebruiksdoel , 
	sum(oppervlakteverblijfsobject) somoppervlakteverblijfsobject, 
	string_agg(distinct "typeadresseerbaarobject",';') typeadresseerbaarobject, 
	string_agg(distinct "verblijfsobjectstatus", ';') verblijfsobjectstatus, 
	count(adresseerbaarobject) aantaladressen, 
	pandid, 
	"pandstatus", 
	pandbouwjaar, 
	--nummeraanduiding, 
	--nevenadres, 
	st_union(st_force2d(geopunt)) geom
from adres_full v 
where
st_intersects(v.geopunt, st_transform(st_union(
        -- het lage land
        st_geomfromgeojson('{"coordinates": [[[4.535422325134277,51.93732672638376],[4.532154387019631,51.94660245519745],[4.532303880153506,51.95053388439783],[4.550741366665449,51.95326725314072],
[4.556246995925903,51.94054790877274],[4.535422325134277,51.93732672638376]]],"type": "Polygon"}'),
        -- prinsenland
        st_geomfromgeojson('{"coordinates": [[[4.535420306137098,51.93732575720483],[4.539101895589852,51.92819196529314],[4.562934196549065,51.931832272836516],
[4.561932107112284,51.93407541493622],[4.561082509545969,51.93463954081136],[4.558228733106091,51.93617070386449],[4.556246338784803,51.94054900459233],
[4.535420306137098,51.93732575720483]]],"type": "Polygon"}')
      ),28992))
     group by pandid, pandstatus, pandbouwjaar,postcode,openbareruimtenaam  having count(adresseerbaarobject) > 1;
     
-- vwpc6geb_energverbruik21
drop view if exists vwpc6geb_energverbruik21;
create view vwpc6geb_energverbruik21 as
select 
    pe.postcode,
    pe.aantal_adres,
    pe.opp_totaal,
    pe.opp_gem,
    pe.gebruiksdoelen,
    pe.bouwjaren,
    pe.gas21_gem,
    pe.gas21_totaal,
    pe.gas21_m2,
    pe.gas21_cor_gem,
    pe.gas21_cor_totaal,
    pe.gas21_cor_m2,
    pe.elek21_gem,
    pe.elek21_totaal,
    pe.elek21_m2,
    pe.labels,
    pe.gebouwtypes,
    pgs.gem_hh_gr,
    pgs.p_koopwon,
    pgs.p_huurwon, 
	pgs.geom
	from pc6_gebied_soceco pgs join pc6_energverbruik21_2 pe  on pgs.pc6 = pe.postcode;


====
-- plll.energielabels202221201 definition

-- Drop table
drop table if exists cbs_buurten;
create table cbs_buurten as 
    select 
      ogc_fid,
      bu_code,
      bu_naam naam, 
      aant_inw,
      aant_man,
      aant_vrouw,
      aantal_hh,
      p_eenp_hh,
      p_hh_z_k,
      p_hh_m_k,
      gem_hh_gr,
      st_transform(geom,28992) geom 
    from anneb.cbs_wijken cw;

-- DROP TABLE plll.energielabels202221201;

CREATE TABLE plll.energielabels202221201 (
	pand_opnamedatum timestamp NULL,
	pand_opnametype varchar(16) NULL,
	pand_status varchar NULL,
	pand_berekeningstype varchar NULL,
	pand_energieindex varchar NULL,
	pand_energieklasse varchar NULL,
	pand_energielabel_is_prive varchar NULL,
	pand_is_op_basis_van_referentie_gebouw int4 NULL,
	pand_gebouwklasse varchar NULL,
	meting_geldig_tot timestamp NULL,
	pand_registratiedatum timestamp NULL,
	pand_postcode varchar(7) NULL,
	pand_huisnummer varchar NULL,
	pand_huisnummer_toev varchar NULL,
	pand_detailaanduiding varchar NULL,
	pand_bagverblijfsobjectid varchar(16) NULL,
	pand_bagligplaatsid varchar(16) NULL,
	pand_bagstandplaatsid varchar(16) NULL,
	pand_bagpandid varchar(16) NULL,
	pand_gebouwtype varchar NULL,
	pand_gebouwsubtype varchar NULL,
	pand_projectnaam varchar NULL,
	pand_projectobject varchar NULL,
	pand_sbicode varchar NULL,
	pand_gebruiksoppervlakte_thermische_zone float4 NULL,
	pand_energiebehoefte float4 NULL,
	pand_eis_energiebehoefte float4 NULL,
	pand_primaire_fossiele_energie float4 NULL,
	pand_eis_primaire_fossiele_energie float4 NULL,
	pand_primaire_fossiele_energie_emg_forfaitair float4 NULL,
	pand_aandeel_hernieuwbare_energie float4 NULL,
	pand_eis_aandeel_hernieuwbare_energie float4 NULL,
	pand_aandeel_hernieuwbare_energie_emg_forfaitair varchar NULL,
	pand_temperatuuroverschrijding float4 NULL,
	pand_eis_temperatuuroverschrijding float4 NULL,
	pand_warmtebehoefte float4 NULL,
	pand_energieindex_met_emg_forfaitair varchar NULL
);
-- download csv file from https://www.ep-online.nl/PublicData
-- Geodan API-Key: Rjk3MTdEMkY5RUI0NUY0QkE1OUVENkZGNDM1RTExM0Y2QkU4NzUxQjBDRTA1QzM3OUY3QzA2N0Y3Rjc0MzREOTlFRDlCQzZFRkMxMTg0MzhENTEyRkNENDY3RTI3MUQ3

copy energielabels202221201(pand_opnamedatum, pand_opnametype, pand_status, pand_berekeningstype, pand_energieindex, pand_energieklasse, pand_energielabel_is_prive, pand_is_op_basis_van_referentie_gebouw, pand_gebouwklasse, meting_geldig_tot, pand_registratiedatum, pand_postcode, pand_huisnummer, pand_huisnummer_toev, pand_detailaanduiding, pand_bagverblijfsobjectid, pand_bagligplaatsid, pand_bagstandplaatsid, pand_bagpandid, pand_gebouwtype, pand_gebouwsubtype, pand_projectnaam, pand_projectobject, pand_sbicode, pand_gebruiksoppervlakte_thermische_zone, pand_energiebehoefte, pand_eis_energiebehoefte, pand_primaire_fossiele_energie, pand_eis_primaire_fossiele_energie, pand_primaire_fossiele_energie_emg_forfaitair, pand_aandeel_hernieuwbare_energie, pand_eis_aandeel_hernieuwbare_energie, pand_aandeel_hernieuwbare_energie_emg_forfaitair, pand_temperatuuroverschrijding, pand_eis_temperatuuroverschrijding, pand_warmtebehoefte, pand_energieindex_met_emg_forfaitair)
  from '/home/anneb/v20221201_csv.csv' delimiter ';' CSV HEADER;

--- work in progress, prepare table plll.verblijfsobjecten
drop sequence if exists verblijfsobjectenseq;
create sequence verblijfsobjectenseq;
drop table if exists verblijfsobjecten;
create table verblijfsobjecten as
with gebruiksfuncties as
 (select 
 	v.identificatie,  
 	v.oppervlakteverblijfsobject, 
 	v.verblijfsobjectstatus,
 	v.hoofdadres,
 	string_agg(v2.gebruiksdoelverblijfsobject::varchar, ',' order by gebruiksdoelverblijfsobject) gebruiksdoel,
 	v.geopunt 
  from bag20221203.verblijfsobjectactueelbestaand v 
	join cbs_buurten b 
	  on st_intersects(v.geopunt, b.geom) 
	join bag20221203.verblijfsobjectgebruiksdoelactueelbestaand v2
	  on v.identificatie = v2.identificatie
	group by v.identificatie, v.oppervlakteverblijfsobject, v.verblijfsobjectstatus,v.hoofdadres, v.geopunt 
  )
select
  nextval('verblijfsobjectseq') ogc_fid, 
  v.identificatie, 
  v.oppervlakteverblijfsobject, 
  v."verblijfsobjectstatus", 
  o.openbareruimtenaam,
  v.hoofdadres,
  v.gebruiksdoel,
  a.huisnummer,
  a.huisletter,
  a.huisnummertoevoeging,
  a.postcode,
  w.woonplaatsnaam,
  v2.gerelateerdpand,
  p.bouwjaar,
  p.pandstatus,
  v.geopunt geom
	from gebruiksfuncties v 
		left join bag20221203.nummeraanduidingactueelbestaand a 
		  on (v.hoofdadres=a.identificatie)
		left join bag20221203.openbareruimte o
		  on (a.gerelateerdeopenbareruimte=o.identificatie)
		left join bag20221203.woonplaats w 
		  on (o.gerelateerdewoonplaats=w.identificatie)
		join bag20221203.verblijfsobjectpandactueelbestaand v2 
		  on (v.identificatie=v2.identificatie)
		join bag20221203.pandactueelbestaand p 
		  on (v2.gerelateerdpand=p.identificatie and st_intersects(p.geovlak,v.geopunt))
;
create index verblijfsobjectengeomidx on verblijfsobjecten using gist(geom);