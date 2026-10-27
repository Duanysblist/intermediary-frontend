import { describe, expect, it } from 'vitest'
import { normalizeChangeSet, parseChangeSet } from './changeSet'

describe('parseChangeSet', () => {
    it('turns CLEAR into a null targetDate', () => {
        const cs = parseChangeSet('{"summary":"s","changes":[{"op":"update","id":7,"fields":{"targetDate":"CLEAR"}}]}')
        expect(cs.changes[0].fields).toEqual({ targetDate: null })
    })

    it('accepts a JSON code fence and keeps a null targetDate as null', () => {
        const text = 'Here you go:\n```json\n{"summary":"","changes":[{"op":"update","id":3,"fields":{"targetDate":null}}]}\n```'
        expect(parseChangeSet(text).changes[0].fields.targetDate).toBeNull()
    })

    it('throws on an unknown intent', () => {
        const text = '{"changes":[{"op":"create","id":null,"fields":{"title":"x","intent":"DANCE"}}]}'
        expect(() => parseChangeSet(text)).toThrow('unknown intent "DANCE"')
    })

    it('throws on a malformed date and on invalid JSON', () => {
        expect(() => normalizeChangeSet({ changes: [{ op: 'update', id: 1, fields: { targetDate: '20 Sept' } }] })).toThrow('YYYY-MM-DD')
        expect(() => parseChangeSet('not json')).toThrow('valid JSON')
    })

    it('requires a title and intent for a new item', () => {
        expect(() => normalizeChangeSet({ changes: [{ op: 'create', id: null, fields: { title: 'Only a title' } }] })).toThrow('needs at least')
    })
})
