import { tvs } from './tv.js';
import { mois_liste, Njj } from './utils.js';

export function calc_besoin_ecs_j(ca, mois, zc, nadeq, depensier) {
  // Vérification de l'existence de tvs.tefs[ca][mois][zc]
  const tefsj = tvs.tefs?.[ca]?.[mois]?.[zc];
  if (tefsj === undefined) {
    return 0; // Valeur par défaut en cas de données manquantes
  }

  // Vérification de l'existence de Njj[mois]
  const njj = Njj[mois];
  if (njj === undefined) {
    return 0; // Valeur par défaut en cas de données manquantes
  }

  // Calcul du besoin en fonction du type de consommation
  const facteur = depensier ? 79 : 56;
  return (1.163 * nadeq * facteur * (40 - tefsj) * njj) / 1000;
}

export default function calc_besoin_ecs(ca, zc, nadeq) {
  const ret = {
    besoin_ecs: 0,
    besoin_ecs_depensier: 0
  };
  for (const mois of mois_liste) {
    ret.besoin_ecs += calc_besoin_ecs_j(ca, mois, zc, nadeq, false);
    ret.besoin_ecs_depensier += calc_besoin_ecs_j(ca, mois, zc, nadeq, true);
  }
  return ret;
}
