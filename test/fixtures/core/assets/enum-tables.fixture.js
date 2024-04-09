export class EnumTablesFixture {
  static anEnumTableExample() {
    return {
      index: [],
      type_isolation: [
        {
          id: '1',
          lib: 'inconnu'
        },
        {
          id: '2',
          lib: ' Non isolé',
          variables_interdites:
            'enum_periode_isolation_id,resistance_isolation,epaisseur_isolation,tv_umur_id,tv_upb_id,tv_uph_id'
        }
      ],
      classe_etiquette: [
        {
          id: 'A',
          lib: 'A'
        },
        {
          id: 'B',
          lib: 'B'
        }
      ]
    };
  }
}
