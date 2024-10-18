export class Nadeq {
  /**
   * Return nadeq for maison or individual logement
   * @param surfaceHabitableLogement {number}
   * @returns {number}
   */
  calculateIndividualNadeq(surfaceHabitableLogement) {
    let Nmax;

    if (surfaceHabitableLogement < 30) Nmax = 1;
    else if (surfaceHabitableLogement < 70) Nmax = 1.75 - 0.01875 * (70 - surfaceHabitableLogement);
    else Nmax = 0.025 * surfaceHabitableLogement;

    if (Nmax < 1.75) return Nmax;
    else return 1.75 + 0.3 * (Nmax - 1.75);
  }

  /**
   * Return nadeq for immeuble or collective logement
   * @param surfaceHabitableImmeuble {number}
   * @param nombreAppartement {number}
   * @returns {number}
   */
  calculateCollectiveNadeq(surfaceHabitableImmeuble, nombreAppartement) {
    const Shmoy = surfaceHabitableImmeuble / nombreAppartement;

    let Nmax;
    if (Shmoy < 10) Nmax = 1;
    else if (Shmoy < 50) Nmax = 1.75 - 0.01875 * (50 - Shmoy);
    else Nmax = 0.035 * Shmoy;

    if (Nmax < 1.75) return nombreAppartement * Nmax;
    else return nombreAppartement * (1.75 + 0.3 * (Nmax - 1.75));
  }

  /**
   * Get nadeq for a DPE
   * @param logement {Logement}
   * @returns {number}
   */
  calculateNadeq(logement) {
    /**
     * enum_methode_application_dpe_log_id pour maison individuelle
     * 1 - dpe maison individuelle
     * 14 - dpe issu d'une étude thermique réglementaire RT2012 bâtiment : maison individuelle
     * 18 - dpe issu d'une étude energie environement réglementaire RE2020 bâtiment : maison individuelle
     */
    if (
      [1, 14, 18].includes(
        Number(logement.caracteristique_generale.enum_methode_application_dpe_log_id)
      )
    ) {
      return this.calculateIndividualNadeq(
        logement.caracteristique_generale.surface_habitable_logement
      );
    } else if (
      [2, 3, 4, 5, 31, 32, 35, 36, 37].includes(
        Number(logement.caracteristique_generale.enum_methode_application_dpe_log_id)
      )
    ) {
      /**
       * enum_methode_application_dpe_log_id - pour appartements
       * 2 - dpe appartement individuel chauffage individuel ecs individuel
       * 3 - dpe appartement individuel chauffage collectif ecs individuel
       * 4 - dpe appartement individuel chauffage individuel ecs collectif
       * 5 - dpe appartement individuel chauffage collectif ecs collectif
       * 31 - dpe appartement individuel chauffage mixte (collectif-individuel) ecs individuel
       * 32 - dpe appartement individuel chauffage mixte (collectif-individuel) ecs collectif
       * 35 - dpe appartement individuel chauffage mixte (collectif-individuel) ecs mixte (collectif-individuel)
       * 36 - dpe appartement individuel chauffage individuel ecs mixte (collectif-individuel)
       * 37 - dpe appartement individuel chauffage collectif ecs mixte (collectif-individuel)
       */
      return this.calculateCollectiveNadeq(
        logement.caracteristique_generale.surface_habitable_logement,
        1
      );
    }

    /**
     * enum_methode_application_dpe_log_id - pour immeuble ou DPE appartement généré à partir du DPE immeuble
     */
    return this.calculateCollectiveNadeq(
      logement.caracteristique_generale.surface_habitable_immeuble,
      logement.caracteristique_generale.nombre_appartement
    );
  }
}
