import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    env: {
      TEST_EMAIL:       '',
      TEST_PASSWORD:    '',
      FIREBASE_API_KEY: 'AIzaSyCItiUpxYqnQbpZfK9KXfmItUh4GimKrmY',
    },
  },
})
