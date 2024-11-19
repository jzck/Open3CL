import enums from './enums.js';
import b from './3.1_b.js';
import { tv, requestInput, getKeyByValue, bug_for_bug_compat } from './utils.js';

function tv_uph0(di, de, du) {
  requestInput(de, du, 'type_plancher_haut');
  const matcher = {
    enum_type_plancher_haut_id: de.enum_type_plancher_haut_id
  };
  const row = tv('uph0', matcher, de);
  if (row) {
    di.uph0 = Number(row.uph0);
    de.tv_uph0_id = Number(row.tv_uph0_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uph0 !!');
  }
}

function tv_uph(di, de, du, pc_id, zc, effetJoule) {
  const type_adjacence = requestInput(de, du, 'type_adjacence');
  const type_ph = requestInput(de, du, 'type_plancher_haut');
  let type_toiture;

  // From "3CL-DPE 2021" page 21 => "Lorsque le local au-dessus du logement est un local non chauffé, ou un local autre que d’habitation., Uph_tab est pris dans la catégorie « Terrasse »."
  if (type_adjacence === 'locaux non chauffés non accessible') {
    type_toiture = 'terrasse';
  } else if (type_adjacence !== 'extérieur') {
    type_toiture = 'combles';
  } else {
    if (type_ph === 'combles aménagés sous rampant') type_toiture = 'combles';
    else type_toiture = 'terrasse';
  }

  if (bug_for_bug_compat && de.tv_uph_id) {
    /**
     * Pour certains DPE le type d'adjacence du plancher haut n'est pas bien défini.
     * On va le récupérer depuis les données d'entrée si besoin
     */
    const rowUph = tv('uph', {
      tv_uph_id: de.tv_uph_id
    });

    if (rowUph) {
      if (rowUph.type_toiture === 'combles' && rowUph.type_toiture !== type_toiture) {
        console.error(
          `Le type d'adjacence pour le plancher haut ${de.description} ne correspond pas aux données saisies (${rowUph.type_toiture})`
        );
        type_toiture = rowUph.type_toiture;
      }

      if (rowUph.effet_joule !== effetJoule) {
        console.error(
          `La variable effet_joule utilisée dans le DPE pour le plancher haut '${de.description}' est ${rowUph.effet_joule}.
        Celle-ci devrait être ${effetJoule}. La valeur ${rowUph.effet_joule} est conservée dans la suite des calculs`
        );

        effetJoule = rowUph.effet_joule;
      }
    }
  }

  const matcher = {
    enum_periode_construction_id: pc_id,
    enum_zone_climatique_id: zc,
    effet_joule: effetJoule,
    type_toiture
  };
  const row = tv('uph', matcher);
  if (row) {
    di.uph = Number(row.uph);
    de.tv_uph_id = Number(row.tv_uph_id);
  } else {
    console.error('!! pas de valeur forfaitaire trouvée pour uph !!');
  }
}

function calc_uph0(di, de, du) {
  const methode_saisie_u0 = requestInput(de, du, 'methode_saisie_u0');
  switch (methode_saisie_u0) {
    case 'type de paroi inconnu (valeur par défaut)':
    case 'déterminé selon le matériau et épaisseur à partir de la table de valeur forfaitaire':
      tv_uph0(di, de, du);
      break;
    case 'saisie direct u0 justifiée à partir des documents justificatifs autorisés':
    case "saisie direct u0 correspondant à la performance de la paroi avec son isolation antérieure iti (umur_iti) lorsqu'il y a une surisolation ite réalisée":
      di.uph0 = requestInput(de, du, 'uph0_saisi');
      break;
    case 'u0 non saisi car le u est saisi connu et justifié.':
      break;
    default:
      console.warn('methode_saisie_u0 inconnue:', methode_saisie_u0);
  }
}

export default function calc_ph(ph, zc, pc_id, effetJoule) {
  const de = ph.donnee_entree;
  const du = {};
  const di = {};
  di.uph0 = ph.donnee_intermediaire.uph0;

  b(di, de, du, zc);

  const methode_saisie_u = requestInput(de, du, 'methode_saisie_u');

  switch (methode_saisie_u) {
    case 'non isolé':
      calc_uph0(di, de, du);
      di.uph = di.uph0;
      break;
    case 'epaisseur isolation saisie justifiée par mesure ou observation':
    case 'epaisseur isolation saisie justifiée à partir des documents justificatifs autorisés': {
      const e = requestInput(de, du, 'epaisseur_isolation', 'int') * 0.01;
      calc_uph0(di, de, du);
      di.uph = 1 / (1 / di.uph0 + e / 0.04);
      break;
    }
    case "resistance isolation saisie justifiée observation de l'isolant installé et mesure de son épaisseur":
    case 'resistance isolation saisie justifiée  à partir des documents justificatifs autorisés': {
      const r = requestInput(de, du, 'resistance_isolation', 'float');
      calc_uph0(di, de, du);
      di.uph = 1 / (1 / di.uph0 + r);
      break;
    }
    case 'isolation inconnue  (table forfaitaire)':
    case "année d'isolation différente de l'année de construction saisie justifiée (table forfaitaire)":
      tv_uph(di, de, du, de.enum_periode_isolation_id || pc_id, zc, effetJoule);
      calc_uph0(di, de, du);
      di.uph = Math.min(di.uph, di.uph0);
      break;
    case 'année de construction saisie (table forfaitaire)': {
      let pi_id = pc_id;
      if (de.enum_periode_isolation_id) {
        pi_id = de.enum_periode_isolation_id;
      } else {
        const pc = enums.periode_construction[pc_id];
        switch (pc) {
          case 'avant 1948':
          case '1948-1974':
            pi_id = getKeyByValue(enums.periode_isolation, '1975-1977');
            break;
        }
      }
      calc_uph0(di, de, du);
      tv_uph(di, de, du, pi_id, zc, effetJoule);
      di.uph = Math.min(di.uph, di.uph0);
      break;
    }
    case 'saisie direct u justifiée  (à partir des documents justificatifs autorisés)':
    case 'saisie direct u depuis rset/rsee( etude rt2012/re2020)':
      di.uph = requestInput(de, du, 'uph_saisi', 'float');
      break;
    default:
      console.warn('methode_saisie_u inconnue:', methode_saisie_u);
  }

  ph.donnee_utilisateur = du;
  ph.donnee_intermediaire = di;
}
