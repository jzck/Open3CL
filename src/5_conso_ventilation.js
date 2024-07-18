import { requestInput } from './utils.js';

const pvent_moy_maison = {
  'simple flux auto': {
    0: 65,
    1: 35
  },
  'simple flux hygro': {
    0: 50,
    1: 15
  },
  'double flux': {
    0: 80,
    1: 35
  }
};

const pvent_immeuble = {
  'simple flux auto': {
    0: 0.46,
    1: 0.25
  },
  'simple flux hygro': {
    0: 0.46,
    1: 0.25
  },
  'double flux': {
    0: 1.1,
    1: 0.6
  }
};

/**
 * Retourne le coefficient en fonction du type d'habitation et du type de ventilation
 * @param {string} th Type d'habitation (maison ou autre)
 * @param {boolean} hybride Ventilation hybride ou pas
 *
 * @return {number}
 */
function getCoefficient(th, hybride) {
  if (!hybride) {
    return 1;
  }
  const ratio = th === 'maison' ? 14 : 28;
  return ratio / (24 * 7);
}

export default function calc_pvent(di, de, du, th) {
  const tv = requestInput(de, du, 'type_ventilation');
  let post_2012 = requestInput(de, du, 'ventilation_post_2012', 'bool');

  // can't calculate without these
  if (tv === undefined || post_2012 === undefined) return;

  let hybride = false;
  let type;
  switch (tv) {
    case 'ventilation par ouverture des fenêtres':
    case "ventilation par entrées d'air hautes et basses":
    case 'ventilation naturelle par conduit':
    case "ventilation naturelle par conduit avec entrées d'air hygro":
    case 'puits climatique sans échangeur avant 2013':
    case 'puits climatique sans échangeur à partir de 2013':
    case 'puits climatique avec échangeur avant 2013':
    case 'puits climatique avec échangeur à partir de 2013':
      di.conso_auxiliaire_ventilation = 0;
      return;
    case 'ventilation hybride avant  2001':
    case 'ventilation hybride de 2001 à 2012':
    case 'ventilation hybride après 2012':
    case "ventilation hybride avec entrées d'air hygro avant  2001":
    case "ventilation hybride avec entrées d'air hygro de 2001 à 2012":
    case "ventilation hybride avec entrées d'air hygro après 2012":
      hybride = true;
      post_2012 = 0;
      /**
       * @see Methode_de_calcul_3CL_DPE_2021-338.pdf, pages 41-42
       * Les consommations d’auxiliaires pour une VMC hybride correspondent aux consommations d’une VMC
       * classique autoréglable de 2001 à 2012 multipliées par le ratio du temps d’utilisation
       */
      type = 'simple flux auto';
      break;
    case 'ventilation mécanique sur conduit existant avant 2013':
    case 'ventilation mécanique sur conduit existant à partir de 2013':
    case 'vmc sf auto réglable avant 1982':
    case 'vmc sf auto réglable de 1982 à 2000':
    case 'vmc sf auto réglable de 2001 à 2012':
    case 'vmc sf auto réglable après 2012':
      type = 'simple flux auto';
      break;
    case 'vmc sf gaz avant  2001':
    case 'vmc sf gaz de 2001 à 2012':
    case 'vmc sf gaz après 2012':
      console.error('vmc gaz ??');
      return;
    case 'vmc sf hygro b avant  2001':
    case 'vmc sf hygro b de 2001 à 2012':
    case 'vmc sf hygro b après 2012':
    case 'vmc sf hygro a avant 2001':
    case 'vmc sf hygro a de 2001 à 2012':
    case 'vmc sf hygro a après 2012':
    case 'vmc basse pression auto-réglable':
    case 'vmc basse pression hygro a':
    case 'vmc basse pression hygro b':
      type = 'simple flux hygro';
      break;
    case 'vmc df individuelle avec échangeur avant 2013':
    case 'vmc df individuelle avec échangeur à partir de 2013':
    case 'vmc df collective avec échangeur avant 2013':
    case 'vmc df collective avec échangeur à partir de 2013':
    case 'vmc df sans échangeur avant 2013':
    case 'vmc df sans échangeur après 2012':
      type = 'double flux';
      break;
  }

  const coef = getCoefficient(th, hybride);
  if (th === 'maison') {
    di.pvent_moy = pvent_moy_maison[type][post_2012] * coef;
  } else {
    const pvent = pvent_immeuble[type][post_2012];
    const sv = requestInput(de, du, 'surface_ventile', 'float');
    di.pvent_moy = pvent * di.qvarep_conv * sv * coef;
  }
  di.conso_auxiliaire_ventilation = 8.76 * di.pvent_moy;
}
