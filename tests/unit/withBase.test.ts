import { describe, it, expect } from 'vitest'
import { withBase } from '../../src/lib/withBase'

describe('withBase', () => {
  it('une base y ruta sin dobles barras (dev: base /)', () => {
    expect(withBase('/leccion/x')).toBe('/leccion/x')
    expect(withBase('/')).toBe('/')
    expect(withBase('leccion/x')).toBe('/leccion/x')
  })
})
