import { describe, expect, it } from 'vitest'
import { splitLinks } from './links'

describe('splitLinks', () => {
    it('turns Markdown links into parts and keeps the text around them', () => {
        expect(splitLinks('Open [week 5](https://claude.ai/a) now.\n- [D05](https://x.test/d05)')).toEqual([
            'Open ',
            { text: 'week 5', href: 'https://claude.ai/a' },
            ' now.\n- ',
            { text: 'D05', href: 'https://x.test/d05' },
        ])
    })

    it('leaves plain text and non-http links alone', () => {
        expect(splitLinks('no links')).toEqual(['no links'])
        expect(splitLinks('[x](javascript:alert(1))')).toEqual(['[x](javascript:alert(1))'])
    })
})
