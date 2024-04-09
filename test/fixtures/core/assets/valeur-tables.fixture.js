export class ValeurTablesFixture {
  static aValeurTableExample() {
    return {
      coef_reduction_deperdition: [
        {
          tv_coef_reduction_deperdition_id: '1'
        }
      ],
      ditribution: {},
      generateur_combustion: [
        {
          critere_pn: 'Pn ≤ 70 kW',
          qp0_perc: '4%'
        }
      ],
      q4pa_conv: [
        {
          tv_q4pa_conv_id: '1',
          q4pa_conv: '4.0'
        },
        {
          tv_q4pa_conv_id: '1',
          isolation_surface: '1',
          q4pa_conv: '4.0'
        }
      ]
    };
  }
}
