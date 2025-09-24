// src/app/@core/services/country-fields.config.ts
export interface CountryFieldConfig {
  code: string;
  name: string;
  region: string;
  recordCount: string;
  requiredFields: string[];
  optionalFields: string[];
  specificRequirements?: {
    [key: string]: any;
  };
  hints?: {
    [key: string]: string;
  };
}

export const COUNTRY_CONFIGURATIONS: { [key: string]: CountryFieldConfig } = {
  'AU': {
    code: 'AU',
    name: 'Australia',
    region: 'Asia-Pacific',
    recordCount: '11.57M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['email', 'mobile', 'addressLine', 'city', 'state', 'postCode'],
    specificRequirements: {
      mobileFormat: '04XXXXXXXX or 61XXXXXXXXX',
      stateFormat: 'NSW, VIC, QLD, WA, SA, TAS, ACT, NT',
      postCodeFormat: '4 digits'
    },
    hints: {
      mobile: 'Australian format: 0412345678 or 61412345678',
      state: 'Use state abbreviation (e.g., NSW, VIC)',
      postCode: '4-digit Australian postcode'
    }
  },
  'NZ': {
    code: 'NZ',
    name: 'New Zealand',
    region: 'Asia-Pacific',
    recordCount: '2.42M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['email', 'mobile', 'addressLine', 'city', 'postCode', 'urn'],
    specificRequirements: {
      mobileFormat: '02XXXXXXXX or 64XXXXXXXXX',
      urnSupport: true
    },
    hints: {
      mobile: 'NZ format: 021234567 or 6421234567',
      urn: 'Unique Reference Number (if available)'
    }
  },
  'JP': {
    code: 'JP',
    name: 'Japan',
    region: 'Asia-Pacific',
    recordCount: '58.26M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['email', 'mobile', 'addressLine', 'city', 'prefecture', 'postCode', 'nameKanji', 'nameKatakana', 'nameHiragana'],
    specificRequirements: {
      mobileFormat: '81XXXXXXXXXX',
      multipleScripts: true,
      nameReadings: true
    },
    hints: {
      mobile: 'Japanese format: 819012345678',
      addressLine: 'Can use Japanese characters or Romaji',
      nameKanji: 'Name in Kanji characters (optional)',
      nameKatakana: 'Name in Katakana (optional)',
      nameHiragana: 'Name in Hiragana (optional)'
    }
  },
  'ID': {
    code: 'ID',
    name: 'Indonesia',
    region: 'Asia-Pacific',
    recordCount: '103.08M',
    requiredFields: ['firstName', 'dateOfBirth'],
    optionalFields: ['lastName', 'givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'nationalId', 'email', 'mobile', 'addressLine', 'city', 'province', 'postCode'],
    specificRequirements: {
      singleNameSupport: true,
      multipleGivenNames: 7,
      nationalIdFormat: '16 digits'
    },
    hints: {
      firstName: 'Single names are common in Indonesia',
      lastName: 'Optional - many Indonesians have single names',
      nationalId: '16-digit KTP number',
      givenName2: 'Second given name (if applicable)',
      province: 'Indonesian province name'
    }
  },
  'MY': {
    code: 'MY',
    name: 'Malaysia',
    region: 'Asia-Pacific',
    recordCount: '24.42M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'nationalId', 'email', 'mobile', 'addressLine', 'city', 'state', 'postCode'],
    specificRequirements: {
      nationalIdFormat: 'MyKad - 12 digits',
      multipleGivenNames: 6,
      titleHandling: 'Bin, Binti, etc.'
    },
    hints: {
      nationalId: 'Malaysian IC/MyKad number (12 digits)',
      firstName: 'Include titles like Bin/Binti if applicable',
      state: 'Malaysian state name'
    }
  },
  'PH': {
    code: 'PH',
    name: 'Philippines',
    region: 'Asia-Pacific',
    recordCount: '49.06M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['middleName', 'givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'email', 'mobile', 'addressLine', 'city', 'province', 'postCode'],
    specificRequirements: {
      multipleGivenNames: 7,
      singleNameSupport: true
    },
    hints: {
      mobile: 'Philippine format: 09XXXXXXXXX or 639XXXXXXXXX',
      province: 'Philippine province/region'
    }
  },
  'TH': {
    code: 'TH',
    name: 'Thailand',
    region: 'Asia-Pacific',
    recordCount: '41.46M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'nationalId', 'email', 'mobile', 'addressLine', 'city', 'province', 'postCode'],
    specificRequirements: {
      nationalIdFormat: '13 digits',
      multipleGivenNames: 7,
      nameRomanization: true
    },
    hints: {
      nationalId: '13-digit Thai National ID',
      firstName: 'Can use Thai or romanized name',
      province: 'One of 81 Thai provinces'
    }
  },
  'VN': {
    code: 'VN',
    name: 'Vietnam',
    region: 'Asia-Pacific',
    recordCount: '75.75M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['middleName', 'middleName2', 'middleName3', 'nationalId', 'email', 'mobile', 'addressLine', 'city', 'district', 'ward', 'province', 'postCode'],
    specificRequirements: {
      nameOrder: 'Surname + Middle + Given',
      emailCoverage: '85%',
      diacriticNormalization: true
    },
    hints: {
      firstName: 'Given name (Vietnamese order: Last Middle First)',
      lastName: 'Family/surname name',
      middleName: 'Middle name(s) - common in Vietnamese names',
      email: 'Vietnam has 85% email coverage!',
      nationalId: 'Vietnamese National ID'
    }
  },
  'SA': {
    code: 'SA',
    name: 'Saudi Arabia',
    region: 'Middle East & Africa',
    recordCount: '26.83M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['nationalId', 'email', 'mobile', 'addressLine', 'city', 'region', 'postCode', 'arabicFirstName', 'arabicLastName'],
    specificRequirements: {
      arabicSupport: true,
      nameTransliteration: true,
      mobileFormat: '966XXXXXXXXX'
    },
    hints: {
      mobile: 'Saudi format: 966501234567',
      firstName: 'Can use Arabic or Latin characters',
      arabicFirstName: 'Name in Arabic (optional)',
      nationalId: 'Saudi National ID or Iqama number'
    }
  },
  'TR': {
    code: 'TR',
    name: 'Turkey',
    region: 'Middle East & Africa',
    recordCount: '88.40M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'nationalId', 'email', 'mobile', 'addressLine', 'city', 'province', 'postCode'],
    specificRequirements: {
      nationalIdFormat: 'T.C. Kimlik No - 11 digits',
      turkishCharacters: 'ç, ğ, ı, ö, ş, ü',
      multipleGivenNames: 7,
      provinces: 81
    },
    hints: {
      nationalId: '11-digit T.C. Kimlik No',
      firstName: 'Turkish characters supported (ç, ğ, ı, ö, ş, ü)',
      mobile: 'Turkish format: 905XXXXXXXXX',
      province: 'One of 81 Turkish provinces'
    }
  },
  'AE': {
    code: 'AE',
    name: 'United Arab Emirates',
    region: 'Middle East & Africa',
    recordCount: '8.30M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'emiratesId', 'email', 'mobile', 'addressLine', 'city', 'emirate', 'postCode', 'arabicFirstName', 'arabicLastName'],
    specificRequirements: {
      emiratesIdFormat: '15 digits',
      arabicSupport: true,
      multipleGivenNames: 7,
      emirates: 7
    },
    hints: {
      emiratesId: '15-digit Emirates ID',
      emirate: 'One of 7 Emirates',
      mobile: 'UAE format: 971501234567',
      firstName: 'Arabic or English name'
    }
  },
  'EG': {
    code: 'EG',
    name: 'Egypt',
    region: 'Middle East & Africa',
    recordCount: '77.74M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['nationalId', 'email', 'mobile', 'addressLine', 'city', 'governorate', 'postCode', 'arabicFirstName', 'arabicLastName'],
    specificRequirements: {
      nationalIdFormat: '14 digits',
      arabicSupport: true,
      governorateExtraction: true
    },
    hints: {
      nationalId: '14-digit Egyptian National ID',
      governorate: 'Egyptian governorate',
      mobile: 'Egyptian format: 201XXXXXXXXX'
    }
  },
  'QA': {
    code: 'QA',
    name: 'Qatar',
    region: 'Middle East & Africa',
    recordCount: '2.36M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['qatarId', 'email', 'mobile', 'addressLine', 'city', 'postCode', 'residence', 'arabicFirstName', 'arabicLastName'],
    specificRequirements: {
      qatarIdSupport: true,
      arabicSupport: true,
      residenceCoverage: '100%'
    },
    hints: {
      qatarId: 'Qatar ID number',
      residence: 'Residence information (100% coverage)',
      mobile: 'Qatar format: 974XXXXXXXX'
    }
  },
  'CZ': {
    code: 'CZ',
    name: 'Czech Republic',
    region: 'Europe',
    recordCount: '9.05M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['birthNumber', 'email', 'mobile', 'addressLine', 'city', 'region', 'postCode'],
    specificRequirements: {
      birthNumberFormat: 'rodné číslo',
      diacriticHandling: 'č, š, ž, ř',
      regions: 14,
      postCodeFormat: 'XXX XX'
    },
    hints: {
      birthNumber: 'Czech birth number (rodné číslo)',
      postCode: 'Format: XXX XX (e.g., 110 00)',
      firstName: 'Czech diacritics supported (č, š, ž, ř)'
    }
  },
  'FR': {
    code: 'FR',
    name: 'France',
    region: 'Europe',
    recordCount: '29.31M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'insee', 'carteIdentite', 'email', 'mobile', 'addressLine', 'city', 'department', 'region', 'postCode'],
    specificRequirements: {
      inseeFormat: 'INSEE/NIR number',
      multipleGivenNames: 7,
      diacriticHandling: 'é, è, ç, œ'
    },
    hints: {
      insee: 'INSEE/NIR social security number',
      carteIdentite: 'Carte d\'Identité number',
      department: 'French department',
      firstName: 'French diacritics supported (é, è, ç, œ)'
    }
  },
  'MA': {
    code: 'MA',
    name: 'Morocco',
    region: 'Europe',
    recordCount: '25.18M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['cin', 'email', 'mobile', 'addressLine', 'city', 'region', 'postCode', 'arabicFirstName', 'arabicLastName'],
    specificRequirements: {
      cinValidation: true,
      arabicBerberSupport: true,
      frenchVariations: true,
      regions: 12
    },
    hints: {
      cin: 'Moroccan ID (CIN)',
      mobile: 'Moroccan format: 212XXXXXXXXX',
      firstName: 'Arabic, Berber, or French names supported'
    }
  },
  'CA': {
    code: 'CA',
    name: 'Canada',
    region: 'Americas',
    recordCount: '9.32M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['sin', 'email', 'phone', 'addressLine', 'city', 'province', 'postalCode'],
    specificRequirements: {
      provinces: 13,
      postalCodeFormat: 'A1A 1A1',
      bilingualSupport: true
    },
    hints: {
      postalCode: 'Format: A1A 1A1',
      province: 'Canadian province/territory (e.g., ON, QC, BC)',
      phone: 'Canadian format: 14165551234'
    }
  },
  'MX': {
    code: 'MX',
    name: 'Mexico',
    region: 'Americas',
    recordCount: '94.94M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['givenName2', 'givenName3', 'givenName4', 'givenName5', 'givenName6', 'givenName7', 'curp', 'email', 'mobile', 'addressLine', 'city', 'state', 'postCode'],
    specificRequirements: {
      curpFormat: '18 characters',
      multipleGivenNames: 7,
      spanishNicknames: true
    },
    hints: {
      curp: '18-character CURP',
      mobile: 'Mexican format: 521XXXXXXXXXX',
      firstName: 'Spanish variations and nicknames supported'
    }
  },
  'ZA': {
    code: 'ZA',
    name: 'South Africa',
    region: 'Middle East & Africa',
    recordCount: '44.47M',
    requiredFields: ['firstName', 'lastName', 'dateOfBirth'],
    optionalFields: ['nationalId', 'email', 'mobile', 'mobile2', 'mobile3', 'addressLine', 'city', 'province', 'postCode'],
    specificRequirements: {
      nationalIdFormat: '13 digits with check digit',
      multipleMobileFields: 3,
      provinces: 9,
      multilingualSupport: true
    },
    hints: {
      nationalId: '13-digit SA ID with check digit',
      mobile: 'SA format: 27XXXXXXXXX',
      mobile2: 'Alternative mobile number',
      province: 'One of 9 South African provinces'
    }
  }
};