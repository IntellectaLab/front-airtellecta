// cypress/e2e/04_simulador.cy.ts

describe('Flujo 4: Simulador de Políticas', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/simulador')
  })

  it('navega al simulador correctamente', () => {
    cy.url().should('include', '/dashboard/simulador')
  })

  it('el formulario del simulador es visible', () => {
    // Busca inputs numéricos o sliders del simulador
    cy.get('input[type="number"], input[type="range"]', { timeout: 8000 })
      .should('exist')
  })

  it('permite cambiar el horizonte de años', () => {
    cy.get('input[type="number"], input[type="range"]').first().then(($input) => {
      if ($input.attr('type') === 'range') {
        cy.wrap($input).invoke('val', '15').trigger('input').trigger('change')
      } else {
        cy.wrap($input).clear().type('15')
        cy.wrap($input).should('have.value', '15')
      }
    })
  })

  it('ejecuta la simulación al hacer click en el botón de simular', () => {
    // Busca el botón de simulación (puede estar dentro de overflow:hidden — usar force)
    cy.contains('button', /simul|calcul|proyect/i, { timeout: 8000 })
      .scrollIntoView()
      .click({ force: true })

    // Espera a que aparezcan resultados o un indicador de carga
    cy.get('body', { timeout: 15000 }).should(($body) => {
      const text = $body.text()
      expect(
        text.includes('proyección') || text.includes('resultado') ||
        text.includes('fumadores') || text.includes('Cargando')
      ).to.be.true
    })
  })
})
