import { tvs } from './tv.js';
import { mois_liste, Njj } from './utils.js';

export function calc_besoin_ecs_j(ca, mois, zc, nadeq, depensier) {
  const tefsj = tvs.tefs[ca][mois][zc];
  const njj = Njj[mois];

  if (depensier) {
    return (1.163 * nadeq * 79 * (40 - tefsj) * njj) / 1000;
  } else {
    return (1.163 * nadeq * 56 * (40 - tefsj) * njj) / 1000;
  }
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
