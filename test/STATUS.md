# ETAT DES RESULTATS

Un ensemble de [DPE](corpus.json) est analysé.

Les valeurs "sorties" du fichier d'origine sont comparées avec les values "sorties" obtenues après analyse par le moteur Open3CL.
On considère comme valable un écart jusqu'à 0,5% afin de compenser les arrondis, plus précis dans la librairie.

## Affinage des tests

- Trouver des cas avec production d'energie
- Trouver des cas avec de la production de froid

## Exclusion de DPE

Certains DPE sont manifestement erronés. Pour ne pas nuire aux tests automatisés, ils sont déplacés de `corpus.json` vers `wrong-corpus.json` afin de conserver une tracabilité.

## Résultats

### sorties.deperdition

| sortie                         | taux de succès          |
| ------------------------------ | ----------------------- |
| deperdition_baie_vitree        | 100% :white_check_mark: |
| deperdition_enveloppe          | %                       |
| deperdition_mur                | %                       |
| deperdition_plancher_bas       | %                       |
| deperdition_plancher_haut      | %                       |
| deperdition_pont_thermique     | %                       |
| deperdition_porte              | 100% :white_check_mark: |
| deperdition_renouvellement_air | %                       |
| hperm                          | %                       |
| hvent                          | 100% :white_check_mark: |

### sorties.apport_et_besoin

| sortie                                  | taux de succès          |
| --------------------------------------- | ----------------------- |
| surface_sud_equivalente                 | 100% :white_check_mark: |
| apport_solaire_fr                       | %                       |
| apport_interne_fr                       | %                       |
| apport_solaire_ch                       | %                       |
| apport_interne_ch                       | %                       |
| fraction_apport_gratuit_ch              | %                       |
| fraction_apport_gratuit_depensier_ch    | %                       |
| pertes_distribution_ecs_recup           | %                       |
| pertes_distribution_ecs_recup_depensier | %                       |
| pertes_stockage_ecs_recup               | %                       |
| pertes_generateur_ch_recup              | %                       |
| pertes_generateur_ch_recup_depensier    | %                       |
| nadeq                                   | 100% :white_check_mark: |
| v40_ecs_journalier                      | 100% :white_check_mark: |
| v40_ecs_journalier_depensier            | 100% :white_check_mark: |
| besoin_ch                               | %                       |
| besoin_ch_depensier                     | %                       |
| besoin_ecs                              | 100% :white_check_mark: |
| besoin_ecs_depensier                    | 100% :white_check_mark: |
| besoin_fr                               | %                       |
| besoin_fr_depensier                     | %                       |

### sorties.ef_conso

| sortie                                    | taux de succès          |
| ----------------------------------------- | ----------------------- |
| conso_ch                                  | %                       |
| conso_ch_depensier                        | %                       |
| conso_ecs                                 | %                       |
| conso_ecs_depensier                       | %                       |
| conso_eclairage                           | 100% :white_check_mark: |
| conso_auxiliaire_generation_ch            | %                       |
| conso_auxiliaire_generation_ch_depensier  | %                       |
| conso_auxiliaire_distribution_ch          | %                       |
| conso_auxiliaire_generation_ecs           | %                       |
| conso_auxiliaire_generation_ecs_depensier | %                       |
| conso_auxiliaire_distribution_ecs         | %                       |
| conso_auxiliaire_distribution_fr          | %                       |
| conso_auxiliaire_ventilation              | %                       |
| conso_totale_auxiliaire                   | %                       |
| conso_fr                                  | %                       |
| conso_fr_depensier                        | %                       |
| conso_5_usages                            | %                       |
| conso_5_usages_m2                         | %                       |

### sorties.emission_ges

| sortie                                           | taux de succès          |
| ------------------------------------------------ | ----------------------- |
| emission_ges_ch                                  | %                       |
| emission_ges_ch_depensier                        | %                       |
| emission_ges_ecs                                 | %                       |
| emission_ges_ecs_depensier                       | %                       |
| emission_ges_eclairage                           | 100% :white_check_mark: |
| emission_ges_auxiliaire_generation_ch            | %                       |
| emission_ges_auxiliaire_generation_ch_depensier  | %                       |
| emission_ges_auxiliaire_distribution_ch          | %                       |
| emission_ges_auxiliaire_generation_ecs           | %                       |
| emission_ges_auxiliaire_generation_ecs_depensier | %                       |
| emission_ges_auxiliaire_distribution_ecs         | %                       |
| emission_ges_auxiliaire_distribution_fr          | %                       |
| emission_ges_auxiliaire_ventilation              | %                       |
| emission_ges_totale_auxiliaire                   | %                       |
| emission_ges_fr                                  | %                       |
| emission_ges_fr_depensier                        | %                       |
| emission_ges_5_usages                            | %                       |
| emission_ges_5_usages_m2                         | %                       |
| classe_emission_ges                              | %                       |

### sorties.cout

| sortie                                   | taux de succès |
| ---------------------------------------- | -------------- |
| cout_ch                                  | %              |
| cout_ch_depensier                        | %              |
| cout_ecs                                 | %              |
| cout_ecs_depensier                       | %              |
| cout_eclairage                           | %              |
| cout_auxiliaire_generation_ch            | %              |
| cout_auxiliaire_generation_ch_depensier  | %              |
| cout_auxiliaire_distribution_ch          | %              |
| cout_auxiliaire_generation_ecs           | %              |
| cout_auxiliaire_generation_ecs_depensier | %              |
| cout_auxiliaire_distribution_ecs         | %              |
| cout_auxiliaire_distribution_fr          | %              |
| cout_auxiliaire_ventilation              | %              |
| cout_total_auxiliaire                    | %              |
| cout_fr_depensier                        | %              |
| cout_5_usages                            | %              |

### sorties.production_electricite

| sortie                    | taux de succès          |
| ------------------------- | ----------------------- |
| production_pv             | 100% :white_check_mark: |
| conso_elec_ac             | 100% :white_check_mark: |
| conso_elec_ac_ch          | 100% :white_check_mark: |
| conso_elec_ac_ecs         | 100% :white_check_mark: |
| conso_elec_ac_fr          | 100% :white_check_mark: |
| conso_elec_ac_eclairage   | 100% :white_check_mark: |
| conso_elec_ac_auxiliaire  | 100% :white_check_mark: |
| conso_elec_ac_autre_usage | 100% :white_check_mark: |

### sorties.confort_ete

| sortie                         | taux de succès |
| ------------------------------ | -------------- |
| isolation_toiture              | %              |
| protection_solaire_exterieure  | %              |
| aspect_traversant              | %              |
| brasseur_air                   | %              |
| inertie_lourde                 | %              |
| enum_indicateur_confort_ete_id | %              |

### sorties.sortie_par_energie

| sortie                    | taux de succès |
| ------------------------- | -------------- |
| sortie_par_energie        | %              |
| conso_elec_ac             | %              |
| conso_elec_ac_ch          | %              |
| conso_elec_ac_ecs         | %              |
| conso_elec_ac_fr          | %              |
| conso_elec_ac_eclairage   | %              |
| conso_elec_ac_auxiliaire  | %              |
| conso_elec_ac_autre_usage | %              |

### sorties.qualite_isolation

| sortie                                    | taux de succès |
| ----------------------------------------- | -------------- |
| ubat                                      | %              |
| qualite_isol_enveloppe                    | %              |
| qualite_isol_mur                          | %              |
| qualite_isol_plancher_haut_toit_terrasse  | %              |
| qualite_isol_plancher_haut_comble_perdu   | %              |
| qualite_isol_plancher_haut_comble_amenage | %              |
| qualite_isol_plancher_bas                 | %              |
| qualite_isol_menuiserie                   | %              |
