// TypeScript interfaces for the medicine data structures
export interface Indholdsstof {
  indholdsstofnavn: string
  indholdsstoftext: string
  dispenseringsarray: string
}

export interface Dispensering {
  dispenseringsnavn: string
  dispenseringstext: string
}

export interface Praeparat {
  index: number
  text: string
  dosisprenhed: number
  dispenseringsenhed: string
  detaljer: string
}

export interface Forslag {
  index: number
  text: string
  value: number
  dage?: number
}

export interface Detaljer {
  anbefalettext: string
  anbefaletmin: number
  anbefaletmax: number
  stofenhed: string
  fordeltpaatext: string
  fordeltpaaval: number
  voksentotaldosismax: number
  voksentotaldosistext: string
  barnvaegtmin?: number
  barnvaegtminalert?: string
  forslag: Forslag[]
}

// Main data arrays
export const mainarray: Indholdsstof[] = [
  {
    indholdsstofnavn: 'amoxicillin',
    indholdsstoftext: 'Amoxicillin',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'amoxicillinclavulansyre',
    indholdsstoftext: 'Amoxicillin/Clavulansyre',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'azithromycin',
    indholdsstoftext: 'Azithromycin',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'clarithromycin',
    indholdsstoftext: 'Clarithromycin',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'dicloxacillin',
    indholdsstoftext: 'Dicloxacillin',
    dispenseringsarray: 'tabletter'
  },
  {
    indholdsstofnavn: 'erythromycin',
    indholdsstoftext: 'Erythromycin',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'pivmecillinam',
    indholdsstoftext: 'Pivmecillinam',
    dispenseringsarray: 'tabletter'
  },
  {
    indholdsstofnavn: 'penicillin',
    indholdsstoftext: 'V-penicillin',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'trimethoprim',
    indholdsstoftext: 'Trimethoprim',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'naproxen',
    indholdsstoftext: 'Naproxen',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'ibuprofen',
    indholdsstoftext: 'Ibuprofen',
    dispenseringsarray: 'tabletter_mixtur'
  },
  {
    indholdsstofnavn: 'paracetamol',
    indholdsstoftext: 'Paracetamol',
    dispenseringsarray: 'tabletter_mixtur_sup'
  }
]

export const dispenseringsarray: Record<string, Dispensering[]> = {
  tabletter_mixtur: [
    { dispenseringsnavn: 'tabletter', dispenseringstext: 'Tabletter' },
    { dispenseringsnavn: 'mixtur', dispenseringstext: 'Mixtur' }
  ],
  tabletter: [{ dispenseringsnavn: 'tabletter', dispenseringstext: 'Tabletter' }],
  injektion: [{ dispenseringsnavn: 'injektion', dispenseringstext: 'Injektion i.v./i.m.' }],
  tabletter_mixtur_sup: [
    { dispenseringsnavn: 'tabletter', dispenseringstext: 'Tabletter' },
    { dispenseringsnavn: 'mixtur', dispenseringstext: 'Mixtur' },
    { dispenseringsnavn: 'sup', dispenseringstext: 'Suppositorier' }
  ]
}

export const praeparatarray: Record<string, Praeparat[]> = {
  penicillin_tabletter: [
    {
      index: 0,
      text: 'Pancillin tabletter 500.000 IE',
      dosisprenhed: 500000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'penicillin_detaljer'
    },
    {
      index: 1,
      text: 'Primcillin tabletter 400 mg (600.000 IE)',
      dosisprenhed: 600000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'penicillin_detaljer'
    },
    {
      index: 2,
      text: 'Pancillin/Ospen/PenHEXAL tabletter 1 mill. IE',
      dosisprenhed: 1000000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'penicillin_detaljer'
    },
    {
      index: 3,
      text: 'Primcillin/Phenoxymethylpenicillinkalium tabletter 800 mg (1,2 mill. IE)',
      dosisprenhed: 1200000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'penicillin_detaljer'
    },
    {
      index: 4,
      text: 'Pancillin/Ospen/PenHEXAL tabletter 1,5 mill. IE',
      dosisprenhed: 1500000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'penicillin_detaljer'
    }
  ],
  penicillin_mixtur: [
    {
      index: 0,
      text: 'Primcillin mixtur 50 mg (75.000 IE) pr. ml ',
      dosisprenhed: 75000,
      dispenseringsenhed: 'ml',
      detaljer: 'penicillin_detaljer'
    }
  ],
  erythromycin_tabletter: [
    {
      index: 0,
      text: 'Abboticin tabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'erythromycin_detaljer'
    }
  ],
  erythromycin_mixtur: [
    {
      index: 0,
      text: 'Abboticin mixtur 40 mg/ml',
      dosisprenhed: 40,
      dispenseringsenhed: 'ml',
      detaljer: 'erythromycin_detaljer'
    },
    {
      index: 1,
      text: 'Abboticin mixtur 100 mg/ml',
      dosisprenhed: 100,
      dispenseringsenhed: 'ml',
      detaljer: 'erythromycin_detaljer'
    }
  ],
  amoxicillin_tabletter: [
    {
      index: 0,
      text: 'Imacillin solutab 375 mg',
      dosisprenhed: 375,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillin_detaljer'
    },
    {
      index: 1,
      text: 'Amoxicillin/Imadrax/Amoxar solutab/tabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillin_detaljer'
    },
    {
      index: 2,
      text: 'Amoxicillin/Imadrax/Amoxar solutab/tabletter 750 mg',
      dosisprenhed: 750,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillin_detaljer'
    },
    {
      index: 3,
      text: 'Amoxicillin/Imadrax solutab/tabletter 1000 mg',
      dosisprenhed: 1000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillin_detaljer'
    }
  ],
  amoxicillin_mixtur: [
    {
      index: 0,
      text: 'Amoxicillin/Imacillin/Imaxi mixtur 50 mg/ml',
      dosisprenhed: 50,
      dispenseringsenhed: 'ml',
      detaljer: 'amoxicillin_detaljer'
    }
  ],
  amoxicillinclavulansyre_tabletter: [
    {
      index: 0,
      text: 'Amoxicillin m. clavulansyre/Bioclavid tabletter 500/125 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillinclavulansyre_detaljer'
    },
    {
      index: 1,
      text: 'Amoxicillin m. clavulansyre/Klaximol tabletter 875/125 mg',
      dosisprenhed: 875,
      dispenseringsenhed: 'tabletter',
      detaljer: 'amoxicillinclavulansyre_detaljer'
    }
  ],
  amoxicillinclavulansyre_mixtur: [
    {
      index: 0,
      text: 'Augmentin Forte/Spektramox mixtur 50/12,5 mg pr. ml',
      dosisprenhed: 50,
      dispenseringsenhed: 'ml',
      detaljer: 'amoxicillinclavulansyre_mixtur_detaljer'
    }
  ],
  dicloxacillin_tabletter: [
    {
      index: 0,
      text: 'Dicloxacillin tabletter (hårde kapsler) 250 mg',
      dosisprenhed: 250,
      dispenseringsenhed: 'tabletter',
      detaljer: 'dicloxacillin_detaljer'
    },
    {
      index: 1,
      text: 'Dicloxacillin tabletter (hårde kapsler) 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'dicloxacillin_detaljer'
    }
  ],
  pivmecillinam_tabletter: [
    {
      index: 0,
      text: 'Selexid/Penomax/Pivmecillinamhydrochlorid tabletter 200 mg',
      dosisprenhed: 200,
      dispenseringsenhed: 'tabletter',
      detaljer: 'pivmecillinam_detaljer'
    },
    {
      index: 1,
      text: 'Selexid/Penomax tabletter 400 mg',
      dosisprenhed: 400,
      dispenseringsenhed: 'tabletter',
      detaljer: 'pivmecillinam_detaljer'
    }
  ],
  benzylpenicillin_injektion: [
    {
      index: 0,
      text: 'Benzylpenicillin hætteglas 600 mg (1 mill. IE)',
      dosisprenhed: 1000000,
      dispenseringsenhed: 'hætteglas',
      detaljer: 'benzylpenicillin_detaljer'
    },
    {
      index: 1,
      text: 'Benzylpenicillin hætteglas 1,2 g (2 mill. IE)',
      dosisprenhed: 2000000,
      dispenseringsenhed: 'hætteglas',
      detaljer: 'benzylpenicillin_detaljer'
    },
    {
      index: 2,
      text: 'Benzylpenicillin hætteglas 3 g (5 mill. IE)',
      dosisprenhed: 5000000,
      dispenseringsenhed: 'hætteglas',
      detaljer: 'benzylpenicillin_detaljer'
    },
    {
      index: 3,
      text: 'Benzylpenicillin hætteglas 6 mg (10 mill. IE)',
      dosisprenhed: 10000000,
      dispenseringsenhed: 'hætteglas',
      detaljer: 'benzylpenicillin_detaljer'
    }
  ],
  clarithromycin_tabletter: [
    {
      index: 0,
      text: 'Clarithromycin tabletter 250 mg',
      dosisprenhed: 250,
      dispenseringsenhed: 'tabletter',
      detaljer: 'clarithromycin_detaljer'
    },
    {
      index: 1,
      text: 'Clarithromycin/Klacid tabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'clarithromycin_detaljer'
    }
  ],
  clarithromycin_mixtur: [
    {
      index: 0,
      text: 'Klacid mixtur 25 mg/ml',
      dosisprenhed: 25,
      dispenseringsenhed: 'ml',
      detaljer: 'clarithromycin_detaljer'
    },
    {
      index: 1,
      text: 'Klacid mixtur 50 mg/ml',
      dosisprenhed: 50,
      dispenseringsenhed: 'ml',
      detaljer: 'clarithromycin_detaljer'
    }
  ],
  paracetamol_tabletter: [
    {
      index: 0,
      text: 'Arax tabletter/Pamol Flash dispergible tabletter 250 mg',
      dosisprenhed: 250,
      dispenseringsenhed: 'tabletter',
      detaljer: 'paracetamol_detaljer'
    },
    {
      index: 1,
      text: 'Arax/Panodil/Pamol/Pinex tabletter/brusetabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'paracetamol_detaljer'
    },
    {
      index: 2,
      text: 'Panodil/Pinemol/Paracetamol tabletter 1000 mg',
      dosisprenhed: 1000,
      dispenseringsenhed: 'tabletter',
      detaljer: 'paracetamol_detaljer'
    }
  ],
  paracetamol_mixtur: [
    {
      index: 0,
      text: 'Panodil/Pinex mixtur 24 mg/ml',
      dosisprenhed: 24,
      dispenseringsenhed: 'ml',
      detaljer: 'paracetamol_detaljer'
    }
  ],
  paracetamol_sup: [
    {
      index: 0,
      text: 'Panodil/Pinex/Paracet 125 mg suppositorier',
      dosisprenhed: 125,
      dispenseringsenhed: 'suppositorier',
      detaljer: 'paracetamol_detaljer'
    },
    {
      index: 1,
      text: 'Panodil/Pinex 250 mg suppositorier',
      dosisprenhed: 250,
      dispenseringsenhed: 'suppositorier',
      detaljer: 'paracetamol_detaljer'
    },
    {
      index: 2,
      text: 'Pinex 500 mg suppositorier',
      dosisprenhed: 500,
      dispenseringsenhed: 'suppositorier',
      detaljer: 'paracetamol_detaljer'
    },
    {
      index: 3,
      text: 'Pinex 1000 mg suppositorier',
      dosisprenhed: 1000,
      dispenseringsenhed: 'suppositorier',
      detaljer: 'paracetamol_detaljer'
    }
  ],
  ibuprofen_tabletter: [
    {
      index: 0,
      text: 'Ibumax/Ibuprofen/Ipren tabletter 200 mg',
      dosisprenhed: 200,
      dispenseringsenhed: 'tabletter',
      detaljer: 'ibuprofen_detaljer'
    },
    {
      index: 1,
      text: 'Ibumax/Ibumetin/Ibuprofen tabletter 400 mg',
      dosisprenhed: 400,
      dispenseringsenhed: 'tabletter',
      detaljer: 'ibuprofen_detaljer'
    },
    {
      index: 2,
      text: 'Brufen/Ibumax/Ibumetin/Ibuprofen tabletter 600 mg',
      dosisprenhed: 600,
      dispenseringsenhed: 'tabletter',
      detaljer: 'ibuprofen_detaljer'
    },
    {
      index: 3,
      text: 'Brufen tabletter 800 mg',
      dosisprenhed: 800,
      dispenseringsenhed: 'tabletter',
      detaljer: 'ibuprofen_detaljer'
    }
  ],
  ibuprofen_mixtur: [
    {
      index: 0,
      text: 'Ibuprofen mixtur 20 mg/ml',
      dosisprenhed: 20,
      dispenseringsenhed: 'ml',
      detaljer: 'ibuprofen_detaljer'
    }
  ],
  azithromycin_tabletter: [
    {
      index: 0,
      text: 'Azithromycin Jubilant/Zithromax tabletter 250 mg',
      dosisprenhed: 250,
      dispenseringsenhed: 'tabletter',
      detaljer: 'azithromycin_detaljer'
    },
    {
      index: 1,
      text: 'Azithromycin/Zitromax tabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'azithromycin_detaljer'
    }
  ],
  azithromycin_mixtur: [
    {
      index: 0,
      text: 'Azithromycin/Zitromax mixtur 40 mg/ml',
      dosisprenhed: 40,
      dispenseringsenhed: 'ml',
      detaljer: 'azithromycin_detaljer'
    }
  ],
  naproxen_tabletter: [
    {
      index: 0,
      text: 'Bonyl/Naproxen-E tabletter 250 mg',
      dosisprenhed: 250,
      dispenseringsenhed: 'tabletter',
      detaljer: 'naproxen_detaljer'
    },
    {
      index: 1,
      text: 'Bonyl/Naproxen/Naproxen-E tabletter 500 mg',
      dosisprenhed: 500,
      dispenseringsenhed: 'tabletter',
      detaljer: 'naproxen_detaljer'
    }
  ],
  naproxen_mixtur: [
    {
      index: 0,
      text: 'Bonyl mixtur 25 mg/ml',
      dosisprenhed: 25,
      dispenseringsenhed: 'ml',
      detaljer: 'naproxen_detaljer'
    }
  ],
  trimethoprim_tabletter: [
    {
      index: 0,
      text: 'Trimopan tabletter 100 mg',
      dosisprenhed: 100,
      dispenseringsenhed: 'tabletter',
      detaljer: 'trimethoprim_detaljer'
    }
  ],
  trimethoprim_mixtur: [
    {
      index: 0,
      text: 'Trimopan mixtur 10 mg/ml',
      dosisprenhed: 10,
      dispenseringsenhed: 'ml',
      detaljer: 'trimethoprim_detaljer'
    }
  ]
}

export const detaljerarray: Record<string, Detaljer> = {
  penicillin_detaljer: {
    anbefalettext: '50000-100000 IE/kg/døgn',
    anbefaletmin: 50000,
    anbefaletmax: 100000,
    stofenhed: 'IE/kg/døgn',
    fordeltpaatext: '3-4',
    fordeltpaaval: 3,
    voksentotaldosismax: 4800000,
    voksentotaldosistext: 'Obs. voksendosis 1.2 Mio IE x 3 - 4',
    forslag: [
      {
        index: 0,
        text: '80000 IE/kg/døgn',
        value: 80000,
        dage: 7
      },
      {
        index: 1,
        text: 'Akut Otitis media: 80000 IE/kg/døgn i 5 dage',
        value: 80000,
        dage: 5
      },
      {
        index: 2,
        text: 'Erythema migrans: 150.000 IE/kg/døgn',
        value: 150000,
        dage: 10
      }
    ]
  },
  erythromycin_detaljer: {
    anbefalettext: '30-50 mg/kg/døgn',
    anbefaletmin: 30,
    anbefaletmax: 50,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '2-4',
    fordeltpaaval: 3,
    voksentotaldosismax: 500,
    voksentotaldosistext: 'Obs. voksendosis er 250-500 mg 2-4 gange dgl.',
    forslag: [
      {
        index: 0,
        text: '40 mg/kg/døgn',
        value: 40,
        dage: 7
      }
    ]
  },
  amoxicillin_detaljer: {
    anbefalettext: '40-100 mg/kg/døgn ved <40 kg + normal GFR',
    anbefaletmin: 40,
    anbefaletmax: 100,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '2-3',
    fordeltpaaval: 3,
    voksentotaldosismax: 500,
    voksentotaldosistext: 'Obs. voksne og børn >40 kg skal have 500 mg 3 gange dagligt',
    forslag: [
      {
        index: 0,
        text: '50 mg/kg/døgn',
        value: 50,
        dage: 7
      }
    ]
  },
  amoxicillinclavulansyre_detaljer: {
    anbefalettext: '25-50 mg/kg/døgn',
    anbefaletmin: 20,
    anbefaletmax: 60,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '3-4',
    fordeltpaaval: 3,
    voksentotaldosismax: 1500,
    voksentotaldosistext: 'Obs. børn >12 år + voksne er 1500 mg fordelt på 3-4 doser.',
    forslag: [
      {
        index: 0,
        text: '2-12 år: 20-60 mg/kg/døgn',
        value: 40,
        dage: 7
      },
      {
        index: 1,
        text: '<2 år: 20-40 mg/kg/døgn',
        value: 30,
        dage: 7
      }
    ]
  },
  amoxicillinclavulansyre_mixtur_detaljer: {
    anbefalettext: '40-50 mg/kg/døgn',
    anbefaletmin: 40,
    anbefaletmax: 50,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '3',
    fordeltpaaval: 3,
    voksentotaldosismax: 1500,
    voksentotaldosistext: 'Obs. børn og voksne > 40 kg: 1500 mg fordelt på 3 doser.',
    forslag: [
      {
        index: 0,
        text: '> 1 måned og <40 kg: 40-50 mg/kg/døgn',
        value: 50,
        dage: 7
      }
    ]
  },
  dicloxacillin_detaljer: {
    anbefalettext: '37.5-50 (-100) mg/kg/døgn',
    anbefaletmin: 12,
    anbefaletmax: 50,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '3',
    fordeltpaaval: 3,
    barnvaegtmin: 20,
    barnvaegtminalert: 'Obs. det anbefales ikke at give hårde kapsler til børn under 20 kg.',
    voksentotaldosismax: 1500,
    voksentotaldosistext: 'Obs. voksendosis er 500-1000 mg 3-4 gange dgl.',
    forslag: [
      {
        index: 0,
        text: '50 mg/kg/døgn',
        value: 50,
        dage: 7
      }
    ]
  },
  pivmecillinam_detaljer: {
    anbefalettext: '20-40 mg/kg/døgn',
    anbefaletmin: 20,
    anbefaletmax: 40,
    stofenhed: 'mg/kg/døgn',
    fordeltpaatext: '3',
    fordeltpaaval: 3,
    voksentotaldosismax: 600,
    voksentotaldosistext: 'Obs. voksendosis er 200-400 mg 3 gange dgl.',
    forslag: [
      {
        index: 0,
        text: '20 mg/kg/døgn',
        value: 20,
        dage: 14
      }
    ]
  },
  benzylpenicillin_detaljer: {
    anbefalettext: '50.000-400.000 IE/kg/døgn i.v./i.m.',
    anbefaletmin: 50000,
    anbefaletmax: 400000,
    stofenhed: 'mg/kg',
    fordeltpaatext: '3-4',
    fordeltpaaval: 1,
    voksentotaldosismax: 5000000,
    voksentotaldosistext: 'Obs. Voksendosis er 5 MIE',
    forslag: [
      {
        index: 0,
        text: 'Meningitis: 0,1 MIE pr. kg i.v./i.m.',
        value: 100000,
        dage: 1
      }
    ]
  },
  clarithromycin_detaljer: {
    anbefalettext: '15 mg/kg/døgn',
    anbefaletmin: 14,
    anbefaletmax: 16,
    stofenhed: 'mg/kg',
    fordeltpaatext: '2',
    fordeltpaaval: 2,
    voksentotaldosismax: 5000000,
    voksentotaldosistext: 'Obs. Voksendosis 250-500 mg 2 gange i døgnet',
    forslag: [
      {
        index: 0,
        text: '15 mg/kg/døgn',
        value: 15,
        dage: 7
      }
    ]
  },
  paracetamol_detaljer: {
    anbefalettext: '50 - 60 mg/kg/døgn (<12 år)',
    anbefaletmin: 50,
    anbefaletmax: 60,
    stofenhed: 'mg/kg',
    fordeltpaatext: '4-6',
    fordeltpaaval: 4,
    voksentotaldosismax: 1500,
    voksentotaldosistext:
      'Obs. unge > 12 år og vægt under 50 kg: Dosering som børn. Voksne og børn > 12 år 500-1000 mg 3-4 gange i døgnet. Maksimalt 4g/døgn. Doseringinterval mindst 4 timer.',
    forslag: [
      {
        index: 0,
        text: '50 - 60 mg/kg/døgn (<12 år)',
        value: 50,
        dage: 7
      }
    ]
  },
  ibuprofen_detaljer: {
    anbefalettext: 'max 20 (-30) mg/kg/døgn',
    anbefaletmin: 10,
    anbefaletmax: 30,
    stofenhed: 'mg/kg',
    fordeltpaatext: '3-4',
    fordeltpaaval: 3,
    barnvaegtmin: 7,
    barnvaegtminalert: 'Obs. Må ikke gives til børn < 6 måneder eller til børn, der vejer mindre end 7 kg.',
    voksentotaldosismax: 600,
    voksentotaldosistext: 'Obs. Voksendosis 200-600 mg 3 gange i døgnet',
    forslag: [
      {
        index: 0,
        text: '>6 md + > 7 kg: 15 mg/kg/døgn',
        value: 15,
        dage: 7
      }
    ]
  },
  azithromycin_detaljer: {
    anbefalettext: '10-20 mg/kg/døgn',
    anbefaletmin: 10,
    anbefaletmax: 20,
    stofenhed: 'mg/kg',
    fordeltpaatext: '1',
    fordeltpaaval: 1,
    voksentotaldosismax: 500,
    voksentotaldosistext: 'Obs. Voksendosis 500 mg 1 gang i døgnet',
    forslag: [
      {
        index: 0,
        text: '1-14 år: 10 mg/kg/døgn',
        value: 10,
        dage: 3
      }
    ]
  },
  trimethoprim_detaljer: {
    anbefalettext: '6-8 mg/kg/døgn',
    anbefaletmin: 6,
    anbefaletmax: 8,
    stofenhed: 'mg/kg',
    fordeltpaatext: '2-3',
    fordeltpaaval: 2,
    voksentotaldosismax: 150,
    voksentotaldosistext: 'Obs. Børn 6-12 år 100 mg 2 gang dgl. Børn > 12 år 200 mg 2 gange dgl.',
    forslag: [
      {
        index: 0,
        text: 'Børn 3 mdr.- 6 år: 6-8 mg/kg/døgn',
        value: 7,
        dage: 7
      }
    ]
  },
  naproxen_detaljer: {
    anbefalettext: '10 mg/kg/døgn',
    anbefaletmin: 9,
    anbefaletmax: 11,
    stofenhed: 'mg/kg',
    fordeltpaatext: '2',
    fordeltpaaval: 2,
    voksentotaldosismax: 500,
    voksentotaldosistext: 'Obs. Voksendosis 250-500 mg 2 gang i døgnet',
    forslag: [
      {
        index: 0,
        text: '>5 år og < 50 kg: 10 mg/kg/døgn',
        value: 10,
        dage: 7
      }
    ]
  }
}

// Utility functions
export function roundToOne(val: number): number {
  return Math.round(val * 10) / 10
}

export function isValidNumber(val: string): number | false {
  let cleanedVal = val.replace(/,/g, '.').replace(/[^0123456789.\*\+\-\/]/g, '')

  if (cleanedVal.match(/[\*\+\-\/]/g)) {
    cleanedVal = cleanedVal.replace(/[a-zA-Z]/g, '')
    try {
      cleanedVal = eval(cleanedVal).toString()
    } catch (e) {
      return false
    }
  }

  const parsed = parseFloat(cleanedVal)
  return isNaN(parsed) ? false : parsed
}

// Calculation functions
export interface CalculationResult {
  dailyAmount: number
  totalAmount: number
  amountPerDose: number
  warning: string
}

export function calculateDosage(
  dosage: number,
  weight: number,
  preparation: Praeparat,
  details: Detaljer,
  frequency: number,
  days: number
): CalculationResult {
  const dailyAmount = roundToOne((dosage * weight) / preparation.dosisprenhed)
  const amountPerDose = roundToOne(dailyAmount / frequency)
  const totalAmount = roundToOne(frequency * amountPerDose * days)

  let warning = ''
  if (dosage * weight > details.voksentotaldosismax) {
    warning = details.voksentotaldosistext
  }
  if (details.barnvaegtmin && weight < details.barnvaegtmin) {
    warning = details.barnvaegtminalert || ''
  }

  return {
    dailyAmount,
    totalAmount,
    amountPerDose,
    warning
  }
}