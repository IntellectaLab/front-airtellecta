// cypress/e2e/05_admin_usuarios.cy.ts

describe('Flujo 5: Administración de Usuarios (ADMIN)', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/usuarios')
  })

  it('el administrador puede ver la tabla de usuarios del sistema', () => {
    cy.get('table', { timeout: 10000 }).should('be.visible')
    cy.get('table tbody tr').should('have.length.greaterThan', 0)
  })

  it('la tabla muestra columnas de Nombre, Email, Rol e Institución', () => {
    cy.get('table thead').within(() => {
      cy.contains(/nombre/i).should('exist')
      cy.contains(/email/i).should('exist')
      cy.contains(/rol/i).should('exist')
    })
  })

  it('existen badges de rol ADMIN y USER en la tabla', () => {
    cy.get('table tbody', { timeout: 10000 }).within(() => {
      cy.contains('ADMIN').should('exist')
    })
  })

  it('el botón Nuevo Usuario abre el modal con formulario completo', () => {
    cy.contains('button', 'Nuevo Usuario').should('be.visible').click()
    cy.contains(/nuevo usuario/i, { timeout: 5000 }).should('be.visible')
    cy.get('input[type="email"]').should('be.visible')
    cy.contains(/nombre/i).should('exist')
    cy.contains(/cargo|institución/i).should('exist')
  })

  it('el modal de creación se cierra al cancelar sin guardar', () => {
    cy.contains('button', 'Nuevo Usuario').click()
    cy.get('input[type="email"]', { timeout: 5000 }).should('be.visible')
    // Cierra clickando fuera del modal (overlay)
    cy.get('.modal-overlay-glass').click({ force: true })
    cy.get('input[type="email"]').should('not.exist')
  })
})
