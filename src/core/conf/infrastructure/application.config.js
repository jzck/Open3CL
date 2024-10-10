export class ApplicationConfig {
  get ademeRepositoryVersion() {
    return 'dpe-mdd-v8.2.1-controle-1.21.8-audit-mdd-v4.4.0-controle-1.9.9-ajout-nom-organisme-qualification';
  }

  get ademeRepositoryUrl() {
    return 'https://gitlab.com/observatoire-dpe/observatoire-dpe';
  }

  get ademeEnumTablesFileUrl() {
    return `${this.ademeRepositoryUrl}/-/raw/${this.ademeRepositoryVersion}/modele_donnee/enum_tables.xlsx?ref_type=tags&inline=false`;
  }

  get ademeValeurTablesFileUrl() {
    return `${this.ademeRepositoryUrl}/-/raw/${this.ademeRepositoryVersion}/modele_donnee/valeur_tables.xlsx?ref_type=tags&inline=false`;
  }

  get solicitationsExtFilePath() {
    return 'src/tv/18.2_sollicitations_ext.ods';
  }

  get c1FilePath() {
    return 'src/tv/18.5_c1.ods';
  }

  get dpeGesLimitValuesFilePath() {
    return 'src/tv/dpe_ges_limit_values.ods';
  }

  get assetsOutputFolder() {
    return 'src';
  }
}
