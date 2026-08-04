// src/config/wahdaPrimaireCurriculum.config.ts
//
// Static import map for the 15 primaire curriculum JSON files.
// Filename pattern: s{level}_wihda_{maidanId}_{slug}.json
// Place all 15 files next to this config file (same folder as your
// existing level1Curriculum.json / level2Curriculum.json etc.)

import s1_wihda_1 from './s1_wihda_1_alwad3iyat.json'
import s1_wihda_2 from './s1_wihda_2_harakat.json'
import s1_wihda_3 from './s1_wihda_3_alhaykala.json'

import s2_wihda_1 from './s2_wihda_1_alwad3iyat.json'
import s2_wihda_2 from './s2_wihda_2_harakat.json'
import s2_wihda_3 from './s2_wihda_3_alhaykala.json'

import s3_wihda_1 from './s3_wihda_1_alwad3iyat.json'
import s3_wihda_2 from './s3_wihda_2_harakat.json'
import s3_wihda_3 from './s3_wihda_3_alhaykala.json'

import s4_wihda_1 from './s4_wihda_1_alwad3iyat.json'
import s4_wihda_2 from './s4_wihda_2_harakat.json'
import s4_wihda_3 from './s4_wihda_3_alhaykala.json'

import s5_wihda_1 from './s5_wihda_1_alwad3iyat.json'
import s5_wihda_2 from './s5_wihda_2_harakat.json'
import s5_wihda_3 from './s5_wihda_3_alhaykala.json'

export type PrimaireSessionType = 'diagnostic' | 'learning' | 'integration' | 'summative'

export interface PrimaireSession {
    type: PrimaireSessionType
    unit_name: string
    kafa_components: string
    knowledge_resources: string
    learning_content: string
    execution_content: string
    guidelines: string
}

export interface PrimaireMaidanCurriculum {
    level: string // 's1'..'s5'
    level_name: string
    maidan_id: number
    maidan_name: string
    kafa_khitamya: string
    sessions: PrimaireSession[]
}

export type PrimaireLevelKey = 's1' | 's2' | 's3' | 's4' | 's5'

// level -> maidanId -> curriculum
export const PRIMAIRE_CURRICULUM: Record<PrimaireLevelKey, Record<number, PrimaireMaidanCurriculum>> = {
    s1: {
        1: s1_wihda_1 as PrimaireMaidanCurriculum,
        2: s1_wihda_2 as PrimaireMaidanCurriculum,
        3: s1_wihda_3 as PrimaireMaidanCurriculum,
    },
    s2: {
        1: s2_wihda_1 as PrimaireMaidanCurriculum,
        2: s2_wihda_2 as PrimaireMaidanCurriculum,
        3: s2_wihda_3 as PrimaireMaidanCurriculum,
    },
    s3: {
        1: s3_wihda_1 as PrimaireMaidanCurriculum,
        2: s3_wihda_2 as PrimaireMaidanCurriculum,
        3: s3_wihda_3 as PrimaireMaidanCurriculum,
    },
    s4: {
        1: s4_wihda_1 as PrimaireMaidanCurriculum,
        2: s4_wihda_2 as PrimaireMaidanCurriculum,
        3: s4_wihda_3 as PrimaireMaidanCurriculum,
    },
    s5: {
        1: s5_wihda_1 as PrimaireMaidanCurriculum,
        2: s5_wihda_2 as PrimaireMaidanCurriculum,
        3: s5_wihda_3 as PrimaireMaidanCurriculum,
    },
}

export const PRIMAIRE_LEVELS: { key: PrimaireLevelKey; name: string }[] = [
    { key: 's1', name: 'السنة الأولى ابتدائي' },
    { key: 's2', name: 'السنة الثانية ابتدائي' },
    { key: 's3', name: 'السنة الثالثة ابتدائي' },
    { key: 's4', name: 'السنة الرابعة ابتدائي' },
    { key: 's5', name: 'السنة الخامسة ابتدائي' },
]

// Adjust display names here if maidan 2 / 3's actual names differ —
// the printed header always pulls maidan_name from the loaded JSON itself,
// this array is only used to populate the selector before loading.
export const PRIMAIRE_MAIDANS: { id: number; slug: string; name: string }[] = [
    { id: 1, slug: 'alwad3iyat', name: 'الوضعيات والتنقلات' },
    { id: 2, slug: 'harakat', name: 'الحركات' },
    { id: 3, slug: 'alhaykala', name: 'الهيكلة' },
]

// Parses a class name like "1ère année", "2ème année A" -> 's1', 's2'...
export const getPrimaireLevelFromClassName = (className: string | undefined): PrimaireLevelKey => {
    if (!className) return 's1'
    const match = className.match(/[1-5]/)
    if (match) return `s${match[0]}` as PrimaireLevelKey
    return 's1'
}