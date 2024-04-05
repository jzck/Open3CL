import * as fs from 'fs';
import { XMLParser } from 'fast-xml-parser';
import enums from '../src/enums.js';
import { calcul_3cl } from '../src/engine.js';

describe('Test Open3CL engine on corpus', () => {
  const xmlParser = new XMLParser({
    // We want to make sure collections of length 1 are still parsed as arrays
    isArray: (name, jpath, isLeafNode, isAttribute) => {
      const collectionNames = [
        'mur',
        'plancher_bas',
        'plancher_haut',
        'baie_vitree',
        'porte',
        'pont_thermique',
        'ventilation',
        'installation_ecs',
        'generateur_ecs',
        'climatisation',
        'installation_chauffage',
        'generateur_chauffage',
        'emetteur_chauffage',
        'sortie_par_energie'
      ];
      if (collectionNames.includes(name)) return true;
    },
    tagValueProcessor: (tagName, val) => {
      if (tagName.startsWith('enum_')) {
        // Preserve value as string for tags starting with "enum_"
        return null;
      }
      if (Number.isNaN(Number(val))) return val;
      return Number(val);
    }
  });

  let ademeIds = [
    '2187E0981996L',
    '2187E0982013C',
    '2187E0982378D',
    '2187E0982782R',
    '2187E1037899O',
    '2187E1039187C',
    '2213E0696993Z',
    '2287E0104246W',
    '2287E0142690M',
    '2287E0224445X',
    '2287E0272588O',
    '2287E0281128A',
    '2287E0373232M',
    '2287E0393451D',
    '2287E0429850C',
    '2287E0532057D',
    '2287E0552632M',
    '2287E0577966W',
    '2287E0601916A',
    '2287E0722622O',
    '2287E0793758O',
    '2287E0800437L',
    '2287E0839803N',
    '2287E0914527N',
    '2287E1018120W',
    '2287E1043883T',
    '2287E1155727L',
    '2287E1201982M',
    '2287E1307980I',
    '2287E1308066Q',
    '2287E1313308G',
    '2287E1327399F',
    '2287E1345114O',
    '2287E1429819L',
    '2287E1429838E',
    '2287E1429874O',
    '2287E1430326Y',
    '2287E1473380W',
    '2287E1473669Z',
    '2287E1489258O',
    '2287E1490206A',
    '2287E1530029R',
    '2287E1641515P',
    '2287E1724516Y',
    '2287E1730921H',
    '2287E1869613P',
    '2287E1923356Q',
    '2287E1956426O',
    '2287E2021836I',
    '2287E2092136E',
    '2287E2232398W',
    '2287E2336469P',
    '2287E2475376E',
    '2287E2508668Q',
    '2287E2761872G',
    '2287E3039996I',
    '2287E3122267P',
    '2387E0028605Q',
    '2387E0045247S',
    '2387E0072031W',
    '2387E0112514X',
    '2387E0112818P',
    '2387E0112951S',
    '2387E0113220B',
    '2387E0113373Y',
    '2387E0167911O',
    '2387E0167926D',
    '2387E0273032R',
    '2387E0291550X',
    '2387E0402213E',
    '2387E0430619S',
    '2387E0507343Q',
    '2387E0562437Q',
    '2387E0692052V',
    '2387E0695337E',
    '2387E0715833M',
    '2387E0837391U',
    '2387E0839319Y',
    '2387E0855381S',
    '2387E0870867I',
    '2387E0872756Z',
    '2387E0888781I',
    '2387E0909114J',
    '2387E0992815Q',
    '2387E1211881G',
    '2387E1211986H',
    '2387E1228202Z',
    '2387E1478659Y',
    '2223E1914800C',
    '2187E0982591I',
    '2307E3075089A',
    '2362E3036179P',
    '2387E2923777K',
    '2387E3092820B',
    '2387E3074987E',
    '2387E1742056P',
    '2387E2899635W',
    '2387E0576340J',
    '2387E2058698D',
    '2387E2603968B'
  ];

  describe.each(ademeIds)(
    'engine output should be same than original ADEME file for %s',
    (ademeId) => {
      let dpeResult, dpeJson;

      beforeAll(() => {
        const dpeFile = `test/fixtures/${ademeId}.xml`;
        const data = fs.readFileSync(dpeFile, { encoding: 'utf8', flag: 'r' });

        dpeJson = xmlParser.parse(data).dpe;
        expect(dpeJson).not.toBeUndefined();

        const dpeModele = enums.modele_dpe[dpeJson.administratif.enum_modele_dpe_id];
        expect(dpeModele).toBe('dpe 3cl 2021 méthode logement');

        dpeResult = calcul_3cl(JSON.parse(JSON.stringify(dpeJson)));

        fs.wr;
      });

      test('check "deperdition" value', () => {
        expect(dpeResult.logement.sortie.deperdition).toStrictEqual(
          dpeJson.logement.sortie.deperdition
        );
      });

      test('check "apport_et_besoin" value', () => {
        expect(dpeResult.logement.sortie.apport_et_besoin).toStrictEqual(
          dpeJson.logement.sortie.apport_et_besoin
        );
      });

      test('check "ef_conso" value', () => {
        expect(dpeResult.logement.sortie.ef_conso).toStrictEqual(dpeJson.logement.sortie.ef_conso);
      });

      test('check "ep_conso" value', () => {
        expect(dpeResult.logement.sortie.ep_conso).toStrictEqual(dpeJson.logement.sortie.ep_conso);
      });

      test('check "emission_ges" value', () => {
        expect(dpeResult.logement.sortie.emission_ges).toStrictEqual(
          dpeJson.logement.sortie.emission_ges
        );
      });

      test('check "cout" value', () => {
        expect(dpeResult.logement.sortie.cout).toStrictEqual(dpeJson.logement.sortie.cout);
      });

      test('check "production_electricite" value', () => {
        expect(dpeResult.logement.sortie.production_electricite).toStrictEqual(
          dpeJson.logement.sortie.production_electricite
        );
      });

      test('check "sortie_par_energie_collection" value', () => {
        expect(dpeResult.logement.sortie.sortie_par_energie_collection).toStrictEqual(
          dpeJson.logement.sortie.sortie_par_energie_collection
        );
      });

      test('check "confort_ete" value', () => {
        expect(dpeResult.logement.sortie.confort_ete).toStrictEqual(
          dpeJson.logement.sortie.confort_ete
        );
      });

      test('check "qualite_isolation" value', () => {
        expect(dpeResult.logement.sortie.qualite_isolation).toStrictEqual(
          dpeJson.logement.sortie.qualite_isolation
        );
      });
    }
  );
});
