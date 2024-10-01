import tvs from '../../../tv.js';

const TV_RENDEMENT_DISTRIBUTION_CH_PROPERTY = 'rendement_distribution_ch';

export class TvsStore {
  /**
   * @param enumTypeEmissionDistributionId {string}
   * @param reseauDistributionIsole {string?}
   * @return {RendementDistributionCh}
   */
  getRendementDistributionCh(enumTypeEmissionDistributionId, reseauDistributionIsole) {
    /**
     *
     * @type {RendementDistributionCh[]}
     */
    const rendement_distribution_ch_list = tvs[TV_RENDEMENT_DISTRIBUTION_CH_PROPERTY];
    return rendement_distribution_ch_list.find((rendement) => {
      const hasTypeEmissionId = rendement.enum_type_emission_distribution_id
        .split('|')
        .includes(enumTypeEmissionDistributionId);
      if (hasTypeEmissionId && reseauDistributionIsole) {
        return rendement.reseau_distribution_isole === reseauDistributionIsole;
      }

      return hasTypeEmissionId;
    });
  }
}
