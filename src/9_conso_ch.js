import { requestInput, requestInputID } from './utils.js';
import { rendement_emission } from './9_emetteur_ch.js';
import { calc_intermittence } from './8_intermittence.js';

function coef_ch(Fch) {
  return {
    'installation de chauffage simple': {
      0: 1,
      1: 1
    },
    'installation de chauffage avec chauffage solaire': {
      0: 1 - Fch
    },
    'installation de chauffage avec insert ou poêle bois en appoint': {
      0: 0.75,
      1: 0.25
    },
    // todo: 2 sdb
    'installation de chauffage par insert, poêle bois (ou biomasse) avec un chauffage électrique dans la salle de bain':
      {
        0: 0.9,
        1: 0.1
      },
    'installation de chauffage avec en appoint un insert ou poêle bois et un chauffage électrique dans la salle de bain (différent du chauffage principal)':
      {
        0: 0.75 * 0.9,
        1: 0.25 * 0.9,
        2: 0.1
      },
    'installation de chauffage avec une chaudière ou une pac en relève d’une chaudière bois': {
      0: 0.75,
      1: 0.25
    },
    'installation de chauffage avec chauffage solaire et insert ou poêle bois en appoint': {
      0: 0.75 * (1 - Fch),
      1: 0.25 * (1 - Fch)
    },
    'installation de chauffage avec chaudière en relève de pac': {
      0: 0.75,
      1: 0.25
    },
    'installation de chauffage avec chaudière en relève de pac avec insert ou poêle bois en appoint':
      {
        0: 0.75 * 0.8,
        1: 0.25 * 0.8,
        2: 0.2
      },
    'installation de chauffage collectif avec base + appoint': {
      0: 0.75 * (1 - Fch),
      1: 0.25 * (1 - Fch)
    },
    'convecteurs bi-jonction': {
      0: 0.6,
      1: 0.4
    }
  };
}

export function conso_ch(di, de, du, _pos, cfg_ch, em_list, GV, Sh, hsp, bch, bch_dep) {
  const gen_lge_id = requestInputID(de, du, 'lien_generateur_emetteur');
  const coef = coef_ch(de.fch || 0.5)[cfg_ch][_pos] || 1;

  const em_filt = em_list.filter(
    (em) => em.donnee_entree.enum_lien_generateur_emetteur_id === gen_lge_id
  );

  const emetteur_eq = em_filt.reduce((acc, em) => {
    const int = calc_intermittence(GV, Sh, hsp, em.donnee_intermediaire.i0);
    const r_em = rendement_emission(em);
    const em_de = em.donnee_entree;
    const em_du = em.donnee_utilisateur;
    const Sc = requestInput(em_de, em_du, 'surface_chauffee', 'float');
    const ratio_s = Sc / Sh;
    const Ich = 1 / r_em;
    return acc + ratio_s * int * Ich;
  }, 0);

  const Ich = emetteur_eq / di.rg;
  const Ich_dep = emetteur_eq / di.rg_dep;
  di.conso_ch = coef * Ich * bch;
  di.conso_ch_depensier = coef * Ich_dep * bch_dep;
}
