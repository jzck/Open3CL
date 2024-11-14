import enums from './enums.js';
import calc_gen_ecs from './14_generateur_ecs.js';
import { tv, requestInput } from './utils.js';

function tv_rendement_distribution_ecs(di, de, du, pvc) {
  let matcher = {};

  if (de.tv_rendement_distribution_ecs_id) {
    matcher['tv_rendement_distribution_ecs_id'] = de.tv_rendement_distribution_ecs_id;
  } else {
    const type_installation = enums.type_installation[de.enum_type_installation_id];

    let configuration_logement;
    if (type_installation.includes('individuelle')) {
      if (pvc === 1) {
        configuration_logement = 'production volume habitable [+] pièces alimentées contiguës';
      } else configuration_logement = 'production hors volume habitable';
    } else if (type_installation.includes('collective')) {
      let type_reseau_collectif;
      if (type_installation.includes('multi-bâtiment')) {
        configuration_logement = 'majorité des logements avec pièces alimentées non contiguës';
      } else {
        configuration_logement = 'majorité des logements avec pièces alimentées contiguës';
      }
      const isole = requestInput(de, du, 'reseau_distribution_isole', 'bool');
      if (isole === 0) {
        type_reseau_collectif = 'Réseau collectif non isolé';
      } else {
        const type_bouclage = requestInput(de, du, 'bouclage_reseau_ecs');
        if (type_bouclage === "réseau d'ecs bouclé") {
          type_reseau_collectif = 'Réseau collectif isolé bouclé';
        } else {
          configuration_logement = null;
          type_reseau_collectif =
            'Réseau collectif isolé avec traçage ou Réseau collectif isolé sans traçage ni bouclage';
        }
      }
      matcher.type_reseau_collectif = type_reseau_collectif;
    }
    if (configuration_logement) matcher.configuration_logement = configuration_logement;
  }

  const row = tv('rendement_distribution_ecs', matcher);
  if (row) {
    di.rendement_distribution = Number(row.rd);
    de.tv_rendement_distribution_ecs_id = Number(row.tv_rendement_distribution_ecs_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour rd !!');
  }
}

export default function calc_ecs(
  dpe,
  ecs,
  becs,
  becs_dep,
  GV,
  ca_id,
  zc_id,
  th,
  virtualisationECS
) {
  const de = ecs.donnee_entree;
  const di = {};
  const du = {};

  // La conso de chaque générateur ECS doit être ramenée au prorata de la surface du logement
  di.ratio_besoin_ecs = 1;
  if (virtualisationECS) {
    di.ratio_besoin_ecs = de.cle_repartition_ecs || 1;
  } else if (de.rdim) {
    di.ratio_besoin_ecs = 1 / de.rdim || 1;
  }

  di.besoin_ecs = becs * di.ratio_besoin_ecs;
  di.besoin_ecs_depensier = becs_dep * di.ratio_besoin_ecs;

  const pvc = ecs.generateur_ecs_collection.generateur_ecs[0].donnee_entree.position_volume_chauffe;
  tv_rendement_distribution_ecs(di, de, du, pvc);

  const gen_ecs_list = ecs.generateur_ecs_collection.generateur_ecs;
  gen_ecs_list.forEach((gen_ecs) => calc_gen_ecs(dpe, gen_ecs, di, de, GV, ca_id, zc_id, th));

  di.conso_ecs = gen_ecs_list.reduce(
    (acc, gen_ecs) => acc + gen_ecs.donnee_intermediaire.conso_ecs,
    0
  );
  di.conso_ecs_depensier = gen_ecs_list.reduce(
    (acc, gen_ecs) => acc + gen_ecs.donnee_intermediaire.conso_ecs_depensier,
    0
  );

  ecs.donnee_intermediaire = di;
  ecs.donnee_utilisateur = du;
}
