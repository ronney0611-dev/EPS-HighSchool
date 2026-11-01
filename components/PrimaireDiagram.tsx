export type PrimaireDiagramSpec = {
    template:
    | "circle" | "scatter" | "relay" | "course" | "hoops" | "tunnel"
    | "train" | "collect" | "targets" | "race" | "ladder" | "pairs"
    | "facing" | "slalom" | "lines" | "jump" | "throw" | "perimeter";
    center?: "teacher" | "chaser" | "ball" | "cone";   // circle
    arrows?: "around" | "out" | "pass";                 // circle
    chaser?: boolean;                                   // circle / hoops / scatter: one pupil chasing
    chairs?: boolean;                                   // circle: chairs (كرسي الملك)
    signal?: "clap" | "whistle" | "colors" | "numbers" | "voice";
    mats?: boolean;                                     // scatter / relay: pupils on mats
    cones?: boolean;                                    // scatter / hoops: cones on the ground
    teams?: number;                                     // relay / tunnel / collect / train (2..3)
    hoops?: number;                                     // relay: hoops on the way
    back?: "run" | "same";                              // relay: dashed way back
    stations?: number;                                  // course (3..6)
    items?: "balls" | "cones";                          // collect
    pairs?: boolean;                                    // race / relay: pupils by two
    target?: "cones" | "hoop" | "rings" | "goal";       // targets: what is aimed at
    moving?: boolean;                                   // targets: run-up steps before the throw
    plate?: boolean;                                    // lines: a plate between the 2 lines
    runup?: boolean;                                    // jump / throw: approach run
    zones?: number;                                     // throw: numbered zones (3..5)
    obstacles?: boolean;                                // slalom / facing: hoops or hurdles on the way
};

const INK = "#111";
const GRAY = "#777";
const W = 320;

const SIGNAL: Record<string, string> = {
    clap: "تصفيق", whistle: "صفارة", colors: "ألوان", numbers: "أرقام", voice: "إشارة صوتية",
};

/* ---------- small pieces ---------- */
const Field = ({ h }: { h: number }) => <rect x={10} y={8} width={W - 20} height={h - 16} fill="#f4f4f4" stroke={GRAY} strokeWidth={0.8} />;
const Pupil = ({ x, y, hollow }: { x: number; y: number; hollow?: boolean }) =>
    <circle cx={x} cy={y} r={5} fill={hollow ? "#fff" : INK} stroke={INK} strokeWidth={1.3} />;
const Teacher = ({ x, y }: { x: number; y: number }) => (
    <g>
        <rect x={x - 6} y={y - 6} width={12} height={12} fill="#fff" stroke={INK} strokeWidth={1.3} />
        <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK}>أ</text>
    </g>
);
const Cone = ({ x, y }: { x: number; y: number }) =>
    <polygon points={`${x},${y - 5} ${x - 4},${y + 3} ${x + 4},${y + 3}`} fill="none" stroke={INK} strokeWidth={1.1} />;
const Hoop = ({ x, y, r = 11 }: { x: number; y: number; r?: number }) =>
    <ellipse cx={x} cy={y} rx={r} ry={r * 0.72} fill="none" stroke={INK} strokeWidth={1.1} />;
const Ball = ({ x, y }: { x: number; y: number }) =>
    <circle cx={x} cy={y} r={3} fill="#fff" stroke={INK} strokeWidth={1.1} />;
const Mat = ({ x, y }: { x: number; y: number }) =>
    <rect x={x - 12} y={y - 6} width={24} height={12} rx={2} fill="#e4e4e4" stroke={GRAY} strokeWidth={0.7} />;
const Arrow = ({ d, dashed }: { d: string; dashed?: boolean }) =>
    <path d={d} fill="none" stroke={INK} strokeWidth={1.1} strokeDasharray={dashed ? "4 3" : undefined} markerEnd="url(#pd-arrow)" />;
const Label = ({ x, y, t, anchor = "middle" }: { x: number; y: number; t: string; anchor?: "start" | "middle" | "end" }) =>
    <text x={x} y={y} textAnchor={anchor} fontSize={8} fill={INK}>{t}</text>;

const Signal = ({ s, x = 296, y = 22 }: { s?: string; x?: number; y?: number }) => (
    <g>
        <Teacher x={x} y={y} />
        {s && <Label x={x - 10} y={y + 3} t={SIGNAL[s] ?? ""} anchor="end" />}
    </g>
);

// fixed "random" spread of pupils (same drawing every time)
const SPREAD: [number, number][] = [
    [52, 40], [96, 30], [140, 46], [186, 32], [232, 44], [70, 78], [118, 88], [164, 74],
    [212, 86], [256, 72], [48, 112], [100, 120], [150, 110], [200, 122], [246, 108],
];

/* ---------- templates ---------- */
function body(s: PrimaireDiagramSpec): { h: number; el: React.ReactNode } {
    const teams = Math.min(Math.max(s.teams ?? 2, 1), 3);

    switch (s.template) {
        case "circle": {
            const h = 150, cx = 150, cy = 75, r = 46, n = 10;
            const pts = Array.from({ length: n }, (_, i) => {
                const a = (i / n) * Math.PI * 2 - Math.PI / 2;
                return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), a };
            });
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <circle cx={cx} cy={cy} r={r} fill="none" stroke={GRAY} strokeWidth={0.8} strokeDasharray="3 3" />
                        {s.chairs && pts.slice(0, n - 1).map((p, i) => (
                            <rect key={`c${i}`} x={cx + (r - 13) * Math.cos(p.a) - 4} y={cy + (r - 13) * Math.sin(p.a) - 4} width={8} height={8} fill="none" stroke={INK} strokeWidth={1} />
                        ))}
                        {pts.map((p, i) => <Pupil key={i} x={p.x} y={p.y} />)}
                        {s.arrows === "around" && <Arrow d={`M ${cx + r + 14} ${cy - 20} A ${r + 14} ${r + 14} 0 0 1 ${cx + r + 6} ${cy + 26}`} />}
                        {s.arrows === "out" && pts.filter((_, i) => i % 2 === 0).map((p, i) => (
                            <Arrow key={`o${i}`} d={`M ${cx + (r + 8) * Math.cos(p.a)} ${cy + (r + 8) * Math.sin(p.a)} L ${cx + (r + 22) * Math.cos(p.a)} ${cy + (r + 22) * Math.sin(p.a)}`} />
                        ))}
                        {s.arrows === "pass" && <Arrow d={`M ${cx + (r - 14) * Math.cos(-1.4)} ${cy + (r - 14) * Math.sin(-1.4)} A ${r - 14} ${r - 14} 0 0 1 ${cx + (r - 14) * Math.cos(0.6)} ${cy + (r - 14) * Math.sin(0.6)}`} />}
                        {s.arrows === "pass" && <Ball x={pts[0].x + 9} y={pts[0].y + 2} />}
                        {s.center === "teacher" && <Teacher x={cx} y={cy} />}
                        {s.center === "ball" && <Ball x={cx} y={cy} />}
                        {s.center === "cone" && <Cone x={cx} y={cy} />}
                        {s.center === "chaser" && <Pupil x={cx} y={cy} hollow />}
                        {s.chaser && (
                            <g>
                                <Pupil x={cx + r + 30} y={cy + 30} hollow />
                                <Arrow d={`M ${cx + r + 30} ${cy + 22} Q ${cx + r + 40} ${cy - 10} ${cx + r + 18} ${cy - 40}`} dashed />
                            </g>
                        )}
                        {s.center !== "teacher" && <Signal s={s.signal} />}
                    </>
                ),
            };
        }

        case "scatter": {
            const h = 150;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {s.cones && [[30, 20], [270, 20], [30, 132], [270, 132]].map(([x, y], i) => <Cone key={`k${i}`} x={x} y={y} />)}
                        {SPREAD.slice(0, 13).map(([x, y], i) => (
                            <g key={i}>
                                {s.mats && <Mat x={x} y={y} />}
                                <Pupil x={x} y={y} hollow={s.chaser && i === 7} />
                            </g>
                        ))}
                        {s.chaser && <Arrow d={`M 170 70 L 196 56`} dashed />}
                        <Signal s={s.signal} />
                    </>
                ),
            };
        }

        case "relay": {
            const h = 40 + teams * 40;
            const rowY = (t: number) => 34 + t * 40;
            const startX = 262, endX = 46;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <line x1={startX - 10} y1={14} x2={startX - 10} y2={h - 14} stroke={INK} strokeWidth={1.6} />
                        {Array.from({ length: teams }, (_, t) => {
                            const y = rowY(t);
                            const hoops = Math.min(s.hoops ?? 0, 4);
                            return (
                                <g key={t}>
                                    {[0, 1, 2, 3].map((k) => (
                                        <g key={k}>
                                            {s.mats && <Mat x={startX + 4 + k * 14} y={y} />}
                                            <Pupil x={startX + k * 14} y={y} />
                                            {s.pairs && <Pupil x={startX + k * 14} y={y + 11} />}
                                        </g>
                                    ))}
                                    {Array.from({ length: hoops }, (_, k) => <Hoop key={`h${k}`} x={startX - 52 - k * ((startX - endX - 80) / Math.max(hoops, 1))} y={y} r={9} />)}
                                    <Cone x={endX} y={y} />
                                    <Arrow d={`M ${startX - 14} ${y - 8} L ${endX + 10} ${y - 8}`} />
                                    {s.back !== "same" && <Arrow d={`M ${endX + 10} ${y + 9} L ${startX - 14} ${y + 9}`} dashed />}
                                </g>
                            );
                        })}
                        <Signal s={s.signal} x={296} y={h - 18} />
                    </>
                ),
            };
        }

        case "course": {
            const h = 150;
            const n = Math.min(Math.max(s.stations ?? 4, 3), 6);
            const pts: [number, number][] = [[262, 40], [196, 104], [130, 40], [64, 104], [64, 40], [130, 116]].slice(0, n) as [number, number][];
            const icons = [
                (x: number, y: number) => <Hoop x={x} y={y} r={12} />,
                (x: number, y: number) => <Mat x={x} y={y} />,
                (x: number, y: number) => <g><Cone x={x - 8} y={y} /><Cone x={x + 8} y={y} /></g>,
                (x: number, y: number) => <g><line x1={x - 12} y1={y} x2={x + 12} y2={y} stroke={INK} strokeWidth={2} /><line x1={x - 12} y1={y + 4} x2={x - 12} y2={y - 4} stroke={INK} /><line x1={x + 12} y1={y + 4} x2={x + 12} y2={y - 4} stroke={INK} /></g>,
            ];
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <Pupil x={296} y={40} />
                        <Arrow d={`M 288 40 L ${pts[0][0] + 16} ${pts[0][1]}`} />
                        {pts.map(([x, y], i) => (
                            <g key={i}>
                                {icons[i % icons.length](x, y)}
                                <text x={x} y={y - 16} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK}>{i + 1}</text>
                                {i < pts.length - 1 && <Arrow d={`M ${x + (pts[i + 1][0] - x) * 0.25} ${y + (pts[i + 1][1] - y) * 0.25} L ${x + (pts[i + 1][0] - x) * 0.72} ${y + (pts[i + 1][1] - y) * 0.72}`} />}
                            </g>
                        ))}
                        <Signal s={s.signal} x={296} y={124} />
                    </>
                ),
            };
        }

        case "hoops": {
            const h = 150;
            const spots = SPREAD.slice(0, 12);
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {spots.map(([x, y], i) => <Hoop key={`h${i}`} x={x} y={y} />)}
                        {spots.map(([x, y], i) => (i % 3 !== 2 ? <Pupil key={i} x={x} y={y} /> : null))}
                        {s.cones && <><Cone x={30} y={20} /><Cone x={270} y={132} /></>}
                        {s.chaser
                            ? <g><Pupil x={278} y={80} hollow /><Arrow d="M 270 80 L 246 92" dashed /></g>
                            : <Arrow d={`M ${spots[0][0] + 12} ${spots[0][1]} Q ${spots[1][0] - 6} ${spots[1][1] - 18} ${spots[1][0] - 10} ${spots[1][1] - 6}`} />}
                        <Signal s={s.signal} x={296} y={20} />
                    </>
                ),
            };
        }

        case "tunnel": {
            const h = 30 + teams * 42;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {Array.from({ length: teams }, (_, t) => {
                            const y = 32 + t * 42;
                            return (
                                <g key={t}>
                                    {[0, 1, 2, 3, 4].map((k) => {
                                        const x = 230 - k * 34;
                                        return (
                                            <g key={k}>
                                                <Pupil x={x} y={y - 7} />
                                                <line x1={x - 4} y1={y - 2} x2={x - 8} y2={y + 8} stroke={INK} strokeWidth={1.2} />
                                                <line x1={x + 4} y1={y - 2} x2={x + 8} y2={y + 8} stroke={INK} strokeWidth={1.2} />
                                            </g>
                                        );
                                    })}
                                    <Ball x={262} y={y + 5} />
                                    <Arrow d={`M 254 ${y + 5} L 70 ${y + 5}`} dashed />
                                </g>
                            );
                        })}
                        <Signal s={s.signal} x={296} y={h - 18} />
                    </>
                ),
            };
        }

        case "train": {
            const h = 150;
            const trains = [[[230, 40], [214, 40], [198, 40], [182, 40]], [[110, 96], [126, 96], [142, 96], [158, 96]], [[80, 40], [64, 40], [48, 40], [32, 40]]].slice(0, teams + 1);
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {trains.map((tr, t) => (
                            <g key={t}>
                                <polyline points={tr.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={INK} strokeWidth={1.4} />
                                {tr.map(([x, y], k) => <Pupil key={k} x={x} y={y} />)}
                            </g>
                        ))}
                        <Arrow d="M 238 40 Q 270 40 270 80" />
                        <Arrow d="M 104 96 Q 80 96 80 120" />
                        <Arrow d="M 24 40 Q 18 70 40 80" />
                        <Signal s={s.signal} x={296} y={130} />
                    </>
                ),
            };
        }

        case "collect": {
            const h = 40 + teams * 44;
            const items: [number, number][] = [[150, 30], [120, 52], [180, 50], [100, 84], [160, 76], [204, 92], [130, 108], [176, 118], [110, 128]];
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {items.filter(([, y]) => y < h - 14).map(([x, y], i) => (s.items === "cones" ? <Cone key={i} x={x} y={y} /> : <Ball key={i} x={x} y={y} />))}
                        {Array.from({ length: teams }, (_, t) => {
                            const y = 32 + t * 44;
                            return (
                                <g key={t}>
                                    <rect x={268} y={y - 8} width={16} height={16} fill="none" stroke={INK} strokeWidth={1.2} />
                                    {[0, 1, 2].map((k) => <Pupil key={k} x={250} y={y - 12 + k * 12} />)}
                                    <Arrow d={`M 242 ${y} L ${200 - t * 10} ${y + 6}`} />
                                </g>
                            );
                        })}
                        <Signal s={s.signal} x={26} y={20} />
                    </>
                ),
            };
        }

        case "targets": {
            const h = 130;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <line x1={240} y1={16} x2={240} y2={h - 16} stroke={INK} strokeWidth={1.6} />
                        {[34, 64, 94].map((y, i) => (
                            <g key={i}>
                                <Pupil x={254} y={y} />
                                <Pupil x={278} y={y} />
                                {s.mats && <Mat x={254} y={y} />}
                                <Ball x={244} y={y + 6} />
                                {s.moving && <Arrow d={`M 290 ${y - 8} L 262 ${y - 8}`} />}
                                <Arrow d={`M 236 ${y + 6} L ${s.target === "rings" ? 96 : 84} ${y}`} dashed />
                                {(!s.target || s.target === "cones") && <g><Cone x={70} y={y - 6} /><Cone x={62} y={y + 4} /><Cone x={78} y={y + 4} /></g>}
                                {s.target === "hoop" && <g><line x1={70} y1={y + 12} x2={70} y2={y - 4} stroke={INK} strokeWidth={1.2} /><Hoop x={70} y={y - 6} r={8} /></g>}
                                {s.target === "rings" && <g><circle cx={70} cy={y} r={12} fill="none" stroke={INK} /><circle cx={70} cy={y} r={7} fill="none" stroke={INK} /><circle cx={70} cy={y} r={2.5} fill={INK} /></g>}
                                {s.target === "goal" && <g><polyline points={`76,${y - 10} 62,${y - 10} 62,${y + 10} 76,${y + 10}`} fill="none" stroke={INK} strokeWidth={1.4} /><Pupil x={72} y={y} hollow /></g>}
                            </g>
                        ))}
                        <Signal s={s.signal} x={296} y={h - 16} />
                    </>
                ),
            };
        }

        case "race": {
            const h = 130;
            const rows = [40, 62, 84, 106];
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <line x1={266} y1={16} x2={266} y2={h - 16} stroke={INK} strokeWidth={1.6} />
                        <line x1={50} y1={16} x2={50} y2={h - 16} stroke={INK} strokeWidth={1.6} strokeDasharray="5 3" />
                        {rows.map((y, i) => (
                            <g key={i}>
                                <Pupil x={280} y={y} />
                                {s.pairs && <><line x1={280} y1={y} x2={294} y2={y} stroke={INK} strokeWidth={1.4} /><Pupil x={294} y={y} hollow /></>}
                                <Arrow d={`M 258 ${y} L 60 ${y}`} />
                            </g>
                        ))}
                        <Label x={266} y={h - 6} t="انطلاق" />
                        <Label x={50} y={h - 6} t="وصول" />
                        <Signal s={s.signal} x={296} y={16} />
                    </>
                ),
            };
        }

        case "ladder": {
            const h = 120;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {[38, 82].map((y, r) => (
                            <g key={r}>
                                {Array.from({ length: 7 }, (_, k) => <rect key={k} x={70 + k * 24} y={y - 10} width={24} height={20} fill="none" stroke={INK} strokeWidth={1} />)}
                                {[0, 1, 2].map((k) => <Pupil key={`p${k}`} x={266 + k * 12} y={y} />)}
                                <Arrow d={`M 252 ${y} L 76 ${y}`} dashed />
                            </g>
                        ))}
                        <Signal s={s.signal} x={30} y={20} />
                    </>
                ),
            };
        }

        case "pairs": {
            const h = 140;
            const pairs: [number, number][] = [[250, 34], [190, 60], [120, 36], [70, 80], [150, 104], [236, 100]];
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {s.cones && <><Cone x={30} y={22} /><Cone x={30} y={118} /></>}
                        {pairs.map(([x, y], i) => (
                            <g key={i}>
                                <line x1={x} y1={y} x2={x + 14} y2={y} stroke={INK} strokeWidth={1.4} />
                                <Pupil x={x} y={y} />
                                <Pupil x={x + 14} y={y} hollow />
                                <Arrow d={`M ${x - 8} ${y + 8} L ${x - 26} ${y + 16}`} />
                            </g>
                        ))}
                        <Signal s={s.signal} x={296} y={20} />
                    </>
                ),
            };
        }

        case "facing": {
            // قاطرات متقابلة: 2 columns face each other, the first runs, gives the object and goes to the back
            const pairsN = Math.min(Math.max(s.teams ?? 2, 1), 3);
            const h = 30 + pairsN * 40;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {Array.from({ length: pairsN }, (_, t) => {
                            const y = 32 + t * 40;
                            return (
                                <g key={t}>
                                    {[0, 1, 2].map((k) => <Pupil key={`a${k}`} x={262 + k * 13} y={y} />)}
                                    {[0, 1, 2].map((k) => <Pupil key={`b${k}`} x={58 - k * 13} y={y} hollow />)}
                                    {s.obstacles && [200, 160, 120].map((x, k) => (k % 2 ? <Hoop key={`o${k}`} x={x} y={y} r={8} /> : <Cone key={`o${k}`} x={x} y={y} />))}
                                    <Arrow d={`M 252 ${y - 9} L 70 ${y - 9}`} />
                                    <Arrow d={`M 70 ${y + 9} L 252 ${y + 9}`} dashed />
                                </g>
                            );
                        })}
                        <Signal s={s.signal} x={160} y={h - 14} />
                    </>
                ),
            };
        }

        case "slalom": {
            const h = 40 + teams * 40;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <line x1={256} y1={14} x2={256} y2={h - 14} stroke={INK} strokeWidth={1.6} />
                        {Array.from({ length: teams }, (_, t) => {
                            const y = 34 + t * 40;
                            const xs = [222, 190, 158, 126, 94];
                            const zig = xs.map((x, k) => `${x},${y + (k % 2 ? 9 : -9)}`).join(" ");
                            return (
                                <g key={t}>
                                    {[0, 1, 2].map((k) => <Pupil key={k} x={268 + k * 13} y={y} />)}
                                    {xs.map((x, k) => <Cone key={`c${k}`} x={x} y={y + (k % 2 ? -6 : 6)} />)}
                                    <polyline points={`248,${y} ${zig} 66,${y}`} fill="none" stroke={INK} strokeWidth={1} markerEnd="url(#pd-arrow)" />
                                    {s.obstacles ? <Hoop x={50} y={y} r={10} /> : <Cone x={50} y={y} />}
                                </g>
                            );
                        })}
                        <Signal s={s.signal} x={296} y={h - 14} />
                    </>
                ),
            };
        }

        case "lines": {
            // 2 lines facing each other (بر بحر، رأس كتف ركبة)
            const h = 140;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <line x1={30} y1={30} x2={270} y2={30} stroke={GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
                        <line x1={30} y1={110} x2={270} y2={110} stroke={GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
                        {[0, 1, 2, 3, 4, 5, 6].map((k) => (
                            <g key={k}>
                                <Pupil x={60 + k * 30} y={44} />
                                <Pupil x={60 + k * 30} y={96} hollow />
                            </g>
                        ))}
                        {s.plate
                            ? [0, 1, 2, 3, 4, 5, 6].map((k) => <ellipse key={`p${k}`} cx={60 + k * 30} cy={70} rx={6} ry={3} fill="none" stroke={INK} />)
                            : <><Arrow d="M 150 54 L 150 84" /><Arrow d="M 180 86 L 180 56" dashed /></>}
                        <Signal s={s.signal} x={296} y={18} />
                    </>
                ),
            };
        }

        case "jump": {
            // long jump: optional approach run, take-off line, sand pit with distance marks
            const h = 110;
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <rect x={30} y={34} width={110} height={44} fill="#e4e4e4" stroke={INK} strokeWidth={1.1} />
                        {[60, 85, 110].map((x, k) => <line key={k} x1={x} y1={34} x2={x} y2={78} stroke={GRAY} strokeWidth={0.7} strokeDasharray="3 3" />)}
                        <line x1={150} y1={30} x2={150} y2={82} stroke={INK} strokeWidth={2.2} />
                        {s.runup && <rect x={150} y={46} width={110} height={20} fill="none" stroke={GRAY} strokeWidth={0.8} />}
                        {[0, 1, 2].map((k) => <Pupil key={k} x={(s.runup ? 272 : 172) + k * 12} y={56} />)}
                        {s.runup && <Arrow d="M 262 56 L 158 56" />}
                        <Arrow d={`M 150 50 Q 115 ${20} 80 50`} dashed />
                        <Label x={85} y={96} t="حوض الرمل" />
                        <Signal s={s.signal} x={296} y={20} />
                    </>
                ),
            };
        }

        case "throw": {
            // throw from a line (or after a run-up) into numbered zones
            const h = 130;
            const n = Math.min(Math.max(s.zones ?? 5, 3), 5);
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        {Array.from({ length: n }, (_, k) => {
                            const x = 200 - (k + 1) * (170 / n);
                            return (
                                <g key={k}>
                                    <line x1={x} y1={20} x2={x} y2={h - 20} stroke={GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
                                    <text x={x + 170 / n / 2} y={h - 24} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK}>{k + 1}</text>
                                </g>
                            );
                        })}
                        <line x1={210} y1={20} x2={210} y2={h - 20} stroke={INK} strokeWidth={2} />
                        {[40, 65, 90].map((y, k) => (
                            <g key={k}>
                                <Pupil x={s.runup ? 262 : 222} y={y} />
                                {s.runup && <Arrow d={`M 254 ${y} L 222 ${y}`} />}
                                <Arrow d={`M 214 ${y - 4} Q ${150 - k * 10} ${y - 40} ${110 - k * 20} ${y}`} dashed />
                            </g>
                        ))}
                        <Signal s={s.signal} x={296} y={20} />
                    </>
                ),
            };
        }

        case "perimeter": {
            // run around the field: pupils at the corners, relay on the perimeter
            const h = 140;
            const corners: [number, number][] = [[260, 30], [60, 30], [60, 110], [260, 110]];
            return {
                h, el: (
                    <>
                        <Field h={h} />
                        <rect x={60} y={30} width={200} height={80} fill="none" stroke={INK} strokeWidth={1} strokeDasharray="5 3" />
                        {corners.map(([x, y], i) => (
                            <g key={i}>
                                <Cone x={x} y={y} />
                                <Pupil x={x + (x > 100 ? 14 : -14)} y={y} />
                            </g>
                        ))}
                        <Arrow d="M 240 22 L 80 22" />
                        <Arrow d="M 50 46 L 50 96" />
                        <Arrow d="M 80 120 L 240 120" />
                        <Arrow d="M 272 96 L 272 46" />
                        <Signal s={s.signal} x={160} y={70} />
                    </>
                ),
            };
        }
    }
    return { h: 0, el: null };
}

export default function PrimaireDiagram({ spec }: { spec?: PrimaireDiagramSpec }) {
    if (!spec) return null;
    const { h, el } = body(spec);
    if (!el) return null;
    return (
        <svg viewBox={`0 0 ${W} ${h}`} style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr", display: "block" }} role="img" aria-label="رسم توضيحي للتشكيلة">
            <defs>
                <marker id="pd-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M0,0 L10,5 L0,10 z" fill={INK} />
                </marker>
            </defs>
            {el}
        </svg>
    );
}