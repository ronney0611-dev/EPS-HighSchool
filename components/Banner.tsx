
const Banner = ({ className }: { className?: string }) => {
    return (
        <div dir="rtl" className={`w-full px-2 flex justify-center py-2.5 font-medium text-lg text-white text-center ${className}`}>
            <p>
                بـ 3000 دج فقط للعام الدراسي كاملا، ابدأ العام الدراسي بشكل مختلف وانضم الى اكثر من 150 مستفيد.       
                
            </p>
        </div>
    );
}

export default Banner
