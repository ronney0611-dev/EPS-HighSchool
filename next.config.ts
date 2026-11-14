import type { NextConfig } from "next";

const pagesAsComponents = [
  'Barmaja', 'BarnamajUsbu3i', 'ClassPlan', 'Dailylogpage', 'DispoCard',
  'FicheTechWizard', 'FicheTechWizardP', 'FieldTest', 'Games', 'ManageTeacherClass',
  'MaterialsCalc', 'Mokhatat', 'Mostamir', 'MostamirPrimaire', 'PlanOfYearLeecy',
  'ShabakaTahliliyaPrimaire', 'TakwimTachkhisiForm', 'TakwinTahsili', 'TaqwimMostamir',
  'TaqwimMostamirPrimaire', 'TaqwimTakwini', 'Tawzi3', 'Wahdaprimairegeneratorpage',
  'WahdaT', 'YawmiLycee',
];

const nextConfig: NextConfig = {
  async redirects() {
    return pagesAsComponents.map(p => ({
      source: `/${p}`,
      destination: '/documents',
      permanent: false,
    }));
  },
};

export default nextConfig;