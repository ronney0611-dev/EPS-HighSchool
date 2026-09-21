// الاستعمال: npx tsx merge-custom.ts original.json custom.json output.json
import { readFileSync, writeFileSync } from 'node:fs'

interface Indicator {
  id?: number
  text: string
  source?: 'custom'
  goal_base: string
  goals: string[]
}

interface Sport {
  activity?: string
  indicators: Indicator[]
}

interface LevelData {
  kafaa_khatamia?: string
  sports: Record<string, Sport>
}

type LevelsFile = Record<string, LevelData>

const [origPath, customPath, outPath] = process.argv.slice(2)
if (!origPath || !customPath || !outPath) {
  console.error('الاستعمال: npx tsx merge-custom.ts original.json custom.json output.json')
  process.exit(1)
}

const original = JSON.parse(readFileSync(origPath, 'utf8')) as LevelsFile
const custom = JSON.parse(readFileSync(customPath, 'utf8')) as LevelsFile

let added = 0

for (const level of Object.keys(custom)) {
  if (!original[level]) {
    console.error(`المستوى ${level} غير موجود في الملف الأصلي`)
    process.exit(1)
  }

  for (const sport of Object.keys(custom[level].sports)) {
    const target = original[level].sports[sport]?.indicators
    if (!target) {
      console.error(`الرياضة ${sport} غير موجودة في المستوى ${level}`)
      process.exit(1)
    }

    for (const ind of custom[level].sports[sport].indicators) {
      if (target.some((t) => t.text.trim() === ind.text.trim())) {
        console.warn(`تم تخطي مؤشر موجود مسبقا: ${sport} - ${ind.text}`)
        continue
      }
      const { id: _ignored, ...rest } = ind
      target.push({ id: target.length, ...rest })
      added++
    }
  }
}

writeFileSync(outPath, JSON.stringify(original, null, 2) + '\n', 'utf8')
console.log(`تمت إضافة ${added} مؤشر`)