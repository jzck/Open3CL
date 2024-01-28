#!/bin/bash
# Usage:
#   ./db.sh _list_dpes
#   ./db.sh _index_one $ID
#   ./db.sh _index_many 87120

TMPDIR=/tmp/dpe
mkdir -p $TMPDIR
GITDIR=$(git rev-parse --show-toplevel)
DB=$GITDIR/test/ademe.db
SQLITE="sqlite3 $DB"

JSON_PATHS="
    .logement.sortie.production_electricite.production_pv \
    .logement.enveloppe.inertie.enum_classe_inertie_id \
    .logement.enveloppe.inertie.enum_classe_inertie_id \
    .logement.sortie.deperdition.deperdition_enveloppe \
    .logement.sortie.apport_et_besoin.surface_sud_equivalente \
    .logement.sortie.apport_et_besoin.nadeq \
    .logement.sortie.apport_et_besoin.apport_interne_ch \
    .logement.sortie.apport_et_besoin.apport_solaire_ch \
    .logement.sortie.apport_et_besoin.besoin_ecs \
    .logement.sortie.apport_et_besoin.besoin_ch \
    .logement.sortie.ef_conso.conso_ecs \
    .logement.sortie.ef_conso.conso_ch \
    .logement.sortie.qualite_isolation.ubat \
    .logement.sortie.apport_et_besoin.v40_ecs_journalier \
    .logement.sortie.confort_ete.enum_indicateur_confort_ete_id \
    .logement.sortie.emission_ges.emission_ges_5_usages_m2 \
    .logement.sortie.ep_conso.ep_conso_5_usages_m2 \
    .logement.sortie.cout.cout_5_usages
    "

_list_dpes() {
    $SQLITE "select dpe_id from dpe order by dpe_id asc;"
}

_list_engine_status() {
    $SQLITE "select dpe_id, engine_status from dpe order by dpe_id asc;"
}

_dl_ademe_json() {
    ID=$1
    ADEMEJSON=$TMPDIR/$ID.json
    # if the file already exists, don't download it again
    if [ -s $TMPDIR/$ID.json ]; then
        return
    fi
    echo "downloading $ID"
    curl --silent "https://observatoire-dpe-audit.ademe.fr/pub/dpe/${ID}/xml" | ./xml_to_json.js > $ADEMEJSON
}

_db_ademe_json() {
    ID=$1
    cat $TMPDIR/$ID.json

    # todo locking problem, can't select while db is open
    return
    $SQLITE "select dpe from dpe where dpe_id='$ID';"
}

_index_one() {
    ID="$1"

    ADEMEJSON=$TMPDIR/$ID.json
    _dl_ademe_json $ID

    echo "inserting $ID"
    $SQLITE "INSERT OR REPLACE INTO dpe(dpe_id, dpe) VALUES('${ID}', readfile('${ADEMEJSON}'));"
}

_index_corpus100() {
    # all IDS in corpus100.txt
    cat corpus100.txt | while read ID; do
        _index_one $ID
    done
}

_index_many() {
    Q=$1
    url=https://data.ademe.fr/data-fair/api/v1/datasets/dpe-v2-logements-existants/lines?q=\"$Q\"

    while [ "$url" != "null" ]; do
        echo $url
        curl -s "$url" | jq -r '.results[]."N°DPE"' | while read ID; do
            _index_one "$ID" &
        done
        wait
        url=$(curl -s "$url" | jq -r '.next')
    done
}

_run_one() {
    ID=$1
    AFTER=$TMPDIR/$ID.open3cl.json
    ERRLOG=$TMPDIR/$ID.err.log

    $GITDIR/test/run_one_dpe.js \
        <(_db_ademe_json $1) \
        >$AFTER \
        2>$ERRLOG
    _compare_one $ID
    $SQLITE "select dpe_id, engine_status from dpe WHERE dpe_id = '${ID}';"
}

_run_all() {
    IDS=$(_list_dpes)
    for ID in $IDS; do
        _run_one $ID
    done
    wait
}

_diff_one() {
    ID=$1
    JSONPATH=$2

    if [ -z "$JSONPATH" ]; then
        JSONPATH="."
    fi

    AFTER=$TMPDIR/$ID.open3cl.json
    _filter() { 
        # remove all objects that have a field named "donnee_utilisateur"
        # and sort the keys alphabetically in objects
        jq -S "$JSONPATH | del(.. | .donnee_utilisateur?)"
    }

    json-diff -Csf <(cat $AFTER | _filter) <(_db_ademe_json $1 | _filter)
}

_compare_one() {
    AFTER=$TMPDIR/$ID.open3cl.json
    ERRLOG=$TMPDIR/$ID.err.log

    _compare() {
        ID=$1
        path=$2

        AFTER=$TMPDIR/$ID.open3cl.json

        num_before=$(_db_ademe_json $ID | jq -r "$path")
        num_after=$(cat $AFTER | jq -r "$path")

        # if they are the same, return 0
        [ "$num_before" = "$num_after" ] && return 0

        diff=$(echo "scale=5; ($num_after - $num_before) / $num_before * 100" | bc | sed 's/-//')
        diff2=$(echo "scale=5; ($num_after - ($num_before/1000)) / ($num_before/1000) * 100" | bc | sed 's/-//')

        [ -z "$diff" ] && return 1
        [ $(echo "$diff > 0.1" | bc) = 1 ] && [ $(echo "$diff2 > 0.1" | bc) = 1 ] && return 1

        return 0
    }

    if [ -s $ERRLOG ]; then
        $SQLITE "update dpe set engine_status = 'errlog: ' || readfile('${ERRLOG}') where dpe_id = '$ID';"
        return
    fi
    if [ ! -f $AFTER ]; then
        $SQLITE "update dpe set engine_status = 'no file' where dpe_id = '$ID';"
        return
    fi
    NUM_PATHS=$(echo $JSON_PATHS | wc -w)
    i=0
    for path in $JSON_PATHS; do
        _compare $ID $path
        result=$?
        # if the result is not 0, update the engine_status column in ademe.db sqlite database
        if [ $result -ne 0 ]; then
            $SQLITE "update dpe set engine_status = 'KO ${i} ${path}' where dpe_id = '$ID';"
            return
        fi
        i=$((i+1))
    done

    # if the result is 0, update the engine_status column in ademe.db sqlite database
    if [ $result -eq 0 ]; then
        $SQLITE "update dpe set engine_status = 'OK' where dpe_id = '$ID';"
    fi
}

_reindex_all() {
    ids=$(_list_dpes)
    for id in $ids; do
        _index_one $id &
    done
}

_init() {
    $SQLITE <init.sql
    _index_corpus100
}

_help() {
    # list all functions in the current file
    grep "^_.*()" $0 | sed 's/()//' | sort
}

# run command if function exists or run _help
if [ -n "$1" ]; then
    "$@"
else
    _help
fi
