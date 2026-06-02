// cypress/e2e/01_resumen_nacional.cy.ts

describe('Flujo 1: Resumen Nacional', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard')
  })

  it('carga la página del dashboard y muestra el resumen nacional', () => {
    cy.get('[data-testid="resumen-nacional"]').should('be.visible')
  })

  it('muestra los 4 KPI cards con valores', () => {
    cy.get('[data-testid="kpi-prevalencia"]').should('be.visible')
    cy.get('[data-testid="kpi-salud"]').should('be.visible')
    cy.get('[data-testid="kpi-vapeadores"]').should('be.visible')
    cy.get('[data-testid="kpi-urgencias"]').should('be.visible')
  })

  it('los KPI cards muestran valores numéricos (no vacíos)', () => {
    cy.get('[data-testid="kpi-prevalencia"]')
      .find('p.font-display')
      .invoke('text')
      .should('match', /\d+/)
  })

  it('el sidebar está visible con los links de navegación', () => {
    cy.get('nav, aside').should('be.visible')
  })
})
