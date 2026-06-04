// cypress/e2e/02_mapa_calor.cy.ts

describe('Flujo 2: Mapa de Calor Estatal', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/mapa')
  })

  it('carga el contenedor principal del mapa estatal', () => {
    cy.get('[data-testid="mapa-calor"]', { timeout: 12000 }).should('be.visible')
  })

  it('muestra la sección de estados con mayor riesgo', () => {
    cy.contains('Estados con mayor riesgo', { timeout: 12000 }).should('be.visible')
  })

  it('muestra al menos 3 tarjetas de estados críticos', () => {
    cy.get('[data-testid="mapa-calor"]', { timeout: 12000 })
      .find('.metric-card-glass')
      .should('have.length.greaterThan', 2)
  })

  it('no muestra ErrorBanner cuando el backend responde correctamente', () => {
    cy.get('[data-testid="error-banner"]', { timeout: 12000 }).should('not.exist')
  })

  it('muestra el ranking de estados con valores de prevalencia', () => {
    cy.contains(/riesgo|prevalencia|ranking/i, { timeout: 12000 }).should('exist')
    cy.get('[data-testid="mapa-calor"]').should('contain.text', '%')
  })
})
