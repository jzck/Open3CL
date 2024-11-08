import enums from './enums.js';
import { tv, requestInput, compareReferences, bug_for_bug_compat } from './utils.js';

function defaultValue(di, de) {
  if (di.k === 0) {
    return 0;
  }

  const row = tv('pont_thermique', {
    tv_pont_thermique_id: de.tv_pont_thermique_id
  });
  return row ? row.k : di.k;
}

function tv_k(pt_di, di, de, du, pc_id, enveloppe) {
  const mur_list = enveloppe.mur_collection.mur || [];
  const pb_list = enveloppe.plancher_bas_collection.plancher_bas || [];
  const ph_list = enveloppe.plancher_haut_collection.plancher_haut || [];
  const bv_list = enveloppe.baie_vitree_collection.baie_vitree || [];
  const porte_list = enveloppe.porte_collection.porte || [];

  const type_liaison = requestInput(de, du, 'type_liaison');

  /**
   * 3.4.4 Refend / mur
   * Lorsque le refend ne sépare pas deux volumes du même lot faisant l’objet du DPE, il faut prendre en compte dans les
   * calculs seulement la moitié de la valeur tabulée ci-dessus.
   * Par défaut on prend 0.5 si la valeur n'est pas spécifiée
   */
  if (type_liaison === 'refend / mur' && !de.pourcentage_valeur_pont_thermique) {
    de.pourcentage_valeur_pont_thermique = 0.5;
  }

  if (!de.reference_1) {
    console.warn(`BUG: pas de reference pour le pont thermique ${de.description}...`);
    // on trouve les references grace a la description
    const desc = de.description;
    let desc_1, desc_2;

    if (desc?.match(/(.+) \/ (.+)/)) {
      desc_1 = desc.match(/(.+) \/ (.+)/)[1];
      desc_2 = desc.match(/(.+) \/ (.+)/)[2];
    } else if (desc?.match(/(.+)-(.+)/)) {
      desc_1 = desc.match(/(.+)-(.+)/)[1];
      desc_2 = desc.match(/(.+)-(.+)/)[2];
    } else {
      di.k = defaultValue(pt_di, de);
      console.error(
        `BUG: description '${desc}' non reconnue pour le pont thermique. 
        La valeur de k est prise dans les données intermédiaires du DPE`
      );
      return;
    }

    let ptMur = mur_list.find(
      (mur) =>
        mur.donnee_entree.description?.includes(desc_1) ||
        mur.donnee_entree.description?.includes(desc_2)
    );
    if (ptMur) {
      de.reference_1 = ptMur.donnee_entree.reference;
    } else {
      di.k = defaultValue(pt_di, de);
      console.error(
        `BUG: descriptions '${desc_1}' ou '${desc_2}' du pont thermique non reconnue dans les descriptions des murs. 
        La valeur de k est prise dans les données intermédiaires du DPE`
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
        console.warn(`Pont thermique ${type_liaison} non supporté`);
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
          men.donnee_entree.description?.includes(desc_2) ||
          men.donnee_entree.description?.includes(desc_1)
      );
      if (ptMur) {
        de.reference_2 = ptMur.donnee_entree.reference;
      } else {
        di.k = defaultValue(pt_di, de);
        console.error(
          `BUG: descriptions '${desc_1}' ou '${desc_2}' du pont thermique non reconnue dans '${type_liaison}'. 
          La valeur de k est prise dans les données intermédiaires du DPE`
        );
        return;
      }
    }
  }

  const mur = mur_list.find(
    (mur) =>
      compareReferences(mur.donnee_entree.reference, de.reference_1) ||
      compareReferences(mur.donnee_entree.reference, de.reference_2)
  );

  const matcher = {
    enum_type_liaison_id: de.enum_type_liaison_id
  };

  const pc = enums.periode_construction[pc_id];

  let type_isolation_mur;

  if (mur) {
    /**
     * 3.4 Calcul des déperditions par les ponts thermiques
     * Les ponts thermiques des parois au niveau des circulations communes ne sont pas pris en compte.
     */
    if (mur && ['14', '15', '16', '22'].includes(mur.donnee_entree.enum_type_adjacence_id)) {
      di.k = 0;
      return;
    }

    type_isolation_mur = requestInput(mur.donnee_entree, mur.donnee_utilisateur, 'type_isolation');

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
          compareReferences(plancher.donnee_entree.reference, de.reference_1) ||
          compareReferences(plancher.donnee_entree.reference, de.reference_2)
      );
      if (!plancher) {
        di.k = defaultValue(pt_di, de);
        console.error(
          `Impossible de trouver un plancher ayant pour référence '${de.reference_1}' ou '${de.reference_2}'. 
          La valeur de k est prise dans les données intermédiaires du DPE`
        );
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
      console.warn(`Pont thermique ${type_liaison} non supporté`);
      break;
    case 'refend / mur':
      break;
    case 'menuiserie / mur': {
      /**
       * 3.4.5 Menuiserie / mu
       * Les ponts thermiques avec les parois en structure bois (ossature bois, rondin de bois, pans de bois) sont négligés.
       * enum_materiaux_structure_mur_id
       * 5 - Murs en pan de bois sans remplissage tout venant
       * 6 - Murs en pan de bois avec remplissage tout venant
       * 7 - Murs bois (rondin)
       * 18 - Murs en ossature bois avec isolant en remplissage ≥ 2006
       * 24 - Murs en ossature bois avec isolant en remplissage 2001-2005
       * 25 - Murs en ossature bois sans remplissage
       * 26 - Murs en ossature bois avec isolant en remplissage <2001
       * 27 - Murs en ossature bois avec remplissage tout venant
       */
      if (
        mur &&
        ['5', '6', '7', '18', '24', '25', '26', '27'].includes(
          mur.donnee_entree.enum_materiaux_structure_mur_id
        )
      ) {
        di.k = 0;
        return;
      }

      // Si isolation ITR, k = 0.2, pas besoin des informations de la fenêtre
      if (type_isolation_mur === 'itr') {
        break;
      }

      const menuiserie_list = bv_list.concat(porte_list);
      const menuiserie = menuiserie_list.find(
        (men) =>
          compareReferences(men.donnee_entree.reference, de.reference_1) ||
          compareReferences(men.donnee_entree.reference, de.reference_2)
      );
      if (!menuiserie) {
        di.k = defaultValue(pt_di, de);
        console.error(
          `Impossible de trouver une menuiserie ayant pour référence '${de.reference_1}' ou '${de.reference_2}'. 
          La valeur de k est prise dans les données intermédiaires du DPE`
        );
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

      if (bug_for_bug_compat) {
        // Certains logiciels n'utilisent le boolean presence_retour_isolation de la même manière
        // 0 = oui pour certains, 1 = oui pour d'autres
        const tvPontThermique = tv('pont_thermique', {
          tv_pont_thermique_id: de.tv_pont_thermique_id
        });

        if (
          tvPontThermique &&
          parseInt(matcher.presence_retour_isolation) !==
            parseInt(tvPontThermique.presence_retour_isolation)
        ) {
          matcher.presence_retour_isolation = parseInt(tvPontThermique.presence_retour_isolation);
        }
      }

      matcher.largeur_dormant = requestInput(mde, mdu, 'largeur_dormant', 'float');
    }
  }

  const row = tv('pont_thermique', matcher);
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

  const methode_saisie_pont_thermique = parseInt(de.enum_methode_saisie_pont_thermique_id);

  /**
   * Si la valeur de k est directement saisie, prendre cette valeur
   * enum_methode_saisie_pont_thermique_id
   * 1 - valeur forfaitaire
   * 2 - valeur justifiée saisie à partir des documents justificatifs autorisés
   * 3 - saisie direct k depuis rset/rsee( etude rt2012/re2020)
   */
  if (methode_saisie_pont_thermique === 1) {
    tv_k(pt.donnee_intermediaire, di, de, du, pc_id, enveloppe);
  } else if (methode_saisie_pont_thermique === 2 || methode_saisie_pont_thermique === 3) {
    if (de.k_saisi) {
      di.k = de.k_saisi;
    } else {
      console.error(
        `Aucune valeur de k_saisi pour le pont thermique '${pt.donnee_entree.reference}' alors que la donnée est saisie`
      );
    }
  } else {
    console.error('methode_saisie_pont_thermique non reconnu:' + methode_saisie_pont_thermique);
  }

  pt.donnee_utilisateur = du;
  pt.donnee_intermediaire = di;
}
