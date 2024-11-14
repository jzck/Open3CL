/**
 * Retourne si elle existe la fiche technique contenant le texte description et
 * présente dans la catégorie de fiches techniques ayant pour catégorie categoryFicheTechiqueId
 * et contenant la valeur classification
 * @param dpe {FullDpe}
 * @param categoryFicheTechiqueId {string}
 * @param description {string}
 * @param classification {string | null}
 */
export default function getFicheTechnique(
  dpe,
  categoryFicheTechiqueId,
  description,
  classification = null
) {
  /** @type {FicheTechniqueItem[]} */
  let fichesTechniques = dpe.fiche_technique_collection.fiche_technique;

  if (!Array.isArray(fichesTechniques)) {
    fichesTechniques = [fichesTechniques];
  }

  fichesTechniques = fichesTechniques
    .filter((ficheTechnique) => ficheTechnique)
    .reduce((acc, ficheTechnique) => {
      if (ficheTechnique.enum_categorie_fiche_technique_id === categoryFicheTechiqueId) {
        /**
         * Plusieurs collections de fiches techniques peuvent exister pour la même catégorie (pour 2 systèmes ECS par exemple)
         * Le champs classification permet de trouver la collection qui convient en filtrant sur une seconde donnée
         */
        if (classification) {
          /** @type {SousFicheTechniqueItem[]} */
          let sousFichesTechniques =
            ficheTechnique.sous_fiche_technique_collection.sous_fiche_technique;

          if (!Array.isArray(sousFichesTechniques)) {
            sousFichesTechniques = [sousFichesTechniques];
          }

          const secondFiche = sousFichesTechniques.filter((ficheTechnique) => {
            const valeur = ficheTechnique?.valeur;

            if (typeof valeur === 'string') {
              return (
                ficheTechnique.valeur.toLowerCase().indexOf(classification.toLowerCase()) !== -1
              );
            }

            return ficheTechnique.valeur === classification;
          });

          if (!secondFiche.length) {
            return acc;
          }
        }

        return acc.concat(ficheTechnique.sous_fiche_technique_collection.sous_fiche_technique);
      }
      return acc;
    }, []);

  if (!fichesTechniques.length) {
    return null;
  }

  const firstFiche = fichesTechniques.filter(
    (ficheTechnique) =>
      ficheTechnique &&
      ficheTechnique.description &&
      ficheTechnique.description.toLowerCase().indexOf(description.toLowerCase()) !== -1
  );

  if (!firstFiche.length) {
    return null;
  }

  return firstFiche[0];
}
