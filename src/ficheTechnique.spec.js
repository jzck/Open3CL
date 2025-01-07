import getFicheTechnique from './ficheTechnique.js';

describe('FicheTechnique service tests', () => {
  const dpe = {
    fiche_technique_collection: {
      fiche_technique: [
        {
          enum_categorie_fiche_technique_id: '10',
          sous_fiche_technique_collection: {
            sous_fiche_technique: [
              {
                description: 'Type de ventilation: VMC SF Auto réglable avant 1982',
                valeur: 'VMC SF Auto réglable avant 1982',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Année installation: 1949',
                valeur: 1949,
                detail_origine_donnee: '',
                enum_origine_donnee_id: '1'
              },
              {
                description: 'Energie utilisée: Electrique',
                valeur: 'Electrique',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Façades exposées: plusieurs',
                valeur: 'plusieurs',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Logement Traversant: oui',
                valeur: 'oui',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              }
            ]
          }
        },
        {
          enum_categorie_fiche_technique_id: '10',
          sous_fiche_technique_collection: {
            sous_fiche_technique: [
              {
                description: 'Type de ventilation: VMC SF Auto réglable avant 1982',
                valeur: 'VMC SF Auto réglable avant 1982',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Année installation: 1950',
                valeur: 1950,
                detail_origine_donnee: '',
                enum_origine_donnee_id: '1'
              },
              {
                description: 'Energie utilisée: Bois',
                valeur: 'Bois',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Façades exposées: plusieurs',
                valeur: 'plusieurs',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Logement Traversant: oui',
                valeur: 'oui',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              }
            ]
          }
        },
        {
          enum_categorie_fiche_technique_id: '10',
          sous_fiche_technique_collection: {
            sous_fiche_technique: [
              {
                description: 'Type de ventilation: VMC SF Auto réglable avant 1982',
                valeur: 'VMC SF Auto réglable avant 1982',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Année installation: 1950',
                valeur: 1950,
                detail_origine_donnee: '',
                enum_origine_donnee_id: '1'
              },
              {
                description: 'Energie utilisée: Gaz',
                valeur: 'Gaz',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Façades exposées: plusieurs',
                valeur: 'aucune',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              },
              {
                description: 'Logement Traversant: oui',
                valeur: 'oui',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              }
            ]
          }
        }
      ]
    }
  };

  it('should return a fiche technique', async () => {
    let fiche = getFicheTechnique(dpe, '10', 'exposées');
    expect(fiche).not.toBeNull();
    expect(fiche.description).toBe('Façades exposées: plusieurs');
    expect(fiche.valeur).toBe('plusieurs');

    // Some DPE have a fiche_technique node which is not an array
    const dpeWithoutArray = {
      fiche_technique_collection: {
        fiche_technique: {
          enum_categorie_fiche_technique_id: '10',
          sous_fiche_technique_collection: {
            sous_fiche_technique: [
              {
                description: 'Façades exposées: plusieurs',
                valeur: 'plusieurs',
                detail_origine_donnee: '',
                enum_origine_donnee_id: '2'
              }
            ]
          }
        }
      }
    };

    fiche = getFicheTechnique(dpeWithoutArray, '10', 'exposées');
    expect(fiche).not.toBeNull();
  });

  it('should return a fiche technique with multiple criteria', async () => {
    let fiche = getFicheTechnique(dpe, '10', 'exposées', [1950, 'Gaz']);
    expect(fiche).not.toBeNull();
    expect(fiche.description).toBe('Façades exposées: plusieurs');
    expect(fiche.valeur).toBe('aucune');
  });

  it('should not return a non existing fiche technique', async () => {
    let fiche = getFicheTechnique(dpe, '40', 'exposées');
    expect(fiche).toBeNull();

    fiche = getFicheTechnique(dpe, '10', 'non existing');
    expect(fiche).toBeNull();

    dpe.fiche_technique_collection.fiche_technique[0].sous_fiche_technique_collection.sous_fiche_technique =
      null;

    fiche = getFicheTechnique(dpe, '11', 'non existing');
    expect(fiche).toBeNull();

    dpe.fiche_technique_collection.fiche_technique[0].sous_fiche_technique_collection = null;

    fiche = getFicheTechnique(dpe, '11', 'non existing');
    expect(fiche).toBeNull();

    dpe.fiche_technique_collection.fiche_technique = null;

    fiche = getFicheTechnique(dpe, '10', 'non existing');
    expect(fiche).toBeNull();
  });
});
