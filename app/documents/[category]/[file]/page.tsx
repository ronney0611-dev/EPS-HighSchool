import ProfileDoc from "@/components/ProfileDoc";
import ClassPlan from "@/pages/ClassPlan";
import ManageClasses from "@/pages/ManageClasses";
import MaterialsCalc from "@/pages/MaterialsCalc";
//import Mostamir from "@/pages/Mostamir";
import TakwimTachkhisiForm from "@/pages/TakwimTachkhisiForm";
import { documentsConfig } from "@/src/config/documents";
import React from "react"

const FilePage = ({ params }: { params: Promise<{ file: string, category: string }> }) => {
  const { category, file } = React.use(params);
  const allCategories = { ...documentsConfig.teacherclass, ...documentsConfig.teacherNote };
  const files = (allCategories[category as keyof typeof allCategories].files as any)[file];

  const components = {
    taqwimTach: <TakwimTachkhisiForm />, //the name should be like the config components
    informationCard: <ProfileDoc />,
    materialsCalc: <MaterialsCalc />,
    classPlan: <ClassPlan />,
    mostamir : <ManageClasses />,
  }

  return (
    <div>
      {components[files.component as keyof typeof components]}
    </div>
  )
}

export default FilePage;
