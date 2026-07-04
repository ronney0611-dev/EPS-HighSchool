'use client';

import { documentsConfig } from '@/src/config/documents';
import GradientText from '../../components/GradientText';
import { useSession } from 'next-auth/react';
import LockedDocCard from '@/components/LockVideo';
import { useSessionRefresh } from '@/hooks/useSessionRefresh';
import { useEffect, useState } from 'react';

const DocumentsPage = () => {
  const { data: session, status } = useSession();
  const { refresh } = useSessionRefresh();
  const [isActivated, setIsActivated] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (status !== 'authenticated') return;
    refresh().then((data) => {
      setIsActivated(Boolean(data?.isPaid));
      setChecking(false);
    })
  }, [status]);

  if (status === "loading" || checking) {
    return <div className="text-center text-white my-20 font-medium">جاري تحميل البيانات...</div>;
  }

  const teacherLevel = session?.user?.level || 'lycee';

  const filteredTeacherClass = Object.entries(documentsConfig.teacherclass).filter(
    ([_, doc]) => doc.levels.includes(teacherLevel)
  );

  const filteredTeacherNote = Object.entries(documentsConfig.teacherNote).filter(
    ([_, doc]) => doc.levels.includes(teacherLevel)
  );

  return (
    <div dir="rtl" className='my-8 mx-8 grid gap-4 bg-black text-white' >

      <div className='flex flex-col justify-center items-center' >
        <div className='flex justify-center text-center '>
          <GradientText
            colors={["#ffffff", "#ff0000", "#ffffff"]}
            animationSpeed={5}
            showBorder={false}
            className="custom-class my-6 text-5xl md:text-6xl lg:text-6xl"
          >
            حقيبة الاستاذ
          </GradientText>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {
            filteredTeacherClass.map(([key, doc]) => {
              return (
                <div key={key} className=' p-4 flex flex-col justify-center items-center border border-gray-500 rounded-2xl transition-transform duration-300 hover:scale-105' >
                  <LockedDocCard
                    key={key}
                    title={doc.name}
                    description={doc.description}
                    imageSrc={doc.image}
                    youtubeVideoId={doc.youtubeVideoId}
                    documentHref={`/documents/${key}`}
                    activationHref="/payment"
                    isActivated={isActivated}
                  />
                </div>
              )
            })
          }
        </div>
      </div>

      <div className='flex flex-col justify-center items-center'>
        <div className='flex justify-center text-center '>
          <GradientText
            colors={["#ffffff", "#ff0000", "#ffffff"]}
            animationSpeed={5}
            showBorder={false}
            className="custom-class my-6 text-5xl md:text-6xl lg:text-6xl"
          >
            دفتر التنقيط
          </GradientText>
        </div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
          {
            filteredTeacherNote.map(([key, doc]) => {
              return (
                <div key={key} className=' p-4 flex flex-col justify-center items-center border border-gray-500 rounded-2xl transition-transform duration-300 hover:scale-105' >
                  <LockedDocCard
                    key={key}
                    title={doc.name}
                    description={doc.description}
                    imageSrc={doc.image}
                    youtubeVideoId={doc.youtubeVideoId}
                    documentHref={`/documents/${key}`}
                    activationHref="/payment"
                    isActivated={isActivated}
                  />
                </div>
              )
            })
          }
        </div>
      </div>

    </div>
  )
}

export default DocumentsPage