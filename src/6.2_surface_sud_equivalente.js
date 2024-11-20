import enums from './enums.js';
import tvs from './tv.js';
import { mois_liste } from './utils.js';

export function calc_sse_j(bv_list, zc, mois) {
  const c1 = tvs.c1;

  const ssej = bv_list.reduce((acc, bv) => {
    const type_adjacence = enums.type_adjacence[bv.donnee_entree.enum_type_adjacence_id];
    /**
     * @TODO implémenter les facteurs solaires pour les espaces tampons solarisés
     * 6.3 Traitement des espaces tampons solarisés
     */
    if (
      type_adjacence !== 'extérieur' &&
      type_adjacence !== 'espace tampon solarisé (véranda,loggia fermée)'
    )
      return acc;
    const de = bv.donnee_entree;
    const di = bv.donnee_intermediaire;

    const orientation = enums.orientation[de.enum_orientation_id];
    const inclinaison = enums.inclinaison_vitrage[de.enum_inclinaison_vitrage_id];
    let oi = `${orientation} ${inclinaison}`;
    if (inclinaison === 'horizontal') oi = 'horizontal';
    const c1j = c1[zc][mois][oi];

    const fe1 = di.fe1;
    const fe2 = di.fe2;
    const ssei = acc + de.surface_totale_baie * c1j * di.sw * fe1 * fe2;
    return ssei;
  }, 0);
  return ssej;
}

export function calc_sse(zc, bv_list) {
  const sse = mois_liste.reduce((acc, mois) => acc + calc_sse_j(bv_list, zc, mois), 0);
  return sse;
}
