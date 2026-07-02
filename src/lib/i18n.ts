export const locales = ['hu', 'en'] as const;
export type Locale = (typeof locales)[number];

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

export const dictionaries = {
  hu: {
    nav: {
      products: 'Termékek',
      services: 'Szolgáltatások',
      printheads: 'Nyomtatófejek',
      partners: 'Partnereink',
      contact: 'Kapcsolat',
      quote: 'Ajánlatkérés',
    },
    hero: {
      eyebrow: 'Blueway Trade Kft.',
      title: 'Személyre szabott termékjelölési megoldások',
      lead: 'Címkenyomtatás, lézeres jelölés, alkatrészellátás és szerviz — a legegyszerűbb feladattól a nagyvállalati komplex rendszerekig.',
      ctaPrimary: 'Kérjen ajánlatot',
      ctaSecondary: 'Termékeink',
    },
    pillars: [
      {
        title: 'Megoldások',
        body: 'A legegyszerűbb termékjelölési feladattól a nagyvállalati komplex rendszerekig: címkenyomtatás, lézeres jelölés, alkatrészellátás és szerviz.',
      },
      {
        title: 'Támogatás',
        body: 'Minden, a piacon megtalálható nyomtatóhoz folyamatos és teljeskörű támogatást biztosítunk.',
      },
      {
        title: 'Gyorsaság',
        body: 'Az igényekhez mérten kialakított raktárkészlet — másnapi szállítás.',
      },
    ],
    products: {
      title: 'Termékek',
      lead: 'Címkenyomtatók, címkéző gépek, lézer gravírozók és kellékanyagok — a legegyszerűbb feladattól a komplex rendszerekig.',
      browseCategory: 'Kategória megtekintése',
      productCount: (n: number) => `${n} termék`,
      comingSoon: 'A kategória termékei hamarosan felkerülnek — addig is kérjen ajánlatot, segítünk a választásban.',
      backToProducts: 'Termékek',
      requestQuote: 'Ajánlatot kérek erre a termékre',
      featuresTitle: 'Főbb jellemzők',
      otherProducts: 'További termékek a kategóriában',
      media: {
        photo: 'Fotó',
        video: 'Videó',
        view3d: '3D nézet',
        demoNote: 'Minta 3D modell',
        dragHint: 'Húzza az egérrel a forgatáshoz',
      },
    },
    footer: {
      company: 'Blueway Trade Kft.',
      address: 'Telephely: 2142 Nagytarcsa, Déri Miksa u. 10/A.',
      billing: 'Számlázási cím: 2234 Maglód, Lövéte u. 35.',
      phone: '+36 30 279 6679',
      email: 'info@blueway.hu',
      rights: 'Minden jog fenntartva.',
    },
  },
  en: {
    nav: {
      products: 'Products',
      services: 'Services',
      printheads: 'Print heads',
      partners: 'Partners',
      contact: 'Contact',
      quote: 'Request a quote',
    },
    hero: {
      eyebrow: 'Blueway Trade Ltd.',
      title: 'Tailor-made product marking solutions',
      lead: 'Label printing, laser marking, spare parts and service — from the simplest task to complex enterprise systems.',
      ctaPrimary: 'Request a quote',
      ctaSecondary: 'Our products',
    },
    pillars: [
      {
        title: 'Solutions',
        body: 'From the simplest product marking task to complex enterprise systems: label printing, laser marking, spare parts and service.',
      },
      {
        title: 'Support',
        body: 'Continuous, full-scope support for every printer available on the market.',
      },
      {
        title: 'Speed',
        body: 'Stock levels tailored to demand — next-day delivery.',
      },
    ],
    products: {
      title: 'Products',
      lead: 'Label printers, labeling machines, laser engravers and consumables — from the simplest task to complex systems.',
      browseCategory: 'Browse category',
      productCount: (n: number) => `${n} products`,
      comingSoon: 'Products in this category are coming soon — in the meantime, request a quote and we will help you choose.',
      backToProducts: 'Products',
      requestQuote: 'Request a quote for this product',
      featuresTitle: 'Key features',
      otherProducts: 'More products in this category',
      media: {
        photo: 'Photo',
        video: 'Video',
        view3d: '3D view',
        demoNote: 'Sample 3D model',
        dragHint: 'Drag to rotate',
      },
    },
    footer: {
      company: 'Blueway Trade Ltd.',
      address: 'Site: Déri Miksa u. 10/A, 2142 Nagytarcsa, Hungary',
      billing: 'Billing: Lövéte u. 35, 2234 Maglód, Hungary',
      phone: '+36 30 279 6679',
      email: 'info@blueway.hu',
      rights: 'All rights reserved.',
    },
  },
} as const;

export type Dictionary = (typeof dictionaries)[Locale];

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}
