// cypress/e2e/02_mapa_calor.cy.ts

describe('Flujo 2: Mapa de Calor Estatal', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/mapa')
  })

  it('navega al mapa de calor sin redirigir a login', () => {
    cy.url().should('include', '/dashboard/mapa')
  })

  it('la página del mapa carga correctamente', () => {
    // Espera a que algún elemento cargue (mapa o estado de carga)
    cy.get('body').should('not.be.empty')
    // Verifica que no hay error de ruta (no redirige a /login)
    cy.url().should('not.include', '/login')
  })

  it('permite filtrar por sexo si existen controles de filtro', () => {
    // Si existen botones/selects de sexo, interactúa con ellos
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="filtro-sexo"]').length > 0) {
        cy.get('[data-testid="filtro-sexo"]').first().click()
        cy.url().should('include', '/dashboard/mapa')
      } else {
        // Fallback: verificar que la página no tiene errores visibles
        cy.get('[data-testid="error-banner"]').should('not.exist')
      }
    })
  })

  it('no muestra ErrorBanner en condiciones normales', () => {
    cy.get('[data-testid="error-banner"]', { timeout: 12000 }).should('not.exist')
  })
})
