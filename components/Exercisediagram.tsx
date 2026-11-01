// components/ExerciseDiagram.tsx
// Draws a small, print-friendly (black & white) diagram for an exercise
// from its "diagram" field in the exercises JSON.
// Sprint templates: lanes, lanes_markers, lanes_zones, lanes_obstacles,
//                   pairs_race, pairs_observer, chase
// Throw templates (shot put…): throw_lines, throw_steps, throw_circle,
//                   throw_pairs, throw_wall, throw_angle
// Jump templates (long jump…): jump_runway (top view), jump_side (side view)
// Team sports: vb_court (volleyball 18×9 m), hb_court (handball 40×20 m), bb_court (basketball 28×15 m) — players / arrows / targets / zones in court meters
// Unknown / missing template -> renders nothing (the fiche stays as before).

import React from "react";

export type DiagramSpec = {
    template: string;
    lanes?: number;
    pairs?: number;
    distance?: number;
    signal?: "whistle" | "flag" | "clap" | "mixed";
    markers?: number;
    zones?: number[];
    obstacles?: number;
    corridor?: boolean;
    gap?: number;
    // throws
    throwers?: number;
    arcs?: number[];
    noThrow?: boolean;
    approach?: boolean;
    observer?: boolean;
    board?: boolean;
    targets?: number;
    narrow?: boolean;
    enter?: boolean;
    exitBack?: boolean;
    points?: boolean;
    target?: boolean;
    angle?: number;
    ropes?: { d: number; h: number }[];
    compare?: boolean;
    // jumps
    steps?: number;
    zone?: boolean;
    wide?: boolean;
    noJump?: boolean;
    lines?: number[];
    accel?: number;
    last2?: boolean;
    exitFront?: boolean;
    run?: boolean;
    standing?: boolean;
    raised?: boolean;
    hang?: { d: number; h: number };
    pose?: "tuck" | "extend" | "knee";
    phases?: boolean;
    landForward?: boolean;
    // team sports (court meters: x 0..18 left→right, y 0..9; our team = right half)
    court?: "full" | "none";
    players?: { x: number; y: number; t: "A" | "B"; n?: string }[];
    arrows?: { f: [number, number]; t: [number, number]; k: "pass" | "set" | "attack" | "serve" | "move" | "dig" | "dribble" | "bounce" }[];
    cones?: [number, number][];
    hoops?: [number, number][];
    areas?: { x: number; y: number; w: number; h: number; label?: string }[];
    teacher?: [number, number];
    referee?: [number, number];
    watcher?: [number, number];
    leader?: number;
    // relay (sprint): baton exchange zone in meters from the start + optional check mark before it
    relayZone?: [number, number];
    checkMark?: number;
};

const W = 320;
const LANE_H = 20;
const TOP = 30;      // space for labels above the lanes
const BOTTOM = 26;   // space for the distance line
const START_X = W - 34; // RTL: start on the right
const FINISH_X = 30;    // finish on the left
const INK = "#111";
const GRAY = "#777";

const SIGNAL_LABEL: Record<string, string> = {
    whistle: "صافرة",
    flag: "علم / إشارة يد",
    clap: "تصفيق",
    mixed: "صافرة أو علم",
};

function Cone({ x, y, s = 5 }: { x: number; y: number; s?: number }) {
    return <polygon points={`${x},${y - s} ${x - s * 0.8},${y + s * 0.6} ${x + s * 0.8},${y + s * 0.6}`} fill="none" stroke={INK} strokeWidth={1.2} />;
}

function Runner({ x, y, label, hollow = false }: { x: number; y: number; label?: string; hollow?: boolean }) {
    return (
        <g>
            <circle cx={x} cy={y} r={6} fill={hollow ? "#fff" : INK} stroke={INK} strokeWidth={1.4} />
            {label && (
                <text x={x} y={y + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={hollow ? INK : "#fff"}>
                    {label}
                </text>
            )}
        </g>
    );
}

function Arrow({ x1, y, x2, dashed = false }: { x1: number; y: number; x2: number; dashed?: boolean }) {
    return (
        <line
            x1={x1} y1={y} x2={x2} y2={y}
            stroke={INK} strokeWidth={1.4}
            strokeDasharray={dashed ? "4 3" : undefined}
            markerEnd="url(#ed-arrow)"
        />
    );
}

export default function ExerciseDiagram({ spec, className }: { spec?: DiagramSpec | null; className?: string }) {
    if (!spec || !spec.template) return null;

    const t = spec.template;
    if (t.startsWith("throw_")) return <ThrowDiagram spec={spec} className={className} />;
    if (t.startsWith("jump_")) return <JumpDiagram spec={spec} className={className} />;
    if (t === "vb_court" || t === "hb_court" || t === "bb_court") return <CourtDiagram spec={spec} className={className} />;
    const known = ["lanes", "lanes_markers", "lanes_zones", "lanes_obstacles", "pairs_race", "pairs_observer", "chase", "relay"];
    if (!known.includes(t)) return null;

    const distance = Math.max(0, spec.distance ?? 15);
    const inPlace = distance === 0;

    // number of lanes actually drawn
    let lanes = Math.min(Math.max(spec.lanes ?? 4, 1), 6);
    if (t === "pairs_race") lanes = 2;
    if (t === "pairs_observer" || t === "chase") lanes = 1;

    const H = TOP + lanes * LANE_H + BOTTOM;
    const laneY = (i: number) => TOP + i * LANE_H + LANE_H / 2;
    const xAt = (m: number) => START_X - (m / (distance || 1)) * (START_X - FINISH_X);
    const runnerX = START_X + 10;
    const lanesTop = TOP;
    const lanesBottom = TOP + lanes * LANE_H;

    return (
        <svg
            viewBox={`0 0 ${W} ${H}`}
            className={className}
            style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }}
            fontFamily="inherit"
            role="img"
        >
            <defs>
                <marker id="ed-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
                </marker>
            </defs>

            {/* ground */}
            <rect x={FINISH_X - 10} y={lanesTop} width={START_X - FINISH_X + 34} height={lanes * LANE_H} fill="#f4f4f4" stroke={GRAY} strokeWidth={0.8} />

            {/* lane separators */}
            {Array.from({ length: lanes - 1 }).map((_, i) => (
                <line key={i} x1={FINISH_X - 10} y1={TOP + (i + 1) * LANE_H} x2={START_X + 24} y2={TOP + (i + 1) * LANE_H} stroke={GRAY} strokeWidth={0.6} strokeDasharray="3 3" />
            ))}

            {/* start line */}
            <line x1={START_X} y1={lanesTop - 4} x2={START_X} y2={lanesBottom + 4} stroke={INK} strokeWidth={2.4} />
            <text x={START_X} y={lanesTop - 8} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={INK}>الانطلاق</text>

            {/* finish line (double) */}
            {!inPlace && (
                <g>
                    <line x1={FINISH_X} y1={lanesTop - 4} x2={FINISH_X} y2={lanesBottom + 4} stroke={INK} strokeWidth={2.4} />
                    <line x1={FINISH_X - 4} y1={lanesTop - 4} x2={FINISH_X - 4} y2={lanesBottom + 4} stroke={INK} strokeWidth={1} />
                    <text x={FINISH_X} y={lanesTop - 8} textAnchor="middle" fontSize={8.5} fontWeight={700} fill={INK}>الوصول</text>
                </g>
            )}

            {/* zones: dashed lines + cones + meter labels */}
            {t === "lanes_zones" && !inPlace && (spec.zones ?? []).filter(z => z > 0 && z < distance + 5).map((z, i) => {
                const x = xAt(Math.min(z, distance));
                return (
                    <g key={i}>
                        <line x1={x} y1={lanesTop} x2={x} y2={lanesBottom} stroke={INK} strokeWidth={1} strokeDasharray="5 3" />
                        <Cone x={x} y={lanesTop - 1} s={4} />
                        <Cone x={x} y={lanesBottom + 4} s={4} />
                        <text x={x} y={lanesTop - 8} textAnchor="middle" fontSize={8} fill={INK} direction="rtl">{z}م</text>
                    </g>
                );
            })}

            {/* ground markers (hoops / chalk marks) */}
            {t === "lanes_markers" && !inPlace && Array.from({ length: lanes }).map((_, li) => (
                <g key={li}>
                    {Array.from({ length: spec.markers ?? 4 }).map((__, k) => {
                        const m = ((k + 1) * distance) / ((spec.markers ?? 4) + 1);
                        return <circle key={k} cx={xAt(m)} cy={laneY(li)} r={3} fill="none" stroke={INK} strokeWidth={1.1} />;
                    })}
                </g>
            ))}

            {/* obstacles (cones in the lane) */}
            {t === "lanes_obstacles" && !inPlace && (spec.obstacles ?? 0) > 0 && Array.from({ length: lanes }).map((_, li) => (
                <g key={li}>
                    {Array.from({ length: spec.obstacles ?? 0 }).map((__, k) => {
                        const m = ((k + 1) * distance) / ((spec.obstacles ?? 0) + 1);
                        return <Cone key={k} x={xAt(m)} y={laneY(li) + 1} s={4.5} />;
                    })}
                </g>
            ))}

            {/* corridor (cones along both sides of each lane) */}
            {t === "lanes_obstacles" && spec.corridor && !inPlace && Array.from({ length: lanes + 1 }).map((_, bi) => (
                <g key={bi}>
                    {Array.from({ length: 5 }).map((__, k) => (
                        <Cone key={k} x={xAt(((k + 1) * distance) / 6)} y={TOP + bi * LANE_H + 1} s={3.5} />
                    ))}
                </g>
            ))}

            {/* relay: hatched exchange zone, outgoing runner waiting at its start */}
            {t === "relay" && !inPlace && (() => {
                const [z0, z1] = spec.relayZone ?? [distance * 0.45, distance * 0.65];
                const xa = xAt(z0), xb = xAt(z1);
                const cm = spec.checkMark;
                return (
                    <g>
                        <defs>
                            <pattern id="ed-relay-hatch" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                                <line x1="0" y1="0" x2="0" y2="5" stroke={GRAY} strokeWidth={1.2} />
                            </pattern>
                        </defs>
                        <rect x={xb} y={lanesTop} width={xa - xb} height={lanesBottom - lanesTop} fill="url(#ed-relay-hatch)" stroke={INK} strokeWidth={1} />
                        <text x={(xa + xb) / 2} y={lanesTop - 8} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK} direction="rtl">منطقة التسليم</text>
                        {cm !== undefined && cm > 0 && (
                            <g>
                                <line x1={xAt(z0 - cm)} y1={lanesTop} x2={xAt(z0 - cm)} y2={lanesBottom} stroke={INK} strokeWidth={0.9} strokeDasharray="2 2" />
                                <Cone x={xAt(z0 - cm)} y={lanesBottom + 4} s={4} />
                            </g>
                        )}
                        {Array.from({ length: lanes }).map((_, li) => (
                            <g key={li}>
                                <Arrow x1={runnerX - 8} y={laneY(li) - 3} x2={(xa + xb) / 2 + 8} />
                                <Runner x={runnerX} y={laneY(li)} label="1" />
                                <Arrow x1={xa - 8} y={laneY(li) + 3} x2={FINISH_X - 8} dashed />
                                <Runner x={xa} y={laneY(li)} label="2" />
                            </g>
                        ))}
                    </g>
                );
            })()}

            {/* runners + arrows */}
            {t !== "pairs_observer" && t !== "chase" && t !== "relay" && Array.from({ length: lanes }).map((_, li) => (
                <g key={li}>
                    {!inPlace && <Arrow x1={runnerX - 8} y={laneY(li)} x2={FINISH_X - 8} />}
                    <Runner x={runnerX} y={laneY(li)} label={String(li + 1)} />
                </g>
            ))}

            {/* runner + observer */}
            {t === "pairs_observer" && (
                <g>
                    {!inPlace && <Arrow x1={runnerX - 8} y={laneY(0)} x2={FINISH_X - 8} />}
                    <Runner x={runnerX} y={laneY(0)} label="1" />
                    {/* observer stands beside the lane, at mid distance */}
                    <Runner x={xAt(distance / 3)} y={lanesBottom + 14} label="2" hollow />
                    <line x1={xAt(distance / 3)} y1={lanesBottom + 7} x2={xAt(distance / 3)} y2={laneY(0) + 7} stroke={INK} strokeWidth={0.9} strokeDasharray="2 2" />
                    <text x={xAt(distance / 3) + 10} y={lanesBottom + 17} textAnchor="start" fontSize={8} fill={INK}>ملاحظ</text>
                </g>
            )}

            {/* chase: runner ahead, chaser behind */}
            {t === "chase" && (
                <g>
                    <Arrow x1={runnerX - 30} y={laneY(0)} x2={FINISH_X - 8} />
                    <Runner x={runnerX - 22} y={laneY(0)} label="1" />
                    <Runner x={runnerX + 2} y={laneY(0)} label="2" hollow />
                    <text x={runnerX - 26} y={lanesBottom + 12} textAnchor="middle" fontSize={7.5} fill={INK}>مطارَد</text>
                    <text x={runnerX + 6} y={lanesBottom + 12} textAnchor="middle" fontSize={7.5} fill={INK}>مطارِد</text>
                </g>
            )}

            {/* teacher + signal */}
            {spec.signal && (
                <g>
                    <rect x={START_X - 50} y={4} width={12} height={12} fill="#fff" stroke={INK} strokeWidth={1.3} />
                    <text x={START_X - 44} y={13} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK}>أ</text>
                    <text x={START_X - 54} y={13} textAnchor="end" fontSize={8} fill={INK}>{SIGNAL_LABEL[spec.signal] ?? ""}</text>
                </g>
            )}

            {/* distance line */}
            {!inPlace && t !== "pairs_observer" && t !== "chase" && (
                <g>
                    <line x1={START_X} y1={H - 10} x2={FINISH_X} y2={H - 10} stroke={INK} strokeWidth={0.9} markerEnd="url(#ed-arrow)" markerStart="url(#ed-arrow)" />
                    <rect x={(START_X + FINISH_X) / 2 - 14} y={H - 17} width={28} height={12} fill="#fff" />
                    <text x={(START_X + FINISH_X) / 2} y={H - 8} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK} direction="rtl">{distance}م</text>
                </g>
            )}
            {!inPlace && (t === "pairs_observer" || t === "chase") && (
                <text x={xAt(distance * 0.75)} y={H - 6} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK} direction="rtl">{distance}م</text>
            )}
            {inPlace && (
                <text x={(START_X + FINISH_X) / 2} y={H - 8} textAnchor="middle" fontSize={9} fontWeight={700} fill={INK}>في المكان</text>
            )}
        </svg>
    );
}


/* ===================================================================== */
/*                              THROWS                                    */
/* ===================================================================== */

function M({ x, y, children, size = 8, bold = false, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; size?: number; bold?: boolean; anchor?: "start" | "middle" | "end" }) {
    const a = anchor === "start" ? "end" : anchor === "end" ? "start" : "middle";
    return <text x={x} y={y} textAnchor={a} fontSize={size} fontWeight={bold ? 700 : 400} fill={INK} direction="rtl">{children}</text>;
}

function ThrowSvg({ h, className, children }: { h: number; className?: string; children: React.ReactNode }) {
    return (
        <svg viewBox={`0 0 ${W} ${h}`} className={className} style={{ width: "100%", maxWidth: 340, height: "auto", direction: "ltr" }} fontFamily="inherit" role="img">
            <defs>
                <marker id="ed-arrow2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 0 L 10 5 L 0 10 z" fill={INK} />
                </marker>
            </defs>
            {children}
        </svg>
    );
}

const Ball = ({ x, y }: { x: number; y: number }) => <circle cx={x} cy={y} r={2.6} fill={INK} />;

function ThrowDiagram({ spec, className }: { spec: DiagramSpec; className?: string }) {
    const t = spec.template;

    /* ---------- students on a throwing line, landing zones ---------- */
    if (t === "throw_lines") {
        const n = Math.min(Math.max(spec.throwers ?? 4, 1), 6);
        const RH = 20, top = 30;
        const H = top + n * RH + 24;
        const LX = W - 46;
        const zones = (spec.zones ?? []).filter(z => z > 0);
        const maxM = zones.length ? Math.max(...zones) + 1 : 6;
        const xAt = (m: number) => LX - (m / maxM) * (LX - 22);
        const rowY = (i: number) => top + i * RH + RH / 2;
        const aim = zones.length ? zones[Math.floor(zones.length / 2)] : 0;
        return (
            <ThrowSvg h={H} className={className}>
                <rect x={16} y={top} width={LX - 16} height={n * RH} fill="#f4f4f4" stroke={GRAY} strokeWidth={0.8} />
                <line x1={LX} y1={top - 6} x2={LX} y2={top + n * RH + 6} stroke={INK} strokeWidth={2.4} />
                <M x={LX} y={top - 10} bold>خط الرمي</M>
                {!spec.noThrow && <M x={(LX + 16) / 2} y={top - 10} bold>منطقة السقوط</M>}
                {zones.map((z, i) => (
                    <g key={i}>
                        <line x1={xAt(z)} y1={top} x2={xAt(z)} y2={top + n * RH} stroke={INK} strokeWidth={0.9} strokeDasharray="5 3" />
                        <Cone x={xAt(z)} y={top + n * RH + 5} s={4} />
                        <M x={xAt(z)} y={H - 4}>{z}م</M>
                    </g>
                ))}
                {Array.from({ length: n }).map((_, i) => (
                    <g key={i}>
                        {!spec.noThrow && aim > 0 && (
                            <line x1={LX - 6} y1={rowY(i)} x2={xAt(aim) + 4} y2={rowY(i)} stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#ed-arrow2)" />
                        )}
                        <Runner x={LX + 14} y={rowY(i)} label={String(i + 1)} />
                        <Ball x={LX + 5} y={rowY(i) - 6} />
                    </g>
                ))}
                {spec.signal && (
                    <g>
                        <rect x={18} y={4} width={12} height={12} fill="#fff" stroke={INK} strokeWidth={1.3} />
                        <text x={24} y={13} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK}>أ</text>
                        <M x={34} y={13} anchor="start">{SIGNAL_LABEL[spec.signal] ?? ""}</M>
                    </g>
                )}
                {spec.noThrow && <M x={(LX + 16) / 2} y={H - 6} bold>تمرين في المكان (بدون رمي)</M>}
            </ThrowSvg>
        );
    }

    /* ---------- side-step approach on chalk lines ---------- */
    if (t === "throw_steps") {
        const n = Math.min(Math.max(spec.throwers ?? 4, 1), 5);
        const RH = 22, top = 24;
        const H = top + n * RH + (spec.observer ? 34 : 22);
        const X0 = W - 40, X1 = 110;
        const rowY = (i: number) => top + i * RH + RH / 2;
        return (
            <ThrowSvg h={H} className={className}>
                <M x={(X0 + X1) / 2} y={top - 8} bold>خطوط مرسومة 3م (الانتقال الجانبي)</M>
                {Array.from({ length: n }).map((_, i) => (
                    <g key={i}>
                        <line x1={X0 - 8} y1={rowY(i) + 7} x2={X1} y2={rowY(i) + 7} stroke={GRAY} strokeWidth={1.2} />
                        {[0, 1, 2, 3].map(k => {
                            const x = X0 - 22 - k * ((X0 - 22 - X1) / 3.4);
                            return <ellipse key={k} cx={x} cy={rowY(i) + (k % 2 ? 3 : -1)} rx={4} ry={2} fill="none" stroke={INK} strokeWidth={0.9} />;
                        })}
                        <line x1={X0 - 8} y1={rowY(i) - 5} x2={X1 + 4} y2={rowY(i) - 5} stroke={INK} strokeWidth={1.2} markerEnd="url(#ed-arrow2)" />
                        <Runner x={X0} y={rowY(i)} label={String(i + 1)} />
                        {spec.target && <Cone x={X1 - 34} y={rowY(i)} s={5} />}
                    </g>
                ))}
                {spec.target && <M x={X1 - 34} y={H - 6}>اتجاه الرمي</M>}
                {spec.observer && (
                    <g>
                        <Runner x={(X0 + X1) / 2} y={top + n * RH + 14} label="2" hollow />
                        <M x={(X0 + X1) / 2 + 12} y={top + n * RH + 17} anchor="start">ملاحظ</M>
                    </g>
                )}
            </ThrowSvg>
        );
    }

    /* ---------- throwing circle + sector (top view) ---------- */
    if (t === "throw_circle") {
        const H = spec.observer ? 168 : 150;
        const CX = W - 50, CY = 74, R = 13;
        const half = ((spec.narrow ? 9 : 17.46) * Math.PI) / 180;
        const arcs = (spec.arcs ?? []).filter(a => a > 0);
        const maxM = Math.max(...arcs, 6) + 1;
        const ppm = (CX - R - 22) / maxM;
        const rad = (m: number) => R + m * ppm;
        const pt = (r: number, a: number) => [CX - r * Math.cos(a), CY + r * Math.sin(a)];
        const L = rad(maxM);
        const [ex1, ey1] = pt(L, half);
        const [ex2, ey2] = pt(L, -half);
        const aimM = arcs.length ? arcs[Math.floor(arcs.length / 2)] : 0;
        return (
            <ThrowSvg h={H} className={className}>
                {/* sector */}
                <polygon points={`${CX},${CY} ${ex1},${ey1} ${ex2},${ey2}`} fill="#f4f4f4" stroke="none" />
                <line x1={CX} y1={CY} x2={ex1} y2={ey1} stroke={INK} strokeWidth={1.2} />
                <line x1={CX} y1={CY} x2={ex2} y2={ey2} stroke={INK} strokeWidth={1.2} />
                <M x={ex1 + 4} y={ey2 - 6} bold>{spec.narrow ? "قطاع ضيق" : "قطاع الرمي"}</M>

                {/* distance arcs */}
                {arcs.map((m, i) => {
                    const r = rad(m);
                    const [ax1, ay1] = pt(r, half);
                    const [ax2, ay2] = pt(r, -half);
                    return (
                        <g key={i}>
                            <path d={`M ${ax2} ${ay2} A ${r} ${r} 0 0 0 ${ax1} ${ay1}`} fill="none" stroke={INK} strokeWidth={0.9} strokeDasharray="4 3" />
                            <M x={Math.max(ax2 - 3, 14)} y={Math.max(ay2 - 6, 10)}>{m}م</M>
                        </g>
                    );
                })}

                {/* point zones */}
                {spec.points && arcs.length >= 2 && arcs.map((m, i) => {
                    const prev = i === 0 ? 0 : arcs[i - 1];
                    const [px, py] = pt(rad((prev + m) / 2), 0);
                    return <M key={i} x={px} y={py + 3} size={9} bold>{`${i + 1}ن`}</M>;
                })}

                {/* corridor 2m wide */}
                {spec.corridor && [1, -1].map(sgn => (
                    <g key={sgn}>
                        <line x1={CX - R - 4} y1={CY + sgn * ppm} x2={pt(L, 0)[0]} y2={CY + sgn * ppm} stroke={INK} strokeWidth={0.9} strokeDasharray="2 3" />
                        {[2, 4, 6].map(m => <Cone key={m} x={CX - rad(m)} y={CY + sgn * ppm} s={3.5} />)}
                    </g>
                ))}

                {/* targets on the middle line */}
                {Array.from({ length: spec.targets ?? 0 }).map((_, i) => {
                    const m = (maxM - 1) * ((i + 1) / ((spec.targets ?? 0) + 1));
                    const off = (spec.targets ?? 0) > 1 ? (i % 2 ? 1 : -1) * ppm * 0.8 : 0;
                    return <Cone key={i} x={CX - rad(m)} y={CY + off} s={5} />;
                })}

                {/* throw */}
                {!spec.noThrow && (
                    <line x1={CX - R - 2} y1={CY} x2={CX - rad(aimM || maxM * 0.6) + 4} y2={CY} stroke={INK} strokeWidth={1.3} strokeDasharray="5 3" markerEnd="url(#ed-arrow2)" />
                )}

                {/* circle */}
                <circle cx={CX} cy={CY} r={R} fill="#fff" stroke={INK} strokeWidth={2} />
                {spec.board && (
                    <path d={`M ${pt(R + 3, 0.6)[0]} ${pt(R + 3, 0.6)[1]} A ${R + 3} ${R + 3} 0 0 1 ${pt(R + 3, -0.6)[0]} ${pt(R + 3, -0.6)[1]}`} fill="none" stroke={INK} strokeWidth={3.5} />
                )}
                {spec.approach && <line x1={CX + 8} y1={CY + 6} x2={CX - 4} y2={CY + 6} stroke={INK} strokeWidth={1.2} markerEnd="url(#ed-arrow2)" />}
                <Runner x={spec.approach ? CX + 6 : CX + 3} y={CY - 2} label="1" />
                <M x={CX} y={CY + R + 12}>دائرة الرمي</M>
                {spec.board && <M x={CX} y={CY - R - 6}>لوحة التوقف</M>}

                {spec.enter && (
                    <g>
                        <path d={`M ${W - 6} ${CY - 22} Q ${CX + R + 14} ${CY - 18} ${CX + R + 2} ${CY - 6}`} fill="none" stroke={INK} strokeWidth={1.2} markerEnd="url(#ed-arrow2)" />
                        <M x={W - 6} y={CY - 26} anchor="end">دخول</M>
                    </g>
                )}
                {spec.exitBack && (
                    <g>
                        <path d={`M ${CX + R} ${CY + 6} Q ${CX + R + 14} ${CY + 28} ${W - 6} ${CY + 32}`} fill="none" stroke={INK} strokeWidth={1.2} strokeDasharray="3 2" markerEnd="url(#ed-arrow2)" />
                        <M x={W - 6} y={CY + 44} anchor="end">خروج من الخلف</M>
                    </g>
                )}
                {spec.observer && (
                    <g>
                        <Runner x={CX - 40} y={H - 16} label="2" hollow />
                        <line x1={CX - 40} y1={H - 22} x2={CX - 18} y2={CY + 8} stroke={INK} strokeWidth={0.9} strokeDasharray="2 2" />
                        <M x={CX - 50} y={H - 13} anchor="end">ملاحظ</M>
                    </g>
                )}
            </ThrowSvg>
        );
    }

    /* ---------- pairs facing each other ---------- */
    if (t === "throw_pairs") {
        const n = Math.min(Math.max(spec.pairs ?? 3, 1), 5);
        const d = spec.distance ?? 4;
        const RH = 24, top = 22;
        const H = top + n * RH + 20;
        const XA = W - 40, XB = 60;
        const rowY = (i: number) => top + i * RH + RH / 2;
        return (
            <ThrowSvg h={H} className={className}>
                {Array.from({ length: n }).map((_, i) => (
                    <g key={i}>
                        <line x1={XA - 10} y1={rowY(i) - 3} x2={XB + 10} y2={rowY(i) - 3} stroke={INK} strokeWidth={1.3} markerEnd="url(#ed-arrow2)" />
                        <line x1={XB + 10} y1={rowY(i) + 4} x2={XA - 10} y2={rowY(i) + 4} stroke={INK} strokeWidth={0.9} strokeDasharray="3 3" markerEnd="url(#ed-arrow2)" />
                        <Runner x={XA} y={rowY(i)} label="1" />
                        <Runner x={XB} y={rowY(i)} label="2" hollow />
                        <Ball x={XA - 9} y={rowY(i) - 9} />
                    </g>
                ))}
                <M x={XA} y={top - 6}>الرامي</M>
                <M x={XB} y={top - 6}>المستقبِل</M>
                <M x={(XA + XB) / 2} y={H - 6} bold>{d}م</M>
            </ThrowSvg>
        );
    }

    /* ---------- throwing against a wall ---------- */
    if (t === "throw_wall") {
        const n = Math.min(Math.max(spec.throwers ?? 4, 1), 5);
        const d = spec.distance ?? 2;
        const RH = 22, top = 24;
        const H = top + n * RH + 20;
        const XW = 40, XT = W - 50;
        const rowY = (i: number) => top + i * RH + RH / 2;
        return (
            <ThrowSvg h={H} className={className}>
                <line x1={XW} y1={top - 6} x2={XW} y2={top + n * RH + 4} stroke={INK} strokeWidth={4} />
                {Array.from({ length: Math.ceil((n * RH + 10) / 6) }).map((_, k) => (
                    <line key={k} x1={XW - 2} y1={top - 6 + k * 6} x2={XW - 8} y2={top + k * 6} stroke={INK} strokeWidth={0.8} />
                ))}
                <M x={XW} y={top - 10} bold>حائط</M>
                {Array.from({ length: n }).map((_, i) => (
                    <g key={i}>
                        <circle cx={XW + 6} cy={rowY(i)} r={4} fill="none" stroke={INK} strokeWidth={1.2} />
                        <line x1={XT - 10} y1={rowY(i)} x2={XW + 12} y2={rowY(i)} stroke={INK} strokeWidth={1.2} strokeDasharray="4 3" markerEnd="url(#ed-arrow2)" />
                        <Runner x={XT} y={rowY(i)} label={String(i + 1)} />
                    </g>
                ))}
                <M x={XW + 26} y={H - 6} anchor="start">علامة على الحائط</M>
                <M x={(XT + XW) / 2 + 30} y={H - 6} bold>{d}م</M>
            </ThrowSvg>
        );
    }

    /* ---------- side view: trajectory, angle, ropes ---------- */
    if (t === "throw_angle") {
        const H = 150, GY = 126, ppm = 22;
        const XR = W - 44;              // thrower position
        const relX = XR - 8, relH = 2.1; // release point (2.1 m high)
        const toY = (h: number) => GY - h * ppm;
        const path = (deg: number, range: number) => {
            const th = (deg * Math.PI) / 180;
            const k = (relH + range * Math.tan(th)) / (range * range);
            const pts: string[] = [];
            for (let i = 0; i <= 30; i++) {
                const xm = (range * i) / 30;
                const hm = relH + xm * Math.tan(th) - k * xm * xm;
                pts.push(`${relX - xm * ppm},${toY(Math.max(hm, 0))}`);
            }
            return pts.join(" ");
        };
        const ang = spec.angle ?? 40;
        const ropes = spec.ropes ?? [];
        const arcR = 18;
        const th = (ang * Math.PI) / 180;
        return (
            <ThrowSvg h={H} className={className}>
                {/* ground */}
                <line x1={10} y1={GY} x2={W - 6} y2={GY} stroke={INK} strokeWidth={1.6} />
                {Array.from({ length: 40 }).map((_, k) => <line key={k} x1={14 + k * 8} y1={GY + 1} x2={10 + k * 8} y2={GY + 6} stroke={GRAY} strokeWidth={0.7} />)}

                {/* thrower (stick figure) */}
                <circle cx={XR} cy={toY(1.6)} r={5} fill="none" stroke={INK} strokeWidth={1.4} />
                <line x1={XR} y1={toY(1.6) + 5} x2={XR + 2} y2={toY(0.85)} stroke={INK} strokeWidth={1.6} />
                <line x1={XR + 2} y1={toY(0.85)} x2={XR - 6} y2={GY} stroke={INK} strokeWidth={1.6} />
                <line x1={XR + 2} y1={toY(0.85)} x2={XR + 10} y2={GY} stroke={INK} strokeWidth={1.6} />
                <line x1={XR + 1} y1={toY(1.35)} x2={relX} y2={toY(relH)} stroke={INK} strokeWidth={1.6} />
                <Ball x={relX} y={toY(relH)} />

                {/* ropes */}
                {ropes.map((r, i) => {
                    const x = relX - r.d * ppm;
                    return (
                        <g key={i}>
                            <line x1={x} y1={GY} x2={x} y2={toY(r.h)} stroke={INK} strokeWidth={2} />
                            <line x1={x - 6} y1={toY(r.h)} x2={x + 6} y2={toY(r.h)} stroke={INK} strokeWidth={2} />
                            <M x={x} y={toY(r.h) - 5}>{`خيط ${r.h}م`}</M>
                            <M x={x} y={GY + 16} size={7.5}>{`على ${r.d}م`}</M>
                        </g>
                    );
                })}

                {spec.compare ? (
                    <g>
                        <polyline points={path(15, 5)} fill="none" stroke={INK} strokeWidth={0.9} strokeDasharray="3 3" />
                        <polyline points={path(70, 4)} fill="none" stroke={INK} strokeWidth={0.9} strokeDasharray="3 3" />
                        <polyline points={path(40, 9)} fill="none" stroke={INK} strokeWidth={1.8} />
                        <M x={relX - 5 * ppm} y={GY - 4} size={7.5}>منخفض</M>
                        <M x={relX - 1.2 * ppm - 18} y={16} size={7.5}>عالٍ جداً</M>
                        <M x={relX - 9 * ppm + 4} y={GY - 4} size={7.5} bold>مناسب ≈40°</M>
                    </g>
                ) : (
                    <polyline points={path(ang, 9)} fill="none" stroke={INK} strokeWidth={1.6} strokeDasharray="5 3" />
                )}

                {/* angle */}
                {!spec.compare && (
                    <g>
                        <line x1={relX} y1={toY(relH)} x2={relX - 40} y2={toY(relH)} stroke={GRAY} strokeWidth={0.8} strokeDasharray="2 2" />
                        <path d={`M ${relX - arcR} ${toY(relH)} A ${arcR} ${arcR} 0 0 1 ${relX - arcR * Math.cos(th)} ${toY(relH) - arcR * Math.sin(th)}`} fill="none" stroke={INK} strokeWidth={1} />
                        <M x={relX - arcR - 12} y={toY(relH) + 11} bold>{ang}°</M>
                    </g>
                )}
                {spec.observer && <M x={W / 2} y={14} bold>الملاحظ يقف جانباً ويحكم على شكل المسار</M>}
            </ThrowSvg>
        );
    }

    return null;
}


/* ===================================================================== */
/*                              JUMPS                                     */
/* ===================================================================== */

function JumpDiagram({ spec, className }: { spec: DiagramSpec; className?: string }) {
    const t = spec.template;

    /* ---------- top view: runway → takeoff → sand pit ---------- */
    if (t === "jump_runway") {
        const H = spec.observer ? 110 : 92;
        const CY = 46, RW = 16, PH = 40;
        const TX = 132;                       // takeoff line
        const PIT_L = 18, PIT_R = TX - 12;
        const ppmPit = (PIT_R - PIT_L) / 5;   // 5 m of sand
        const ppmRun = (W - 26 - TX) / 12;    // 12 m of runway
        const pitX = (m: number) => TX - m * ppmPit;
        const runX = (m: number) => TX + m * ppmRun;
        const lines = spec.lines ?? [];
        const landM = spec.target ? 2.5 : lines.length ? lines[Math.floor(lines.length / 2)] + 0.4 : 2.6;
        const zoneW = spec.wide ? 24 : 12;
        return (
            <ThrowSvg h={H} className={className}>
                {/* runway */}
                <rect x={TX} y={CY - RW / 2} width={W - 10 - TX} height={RW} fill="#f4f4f4" stroke={GRAY} strokeWidth={0.8} />
                <M x={W - 60} y={CY - RW / 2 - 6}>مسار الاقتراب</M>

                {/* accel zone */}
                {(spec.accel ?? 0) > 0 && (
                    <g>
                        <rect x={TX} y={CY - RW / 2} width={(spec.accel ?? 0) * ppmRun} height={RW} fill="#ddd" />
                        <Cone x={runX(spec.accel ?? 0)} y={CY - RW / 2 - 2} s={4} />
                        <Cone x={runX(spec.accel ?? 0)} y={CY + RW / 2 + 5} s={4} />
                        <M x={runX((spec.accel ?? 0) / 2) + 6} y={CY - RW / 2 - 6} size={7.5}>{`تسريع (آخر ${spec.accel}م)`}</M>
                    </g>
                )}

                {/* sand pit */}
                <rect x={PIT_L} y={CY - PH / 2} width={PIT_R - PIT_L} height={PH} fill="#fff" stroke={INK} strokeWidth={1.2} />
                {Array.from({ length: 60 }).map((_, k) => {
                    const rx = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
                    const ry = Math.abs(Math.sin(k * 78.233) * 12345.6789) % 1;
                    return <circle key={k} cx={PIT_L + 4 + rx * (PIT_R - PIT_L - 8)} cy={CY - PH / 2 + 4 + ry * (PH - 8)} r={0.7} fill={GRAY} />;
                })}
                <M x={PIT_R - 22} y={CY + PH / 2 - 4} size={7}>حفرة الرمل</M>
                {lines.map((m, i) => (
                    <g key={i}>
                        <line x1={pitX(m)} y1={CY - PH / 2} x2={pitX(m)} y2={CY + PH / 2} stroke={INK} strokeWidth={0.9} strokeDasharray="3 3" />
                        <M x={pitX(m)} y={CY - PH / 2 - 4} size={7.5}>{m}م</M>
                    </g>
                ))}
                {spec.points && lines.length >= 2 && lines.map((m, i) => {
                    const next = lines[i + 1] ?? Math.max(5, (TX - PIT_L) / ppmPit); // last zone: up to the end of the pit
                    return <M key={i} x={pitX((m + next) / 2)} y={CY + PH / 2 - 14} size={8} bold>{`${i + 1}ن`}</M>;
                })}
                {spec.target && <circle cx={pitX(2.5)} cy={CY} r={7} fill="none" stroke={INK} strokeWidth={1.3} />}

                {/* takeoff zone / board */}
                {spec.zone && (
                    <g>
                        <rect x={TX} y={CY - RW / 2} width={zoneW} height={RW} fill="url(#ed-hatch)" stroke={INK} strokeWidth={0.8} />
                        <M x={TX + 2} y={CY + RW / 2 + 10} size={7.5} anchor="start">منطقة الارتقاء</M>
                    </g>
                )}
                {spec.board && (
                    <g>
                        <rect x={TX - 2} y={CY - RW / 2 - 2} width={5} height={RW + 4} fill="#fff" stroke={INK} strokeWidth={1.4} />
                        <M x={TX + 2} y={CY + RW / 2 + (spec.zone ? 20 : 10)} size={7.5} bold anchor="start">لوح الارتقاء</M>
                    </g>
                )}
                <defs>
                    <pattern id="ed-hatch" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                        <line x1="0" y1="0" x2="0" y2="4" stroke={INK} strokeWidth="0.8" />
                    </pattern>
                </defs>

                {/* last two steps */}
                {spec.last2 && [2.3, 1.1].map((m, i) => <circle key={i} cx={runX(m)} cy={CY} r={3} fill="none" stroke={INK} strokeWidth={1.1} />)}

                {/* start mark + runner + run */}
                <Cone x={W - 22} y={CY + RW / 2 + 5} s={4} />
                <M x={W - 22} y={CY + RW / 2 + 16} size={7.5}>{spec.steps ? `${spec.steps} خطوات` : "علامة البداية"}</M>
                <line x1={W - 30} y1={CY} x2={TX + 6} y2={CY} stroke={INK} strokeWidth={1.4} markerEnd="url(#ed-arrow2)" />
                <Runner x={W - 20} y={CY} label="1" />

                {/* jump */}
                {!spec.noJump && (
                    <path d={`M ${TX} ${CY} Q ${(TX + pitX(landM)) / 2} ${CY - 34} ${pitX(landM)} ${CY}`} fill="none" stroke={INK} strokeWidth={1.4} strokeDasharray="5 3" markerEnd="url(#ed-arrow2)" />
                )}
                {!spec.noJump && spec.exitFront && (
                    <g>
                        <line x1={pitX(landM) - 4} y1={CY + 4} x2={pitX(landM) - 16} y2={CY + PH / 2 + 4} stroke={INK} strokeWidth={1.1} strokeDasharray="2 2" markerEnd="url(#ed-arrow2)" />
                        <M x={pitX(landM) - 16} y={CY + PH / 2 + 14} size={7.5}>خروج للأمام</M>
                    </g>
                )}

                {spec.signal && (
                    <g>
                        <rect x={runX(2) - 6} y={4} width={12} height={12} fill="#fff" stroke={INK} strokeWidth={1.3} />
                        <text x={runX(2)} y={13} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK}>أ</text>
                        <M x={runX(2) + 10} y={13} anchor="start">{SIGNAL_LABEL[spec.signal] ?? ""}</M>
                    </g>
                )}
                {spec.observer && (
                    <g>
                        <Runner x={TX + 18} y={H - 12} label="2" hollow />
                        <line x1={TX + 14} y1={H - 18} x2={TX + 2} y2={CY + RW / 2} stroke={INK} strokeWidth={0.9} strokeDasharray="2 2" />
                        <M x={TX + 28} y={H - 9} anchor="start">ملاحظ</M>
                    </g>
                )}
            </ThrowSvg>
        );
    }

    /* ---------- side view: run, takeoff, flight, landing ---------- */
    if (t === "jump_side") {
        const H = spec.observer ? 132 : 120, GY = 88, ppm = 26;
        const standing = !!spec.standing;
        const raise = spec.raised ? 0.3 : 0;
        const TX = standing ? 250 : 200;
        const PIT_R = TX - 10;
        const range = standing ? 1.8 : 3.4;
        const toY = (h: number) => GY - h * ppm;
        const LX = TX - range * ppm;
        // flight of the hips: from (TX, 1.0+raise) to (LX, 0.45), apex +0.6
        const h0 = 1.0 + raise, h1 = 0.45, apexH = Math.max(h0, h1) + (standing ? 0.35 : 0.6);
        const pathPts: string[] = [];
        for (let i = 0; i <= 30; i++) {
            const u = i / 30;
            const base = h0 + (h1 - h0) * u;
            const bump = 4 * (apexH - (h0 + h1) / 2) * u * (1 - u);
            pathPts.push(`${TX - u * range * ppm},${toY(base + bump)}`);
        }
        const apexX = TX - 0.5 * range * ppm;
        const ropes = spec.ropes ?? [];
        return (
            <ThrowSvg h={H} className={className}>
                {/* ground + pit */}
                <line x1={PIT_R} y1={GY} x2={W - 6} y2={GY} stroke={INK} strokeWidth={1.6} />
                <rect x={14} y={GY} width={PIT_R - 14} height={9} fill="#fff" stroke={INK} strokeWidth={1.2} />
                {Array.from({ length: 50 }).map((_, k) => {
                    const rx = Math.abs(Math.sin(k * 12.9898) * 43758.5453) % 1;
                    const ry = Math.abs(Math.sin(k * 78.233) * 12345.6789) % 1;
                    return <circle key={k} cx={17 + rx * (PIT_R - 20)} cy={GY + 2 + ry * 5} r={0.7} fill={GRAY} />;
                })}
                <M x={40} y={GY + 20} size={7.5}>حفرة الرمل</M>

                {/* raised platform */}
                {spec.raised && (
                    <g>
                        <rect x={TX - 2} y={toY(raise)} width={22} height={raise * ppm} fill="#fff" stroke={INK} strokeWidth={1.3} />
                        <M x={TX + 9} y={GY + 12} size={7}>صندوق منخفض</M>
                    </g>
                )}
                {/* board */}
                {!standing && !spec.raised && <rect x={TX - 3} y={GY - 2} width={8} height={4} fill="#fff" stroke={INK} strokeWidth={1.2} />}

                {/* run */}
                {!standing && (
                    <g>
                        <line x1={W - 12} y1={toY(0.5)} x2={TX + 26} y2={toY(0.5)} stroke={INK} strokeWidth={1.2} markerEnd="url(#ed-arrow2)" />
                        <M x={(W + TX) / 2 + 10} y={toY(0.5) - 5} size={7.5}>اقتراب</M>
                    </g>
                )}

                {/* figure at takeoff */}
                {(() => {
                    const fx = TX + 4, fy = toY(raise);
                    const knee = spec.pose === "knee" || !standing;
                    return (
                        <g stroke={INK} strokeWidth={1.6} fill="none">
                            <circle cx={fx - 3} cy={fy - 44} r={5} />
                            <line x1={fx - 2} y1={fy - 39} x2={fx} y2={fy - 22} />
                            {/* push leg */}
                            <line x1={fx} y1={fy - 22} x2={fx + 6} y2={fy} />
                            {/* free leg */}
                            {knee ? (
                                <polyline points={`${fx},${fy - 22} ${fx - 10},${fy - 24} ${fx - 10},${fy - 12}`} />
                            ) : (
                                <line x1={fx} y1={fy - 22} x2={fx - 4} y2={fy} />
                            )}
                            {/* arms up */}
                            <line x1={fx - 1} y1={fy - 34} x2={fx - 9} y2={fy - 48} />
                            <line x1={fx - 1} y1={fy - 34} x2={fx + 6} y2={fy - 46} />
                        </g>
                    );
                })()}

                {/* flight */}
                <polyline points={pathPts.join(" ")} fill="none" stroke={INK} strokeWidth={1.5} strokeDasharray="5 3" />
                <polygon points={`${LX - 1},${toY(h1) + 4} ${LX + 6},${toY(h1) - 3} ${LX + 8},${toY(h1) + 4}`} fill={INK} />

                {/* pose at apex */}
                {spec.pose === "tuck" && <M x={apexX} y={toY(apexH) - 8} bold>تجميع الركبتين</M>}
                {spec.pose === "extend" && <M x={LX + 18} y={toY(h1) - 14} bold>مد الرجلين للأمام</M>}
                {spec.pose === "knee" && <M x={TX - 34} y={toY(1.15 + raise)} bold>رفع الركبة</M>}

                {/* ropes */}
                {ropes.map((r, i) => {
                    const x = TX - r.d * ppm;
                    return (
                        <g key={i}>
                            <line x1={x} y1={GY} x2={x} y2={toY(r.h)} stroke={INK} strokeWidth={2} />
                            <line x1={x - 5} y1={toY(r.h)} x2={x + 5} y2={toY(r.h)} stroke={INK} strokeWidth={2} />
                            <M x={x} y={toY(r.h) - 5} size={7.5}>{`خيط ${Math.round(r.h * 100)}سم`}</M>
                        </g>
                    );
                })}
                {/* hanging target */}
                {spec.hang && (
                    <g>
                        <line x1={TX - spec.hang.d * ppm} y1={4} x2={TX - spec.hang.d * ppm} y2={toY(spec.hang.h) - 5} stroke={INK} strokeWidth={0.9} />
                        <circle cx={TX - spec.hang.d * ppm} cy={toY(spec.hang.h)} r={5} fill="#fff" stroke={INK} strokeWidth={1.3} />
                        <M x={TX - spec.hang.d * ppm + 9} y={toY(spec.hang.h) + 3} size={7.5} anchor="start">هدف معلق</M>
                    </g>
                )}

                {/* landing */}
                <ellipse cx={LX} cy={GY + 2} rx={5} ry={2} fill={INK} />
                <ellipse cx={LX + 4} cy={GY + 5} rx={5} ry={2} fill={INK} />
                {spec.landForward && (
                    <g>
                        <line x1={LX - 4} y1={toY(0.3)} x2={LX - 30} y2={toY(0.3)} stroke={INK} strokeWidth={1.4} markerEnd="url(#ed-arrow2)" />
                        <M x={LX - 18} y={toY(0.3) - 5} size={7.5}>للأمام</M>
                    </g>
                )}

                {spec.phases && (
                    <g>
                        <M x={TX} y={GY + 20} size={7.5} bold>ارتقاء</M>
                        <M x={apexX} y={toY(apexH) - 6} size={7.5} bold>طيران</M>
                        <M x={LX} y={GY + 20} size={7.5} bold>هبوط</M>
                    </g>
                )}
                {spec.observer && <M x={W / 2} y={H - 3} bold>الملاحظ يقف جانب الحفرة</M>}
            </ThrowSvg>
        );
    }

    return null;
}


/* ===================================================================== */
/*                         TEAM SPORTS: COURT                             */
/* ===================================================================== */

function CourtDiagram({ spec, className }: { spec: DiagramSpec; className?: string }) {
    const hb = spec.template === "hb_court";
    const bb = spec.template === "bb_court";
    const CL = hb ? 40 : bb ? 28 : 18, CW = hb ? 20 : bb ? 15 : 9;   // court length / width in meters
    const MX = 16, TOP = 22, S = (W - 2 * MX) / CL;
    const X = (x: number) => MX + x * S;
    const Y = (y: number) => TOP + y * S;
    const extra = spec.watcher || spec.referee ? 18 : 0;
    const H = TOP + CW * S + 28 + extra;
    const full = spec.court !== "none";

    const arrow = (a: NonNullable<DiagramSpec["arrows"]>[number], i: number) => {
        const x1 = X(a.f[0]), y1 = Y(a.f[1]), x2 = X(a.t[0]), y2 = Y(a.t[1]);
        const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
        // shorten so the head does not hide the player
        const k = Math.max(0, (len - 8) / len);
        const ex = x1 + dx * k, ey = y1 + dy * k;
        const sx = x1 + dx * (6 / len), sy = y1 + dy * (6 / len);
        const bend = a.k === "set" ? 0.45 : a.k === "pass" || a.k === "dig" || a.k === "serve" ? 0.22 : 0;
        const cx = (sx + ex) / 2 + (dy / len) * len * bend * -1 * (dx >= 0 ? -1 : 1);
        const cy = (sy + ey) / 2 - Math.abs(dx / len) * len * bend;
        const dash = a.k === "move" ? "1.5 3" : a.k === "pass" || a.k === "set" || a.k === "dig" || a.k === "bounce" ? "5 3" : undefined;
        const width = a.k === "attack" ? 2.2 : a.k === "move" ? 1.3 : 1.3;
        let d = bend ? `M ${sx} ${sy} Q ${cx} ${cy} ${ex} ${ey}` : `M ${sx} ${sy} L ${ex} ${ey}`;
        if (a.k === "dribble") {
            // zig-zag line = dribbling
            const n = Math.max(2, Math.floor(Math.hypot(ex - sx, ey - sy) / 6));
            const ux = (ex - sx) / n, uy = (ey - sy) / n;
            const px = -uy / Math.hypot(ux, uy) * 2.6, py = ux / Math.hypot(ux, uy) * 2.6;
            const pts = [`M ${sx} ${sy}`];
            for (let j = 1; j < n; j++) pts.push(`L ${sx + ux * j + (j % 2 ? px : -px)} ${sy + uy * j + (j % 2 ? py : -py)}`);
            pts.push(`L ${ex} ${ey}`);
            d = pts.join(" ");
        }
        if (a.k === "bounce") {
            // straight pass with a bounce mark at 2/3 of the way
            const bx = sx + (ex - sx) * 0.66, by = sy + (ey - sy) * 0.66;
            return (
                <g key={i}>
                    <path d={`M ${sx} ${sy} L ${ex} ${ey}`} fill="none" stroke={INK} strokeWidth={width} strokeDasharray={dash} markerEnd="url(#ed-arrow2)" />
                    <path d={`M ${bx - 3} ${by - 3} L ${bx + 3} ${by + 3} M ${bx + 3} ${by - 3} L ${bx - 3} ${by + 3}`} stroke={INK} strokeWidth={1.4} />
                </g>
            );
        }
        return <path key={i} d={d} fill="none" stroke={INK} strokeWidth={width} strokeDasharray={dash} markerEnd="url(#ed-arrow2)" />;
    };

    return (
        <ThrowSvg h={H} className={className}>
            {/* court */}
            {full && bb ? (
                <g>
                    <rect x={X(0)} y={Y(0)} width={28 * S} height={15 * S} fill="#f4f4f4" stroke={INK} strokeWidth={1.4} />
                    <line x1={X(14)} y1={Y(0)} x2={X(14)} y2={Y(15)} stroke={INK} strokeWidth={1} />
                    <circle cx={X(14)} cy={Y(7.5)} r={1.8 * S} fill="none" stroke={INK} strokeWidth={1} />
                    {[0, 28].map(gx => {
                        const sgn = gx === 0 ? 1 : -1;
                        const sw = gx === 0 ? 1 : 0;
                        const r3 = 6.75 * S;
                        return (
                            <g key={gx}>
                                <rect x={gx === 0 ? X(0) : X(28 - 5.8)} y={Y(5.05)} width={5.8 * S} height={4.9 * S} fill="#e6e6e6" stroke={INK} strokeWidth={1.1} />
                                <circle cx={X(gx + sgn * 5.8)} cy={Y(7.5)} r={1.8 * S} fill="none" stroke={INK} strokeWidth={1} />
                                <path d={`M ${X(gx)} ${Y(0.9)} L ${X(gx + sgn * 2.99)} ${Y(0.9)} A ${r3} ${r3} 0 0 ${sw} ${X(gx + sgn * 2.99)} ${Y(14.1)} L ${X(gx)} ${Y(14.1)}`} fill="none" stroke={INK} strokeWidth={1.1} />
                                <line x1={X(gx + sgn * 1.2)} y1={Y(6.6)} x2={X(gx + sgn * 1.2)} y2={Y(8.4)} stroke={INK} strokeWidth={2.2} />
                                <circle cx={X(gx + sgn * 1.575)} cy={Y(7.5)} r={3.2} fill="#fff" stroke={INK} strokeWidth={1.6} />
                            </g>
                        );
                    })}
                    <M x={X(1.6)} y={Y(0) - 5} size={7.5} bold>السلة</M>
                </g>
            ) : full && hb ? (
                <g>
                    <rect x={X(0)} y={Y(0)} width={40 * S} height={20 * S} fill="#f4f4f4" stroke={INK} strokeWidth={1.4} />
                    <line x1={X(20)} y1={Y(0)} x2={X(20)} y2={Y(20)} stroke={INK} strokeWidth={1} />
                    {[0, 40].map(gx => {
                        const sgn = gx === 0 ? 1 : -1;            // direction into the court
                        const sw = gx === 0 ? 1 : 0;
                        const r6 = 6 * S, r9 = 9 * S;
                        const x9 = Math.sqrt(81 - 8.5 * 8.5);
                        return (
                            <g key={gx}>
                                <path d={`M ${X(gx)} ${Y(2.5)} A ${r6} ${r6} 0 0 ${sw} ${X(gx + sgn * 6)} ${Y(8.5)} L ${X(gx + sgn * 6)} ${Y(11.5)} A ${r6} ${r6} 0 0 ${sw} ${X(gx)} ${Y(17.5)}`} fill="#e6e6e6" stroke={INK} strokeWidth={1.2} />
                                <path d={`M ${X(gx + sgn * x9)} ${Y(0)} A ${r9} ${r9} 0 0 ${sw} ${X(gx + sgn * 9)} ${Y(8.5)} L ${X(gx + sgn * 9)} ${Y(11.5)} A ${r9} ${r9} 0 0 ${sw} ${X(gx + sgn * x9)} ${Y(20)}`} fill="none" stroke={GRAY} strokeWidth={0.9} strokeDasharray="4 3" />
                                <line x1={X(gx + sgn * 7)} y1={Y(9.6)} x2={X(gx + sgn * 7)} y2={Y(10.4)} stroke={INK} strokeWidth={1.2} />
                                <rect x={gx === 0 ? X(0) - 5 : X(40)} y={Y(8.5)} width={5} height={3 * S} fill="#fff" stroke={INK} strokeWidth={1.8} />
                            </g>
                        );
                    })}
                    <M x={X(3)} y={Y(0) - 5} size={7.5} bold>المرمى</M>
                </g>
            ) : full ? (
                <g>
                    <rect x={X(0)} y={Y(0)} width={18 * S} height={9 * S} fill="#f4f4f4" stroke={INK} strokeWidth={1.4} />
                    <line x1={X(6)} y1={Y(0)} x2={X(6)} y2={Y(9)} stroke={GRAY} strokeWidth={0.9} strokeDasharray="4 3" />
                    <line x1={X(12)} y1={Y(0)} x2={X(12)} y2={Y(9)} stroke={GRAY} strokeWidth={0.9} strokeDasharray="4 3" />
                    <line x1={X(9)} y1={Y(0) - 6} x2={X(9)} y2={Y(9) + 6} stroke={INK} strokeWidth={3} />
                    <circle cx={X(9)} cy={Y(0) - 7} r={2.5} fill={INK} />
                    <circle cx={X(9)} cy={Y(9) + 7} r={2.5} fill={INK} />
                    <M x={X(9)} y={Y(0) - 11} size={7.5} bold>الشبكة</M>
                </g>
            ) : (
                <rect x={X(CL / 2 - CW / 2)} y={Y(0)} width={CW * S} height={CW * S} fill="#f7f7f7" stroke={GRAY} strokeWidth={0.8} strokeDasharray="4 3" />
            )}

            {/* areas */}
            {(spec.areas ?? []).map((z, i) => (
                <g key={i}>
                    <rect x={X(z.x)} y={Y(z.y)} width={z.w * S} height={z.h * S} fill="#e2e2e2" stroke={GRAY} strokeWidth={0.8} strokeDasharray="3 2" />
                    {z.label && <M x={X(z.x + z.w / 2)} y={Y(z.y + z.h / 2) + 3} size={7.5}>{z.label}</M>}
                </g>
            ))}

            {/* cones */}
            {(spec.cones ?? []).map((c, i) => <Cone key={`c${i}`} x={X(c[0])} y={Y(c[1]) + 1} s={4.5} />)}

            {/* hoops / targets */}
            {(spec.hoops ?? []).map((h, i) => <circle key={i} cx={X(h[0])} cy={Y(h[1])} r={7} fill="#fff" stroke={INK} strokeWidth={1.4} />)}

            {/* arrows */}
            {(spec.arrows ?? []).map(arrow)}

            {/* players */}
            {(spec.players ?? []).map((pl, i) => (
                <g key={i}>
                    <Runner x={X(pl.x)} y={Y(pl.y)} label={pl.n} hollow={pl.t === "B"} />
                    {spec.leader === i && <M x={X(pl.x)} y={Y(pl.y) - 9} size={7} bold>قائد</M>}
                </g>
            ))}

            {/* ball on the first arrow */}
            {spec.arrows && spec.arrows.length > 0 && spec.arrows[0].k !== "move" && (
                <circle cx={X(spec.arrows[0].f[0]) - 7} cy={Y(spec.arrows[0].f[1]) - 7} r={3} fill="#fff" stroke={INK} strokeWidth={1.2} />
            )}

            {/* teacher / referee / watcher */}
            {spec.teacher && (
                <g>
                    <rect x={X(spec.teacher[0]) - 6} y={Y(spec.teacher[1]) - 6} width={12} height={12} fill="#fff" stroke={INK} strokeWidth={1.4} />
                    <text x={X(spec.teacher[0])} y={Y(spec.teacher[1]) + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill={INK}>أ</text>
                </g>
            )}
            {spec.referee && (
                <g>
                    <rect x={X(spec.referee[0]) - 6} y={Y(spec.referee[1]) - 6} width={12} height={12} fill={INK} />
                    <text x={X(spec.referee[0])} y={Y(spec.referee[1]) + 3} textAnchor="middle" fontSize={8} fontWeight={700} fill="#fff">ح</text>
                </g>
            )}
            {spec.watcher && (
                <g>
                    <Runner x={X(spec.watcher[0])} y={Y(spec.watcher[1])} label="م" hollow />
                    <M x={X(spec.watcher[0]) + 10} y={Y(spec.watcher[1]) + 3} size={7.5} anchor="start">ملاحظ</M>
                </g>
            )}

            {/* legend */}
            {(() => {
                const ly = H - 8;
                return (
                    <g>
                        <Runner x={W - 22} y={ly - 3} />
                        <M x={W - 32} y={ly} size={7.5} anchor="end">فريقنا</M>
                        <Runner x={W - 80} y={ly - 3} hollow />
                        <M x={W - 90} y={ly} size={7.5} anchor="end">الخصم</M>
                        <line x1={W - 160} y1={ly - 3} x2={W - 140} y2={ly - 3} stroke={INK} strokeWidth={1.3} strokeDasharray="5 3" />
                        <M x={W - 164} y={ly} size={7.5} anchor="end">تمرير</M>
                        <line x1={W - 215} y1={ly - 3} x2={W - 195} y2={ly - 3} stroke={INK} strokeWidth={2.2} />
                        <M x={W - 219} y={ly} size={7.5} anchor="end">{hb || bb ? "تسديد" : "ضرب/إرسال"}</M>
                        <line x1={W - 290} y1={ly - 3} x2={W - 270} y2={ly - 3} stroke={INK} strokeWidth={1.3} strokeDasharray="1.5 3" />
                        <M x={W - 294} y={ly} size={7.5} anchor="end">تنقل</M>
                    </g>
                );
            })()}
        </ThrowSvg>
    );
}