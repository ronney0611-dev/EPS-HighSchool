'use client'

import ProfileDoc from "@/components/ProfileDoc";
import ClassPlan from "@/pages/ClassPlan";
import MaterialsCalc from "@/pages/MaterialsCalc";
import Mostamir from "@/pages/Mostamir";
import MostamirPrimaire from "@/pages/MostamirPrimaire";
import TakwimTachkhisiForm from "@/pages/TakwimTachkhisiForm";
import TakwinTahsili from "@/pages/TakwinTahsili";
import TaqwimMostamir from "@/pages/TaqwimMostamir";
import TaqwimMostamirPrimaire from "@/pages/TaqwimMostamirPrimaire";
import TaqwimTakwini from "@/pages/TaqwimTakwini";
import TaqwimTakwiniCem from "@/pages/TaqwimTakwiniCem";
import WahdaCem from "@/pages/WahdaCem";
import WahdaP from "@/pages/WahdaP";
import WahdaT from "@/pages/WahdaT";
import { documentsConfig } from "@/src/config/documents";
import { useSession } from "next-auth/react";
import React from "react";
import TaqwimTahsiliCem from "@/pages/TaqwimTahsiliCem";
import Mokhatat from "@/pages/Mokhatat";
import Tawzi3 from "@/pages/Tawzi3";
import TakwimTaskhisiP from "@/pages/TakwimTaskhisiP";
import Barmaja from "@/pages/Barmaja";

interface FileConfig {
  id: string;
  name: string;
  type: 'static' | 'interactive';
  component: string | Record<string, string>;
}

interface CategoryConfig {
  files: Record<string, FileConfig>;
}

const FilePage = ({ params }: { params: Promise<{ file: string; category: string }> }) => {
  const { category, file } = React.use(params);
  const { data: session, status } = useSession();

  const allCategories = { 
    ...documentsConfig.teacherclass, 
    ...documentsConfig.teacherNote 
  } as Record<string, CategoryConfig>;

  if (status === "loading") {
    return <div className="text-center text-white my-20 font-medium">جاري تحميل الاستمارة...</div>;
  }

  const activeCategory = allCategories[category];
  const fileData = activeCategory?.files?.[file];

  if (!fileData) {
    return <div className="text-center text-red-500 my-20">الملف غير موجود</div>;
  }

  // 1. Extract the current school level string safely from session
  const teacherLevel = session?.user?.level || 'lycee';

  // 2. Resolve the key string if component is an object variant map, else treat as raw string
  const activeComponentKey = fileData.component && typeof fileData.component === 'object'
    ? fileData.component[teacherLevel]
    : fileData.component;

  // 3. Match keys directly with your values inside your centralized documentsConfig fields
  const components = [
    { key: 'informationCard', component: <ProfileDoc /> }, 
    { key: 'materialsCalc', component: <MaterialsCalc /> },
    { key: 'barmaja', component: <Barmaja /> },
    { key: 'classPlan', component: <ClassPlan /> },
    { key: 'baladiyat', component: <ClassPlan /> },
    { key: 'mokhatat', component: <Mokhatat /> }, 
    { key: 'tawzi3', component: <Tawzi3 /> }, 
    
    // Wahda variants
    { key: 'wahda', component: <WahdaT /> },
    { key: 'wahdaCem', component: <WahdaCem /> },
    { key: 'wahdaPrimaire', component: <WahdaP /> },

    // Diagnostic evaluation variations
    { key: 'taqwimTach', component: <TakwimTachkhisiForm /> },
    { key: 'taqwimTachCem', component: <TakwimTachkhisiForm /> },
    { key: 'taqwimTachPrimaire', component: <TakwimTaskhisiP /> },

    // Presence/Monitoring tracking variants
    { key: 'mostamir', component: <Mostamir /> },
    { key: 'mostamirPrimaire', component: <MostamirPrimaire /> },

    // Continuous & final grade calculations
    { key: 'taqwimMostamir', component: <TaqwimMostamir /> },
    { key: 'taqwimMostamirPrimaire', component: <TaqwimMostamirPrimaire /> },
    { key: 'taqwimTakwini', component: <TaqwimTakwini /> },
    { key: 'taqwimTakwiniCem', component: <TaqwimTakwiniCem /> },
    { key: 'taqwimTahsili', component: <TakwinTahsili /> },
    { key: 'taqwimTahsiliCem', component: <TaqwimTahsiliCem /> },
  ];

  const matched = components.find(c => c.key === activeComponentKey);

  return (
    <div>
      {matched ? matched.component : <div className="text-center text-red-500 my-20">الواجهة غير متوفرة لهذا المستوى</div>}
    </div>
  );
};

export default FilePage;