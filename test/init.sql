.timeout 1000

-- create table dpe with columns dpe_id(str) and dpe(json)
create table if not exists dpe(dpe_id text primary key, dpe json, engine_status text);

-- fill corpus100 table with dpe_id from corpus100.txt
create table if not exists corpus100(dpe_id text primary key);
.mode csv
.import corpus100.txt corpus100

-- view for dpes with dpe_id in corpus100.txt
create view if not exists dpe_corpus100 as select * from dpe where dpe_id in (select dpe_id from corpus100);
