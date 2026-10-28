import { describe, expect, it } from 'vitest'
import { fitWithin } from './readImage'

describe('fitWithin', () => {
  it('scales the longest side down to 360 px, keeping the ratio', () => {
    expect(fitWithin(4000, 3000)).toEqual({ width: 360, height: 270 })
    expect(fitWithin(1080, 1920)).toEqual({ width: 203, height: 360 })
  })

  it('never scales a small image up', () => {
    expect(fitWithin(200, 120)).toEqual({ width: 200, height: 120 })
  })

  it('keeps at least 1 px on each side', () => {
    expect(fitWithin(10000, 5)).toEqual({ width: 360, height: 1 })
  })
})
