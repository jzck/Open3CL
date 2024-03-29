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

export default function calc_conso_eclairage (zc_id) {
  const zc = enums.zone_climatique[zc_id]

  const C = 0.9
  const Pecl = 1.4
  const Cecl = (C * Pecl * Nh[zc]) / 1000
  return Cecl
}
