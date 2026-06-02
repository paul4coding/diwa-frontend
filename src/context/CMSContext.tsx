import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

interface CMSContextType {
  cmsData: any;
  loading: boolean;
  refreshCMS: () => Promise<void>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsData, setCmsData] = useState<any>({
    hero: [],
    services: [],
    footer: {
      address: '2556, Boulevard de la paix, Tokoin Aéroport - 08 BP 8535, Lomé-Togo',
      phone: '(+228) 22 61 27 76 / 77 / 78',
      email: 'info@diwatg.com',
      socials: { facebook: 'https://facebook.com/Diwainternational', instagram: 'https://instagram.com/Diwainternational', linkedin: 'https://linkedin.com/company/Diwainternational', twitter: 'https://twitter.com/Diwainternational' }
    },
    sections: {
      about: { title: "L'excellence DIWA", text: "Depuis plus de 20 ans...", parallaxImage: "" },
      products: { title: "Pièces & Accessoires", subtitle: "Le meilleur pour votre moteur", bgImage: "" }
    },
    brands: [
      { name: 'MG', logo: '/assets/brands/MG_Logo.png' },
      { name: 'BAIC', logo: '/assets/brands/BAIC_Logo.png' },
      { name: 'ISUZU', logo: '/assets/brands/ISUZU_Logo.png' },
      { name: 'CHEVROLET', logo: '/assets/brands/CHEVROLET_Logo.png' }
    ]
  });
  const [loading, setLoading] = useState(true);

  const refreshCMS = async () => {
    try {
      const response = await axiosInstance.get('/api/v1/cms/all');
      if (response.data.statut === 200) {
        const rawData = response.data.data;
        const mappedData: any = { ...cmsData };
        rawData.forEach((item: any) => {
          try {
            mappedData[item.contentKey] = JSON.parse(item.jsonContent);
          } catch (e) {
            console.error(`Error parsing CMS ${item.contentKey}`, e);
          }
        });
        setCmsData(mappedData);
      }
    } catch (error) {
      console.error("Error refreshing CMS:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshCMS();
  }, []);

  return (
    <CMSContext.Provider value={{ cmsData, loading, refreshCMS }}>
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (context === undefined) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
