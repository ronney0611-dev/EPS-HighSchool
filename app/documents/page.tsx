import { documentsConfig } from '@/src/config/documents';

const DocumentsPage = () => {
  return (
    <div>
      {
        //Object.values(documentsConfig) == when we have an object not an array.        
        Object.values(documentsConfig).map((doc) => {
          return (
            <div key={doc.id}>
              <h1>{doc.name}</h1>
            </div>
          )
        })
      }
    </div>
  )
}

export default DocumentsPage
