export type Brand = 'MG' | 'ISUZU' | 'CHEVROLET' | 'BAIC';

export interface BrandInfo {
  name: string;
  color: string;
  logo: string;
  slogan: string;
  description: string;
}

export const BRANDS: Record<Brand, BrandInfo> = {
  MG: {
    name: 'MG Motor',
    color: '#C0392B',
    logo: '/images/brands/mg-logo.png',
    slogan: 'Drive Evolution',
    description: 'Une alliance iconique entre héritage britannique et innovation technologique.'
  },
  ISUZU: {
    name: 'ISUZU',
    color: '#1A5276',
    logo: '/images/brands/isuzu-logo.png',
    slogan: 'With You Always',
    description: 'La référence mondiale de la robustesse et des moteurs diesel haute performance.'
  },
  CHEVROLET: {
    name: 'CHEVROLET',
    color: '#B7950B',
    logo: '/images/brands/chevrolet-logo.png',
    slogan: 'Find New Roads',
    description: 'L\'excellence automobile américaine, alliant puissance, style et polyvalence.'
  },
  BAIC: {
    name: 'BAIC',
    color: '#566573',
    logo: '/images/brands/baic-logo.png',
    slogan: 'Drive Your Dreams',
    description: 'Une nouvelle ère de transport alliant design audacieux et mobilité intelligente.'
  }
};
