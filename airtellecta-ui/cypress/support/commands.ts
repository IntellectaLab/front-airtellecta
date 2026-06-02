/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
    }
  }
}

// UI-based login — lets Firebase SDK manage IndexedDB persistence naturally.
// The app skips reCAPTCHA and MFA enrollment when window.Cypress is defined.
// The test user in cypress.env.json must NOT have TOTP MFA enrolled in Firebase.
Cypress.Commands.add('login', (
  email    = Cypress.env('TEST_EMAIL'),
  password = Cypress.env('TEST_PASSWORD'),
) => {
  cy.session(
    [email],
    () => {
      cy.visit('/login')
      cy.get('[data-testid="login-usuario"]').type(email)
      cy.get('[data-testid="login-password"]').type(password)
      cy.get('[data-testid="login-submit"]').click()
      cy.url({ timeout: 20000 }).should('include', '/dashboard')
    },
    {
      validate() {
        cy.visit('/dashboard')
        cy.url().should('not.include', '/login')
      },
    }
  )
})

export {}
