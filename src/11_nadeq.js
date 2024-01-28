export function calc_nadeq_individuel(Sh, Nb_lgt) {
  let Shmoy = Sh / Nb_lgt

  var Nmax
  if (Shmoy < 30) Nmax = 1
  else if (Shmoy < 70) Nmax = 1.75 - 0.01875 * (70 - Shmoy)
  else Nmax = 0.025 * Shmoy

  var nadeq
  if (Nmax < 1.75) nadeq = Nb_lgt * Nmax
  else nadeq = Nb_lgt * (1.75 + 0.3 * (Nmax - 1.75))

  return nadeq
}

export function calc_nadeq_collectif(Sh, Nb_lgt) {
  let Shmoy = Sh / Nb_lgt

  var Nmax
  if (Shmoy < 10) Nmax = 1
  else if (Shmoy < 50) Nmax = 1.75 - 0.01875 * (50 - Shmoy)
  else Nmax = 0.035 * Shmoy

  var nadeq
  if (Nmax < 1.75) nadeq = Nb_lgt * Nmax
  else nadeq = Nb_lgt * (1.75 + 0.3 * (Nmax - 1.75))

  return nadeq
}
