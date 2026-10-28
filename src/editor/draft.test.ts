import { describe, expect, it } from 'vitest'
import type { Theme } from '../types'
import { FORM_ERRORS, draftFromTheme, emptyDraft, readyCount, savedNotice, validateDraft, type Draft, type DraftRow } from './draft'

const row = (word: string, image: string): DraftRow => ({ key: word + image, word, image })
const draft = (rows: DraftRow[], name = 'La ropa'): Draft => ({ name, grade: '4e', rows })
const photo = 'data:image/jpeg;base64,AAAA'

describe('emptyDraft', () => {
  it('starts with 4 empty rows with distinct keys', () => {
    const d = emptyDraft('3e')
    expect(d).toMatchObject({ name: '', grade: '3e' })
    expect(d.id).toBeUndefined()
    expect(d.rows).toHaveLength(4)
    expect(new Set(d.rows.map((r) => r.key)).size).toBe(4)
  })
})

describe('draftFromTheme', () => {
  it('prefills the form and keeps the theme id', () => {
    const theme: Theme = { id: 't1', grade: '4e', name: 'La ropa', builtIn: false, words: [{ word: 'la camisa', image: photo }] }
    expect(draftFromTheme(theme)).toMatchObject({ id: 't1', name: 'La ropa', grade: '4e', rows: [{ word: 'la camisa', image: photo }] })
  })
})

describe('readyCount', () => {
  it('counts rows with both a word and an image', () => {
    expect(readyCount([row('el perro', photo), row('el gato', ''), row('', photo), row('', '')])).toBe(1)
    expect(readyCount([row('   ', photo)])).toBe(0)
  })
})

describe('validateDraft', () => {
  it('requires a name', () => {
    expect(validateDraft(draft([row('a', photo), row('b', photo)], '  '))).toEqual({ ok: false, error: FORM_ERRORS.noName })
  })

  it('rejects a word without an image or an image without a word', () => {
    expect(validateDraft(draft([row('el perro', photo), row('el gato', ''), row('la vaca', photo)]))).toEqual({
      ok: false,
      error: FORM_ERRORS.incompleteRow,
    })
    expect(validateDraft(draft([row('el perro', photo), row(' ', photo), row('la vaca', photo)]))).toEqual({
      ok: false,
      error: FORM_ERRORS.incompleteRow,
    })
  })

  it('needs at least 2 complete rows, ignoring blank ones', () => {
    expect(validateDraft(draft([row('el perro', photo), row('', ''), row('', '')]))).toEqual({
      ok: false,
      error: FORM_ERRORS.tooFewRows,
    })
  })

  it('checks the name before the rows', () => {
    expect(validateDraft(draft([row('el gato', '')], ''))).toEqual({ ok: false, error: FORM_ERRORS.noName })
  })

  it('builds a trimmed custom theme and skips blank rows', () => {
    const result = validateDraft(draft([row('  el perro ', photo), row('', ''), row('la vaca', photo)], ' La granja '), () => 'new-id')
    expect(result).toEqual({
      ok: true,
      theme: {
        id: 'new-id',
        grade: '4e',
        name: 'La granja',
        tint: '#ECE6F7',
        builtIn: false,
        words: [
          { word: 'el perro', image: photo },
          { word: 'la vaca', image: photo },
        ],
      },
    })
  })

  it('keeps the id of a modified theme', () => {
    const result = validateDraft({ ...draft([row('a', photo), row('b', photo)]), id: 'existing' }, () => 'new-id')
    expect(result.ok && result.theme.id).toBe('existing')
  })

  it('generates a unique id by default', () => {
    const d = draft([row('a', photo), row('b', photo)])
    const a = validateDraft(d)
    const b = validateDraft(d)
    expect(a.ok && b.ok && a.theme.id !== b.theme.id).toBe(true)
  })
})

describe('savedNotice', () => {
  const theme: Theme = { id: 'x', grade: '4e', name: 'La ropa', builtIn: false, words: [] }
  it('confirms the save or warns that it only lasts for the session', () => {
    expect(savedNotice(theme, true)).toBe('Tema «La ropa» guardado en 4e.')
    expect(savedNotice(theme, false)).toBe('Tema «La ropa» listo para esta sesión, pero el navegador no ha podido guardarlo.')
  })
})
