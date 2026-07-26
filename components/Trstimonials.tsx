import RenderCard from "./RenderCard";
import GradientText from "./GradientText";
import axios from "axios";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Testimonials = () => {
    const [teachers, setTeachers] = useState([]);
    const [current, setCurrent] = useState(0);
    const [itemsPerView, setItemsPerView] = useState(1);

    useEffect(() => {
        axios.get('/api/teacher/testimonials').then(res => setTeachers(res.data.teachers));
    }, []);

    useEffect(() => {
        const updateItemsPerView = () => {
            setItemsPerView(window.innerWidth >= 768 ? 3 : 1);
        };
        updateItemsPerView();
        window.addEventListener('resize', updateItemsPerView);
        return () => window.removeEventListener('resize', updateItemsPerView);
    }, []);

    const next = () => setCurrent((prev) => (prev + 1) % teachers.length);
    const prev = () => setCurrent((prev) => (prev - 1 + teachers.length) % teachers.length);

    const visibleTeachers = Array.from({ length: Math.min(itemsPerView, teachers.length) }, (_, i) =>
        teachers[(current + i) % teachers.length]
    );

    return (
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

                {teachers.length === 0 ? null : (
                    <div className="flex items-center justify-center gap-4 max-w-6xl mx-6 md:mx-auto">
                        <button
                            onClick={prev}
                            className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors shrink-0"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>

                        <div className="flex gap-6 justify-center flex-1 overflow-hidden">
                            {visibleTeachers.map((teacher, i) => (
                                <RenderCard key={`${current}-${i}`} teacher={teacher} index={i} />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors shrink-0"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                    </div>
                )}

                {teachers.length > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        {teachers.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrent(i)}
                                className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-red-500' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </section>
    )
}

export default Testimonials