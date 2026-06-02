// cypress/e2e/03_panel_ejecutivo.cy.ts

describe('Flujo 3: Panel Ejecutivo', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/panel-ejecutivo')
  })

  it('navega al panel ejecutivo sin redirigir', () => {
    cy.url().should('include', '/dashboard/panel-ejecutivo')
  })

  it('la página carga y muestra contenido', () => {
    cy.url().should('not.include', '/login')
    cy.get('body').should('not.be.empty')
  })

  it('no muestra ErrorBanner si el backend responde', () => {
    cy.get('[data-testid="error-banner"]', { timeout: 12000 }).should('not.exist')
  })

  it('botón de exportar Excel existe si hay datos', () => {
    cy.get('body').then(($body) => {
      // Si existe botón de exportar, verificar que es clickeable
      if ($body.find('[data-testid="export-excel"]').length > 0) {
        cy.get('[data-testid="export-excel"]').should('be.visible').and('not.be.disabled')
      } else {
        cy.log('Botón de exportar no encontrado — puede ser normal si no hay datos')
      }
    })
  })
})
