/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email?: string, password?: string): Chainable<void>
    }
  }
}

Cypress.Commands.add('login', (
  email    = Cypress.env('TEST_EMAIL'),
  password = Cypress.env('TEST_PASSWORD'),
) => {
  cy.session(
    [email],
    () => {
      const apiKey = Cypress.env('FIREBASE_API_KEY')
      cy.request({
        method: 'POST',
        url: `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
        body: { email, password, returnSecureToken: true },
        failOnStatusCode: false,
      }).then(({ body, status }) => {
        if (status === 200 && body.idToken) {
          window.localStorage.setItem(
            `firebase:authUser:${body.localId}`,
            JSON.stringify({
              uid: body.localId,
              email: body.email,
              stsTokenManager: {
                refreshToken:   body.refreshToken,
                accessToken:    body.idToken,
                expirationTime: Date.now() + 3600 * 1000,
              },
            })
          )
        }
      })
    },
    {
      validate() {
        cy.visit('/dashboard')
        cy.get('[data-testid="resumen-nacional"]', { timeout: 15000 }).should('exist')
      },
    }
  )
})

export {}
