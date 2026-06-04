// cypress/e2e/01_resumen_nacional.cy.ts

describe('Flujo 1: Resumen Nacional', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard')
  })

  it('muestra el contenedor principal del resumen nacional', () => {
    cy.get('[data-testid="resumen-nacional"]', { timeout: 10000 }).should('be.visible')
  })

  it('los 4 KPI cards están visibles con datos del backend', () => {
    cy.get('[data-testid="kpi-prevalencia"]', { timeout: 12000 }).should('be.visible')
    cy.get('[data-testid="kpi-costo"]').should('be.visible')
    cy.get('[data-testid="kpi-muertes"]').should('be.visible')
    cy.get('[data-testid="kpi-deficit"]').should('be.visible')
  })

  it('kpi-prevalencia muestra un porcentaje numérico válido', () => {
    cy.get('[data-testid="kpi-prevalencia"]', { timeout: 12000 })
      .find('p.font-display')
      .invoke('text')
      .should('match', /\d+(\.\d+)?/)
  })

  it('no muestra ErrorBanner cuando el backend responde correctamente', () => {
    cy.get('[data-testid="error-banner"]', { timeout: 12000 }).should('not.exist')
  })

  it('el sidebar de navegación está visible y tiene links al dashboard', () => {
    cy.get('nav, aside', { timeout: 8000 }).should('be.visible')
    cy.get('nav a, aside a').should('have.length.greaterThan', 0)
  })
})
