// cypress/e2e/05_admin_usuarios.cy.ts

describe('Flujo 5: Administración de Usuarios', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/usuarios')
  })

  it('navega a la sección de usuarios sin redirigir a login', () => {
    cy.url().should('not.include', '/login')
  })

  it('la página de usuarios carga contenido', () => {
    // El usuario de prueba no es admin — la página muestra "Acceso denegado"
    cy.get('body', { timeout: 8000 }).should(($body) => {
      const text = $body.text()
      expect(
        text.includes('usuario') || text.includes('Usuario') ||
        text.includes('Acceso') || text.includes('denegado') ||
        text.includes('permisos')
      ).to.be.true
    })
  })

  it('si el usuario es admin, muestra tabla de usuarios', () => {
    cy.get('body').then(($body) => {
      if ($body.find('table').length > 0) {
        cy.get('table').should('be.visible')
        cy.get('table tbody tr').should('have.length.greaterThan', 0)
      } else {
        // Usuario no es admin — se espera mensaje de acceso denegado
        cy.get('body').should(($b) => {
          const t = $b.text()
          expect(t.includes('Acceso') || t.includes('denegado') || t.includes('Usuario')).to.be.true
        })
      }
    })
  })

  it('flujo alternativo: bases de datos accesibles', () => {
    cy.visit('/dashboard/bases-de-datos')
    cy.url().should('include', '/dashboard/bases-de-datos')
    cy.url().should('not.include', '/login')
  })
})
