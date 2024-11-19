import enums from './enums.js';
import {
  tv,
  requestInput,
  requestInputID,
  getKeyByValue,
  bug_for_bug_compat,
  getThicknessFromDescription
} from './utils.js';
import b from './3.1_b.js';

const scriptName = new URL(import.meta.url).pathname.split('/').pop();

function tv_umur0(di, de, du) {
  const matcher = {
    enum_materiaux_structure_mur_id: de.enum_materiaux_structure_mur_id
  };
  if (!['1', '20'].includes(de.enum_materiaux_structure_mur_id.toString())) {
    // 1: inconnu, 20: cloison de platree, pas concerné par les epaisseurs
    // TODO not float, get from csv
    matcher.epaisseur_structure = requestInput(de, du, 'epaisseur_structure', 'float');
    if (!matcher.epaisseur_structure) {
      // BUG: des fois, LICIEL omet le champ 'epaisseur_structure'
      // il faut aller le chercher dans description
      // if desc is "Mur en blocs de béton creux d'épaisseur ≥ 25 cm non isolé donnant sur l'extérieur"
      // retrive just "≥ 25" with a regex
      matcher.epaisseur_structure = getThicknessFromDescription(de.description);
    }
  }
  const row = tv('umur0', matcher, de);
  if (row) {
    di.umur0 = Number(row.umur0);
    de.tv_umur0_id = Number(row.tv_umur0_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur0 !!');
  }
}

function tv_umur(di, de, du, pc_id, zc, effetJoule) {
  if (bug_for_bug_compat && de.tv_umur_id) {
    /**
     * Vérification de la variable effet_joule
     * Certains DPE utilise de manière erronée cette variable. Pour rester cohérent avec le DPE, utilisation de la variable
     * effet_joule telle qu'elle est utilisée dans le DPE
     */
    const rowUmur = tv('umur', {
      tv_umur_id: de.tv_umur_id
    });

    if (rowUmur && rowUmur.effet_joule !== effetJoule) {
      console.error(
        `La variable effet_joule utilisée dans le DPE pour le mur '${de.description}' est ${rowUmur.effet_joule}.
        Celle-ci devrait être ${effetJoule}. La valeur ${rowUmur.effet_joule} est conservée dans la suite des calculs`
      );

      effetJoule = rowUmur.effet_joule;
    }
  }

  const matcher = {
    enum_periode_construction_id: pc_id,
    enum_zone_climatique_id: zc,
    effet_joule: effetJoule
  };
  const row = tv('umur', matcher, de);
  if (row) {
    di.umur = Number(row.umur);
    de.tv_umur_id = Number(row.tv_umur_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour umur !!');
  }
}

function calc_umur0(di, de, du) {
  const umur0_avant = du.umur0_avant;
  const methode_saisie_u0 = requestInput(de, du, 'methode_saisie_u0');
  switch (methode_saisie_u0) {
    case 'type de paroi inconnu (valeur par défaut)':
      de.enum_materiaux_structure_mur_id = getKeyByValue(enums.materiaux_structure_mur, 'inconnu');
      tv_umur0(di, de, du);
      break;
    case 'déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire':
      requestInput(de, du, 'materiaux_structure_mur');
      tv_umur0(di, de, du);
      break;
    case 'saisie direct u0 justifiée à partir des documents justificatifs autorisés':
    case "saisie direct u0 correspondant à la performance de la paroi avec son isolation antérieure iti (umur_iti) lorsqu'il y a une surisolation ite réalisée":
      di.umur0 = requestInput(de, du, 'umur0_saisi', 'float');
      break;
    case 'u0 non saisi car le u est saisi connu et justifié.':
      break;
    default:
      console.warn('methode_saisie_u0 inconnue:', methode_saisie_u0);
  }

  if (de.paroi_ancienne) {
    // le champ `paroi_ancienne` a ete renomme en `enduit_isolant_paroi_ancienne`
    de.enduit_isolant_paroi_ancienne = de.paroi_ancienne;
  }

  let type_doublage = parseInt(de.enum_type_doublage_id);

  // Certaines descriptions contiennent des informations sur le type de doublage
  if (bug_for_bug_compat) {
    if (
      (type_doublage === 1 || type_doublage === 2) &&
      de.description.toLowerCase().indexOf('doublage connu (plâtre, brique, bois') !== -1
    ) {
      type_doublage = 5;
    }
  }

  // 3 - doublage indéterminé ou lame d'air inf 15 mm
  if (type_doublage === 3) {
    di.umur0 = 1 / (1 / di.umur0 + 0.1);
  } else if (type_doublage === 4 || type_doublage === 5) {
    // 4 - doublage indéterminé avec lame d'air sup 15 mm
    // 5 - doublage connu (plâtre brique bois)
    di.umur0 = 1 / (1 / di.umur0 + 0.21);
  }

  if (requestInput(de, du, 'enduit_isolant_paroi_ancienne', 'bool') === 1) {
    if (
      umur0_avant !== undefined &&
      parseFloat(umur0_avant.toFixed(3)) === parseFloat(di.umur0.toFixed(3))
    ) {
      // BUG: 2287E1923356Q utilise paroi_ancienne=1 mais le calcul est fait avec paroi_ancienne=0
      console.warn(`BUG(${scriptName}) correction isolation pour parois anciennes pas appliqué`);
      if (bug_for_bug_compat) di.umur0 = umur0_avant;
      else di.umur0 = 1 / (1 / di.umur0 + 0.7);
    } else {
      di.umur0 = 1 / (1 / di.umur0 + 0.7);
    }
  }

  di.umur0 = Math.min(2.5, di.umur0);
}

export default function calc_mur(mur, zc, pc_id, effetJoule) {
  const de = mur.donnee_entree;
  const du = {};
  const di = {};
  du.umur0_avant = mur.donnee_intermediaire?.umur0; // pour comparaison

  requestInput(de, du, 'surface_paroi_totale', 'float');
  requestInput(de, du, 'orientation');

  b(di, de, du, zc);

  const methode_saisie_u = requestInput(de, du, 'methode_saisie_u');
  switch (methode_saisie_u) {
    case 'non isolé':
      calc_umur0(di, de, du);
      di.umur = Math.min(di.umur0, 2.5);
      break;
    case 'epaisseur isolation saisie justifiée par mesure ou observation':
    case 'epaisseur isolation saisie justifiée à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du);
      const epaisseurIsolation = requestInput(de, du, 'epaisseur_isolation', 'int') * 0.01;

      if (epaisseurIsolation) {
        di.umur = 1 / (1 / Number(di.umur0) + epaisseurIsolation / 0.04);
      } else {
        console.error(
          `Le mur ${mur.donnee_entree.description} ne possède pas de donnée d'entrée pour epaisseur_isolation 
          alors que methode_saisie_u = 'epaisseur isolation saisie'`
        );

        di.umur = Math.min(di.umur0, 2.5);
      }

      break;
    }
    case "resistance isolation saisie justifiée observation de l'isolant installé et mesure de son épaisseur":
    case 'resistance isolation saisie justifiée  à partir des documents justificatifs autorisés': {
      calc_umur0(di, de, du);
      const resistanceIsolation = requestInput(de, du, 'resistance_isolation', 'float');

      if (resistanceIsolation) {
        di.umur = 1 / (1 / Number(di.umur0) + resistanceIsolation);
      } else {
        console.error(
          `Le mur ${mur.donnee_entree.description} ne possède pas de donnée d'entrée pour resistance_isolation 
          alors que methode_saisie_u = 'resistance isolation saisie'`
        );

        di.umur = Math.min(di.umur0, 2.5);
      }

      break;
    }
    case 'isolation inconnue  (table forfaitaire)':
      calc_umur0(di, de, du);
      tv_umur(di, de, du, pc_id, zc, effetJoule);
      di.umur = Math.min(di.umur, di.umur0);
      break;
    case "année d'isolation différente de l'année de construction saisie justifiée (table forfaitaire)": {
      calc_umur0(di, de, du);
      const pi_id = requestInputID(de, du, 'periode_isolation') || pc_id;
      tv_umur(di, de, du, pi_id, zc, effetJoule);
      di.umur = Math.min(di.umur, di.umur0);
      break;
    }
    case 'année de construction saisie (table forfaitaire)': {
      calc_umur0(di, de, du);
      // Si l'année d'isolation est connue, il faut l'utiliser et pas l'année de construction
      let pi_id = de.enum_periode_isolation_id || pc_id;
      if (!de.enum_periode_isolation_id) {
        const pc = enums.periode_construction[pc_id];
        switch (pc) {
          case 'avant 1948':
          case '1948-1974':
            pi_id = parseInt(getKeyByValue(enums.periode_isolation, '1975-1977'), 10);
            break;
        }
      }
      const tv_umur_avant = de.tv_umur_id;
      tv_umur(di, de, du, pi_id, zc, effetJoule);
      if (de.tv_umur_id !== tv_umur_avant && pi_id !== pc_id) {
        console.warn(
          `BUG(${scriptName}) Si année de construction <74 alors Année d'isolation=75-77 (3CL page 13)`
        );
        if (bug_for_bug_compat) tv_umur(di, de, du, pc_id, zc, effetJoule);
      }
      di.umur = Math.min(di.umur, di.umur0);
      break;
    }
    case 'saisie direct u justifiée  (à partir des documents justificatifs autorisés)':
    case 'saisie direct u depuis rset/rsee( etude rt2012/re2020)':
      di.umur = requestInput(de, du, 'umur_saisi', 'float');
      di.umur0 = mur.donnee_intermediaire?.umur0;
      break;
    default:
      console.warn('methode_saisie_u inconnue:', methode_saisie_u);
  }
  mur.donnee_utilisateur = du;
  mur.donnee_intermediaire = di;
}
