import ProfileDoc from "@/components/ProfileDoc";
import TakwimTachkhisiForm from "@/pages/TakwimTachkhisiForm";
import { documentsConfig } from "@/src/config/documents";
import React from "react"

const FilePage = ({ params }: { params: Promise<{ file: string, category: string }> }) => {
  const { category, file } = React.use(params);
  const files = (documentsConfig[category as keyof typeof documentsConfig].files as any)[file ];
  console.log(files);

  const components = {
    taqwimTach: <TakwimTachkhisiForm />, //the name should be like the config components
    informationCard: <ProfileDoc />
  }

  return (
    <div>
      {components[files.component]}
    </div>
  )
}

export default FilePage;
