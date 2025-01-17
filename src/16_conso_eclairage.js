import enums from './enums.js';

/**
 * Nombre moyen d'heures d'éclairage annuel pour chacune des zones
 * @type {{h1a: number, h1b: number, h1c: number, h2a: number, h2b: number, h2c: number, h2d: number, h3: number}}
 */
const Nh = {
  h1a: 1500,
  h1b: 1445,
  h1c: 1476,
  h2a: 1500,
  h2b: 1531,
  h2c: 1566,
  h2d: 1566,
  h3: 1506
};

/**
 * 16.1 Consommation d’éclairage (Cecl)
 * @param zc_id
 * @returns {number}
 */
export default function calc_conso_eclairage(zc_id) {
  const zc = enums.zone_climatique[zc_id];

  // Coefficient correspondant au taux d'utilisation de l'éclairage en l'absence d'éclairage naturel. Il prend la
  // valeur de 0,9 pour une commande de l’éclairage par interrupteur (considéré dans les logements).
  const C = 0.9;

  // Puissance d’éclairage conventionnelle, égale à 1,4 W/m2
  const Pecl = 1.4;

  // Nombre d’heures de fonctionnement de l’éclairage sur l'année
  const nh = Nh[zc];

  return (C * Pecl * nh) / 1000;
}
