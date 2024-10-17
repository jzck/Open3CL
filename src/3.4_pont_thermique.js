import enums from './enums.js';
import { tv, requestInput } from './utils.js';

function tv_k(di, de, du, pc_id, enveloppe) {
  const mur_list = enveloppe.mur_collection.mur || [];
  const pb_list = enveloppe.plancher_bas_collection.plancher_bas || [];
  const ph_list = enveloppe.plancher_haut_collection.plancher_haut || [];
  const bv_list = enveloppe.baie_vitree_collection.baie_vitree || [];
  const porte_list = enveloppe.porte_collection.porte || [];

  const type_liaison = requestInput(de, du, 'type_liaison');

  if (!de.reference_1) {
    console.warn('BUG: pas de reference pour le pont thermique...');
    // on trouve les references grace a la description
    const desc = de.description;
    let desc_1, desc_2;

    if (desc.match(/(.+) \/ (.+)/)) {
      desc_1 = desc.match(/(.+) \/ (.+)/)[1];
      desc_2 = desc.match(/(.+) \/ (.+)/)[2];
    } else if (desc.match(/(.+)-(.+)/)) {
      desc_1 = desc.match(/(.+)-(.+)/)[1];
      desc_2 = desc.match(/(.+)-(.+)/)[2];
    } else {
      console.error(`BUG: description '${desc}' non reconnue pour le pont thermique...`);
      return;
    }

    let ptMur = mur_list.find(
      (mur) =>
        mur.donnee_entree.description.includes(desc_1) ||
        mur.donnee_entree.description.includes(desc_2)
    );
    if (ptMur) {
      de.reference_1 = ptMur.donnee_entree.reference;
    } else {
      console.error(
        `BUG: descriptions '${desc_1}' ou '${desc_2}' du pont thermique non reconnue dans les descriptions des murs`
      );
      return;
    }

    let list_2;
    switch (type_liaison) {
      case 'refend / mur':
        list_2 = null;
        break;
      case 'plancher intermédiaire lourd / mur':
        // TODO
        break;
      case 'plancher bas / mur':
      case 'plancher haut lourd / mur':
        list_2 = pb_list.concat(ph_list);
        break;
      case 'menuiserie / mur':
        list_2 = bv_list.concat(porte_list);
        break;
    }
    if (list_2) {
      ptMur = list_2.find(
        (men) =>
          men.donnee_entree.description.includes(desc_2) ||
          men.donnee_entree.description.includes(desc_1)
      );
      if (ptMur) {
        de.reference_2 = ptMur.donnee_entree.reference;
      } else {
        console.error(
          `BUG: descriptions '${desc_1}' ou '${desc_2}' du pont thermique non reconnue dans '${type_liaison}'`
        );
        return;
      }
    }
  }

  const mur = mur_list.find(
    (mur) =>
      mur.donnee_entree.reference === de.reference_1 ||
      mur.donnee_entree.reference === de.reference_2
  );

  const matcher = {
    enum_type_liaison_id: de.enum_type_liaison_id
  };

  const pc = enums.periode_construction[pc_id];

  if (mur) {
    let type_isolation_mur = requestInput(
      mur.donnee_entree,
      mur.donnee_utilisateur,
      'type_isolation'
    );

    const pi = requestInput(mur.donnee_entree, mur.donnee_utilisateur, 'periode_isolation') || pc;

    if (type_isolation_mur.includes('inconnu')) {
      if (['avant 1948', '1948-1974'].includes(pi)) type_isolation_mur = 'non isolé';
      else type_isolation_mur = 'iti';
    }

    matcher.isolation_mur = `^${type_isolation_mur}$`;
  }

  switch (type_liaison) {
    case 'plancher bas / mur':
    case 'plancher haut lourd / mur': {
      const plancher_list = ph_list.concat(pb_list);
      const plancher = plancher_list.find(
        (plancher) =>
          plancher.donnee_entree.reference === de.reference_1 ||
          plancher.donnee_entree.reference === de.reference_2
      );
      if (!plancher) {
        console.error('Did not find plancher reference:', de.reference_1, de.reference_2);
        return;
      }
      const isolation_plancher = requestInput(
        plancher.donnee_entree,
        plancher.donnee_utilisateur,
        'type_isolation'
      );
      matcher.isolation_plancher = `^${isolation_plancher}$`;
      if (isolation_plancher === 'inconnu') {
        const type_adjacence_plancher = requestInput(
          plancher.donnee_entree,
          plancher.donnee_utilisateur,
          'type_adjacence'
        );

        const pi =
          requestInput(plancher.donnee_entree, plancher.donnee_utilisateur, 'periode_isolation') ||
          pc;

        let cutoff;
        if (type_adjacence_plancher === 'terre-plein') {
          cutoff = ['avant 1948', '1948-1974', '1975-1977', '1978-1982', '1983-1988', '1989-2000'];
        } else cutoff = ['avant 1948', '1948-1974'];

        if (cutoff.includes(pi)) matcher.isolation_plancher = 'non isolé';
        else matcher.isolation_plancher = '^ite$';
      } else if (isolation_plancher === "isolé mais type d'isolation inconnu") {
        matcher.isolation_plancher = '^ite$';
      }
      break;
    }
    case 'plancher intermédiaire lourd / mur':
      // TODO
      break;
    case 'refend / mur':
      // TODO
      break;
    case 'menuiserie / mur': {
      const menuiserie_list = bv_list.concat(porte_list);
      const menuiserie = menuiserie_list.find(
        (men) =>
          men.donnee_entree.reference === de.reference_1 ||
          men.donnee_entree.reference === de.reference_2
      );
      if (!menuiserie) {
        console.error('Did not find menuiserie reference:', de.reference_1, de.reference_2);
        return;
      }
      const mde = menuiserie.donnee_entree;
      const mdu = menuiserie.donnee_utilisateur;

      let type_pose = requestInput(mde, mdu, 'type_pose') || 'tunnel';
      if (type_pose.includes('sans objet')) {
        type_pose = 'tunnel';
      }

      matcher.type_pose = type_pose;
      matcher.presence_retour_isolation = requestInput(
        mde,
        mdu,
        'presence_retour_isolation',
        'bool'
      );
      matcher.largeur_dormant = requestInput(mde, mdu, 'largeur_dormant', 'float');
    }
  }

  const row = tv('pont_thermique', matcher, de);
  if (row) {
    di.k = Number(row.k);
    de.tv_pont_thermique_id = Number(row.tv_pont_thermique_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour pont_thermique (k) !!');
  }
}

export default function calc_pont_thermique(pt, pc_id, enveloppe) {
  const de = pt.donnee_entree;
  const di = {};
  const du = {};

  const methode_saisie_pont_thermique = requestInput(de, du, 'methode_saisie_pont_thermique');

  switch (methode_saisie_pont_thermique) {
    case 'valeur forfaitaire':
      tv_k(di, de, du, pc_id, enveloppe);
      break;
    case 'valeur justifiée saisie à partir des documents justificatifs autorisés':
      di.k = requestInput(de, du, 'k', 'float');
      break;
    case 'saisie direct k depuis rset/rsee( etude rt2012/re2020)':
      break;
    default:
      console.error('methode_saisie_pont_thermique non reconnu:' + methode_saisie_pont_thermique);
  }

  pt.donnee_utilisateur = du;
  pt.donnee_intermediaire = di;
}
