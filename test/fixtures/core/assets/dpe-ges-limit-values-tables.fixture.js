export class DpeGesLimitValuesTablesFixture {
  static aDpeGesLimitExample() {
    return {
      dpe_class_limit: [
        {
          classe_altitude: 'inférieur à 400m',
          surface: '3',
          A: '146',
          B: '186',
          C: '386',
          D: '505',
          E: '622',
          F: '739'
        },
        {
          classe_altitude: '400-800m',
          surface: '10',
          A: '124',
          B: '164',
          C: '329',
          D: '428',
          E: '533',
          F: '640'
        }
      ],
      ges_class_limit: [
        {
          classe_altitude: 'inférieur à 400m',
          surface: '3',
          A: '11',
          B: '16',
          C: '44',
          D: '68',
          E: '90',
          F: '122'
        },
        {
          classe_altitude: '400-800m',
          surface: '10',
          A: '10',
          B: '15',
          C: '40',
          D: '62',
          E: '84',
          F: '115'
        }
      ]
    };
  }
}
