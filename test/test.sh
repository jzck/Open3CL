#!/bin/bash
# Usage:
#   ./test.sh _download_one $ID 
#   ./test.sh _run_one $ID
#   ./test.sh _diff_one $ID
# Pour regéner la progression:
#   ./test.sh _corpus100_download
#   ./test.sh _corpus100_run
#   ./test.sh _corpus100_show_progress

TMPDIR=/tmp/dpe
mkdir -p $TMPDIR
GITDIR=$(git rev-parse --show-toplevel)

JSON_PATHS="
    .logement.sortie.production_electricite.production_pv \
    .logement.enveloppe.inertie.enum_classe_inertie_id \
    .logement.sortie.deperdition.deperdition_renouvellement_air \
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

_download_one() {
    ID=$1
    ADEMEJSON=$TMPDIR/$ID.json
    # if the file already exists, don't download it again
    if [ -s $TMPDIR/$ID.json ]; then
        return
    fi
    echo "downloading $ID"
    curl --silent "https://observatoire-dpe-audit.ademe.fr/pub/dpe/${ID}/xml" | ./xml_to_json.js > $ADEMEJSON
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
    BEFORE=$TMPDIR/$ID.json
    ERRLOG=$TMPDIR/$ID.err.log

    echo $ID running
    time $GITDIR/test/run_one_dpe.js \
        $BEFORE \
        >$AFTER \
        2>$ERRLOG
    echo $ID comparing
    time _compare_one $ID
    echo $ID done
}

_diff_one() {
    ID=$1
    JSONPATH=$2

    if [ -z "$JSONPATH" ]; then
        JSONPATH="."
    fi

    AFTER=$TMPDIR/$ID.open3cl.json
    BEFORE=$TMPDIR/$ID.json
    _filter() { 
        # remove all objects that have a field named "donnee_utilisateur"
        # and sort the keys alphabetically in objects
        jq -S "$JSONPATH | del(.. | .donnee_utilisateur?)"
    }

    json-diff -Csf <(cat $BEFORE | _filter) <(cat $AFTER | _filter)
}

_compare_one() {
    ID=$1
    AFTER=$TMPDIR/$ID.open3cl.json
    ERRLOG=$TMPDIR/$ID.err.log
    OKPATHS=$TMPDIR/$ID.ok

    _compare() {
        ID=$1
        path=$2

        BEFORE=$TMPDIR/$ID.json
        AFTER=$TMPDIR/$ID.open3cl.json

        # if path not in before return 0, missing in original
        num_before=$(jq -er "$path" $BEFORE) || return 0
        num_after=$(jq -r "$path" $AFTER)

        # if they are the same, return 0
        [ "$num_before" = "$num_after" ] && return 0

        diff=$(echo "scale=5; ($num_after - $num_before) / $num_before * 100" | bc | sed 's/-//')
        diff2=$(echo "scale=5; ($num_after - ($num_before/1000)) / ($num_before/1000) * 100" | bc | sed 's/-//')

        [ -z "$diff" ] && return 1
        [ $(echo "$diff > 0.1" | bc) = 1 ] && [ $(echo "$diff2 > 0.1" | bc) = 1 ] && return 1

        return 0
    }

    good_paths=""
    for path in $JSON_PATHS; do
        _compare $ID $path && good_paths+=" $path"
    done

    echo $good_paths > $OKPATHS
}

_corpus100_download() {
    # all IDS in corpus100.txt
    cat corpus100.txt | while read ID; do
        _download_one $ID
    done
}

_corpus100_run() {
    IDS=$(cat corpus100.txt)
    for ID in $IDS; do
        _run_one $ID &
    done
    wait
}

_corpus100_show_progress() {
    cat /tmp/dpe/*.ok | tr '[:space:]' '\n' | sort | uniq -c |  sort -nr | awk '{printf "%s%% %s\n", $1, $2}'
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
