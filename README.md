# Open3CL

Le méthode 3CL, décrite dans [ce PDF](https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf), est la base de calcul pour les DPE.

Open3CL est un projet d'exploration pour mieux comprendre le DPE et la méthode de calcul 3CL, il est encore en développement, veuillez suivre [la progression ici](./test/).

## Modèle de données

Les DPE dans la base de l'ademe sont au format XML. Open3CL fonctionne en json, car c'est un format plus simple pour travailler au quotidien. Le fichier [xml_to_json.js](./test/xml_to_json.js) permet de transformer un DPE xml en format json utilisable par Open3CL.

## Resources

 - [PDF Méthode 3CL v1.3](https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf)
 - [Gitlab Observatoire DPE](https://gitlab.com/observatoire-dpe/observatoire-dpe/-/blob/master/README.md) 
 - [Légifrance valeurs GES](https://www.legifrance.gouv.fr/download/pdf?id=doxMrRr0wbfJVvtWjfDP4gHzzERt1iX0PtobthCE6A0=)
 - [CSTB Procédure de certification](https://www.google.com/url?sa=t&rct=j&q=&esrc=s&source=web&cd=&cad=rja&uact=8&ved=2ahUKEwjH-fG2-s7_AhXLaqQEHTP8CwMQFnoECA4QAQ&url=https%3A%2F%2Frt-re-batiment.developpement-durable.gouv.fr%2FIMG%2Fpdf%2Freglement_evaluation_logiciel_dpe_2021_-_audit_energetique-13122022_v2.pdf&usg=AOvVaw3SWv8drhqbgMMT8K9m6a2C&opi=89978449)
 - [Valeurs des étiquettes énergétiques](https://docs.google.com/spreadsheets/d/1QVXUOLP8aJukA-PLBGyVB0ZJTWmLEE1WbflXUfsT_jU/edit#gid=0)

## Quelques DPE intéressants

En travaillant sur les DPE je suis tombé sur quelques cas de DPE intéressants

- `2307E3075089A` chaudiere a condensation + climatiseur
- `2362E3036179P` poele a charbon
- `2369E2991011Q` 1 radiateur à gaz + fenetres avec masques lointains
- `2387E2923777K` pas d’ECS, pas de portes
- `2387E3092820B` pas de pancher_haut
- `2387E3074987E` bouclage ECS
- `2387E1742056P` 2 emetteur ch
- `2387E2899635W` 2 installation_ch
- `2387E0576340J` 2 gen ch
- `2387E2058698D` ventil hybride
- `2387E2603968B` inertie lourde + parois ancienne (différentes periode de chauffe)
- `2344E2258429L` DPE generé a partir des données immeuble
- `2387E0402213E` methode_application 'maison_individuelle' mais les portes sont saisie depuis une étude rt2012/rt2020
- `2387E3103505A` Analysimmo 4.1.1 incohérence pont thermique, PB considéré pont ITI+ITE ??
- `2387E3103131Q` Analysimmo 4.1.1 incohérence ventil calculée comme si presence_joint_menuiserie=1 alors qu’aucune menuiserie n’a de joints
