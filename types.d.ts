interface FullDpe {
  numero_dpe: string;
  statut: string;
  administratif: Administratif;
  logement: Logement;
  descriptif_enr_collection: string;
  descriptif_simplifie_collection: Descriptif_simplifie_collection;
  fiche_technique_collection: Fiche_technique_collection;
  justificatif_collection: Justificatif_collection;
  descriptif_geste_entretien_collection: Descriptif_geste_entretien_collection;
  descriptif_travaux: Descriptif_travaux;
}
interface Administratif {
  dpe_a_remplacer: string;
  motif_remplacement: string;
  dpe_immeuble_associe: string;
  enum_version_id: string;
  date_visite_diagnostiqueur: string;
  date_etablissement_dpe: string;
  enum_modele_dpe_id: string;
  diagnostiqueur: Diagnostiqueur;
  geolocalisation: Geolocalisation;
}
interface Diagnostiqueur {
  usr_logiciel_id: number;
  version_logiciel: string;
  version_moteur_calcul: string;
}
interface Geolocalisation {
  invar_logement: string;
  rpls_log_id: string;
  rpls_org_id: string;
  idpar: string;
  immatriculation_copropriete: string;
  adresses: Adresses;
}
interface Adresses {
  adresse_bien: Adresse_bien;
}
interface Adresse_bien {
  adresse_brut: string;
  code_postal_brut: number;
  nom_commune_brut: string;
  label_brut: string;
  enum_statut_geocodage_ban_id: string;
  ban_date_appel: string;
  ban_id: string;
  ban_label: string;
  ban_housenumber: number;
  ban_street: string;
  ban_citycode: number;
  ban_postcode: number;
  ban_city: string;
  ban_type: string;
  ban_score: number;
  ban_x: number;
  ban_y: number;
  compl_nom_residence: string;
  compl_ref_batiment: string;
  compl_etage_appartement: number;
  compl_ref_cage_escalier: string;
  compl_ref_logement: string;
}
interface Logement {
  caracteristique_generale: Caracteristique_generale;
  meteo: Meteo;
  enveloppe: Enveloppe;
  ventilation_collection: Ventilation_collection;
  climatisation_collection: string;
  production_elec_enr: string;
  installation_ecs_collection: Installation_ecs_collection;
  installation_chauffage_collection: Installation_chauffage_collection;
  sortie: Sortie;
}
interface Caracteristique_generale {
  annee_construction: number;
  enum_periode_construction_id: string;
  enum_methode_application_dpe_log_id: string;
  surface_habitable_logement: number;
  nombre_niveau_logement: number;
  hsp: number;
  nombre_appartement: number;
}
interface Meteo {
  enum_zone_climatique_id: string;
  enum_classe_altitude_id: string;
  batiment_materiaux_anciens: number;
}
interface Enveloppe {
  inertie: Inertie;
  mur_collection: Mur_collection;
  plancher_bas_collection: Plancher_bas_collection;
  plancher_haut_collection: Plancher_haut_collection;
  baie_vitree_collection: Baie_vitree_collection;
  porte_collection: Porte_collection;
  ets_collection: string;
  pont_thermique_collection: string;
}
interface Inertie {
  inertie_plancher_bas_lourd: number;
  inertie_plancher_haut_lourd: number;
  inertie_paroi_verticale_lourd: number;
  enum_classe_inertie_id: string;
}
interface Mur_collection {
  mur: MurItem[];
}
interface MurItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Donnee_entree {
  description: string;
  reference: string;
  reference_lnc?: string;
  tv_coef_reduction_deperdition_id?: number;
  surface_aiu?: number;
  surface_aue?: number;
  enum_cfg_isolation_lnc_id?: string;
  enum_type_adjacence_id?: string;
  enum_orientation_id?: string;
  surface_paroi_totale?: number;
  surface_paroi_opaque?: number;
  tv_umur0_id?: number;
  enum_materiaux_structure_mur_id?: string;
  enum_methode_saisie_u0_id?: string;
  paroi_ancienne?: number;
  enum_type_doublage_id?: string;
  enum_type_isolation_id?: string;
  epaisseur_isolation?: number;
  enum_methode_saisie_u_id?: string;
  tv_upb0_id?: number;
  enum_type_plancher_bas_id?: string;
  enum_periode_isolation_id?: string;
  tv_upb_id?: number;
  calcul_ue?: number;
  tv_uph0_id?: number;
  enum_type_plancher_haut_id?: string;
  tv_uph_id?: number;
  reference_paroi?: string;
  surface_totale_baie?: number;
  nb_baie?: number;
  tv_ug_id?: number;
  enum_type_vitrage_id?: string;
  enum_inclinaison_vitrage_id?: string;
  enum_type_gaz_lame_id?: string;
  epaisseur_lame?: number;
  vitrage_vir?: number;
  enum_methode_saisie_perf_vitrage_id?: string;
  tv_uw_id?: number;
  enum_type_materiaux_menuiserie_id?: string;
  enum_type_baie_id?: string;
  double_fenetre?: number;
  uw_1?: number;
  sw_1?: number;
  enum_type_fermeture_id?: string;
  presence_retour_isolation?: number;
  largeur_dormant?: number;
  tv_sw_id?: number;
  enum_type_pose_id?: string;
  tv_coef_masque_proche_id?: number;
  masque_lointain_non_homogene_collection?: string;
  surface_porte?: number;
  tv_uporte_id?: number;
  enum_methode_saisie_uporte_id?: string;
  enum_type_porte_id?: string;
  nb_porte?: number;
  surface_ventile?: number;
  data_complementaires?: string;
  plusieurs_facade_exposee?: number;
  tv_q4pa_conv_id?: number;
  enum_methode_saisie_q4pa_conv_id?: string;
  tv_debits_ventilation_id?: number;
  enum_type_ventilation_id?: string;
  ventilation_post_2012?: number;
  ref_produit_ventilation?: string;
  enum_cfg_installation_ecs_id?: string;
  enum_type_installation_id?: string;
  enum_methode_calcul_conso_id?: string;
  surface_habitable?: number;
  nombre_logement?: number;
  nombre_niveau_installation_ecs?: number;
  tv_rendement_distribution_ecs_id?: number;
  enum_bouclage_reseau_ecs_id?: string;
  reference_generateur_mixte?: string;
  enum_type_generateur_ecs_id?: string;
  ref_produit_generateur_ecs?: string;
  enum_usage_generateur_id?: string;
  enum_type_energie_id?: string;
  enum_methode_saisie_carac_sys_id?: string;
  tv_pertes_stockage_id?: number;
  identifiant_reseau_chaleur?: string;
  enum_type_stockage_ecs_id?: string;
  position_volume_chauffe?: number;
  volume_stockage?: number;
  surface_chauffee?: number;
  nombre_niveau_installation_ch?: number;
  enum_cfg_installation_ch_id?: string;
  tv_rendement_emission_id?: number;
  tv_rendement_distribution_ch_id?: number;
  tv_rendement_regulation_id?: number;
  enum_type_emission_distribution_id?: string;
  tv_intermittence_id?: number;
  reseau_distribution_isole?: number;
  enum_equipement_intermittence_id?: string;
  enum_type_regulation_id?: string;
  enum_periode_installation_emetteur_id?: string;
  enum_type_chauffage_id?: string;
  enum_temp_distribution_ch_id?: string;
  enum_lien_generateur_emetteur_id?: string;
  ref_produit_generateur_ch?: string;
  enum_type_generateur_ch_id?: string;
  tv_rendement_generation_id?: number;
}
interface Donnee_intermediaire {
  b?: number;
  umur?: number;
  umur0?: number;
  upb?: number;
  upb_final?: number;
  upb0?: number;
  uph?: number;
  uph0?: number;
  ug?: number;
  uw?: number;
  u_menuiserie?: number;
  sw?: number;
  fe1?: number;
  fe2?: number;
  uporte?: number;
  pvent_moy?: number;
  q4pa_conv?: number;
  conso_auxiliaire_ventilation?: number;
  hperm?: number;
  hvent?: number;
  rendement_distribution?: number;
  besoin_ecs?: number;
  besoin_ecs_depensier?: number;
  conso_ecs?: number;
  conso_ecs_depensier?: number;
  ratio_besoin_ecs?: number;
  rendement_generation?: number;
  rendement_stockage?: number;
  besoin_ch?: number;
  besoin_ch_depensier?: number;
  conso_ch?: number;
  conso_ch_depensier?: number;
  i0?: number;
  rendement_emission?: number;
  rendement_regulation?: number;
}
interface Plancher_bas_collection {
  plancher_bas: PlancherBasItem[];
}
interface PlancherBasItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Plancher_haut_collection {
  plancher_haut: PlancherHautItem[];
}
interface PlancherHautItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Baie_vitree_collection {
  baie_vitree: BaieVitreeItem[];
}
interface BaieVitreeItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Porte_collection {
  porte: PorteItem[];
}
interface PorteItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Ventilation_collection {
  ventilation: VentilationItem[];
}
interface VentilationItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Installation_ecs_collection {
  installation_ecs: InstallationEcsItem[];
}
interface InstallationEcsItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
  generateur_ecs_collection: Generateur_ecs_collection;
}
interface Generateur_ecs_collection {
  generateur_ecs: GenerateurEcsItem[];
}
interface GenerateurEcsItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Installation_chauffage_collection {
  installation_chauffage: InstallationChauffageItem[];
}
interface InstallationChauffageItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
  emetteur_chauffage_collection: Emetteur_chauffage_collection;
  generateur_chauffage_collection: Generateur_chauffage_collection;
}
interface Emetteur_chauffage_collection {
  emetteur_chauffage: EmetteurChauffageItem[];
}
interface EmetteurChauffageItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Generateur_chauffage_collection {
  generateur_chauffage: GenerateurChauffageItem[];
}
interface GenerateurChauffageItem {
  donnee_entree: Donnee_entree;
  donnee_intermediaire: Donnee_intermediaire;
}
interface Sortie {
  deperdition: Deperdition;
  apport_et_besoin: Apport_et_besoin;
  ef_conso: Ef_conso;
  ep_conso: Ep_conso;
  emission_ges: Emission_ges;
  cout: Cout;
  production_electricite: Production_electricite;
  sortie_par_energie_collection: Sortie_par_energie_collection;
  confort_ete: Confort_ete;
  qualite_isolation: Qualite_isolation;
}
interface Deperdition {
  hvent: number;
  hperm: number;
  deperdition_renouvellement_air: number;
  deperdition_mur: number;
  deperdition_plancher_bas: number;
  deperdition_plancher_haut: number;
  deperdition_baie_vitree: number;
  deperdition_porte: number;
  deperdition_pont_thermique: number;
  deperdition_enveloppe: number;
}
interface Apport_et_besoin {
  surface_sud_equivalente: number;
  apport_solaire_fr: number;
  apport_interne_fr: number;
  apport_solaire_ch: number;
  apport_interne_ch: number;
  fraction_apport_gratuit_ch: number;
  fraction_apport_gratuit_depensier_ch: number;
  pertes_distribution_ecs_recup: number;
  pertes_distribution_ecs_recup_depensier: number;
  pertes_stockage_ecs_recup: number;
  pertes_generateur_ch_recup: number;
  pertes_generateur_ch_recup_depensier: number;
  nadeq: number;
  v40_ecs_journalier: number;
  v40_ecs_journalier_depensier: number;
  besoin_ch: number;
  besoin_ch_depensier: number;
  besoin_ecs: number;
  besoin_ecs_depensier: number;
  besoin_fr: number;
  besoin_fr_depensier: number;
}
interface Ef_conso {
  conso_ch: number;
  conso_ch_depensier: number;
  conso_ecs: number;
  conso_ecs_depensier: number;
  conso_eclairage: number;
  conso_auxiliaire_generation_ch: number;
  conso_auxiliaire_generation_ch_depensier: number;
  conso_auxiliaire_distribution_ch: number;
  conso_auxiliaire_generation_ecs: number;
  conso_auxiliaire_generation_ecs_depensier: number;
  conso_auxiliaire_distribution_ecs: number;
  conso_auxiliaire_ventilation: number;
  conso_totale_auxiliaire: number;
  conso_fr: number;
  conso_fr_depensier: number;
  conso_5_usages: number;
  conso_5_usages_m2: number;
}
interface Ep_conso {
  ep_conso_ch: number;
  ep_conso_ch_depensier: number;
  ep_conso_ecs: number;
  ep_conso_ecs_depensier: number;
  ep_conso_eclairage: number;
  ep_conso_auxiliaire_generation_ch: number;
  ep_conso_auxiliaire_generation_ch_depensier: number;
  ep_conso_auxiliaire_distribution_ch: number;
  ep_conso_auxiliaire_generation_ecs: number;
  ep_conso_auxiliaire_generation_ecs_depensier: number;
  ep_conso_auxiliaire_distribution_ecs: number;
  ep_conso_auxiliaire_ventilation: number;
  ep_conso_totale_auxiliaire: number;
  ep_conso_fr: number;
  ep_conso_fr_depensier: number;
  ep_conso_5_usages: number;
  ep_conso_5_usages_m2: number;
  classe_bilan_dpe: string;
}
interface Emission_ges {
  emission_ges_ch: number;
  emission_ges_ch_depensier: number;
  emission_ges_ecs: number;
  emission_ges_ecs_depensier: number;
  emission_ges_eclairage: number;
  emission_ges_auxiliaire_generation_ch: number;
  emission_ges_auxiliaire_generation_ch_depensier: number;
  emission_ges_auxiliaire_distribution_ch: number;
  emission_ges_auxiliaire_generation_ecs: number;
  emission_ges_auxiliaire_generation_ecs_depensier: number;
  emission_ges_auxiliaire_distribution_ecs: number;
  emission_ges_auxiliaire_ventilation: number;
  emission_ges_totale_auxiliaire: number;
  emission_ges_fr: number;
  emission_ges_fr_depensier: number;
  emission_ges_5_usages: number;
  emission_ges_5_usages_m2: number;
  classe_emission_ges: string;
}
interface Cout {
  cout_ch: number;
  cout_ch_depensier: number;
  cout_ecs: number;
  cout_ecs_depensier: number;
  cout_eclairage: number;
  cout_auxiliaire_generation_ch: number;
  cout_auxiliaire_generation_ch_depensier: number;
  cout_auxiliaire_distribution_ch: number;
  cout_auxiliaire_generation_ecs: number;
  cout_auxiliaire_generation_ecs_depensier: number;
  cout_auxiliaire_distribution_ecs: number;
  cout_auxiliaire_ventilation: number;
  cout_total_auxiliaire: number;
  cout_fr: number;
  cout_fr_depensier: number;
  cout_5_usages: number;
}
interface Production_electricite {
  production_pv: number;
  conso_elec_ac: number;
  conso_elec_ac_ch: number;
  conso_elec_ac_ecs: number;
  conso_elec_ac_fr: number;
  conso_elec_ac_eclairage: number;
  conso_elec_ac_auxiliaire: number;
  conso_elec_ac_autre_usage: number;
}
interface Sortie_par_energie_collection {
  sortie_par_energie: SortieParEnergieItem[];
}
interface SortieParEnergieItem {
  enum_type_energie_id: string;
  conso_ch: number;
  conso_ecs: number;
  conso_5_usages: number;
  emission_ges_ch: number;
  emission_ges_ecs: number;
  emission_ges_5_usages: number;
  cout_ch: number;
  cout_ecs: number;
  cout_5_usages: number;
}
interface Confort_ete {
  isolation_toiture: number;
  protection_solaire_exterieure: number;
  aspect_traversant: number;
  brasseur_air: number;
  inertie_lourde: number;
  enum_indicateur_confort_ete_id: string;
}
interface Qualite_isolation {
  ubat: number;
  qualite_isol_enveloppe: number;
  qualite_isol_mur: number;
  qualite_isol_plancher_haut_comble_perdu: number;
  qualite_isol_plancher_bas: number;
  qualite_isol_menuiserie: number;
}
interface Descriptif_simplifie_collection {
  descriptif_simplifie: DescriptifSimplifieItem[];
}
interface DescriptifSimplifieItem {
  description: string;
  enum_categorie_descriptif_simplifie_id: string;
}
interface Fiche_technique_collection {
  fiche_technique: FicheTechniqueItem[];
}
interface FicheTechniqueItem {
  enum_categorie_fiche_technique_id: string;
  sous_fiche_technique_collection: Sous_fiche_technique_collection;
}
interface Sous_fiche_technique_collection {
  sous_fiche_technique: SousFicheTechniqueItem[];
}
interface SousFicheTechniqueItem {
  description: string;
  valeur: string | number;
  detail_origine_donnee: string;
  enum_origine_donnee_id: string;
}
interface Justificatif_collection {
  justificatif: Justificatif;
}
interface Justificatif {
  description: string;
  enum_type_justificatif_id: string;
}
interface Descriptif_geste_entretien_collection {
  descriptif_geste_entretien: DescriptifGesteEntretienItem[];
}
interface DescriptifGesteEntretienItem {
  description: string;
  enum_picto_geste_entretien_id: string;
  categorie_geste_entretien: string;
}
interface Descriptif_travaux {
  pack_travaux_collection: Pack_travaux_collection;
  commentaire_travaux: string;
}
interface Pack_travaux_collection {
  pack_travaux: PackTravauxItem[];
}
interface PackTravauxItem {
  enum_num_pack_travaux_id: string;
  conso_5_usages_apres_travaux: number;
  emission_ges_5_usages_apres_travaux: number;
  cout_pack_travaux_min: number;
  cout_pack_travaux_max: number;
  travaux_collection: Travaux_collection;
}
interface Travaux_collection {
  travaux: TravauxItem[];
}
interface TravauxItem {
  description_travaux: string;
  enum_lot_travaux_id: string;
  avertissement_travaux: string;
  performance_recommande: string;
}
