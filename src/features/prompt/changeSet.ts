import { PLAN_INTENTS, PLAN_STATUSES, type PlanIntent, type PlanItemStatus } from '../../types'

/**
 * The change-set contract shared with the backend's ChangeSet record. Claude returns it from
 * POST /ai/suggest; any chat assistant can also produce it by hand and the user pastes it in.
 */
export type PlanItemFields = {
    title?: string | null
    intent?: PlanIntent | null
    status?: PlanItemStatus | null
    targetDate?: string | null
    notes?: string | null
}

export type Change = {
    op: 'update' | 'create'
    id: number | null
    fields: PlanItemFields
    reason?: string | null
}

export type ChangeSet = {
    summary: string
    changes: Change[]
}

/** JSON schema text included in prompts so an assistant knows the exact import format. */
export const CHANGE_SET_FORMAT = `{
  "summary": "one or two sentences",
  "changes": [
    { "op": "update", "id": 12, "fields": { "targetDate": "2026-09-20", "status": "IN_PROGRESS" }, "reason": "why" },
    { "op": "create", "id": null, "fields": { "title": "New item", "intent": "STUDY", "targetDate": "2026-09-22" }, "reason": "why" }
  ]
}`

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/

/**
 * Parses pasted text into a ChangeSet. Accepts raw JSON or JSON inside a \`\`\`json fence,
 * and validates just enough that Apply cannot send garbage to the API.
 */
export function parseChangeSet(text: string): ChangeSet {
    const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    const raw = (fenced ? fenced[1] : text).trim()
    if (!raw) throw new Error('Paste the JSON change set first.')
    let parsed: unknown
    try {
        parsed = JSON.parse(raw)
    } catch {
        throw new Error("That isn't valid JSON. Ask the assistant for the change set as a JSON code block.")
    }
    if (!parsed || typeof parsed !== 'object') throw new Error('Expected a JSON object with "changes".')
    const obj = parsed as Record<string, unknown>
    const changes = Array.isArray(obj.changes) ? obj.changes : null
    if (!changes) throw new Error('The JSON needs a "changes" array.')

    const out: Change[] = changes.map((c, i) => {
        if (!c || typeof c !== 'object') throw new Error(`Change ${i + 1} is not an object.`)
        const ch = c as Record<string, unknown>
        const op = ch.op === 'create' ? 'create' : ch.op === 'update' ? 'update' : null
        if (!op) throw new Error(`Change ${i + 1}: "op" must be "update" or "create".`)
        const id = op === 'update' ? Number(ch.id) : null
        if (op === 'update' && (!Number.isInteger(id) || id! <= 0)) throw new Error(`Change ${i + 1}: an update needs a numeric "id".`)
        const f = (ch.fields && typeof ch.fields === 'object' ? ch.fields : {}) as Record<string, unknown>
        const fields: PlanItemFields = {}
        if (typeof f.title === 'string' && f.title.trim()) fields.title = f.title.trim()
        if (typeof f.intent === 'string') {
            if (!PLAN_INTENTS.includes(f.intent as PlanIntent)) throw new Error(`Change ${i + 1}: unknown intent "${f.intent}".`)
            fields.intent = f.intent as PlanIntent
        }
        if (typeof f.status === 'string') {
            if (!PLAN_STATUSES.includes(f.status as PlanItemStatus)) throw new Error(`Change ${i + 1}: unknown status "${f.status}".`)
            fields.status = f.status as PlanItemStatus
        }
        if (typeof f.targetDate === 'string') {
            if (!ISO_DATE.test(f.targetDate)) throw new Error(`Change ${i + 1}: targetDate must be YYYY-MM-DD.`)
            fields.targetDate = f.targetDate
        }
        if (typeof f.notes === 'string') fields.notes = f.notes
        if (op === 'create' && (!fields.title || !fields.intent)) throw new Error(`Change ${i + 1}: a new item needs at least "title" and "intent".`)
        if (op === 'update' && Object.keys(fields).length === 0) throw new Error(`Change ${i + 1}: nothing to update.`)
        return { op, id, fields, reason: typeof ch.reason === 'string' ? ch.reason : null }
    })

    return { summary: typeof obj.summary === 'string' ? obj.summary : '', changes: out }
}
