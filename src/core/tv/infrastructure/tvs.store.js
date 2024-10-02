import tvs from '../../../tv.js';

const TV_RENDEMENT_DISTRIBUTION_CH_PROPERTY = 'rendement_distribution_ch';

/**
 * @type {RendementDistributionCh[]}
 */
const RENDEMENT_DISTRIBUTION_CH_LIST = tvs[TV_RENDEMENT_DISTRIBUTION_CH_PROPERTY];

export class TvsStore {
  /**
   * @param enumTypeEmissionDistributionId {string}
   * @param reseauDistributionIsole {number?}
   * @return {RendementDistributionCh}
   */
  getRendementDistributionCh(enumTypeEmissionDistributionId, reseauDistributionIsole) {
    return RENDEMENT_DISTRIBUTION_CH_LIST.find((rendement) => {
      const hasTypeEmissionId = rendement.enum_type_emission_distribution_id
        .split('|')
        .includes(enumTypeEmissionDistributionId);

      if (hasTypeEmissionId && reseauDistributionIsole !== undefined) {
        return rendement.reseau_distribution_isole === reseauDistributionIsole.toString();
      }

      return hasTypeEmissionId;
    });
  }

  /**
   * @param tv_rendement_distribution_ch_id {number}
   * @return {RendementDistributionCh}
   */
  getRendementDistributionChById(tv_rendement_distribution_ch_id) {
    return RENDEMENT_DISTRIBUTION_CH_LIST.find(
      (rendement) =>
        rendement.tv_rendement_distribution_ch_id === tv_rendement_distribution_ch_id.toString()
    );
  }
}
