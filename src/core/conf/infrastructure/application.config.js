export class ApplicationConfig {
  get ademeRepositoryVersion() {
    return 'dpe-2.4-audit-2.2';
  }

  get ademeRepositoryUrl() {
    return 'https://gitlab.com/observatoire-dpe/observatoire-dpe';
  }

  get ademeEnumTablesFileUrl() {
    return `${this.ademeRepositoryUrl}/-/raw/${this.ademeRepositoryVersion}/modele_donnee/enum_tables.xlsx?ref_type=heads&inline=false`;
  }

  get ademeValeurTablesFileUrl() {
    return `${this.ademeRepositoryUrl}/-/raw/${this.ademeRepositoryVersion}/modele_donnee/valeur_tables.xlsx?ref_type=heads&inline=false`;
  }

  get solicitationsExtFilePath() {
    return 'src/tv/18.2_sollicitations_ext.ods';
  }

  get c1FilePath() {
    return 'src/tv/18.5_c1.ods';
  }

  get assetsOutputFolder() {
    return 'scripts/assets';
  }
}
