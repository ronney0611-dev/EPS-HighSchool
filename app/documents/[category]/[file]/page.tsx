import ProfileDoc from "@/components/ProfileDoc";
import MaterialsCalc from "@/pages/MaterialsCalc";
import TakwimTachkhisiForm from "@/pages/TakwimTachkhisiForm";
import { documentsConfig } from "@/src/config/documents";
import React from "react"

const FilePage = ({ params }: { params: Promise<{ file: string, category: string }> }) => {
  const { category, file } = React.use(params);
  const files = (documentsConfig[category as keyof typeof documentsConfig].files as any)[file ];
  console.log(files);

  const components = {
    taqwimTach: <TakwimTachkhisiForm />, //the name should be like the config components
    informationCard: <ProfileDoc />,
    materialsCalc:<MaterialsCalc />,
  }

  return (
    <div>
      {components[files.component as keyof typeof components]}
    </div>
  )
}

export default FilePage;
