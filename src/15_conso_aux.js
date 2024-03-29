import enums from './enums.js'

const G = {
  'chaudière gaz': 20,
  'chaudière fioul': 20,
  'radiateur à gaz': 40
  // TODO chaudiere bois assité par ventilateur: 73.3
}

const H = {
  'chaudière gaz': 1.6,
  'chaudière fioul': 1.6,
  'générateur à air chaud': 4
  // TODO chaudiere bois assité par ventilateur: 10.5
}

export function conso_aux_gen (di, de, type, bch, bch_dep) {
  const type_generateur = enums[`type_generateur_${type}`][de[`enum_type_generateur_${type}_id`]]
  // find key in G that starts with type_generateur_ch
  const g = G[Object.keys(G).find((key) => type_generateur.startsWith(key))] || 0
  const h = H[Object.keys(G).find((key) => type_generateur.startsWith(key))] || 0
  const Paux_g_ch = g + h * (di.pn / 1000)
  di[`conso_auxiliaire_generation_${type}`] = (Paux_g_ch * bch) / di.pn || 0
  di[`conso_auxiliaire_generation_${type}_depensier`] = (Paux_g_ch * bch_dep) / di.pn || 0
}
