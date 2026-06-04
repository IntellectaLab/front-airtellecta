// cypress/e2e/03_panel_ejecutivo.cy.ts

describe('Flujo 3: Panel Ejecutivo', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/panel-ejecutivo')
  })

  it('carga el contenedor principal del panel ejecutivo', () => {
    cy.get('[data-testid="panel-ejecutivo"]', { timeout: 12000 }).should('be.visible')
  })

  it('muestra los 3 KPI cards con datos reales del backend', () => {
    cy.get('[data-testid="kpi-costo-directo"]', { timeout: 12000 }).should('be.visible')
    cy.get('[data-testid="kpi-recaudacion"]').should('be.visible')
    cy.get('[data-testid="kpi-prevalencia"]').should('be.visible')
  })

  it('los KPI muestran valores en pesos (Mdp)', () => {
    cy.get('[data-testid="kpi-costo-directo"]', { timeout: 12000 })
      .find('p.font-display')
      .invoke('text')
      .should('match', /\$[\d,]+/)
  })

  it('la tabla de costos por patología existe y tiene filas', () => {
    cy.get('[data-testid="tabla-costos-patologia"]', { timeout: 12000 }).should('be.visible')
    cy.get('[data-testid="costos-table"] tbody tr').should('have.length.greaterThan', 0)
  })

  it('no muestra ErrorBanner cuando el backend responde correctamente', () => {
    cy.get('[data-testid="error-banner"]', { timeout: 12000 }).should('not.exist')
  })
})
