import TakwimGroupe from '@/components/TakwimGroupe'
import TakwimTshTable from '@/components/TakwimTshTable'

const TakwimTachkhisiForm = () => {
  return (
    <div className='flex flex-col gap-8'>
      <TakwimTshTable />
      <hr className='border border-white w-full m-4' />
      <TakwimGroupe />
    </div>
  )
}

export default TakwimTachkhisiForm
