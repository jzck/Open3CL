/**
 * Retourne si elle existe la fiche technique de type categoryFicheTechiqueId
 * et contenant le texte description
 * @param dpe {FullDpe}
 * @param categoryFicheTechiqueId {string}
 */
export default function getFicheTechnique(dpe, categoryFicheTechiqueId, description) {
  /** @type {FicheTechniqueItem[]} */
  let fichesTechniques = dpe.fiche_technique_collection.fiche_technique;

  if (!Array.isArray(fichesTechniques)) {
    fichesTechniques = [fichesTechniques];
  }

  fichesTechniques = fichesTechniques.reduce((acc, ficheTechnique) => {
    if (ficheTechnique.enum_categorie_fiche_technique_id === categoryFicheTechiqueId) {
      return acc.concat(ficheTechnique.sous_fiche_technique_collection.sous_fiche_technique);
    }
    return acc;
  }, []);

  if (!fichesTechniques.length) {
    return null;
  }

  const found = fichesTechniques.filter(
    (ficheTechnique) =>
      ficheTechnique &&
      ficheTechnique.description &&
      ficheTechnique.description.toLowerCase().indexOf(description.toLowerCase()) !== -1
  );

  if (!found.length) {
    return null;
  }

  return found[0];
}
