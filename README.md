# Open3cl

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
