import GradientText from "./GradientText";
import RenderCard from "./RenderCard";
import axios from "axios";
import { useEffect, useState } from "react";

const Testimonials = () => {

    const [teachers, setTeachers] = useState([]);

    useEffect(() => {
        axios.get('/api/teacher/testimonials').then(res => setTeachers(res.data.teachers));
    }, []);

    const rows = [
        { start: 0, end: 3, className: "animate-scroll" },
        { start: 3, end: 6, className: "animate-scroll-reverse" }
    ];

    return (
        <>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Geist:wght@100..900&display=swap');
                    *{
                        font-family: "Geist", sans-serif;
                    }

                    @keyframes scroll {
                        0% {
                            transform: translateX(0);
                        }
                        100% {
                            transform: translateX(-50%);
                        }
                    }
                    @keyframes scrollReverse {
                        0% {
                            transform: translateX(-50%);
                        }
                        100% {
                            transform: translateX(0);
                        }
                    }
                    .animate-scroll {
                        animation: scroll 15s linear infinite;
                    }
                    .animate-scroll-reverse {
                        animation: scrollReverse 15s linear infinite;
                    }
                `}
            </style>
            <section dir="rtl" id="features-section" className="py-20 px-6 w-full mx-auto font-['Noto_Kufi_Arabic','Cairo',sans-serif]">
                <div className="w-full"> 

                    <div className="flex items-center justify-center gap-3 mx-auto mb-4">
                        <hr className='border border-white w-full my-4 mx-8' />
                        <div className='flex justify-center text-center w-full'>
                            <GradientText
                                colors={["#ffffff", "#ff0000", "#ffffff"]}
                                animationSpeed={5}
                                showBorder={false}
                                className="custom-class my-6 text-5xl md:text-6xl lg:text-6xl"
                            >
                                ماذا يقول الاساتذة عنا؟
                            </GradientText>
                        </div>
                        <hr className='border border-white w-full my-4 mx-8' />
                    </div>

                    <div className="space-y-6">
                        {rows.map((row, rowIndex) => (
                            <div key={rowIndex} className="relative overflow-hidden">
                                <div className="absolute left-0 top-0 bottom-0 w-28 bg-linear-to-r from-[#000000] to-transparent z-10 pointer-events-none"></div>
                                <div className="absolute right-0 top-0 bottom-0 w-28 bg-linear-to-l from-[#000000] to-transparent z-10 pointer-events-none"></div>

                                <div className={`flex gap-6 ${row.className}`}>
                                    {[...teachers.slice(row.start, row.end), ...teachers.slice(row.start, row.end)].map((teacher, index) =>
                                        <RenderCard key={index} teacher={teacher} index={index} />
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    )
}

export default Testimonials 