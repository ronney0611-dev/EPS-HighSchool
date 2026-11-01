const PH_INK = "#111";
const PH_GRAY = "#777";
const Teacher = ({ x, y }: { x: number; y: number }) => (
    <g>
        <rect x={x - 6} y={y - 6} width={12} height={12} fill="#fff" stroke={PH_INK} strokeWidth={1.3} />
        <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={PH_INK}>أ</text>
    </g>
);
const Pupil = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={5} fill={PH_INK} />;
const Cone = ({ x, y }: { x: number; y: number }) => (
    <polygon points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`} fill="none" stroke={PH_INK} strokeWidth={1.1} />
);

// اصطفاف: pupils in one line facing the teacher (لباس, مناداة, شرح الهدف, تحية)
export function LineupDiagram() {
    const xs = Array.from({ length: 10 }, (_, i) => 52 + i * 24);
    return (
        <svg viewBox="0 0 320 112" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
            <rect x={20} y={8} width={280} height={84} fill="#f4f4f4" stroke={PH_GRAY} strokeWidth={0.8} />
            <Teacher x={160} y={28} />
            <text x={174} y={31} fontSize={8} fill={PH_INK}>الأستاذ</text>
            <line x1={40} y1={74} x2={280} y2={74} stroke={PH_GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
            {xs.map((x, i) => (
                <g key={i}>
                    <line x1={x} y1={62} x2={x} y2={54} stroke={PH_INK} strokeWidth={1} />
                    <Pupil x={x} y={66} />
                </g>
            ))}
            <text x={160} y={106} textAnchor="middle" fontSize={9} fill={PH_INK}>اصطفاف، مراقبة اللباس، المناداة، شرح هدف الحصة ثم التحية</text>
        </svg>
    );
}

// stadium: athletics track around the field, pupils running on the track (anticlockwise)
export function WarmupDiagram() {
    const L = 92, R = 228, cy = 72;
    const stadium = (r: number) =>
        `M ${L} ${cy - r} L ${R} ${cy - r} A ${r} ${r} 0 0 1 ${R} ${cy + r} L ${L} ${cy + r} A ${r} ${r} 0 0 1 ${L} ${cy - r} Z`;
    const run = 50; // middle of the track
    const pupils = [
        ...[105, 135, 215].map((x) => ({ x, y: cy - run })),
        ...[105, 185, 215].map((x) => ({ x, y: cy + run })),
        ...[-0.6, 0.6].map((a) => ({ x: L - run * Math.cos(a), y: cy + run * Math.sin(a) })),
        ...[-0.6, 0.6].map((a) => ({ x: R + run * Math.cos(a), y: cy + run * Math.sin(a) })),
    ];
    return (
        <svg viewBox="0 0 320 150" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
            <defs>
                <marker id="ph2-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill={PH_INK} />
                </marker>
            </defs>
            {/* track */}
            <path d={stadium(58)} fill="#e9e9e9" stroke={PH_INK} strokeWidth={1.2} />
            <path d={stadium(54)} fill="none" stroke={PH_GRAY} strokeWidth={0.5} />
            <path d={stadium(46)} fill="none" stroke={PH_GRAY} strokeWidth={0.5} />
            <path d={stadium(42)} fill="#fff" stroke={PH_INK} strokeWidth={1} />
            {/* field */}
            <rect x={L - 14} y={cy - 30} width={R - L + 28} height={60} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
            <line x1={(L + R) / 2} y1={cy - 30} x2={(L + R) / 2} y2={cy + 30} stroke={PH_GRAY} strokeWidth={0.9} />
            <circle cx={(L + R) / 2} cy={cy} r={10} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
            <rect x={L - 14} y={cy - 14} width={16} height={28} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
            <rect x={R - 2} y={cy - 14} width={16} height={28} fill="none" stroke={PH_GRAY} strokeWidth={0.9} />
            {/* running direction */}
            <line x1={198} y1={cy - run} x2={155} y2={cy - run} stroke={PH_INK} strokeWidth={1.2} markerEnd="url(#ph2-arrow)" />
            <line x1={122} y1={cy + run} x2={165} y2={cy + run} stroke={PH_INK} strokeWidth={1.2} markerEnd="url(#ph2-arrow)" />
            {pupils.map((p, i) => <Pupil key={i} x={p.x} y={p.y} />)}
            <Teacher x={(L + R) / 2 + 30} y={cy} />
            <text x={160} y={146} textAnchor="middle" fontSize={9} fill={PH_INK}>جري خفيف حول الملعب ثم حركات الإحماء العام والخاص</text>
        </svg>
    );
}

export function CooldownDiagram() {
    const cx = 160, cy = 34, r = 78;
    const pupils = Array.from({ length: 9 }, (_, i) => {
        const a = Math.PI * (0.15 + (0.7 * i) / 8);
        return { x: cx + r * Math.cos(a) * 1.5, y: cy + r * Math.sin(a) * 0.95 };
    });
    return (
        <svg viewBox="0 0 320 130" style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} role="img">
            <rect x={20} y={10} width={280} height={104} fill="#f4f4f4" stroke={PH_GRAY} strokeWidth={0.8} />
            {pupils.map((p, i) => (
                <g key={i}>
                    <line x1={p.x} y1={p.y - 6} x2={cx + (p.x - cx) * 0.45} y2={cy + (p.y - cy) * 0.45} stroke={PH_GRAY} strokeWidth={0.7} strokeDasharray="2 3" />
                    <Pupil x={p.x} y={p.y} />
                </g>
            ))}
            <Teacher x={cx} y={cy} />
            <text x={160} y={126} textAnchor="middle" fontSize={9} fill={PH_INK}>التلاميذ في نصف دائرة: تمديدات، تنفس، مناقشة الحصة</text>
        </svg>
    );
}