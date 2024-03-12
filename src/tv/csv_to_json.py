#!/usr/bin/env python3

import csv, json, sys
a = [dict(r) for r in csv.DictReader(sys.stdin)]

all_columns = list(a[0].keys())
left_columns = [ k for k in all_columns if k in ['mois', 'zc', 'classe_altitude', 'ilpa']]

f = {}

def fill(f, val, *keys):
    if len(keys) == 1:
        f[keys[0]] = float(val)
        return
    if keys[0] not in f:
        f[keys[0]] = {}
    fill(f[keys[0]], val, *keys[1:])
    return

for row in a:
    d1 = {k: row[k] for k in left_columns}
    d2 = {k: row[k] for k in all_columns if k not in left_columns}
    for k in d2:
        fill(f, d2[k], *d1.values(), k)

print(json.dumps(f, sort_keys=True, indent=2))
