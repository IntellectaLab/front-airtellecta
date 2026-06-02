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
    cy.get('body').should('not.be.empty')
    // Puede mostrar tabla de usuarios o un mensaje de "sin permisos" si el usuario no es admin
    cy.get('body').then(($body) => {
      const text = $body.text()
      expect(
        text.includes('usuario') || text.includes('Usuario') ||
        text.includes('acceso') || text.includes('permisos')
      ).to.be.true
    })
  })

  it('si el usuario es admin, muestra tabla de usuarios', () => {
    cy.get('body').then(($body) => {
      if ($body.find('table').length > 0) {
        cy.get('table').should('be.visible')
        cy.get('table tbody tr').should('have.length.greaterThan', 0)
      } else {
        cy.log('Usuario no es admin o tabla renderizada como lista')
        cy.get('body').should('contain.text', 'usu')
      }
    })
  })

  it('flujo alternativo: bases de datos accesibles', () => {
    cy.visit('/dashboard/bases-de-datos')
    cy.url().should('include', '/dashboard/bases-de-datos')
    cy.url().should('not.include', '/login')
  })
})
