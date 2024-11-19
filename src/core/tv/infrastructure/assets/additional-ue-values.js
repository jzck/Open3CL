export const UPB_ADDITIONAL_VALUES = [
  {
    type_adjacence_plancher: 'terre plein bâtiment construit avant 2001',
    enum_periode_construction_id: '1|2|3|4|5|6',
    periode_construction: '<2001',
    type_adjacence: 'terre-plein',
    enum_type_adjacence_id: '5',
    values: [
      { '2s_p': '1', upb: '3.4', ue: '0.98' },
      { '2s_p': '1', upb: '1.5', ue: '0.66' },
      { '2s_p': '1', upb: '0.85', ue: '0.49' },
      { '2s_p': '1', upb: '0.59', ue: '0.39' },
      { '2s_p': '1', upb: '0.46', ue: '0.34' },
      { '2s_p': '2', upb: '3.4', ue: '0.88' },
      { '2s_p': '2', upb: '1.5', ue: '0.61' },
      { '2s_p': '2', upb: '0.85', ue: '0.46' },
      { '2s_p': '2', upb: '0.59', ue: '0.37' },
      { '2s_p': '2', upb: '0.46', ue: '0.32' }
    ]
  },
  {
    type_adjacence_plancher: 'terre plein bâtiment construit à partir de 2001',
    enum_type_adjacence_id: '5',
    type_adjacence: 'terre-plein',
    enum_periode_construction_id: '7|8|9|10',
    periode_construction: '>=2001',
    values: [
      { '2s_p': '1', upb: '3.4', ue: '0.8' },
      { '2s_p': '1', upb: '1.5', ue: '0.7' },
      { '2s_p': '1', upb: '0.85', ue: '0.57' },
      { '2s_p': '1', upb: '0.6', ue: '0.45' },
      { '2s_p': '1', upb: '0.46', ue: '0.37' },
      { '2s_p': '1', upb: '0.37', ue: '0.32' },
      { '2s_p': '1', upb: '0.31', ue: '0.29' },
      { '2s_p': '2', upb: '3.4', ue: '0.75' },
      { '2s_p': '2', upb: '1.5', ue: '0.65' },
      { '2s_p': '2', upb: '0.85', ue: '0.53' },
      { '2s_p': '2', upb: '0.6', ue: '0.42' },
      { '2s_p': '2', upb: '0.46', ue: '0.35' },
      { '2s_p': '2', upb: '0.37', ue: '0.3' },
      { '2s_p': '2', upb: '0.31', ue: '0.27' }
    ]
  },
  {
    type_adjacence_plancher: 'plancher sur vide sanitaire ou sous-sol non chauffé',
    enum_type_adjacence_id: '3|6',
    type_adjacence: 'vide sanitaire ou sous-sol non chauffé',
    enum_periode_construction_id: '1|2|3|4|5|6|7|8|9|10',
    periode_construction: 'toutes',
    values: [
      { '2s_p': '1', upb: '3.33', ue: '0.49' },
      { '2s_p': '1', upb: '1.43', ue: '0.46' },
      { '2s_p': '1', upb: '0.83', ue: '0.43' },
      { '2s_p': '1', upb: '0.45', ue: '0.4' },
      { '2s_p': '1', upb: '0.41', ue: '0.37' },
      { '2s_p': '1', upb: '0.37', ue: '0.32' },
      { '2s_p': '1', upb: '0.34', ue: '0.3' },
      { '2s_p': '1', upb: '0.31', ue: '0.28' },
      { '2s_p': '2', upb: '3.33', ue: '0.47' },
      { '2s_p': '2', upb: '1.43', ue: '0.44' },
      { '2s_p': '2', upb: '0.83', ue: '0.41' },
      { '2s_p': '2', upb: '0.45', ue: '0.38' },
      { '2s_p': '2', upb: '0.41', ue: '0.35' },
      { '2s_p': '2', upb: '0.37', ue: '0.31' },
      { '2s_p': '2', upb: '0.34', ue: '0.29' },
      { '2s_p': '2', upb: '0.31', ue: '0.27' }
    ]
  }
];
