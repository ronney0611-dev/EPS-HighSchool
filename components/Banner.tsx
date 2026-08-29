
const Banner = ({ className }: { className?: string }) => {
    return (
        <div dir="rtl" className={`w-full px-2 flex justify-center py-2.5 font-medium text-lg text-white text-center ${className}`}>
            <p>
                بـ <strong>3000 دج</strong> فقط للعام الدراسي كاملا، <strong><a href="/payment" className="underline">فعل الحساب الان</a></strong> وانضم الى اكثر من <strong>150</strong> مستفيد.
            </p>
        </div>
    );
}

export default Banner
