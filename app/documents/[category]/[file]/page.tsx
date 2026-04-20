import ProfileDoc from "@/components/ProfileDoc";
import ClassPlan from "@/pages/ClassPlan";
import MaterialsCalc from "@/pages/MaterialsCalc";
import Mostamir from "@/pages/Mostamir";
import TakwimTachkhisiForm from "@/pages/TakwimTachkhisiForm";
import TakwinTahsili from "@/pages/TakwinTahsili";
import TaqwimTakwini from "@/pages/TaqwimTakwini";
import { documentsConfig } from "@/src/config/documents";
import React from "react"

const FilePage = ({ params }: { params: Promise<{ file: string, category: string }> }) => {
  const { category, file } = React.use(params);
  const allCategories = { ...documentsConfig.teacherclass, ...documentsConfig.teacherNote };
  const files = (allCategories[category as keyof typeof allCategories].files as any)[file];

  const components = [
    { key: 'taqwimTach', component: <TakwimTachkhisiForm /> }, //the name should be like the config components
    { key: 'informationCard', component: <ProfileDoc /> },
    { key: 'materialsCalc', component: <MaterialsCalc /> },
    { key: 'classPlan', component: <ClassPlan /> },
    { key: 'mostamir', component: <Mostamir /> },
    { key: 'taqwimTaqwini', component: <TaqwimTakwini /> },
    { key: 'taqwimTahsili', component: <TakwinTahsili /> },
  ]

  return (
    <div>
      {components.find(c => c.key === files.component)?.component}
    </div>
  )
}

export default FilePage;
