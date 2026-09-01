const Banner = ({ className = "" }: { className?: string }) => {
    return (
        <div 
            dir="rtl" 
            className={`w-full bg-zinc-950  px-4 py-3 text-zinc-200 text-center font-['Cairo',sans-serif] text-sm sm:text-base ${className}`}
        >
            <div className="max-w-7xl mx-auto px-4 flex items-center justify-center gap-1.5 flex-wrap">
                <p className="leading-normal">
                    بـ <strong className="text-white font-extrabold px-1">3000 دج</strong> فقط للعام الدراسي كاملا،{" "}
                    <strong>
                        <a 
                            href="/payment" 
                            className="inline-block text-red-400 font-bold hover:text-red-300 underline underline-offset-4 decoration-red-500/60 transition-colors duration-150"
                        >
                            فعل الحساب الان
                        </a>
                    </strong>{" "}
                    وانضم الى اكثر من <strong className="text-white font-bold px-1">150</strong> مستفيد.
                </p>
            </div>
        </div>
    );
}

export default Banner;