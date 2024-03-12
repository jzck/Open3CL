# Progression

Pour le moment, on évalue le moteur par comparaison avec des DPE éxistants, on a selectioné 100 DPE dans la base de donnée de l'ademe (voir [corpus100.txt](./corpus100.txt)).

Pour chacuns de ces DPE, on fait le calcul avec notre moteur, puis on compare les valeurs des champs de sortie avec les valeurs originales (calculées par des moteurs certifiés).

```
100% .logement.sortie.apport_et_besoin.v40_ecs_journalier
100% .logement.sortie.apport_et_besoin.surface_sud_equivalente
100% .logement.sortie.apport_et_besoin.nadeq
100% .logement.sortie.apport_et_besoin.besoin_ecs
77% .logement.sortie.qualite_isolation.ubat
75% .logement.sortie.deperdition.deperdition_renouvellement_air
69% .logement.sortie.deperdition.deperdition_enveloppe
45% .logement.sortie.ef_conso.conso_ecs
37% .logement.sortie.apport_et_besoin.besoin_ch
33% .logement.sortie.emission_ges.emission_ges_5_usages_m2
13% .logement.sortie.ef_conso.conso_ch
10% .logement.sortie.ep_conso.ep_conso_5_usages_m2
2% .logement.sortie.cout.cout_5_usages
```
