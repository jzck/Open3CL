import enums from './enums.js'

const Nh = {
  h1a: 1500,
  h1b: 1445,
  h1c: 1476,
  h2a: 1500,
  h2b: 1531,
  h2c: 1566,
  h2d: 1566,
  h3: 1506
}

export default function calc_conso_eclairage(zc_id) {
  let zc = enums.zone_climatique[zc_id]

  let C = 0.9
  let Pecl = 1.4
  let Cecl = (C * Pecl * Nh[zc]) / 1000
  return Cecl
}
