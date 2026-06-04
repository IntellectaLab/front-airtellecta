// cypress/e2e/04_simulador.cy.ts

describe('Flujo 4: Simulador de Políticas SimSmoke', () => {
  before(() => {
    cy.login()
  })

  beforeEach(() => {
    cy.visit('/dashboard/simulador')
  })

  it('carga el contenedor principal del simulador', () => {
    cy.get('[data-testid="simulador"]', { timeout: 10000 }).should('be.visible')
  })

  it('el slider de impuesto inicia en 68% (Math.round de 67.57 — nivel México)', () => {
    // El estado inicial es 67.57 → Math.round(67.57) = 68
    cy.get('[data-testid="impuesto-valor"]', { timeout: 8000 })
      .invoke('text')
      .should('eq', '68')
  })

  it('al mover el slider a 75% el display se actualiza', () => {
    // React ignora trigger('input') porque usa synthetic events.
    // Hay que usar nativeInputValueSetter para que React detecte el cambio.
    cy.get('[data-testid="impuesto-slider"]', { timeout: 8000 }).then($el => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call($el[0], '75')
      $el[0].dispatchEvent(new Event('input', { bubbles: true }))
    })
    cy.get('[data-testid="impuesto-valor"]').invoke('text').should('eq', '75')
  })

  it('permite seleccionar una política y el checkbox se activa', () => {
    cy.get('[data-testid="politica-health_warnings_high"]', { timeout: 8000 })
      .scrollIntoView()
      .click({ force: true })
    // El checkbox interno cambia a bg-blue-600 cuando está seleccionado
    cy.get('[data-testid="politica-health_warnings_high"]')
      .find('div').first()
      .should('have.class', 'bg-blue-600')
  })

  it('permite cambiar el horizonte de proyección a 10 años', () => {
    // El botón está dentro de overflow:hidden — se necesita force:true
    cy.get('[data-testid="horizonte-10"]', { timeout: 8000 })
      .scrollIntoView()
      .click({ force: true })
    cy.get('[data-testid="horizonte-10"]').should('have.class', 'text-blue-400')
  })

  it('flujo completo: política + impuesto 75% + horizonte 10 años → resultados visibles', () => {
    // Paso 1: selecciona política
    cy.get('[data-testid="politica-marketing_ban_full"]', { timeout: 8000 })
      .scrollIntoView().click({ force: true })

    // Paso 2: slider a 75% con nativeInputValueSetter
    cy.get('[data-testid="impuesto-slider"]').then($el => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')!.set!
      setter.call($el[0], '75')
      $el[0].dispatchEvent(new Event('input', { bubbles: true }))
    })
    cy.get('[data-testid="impuesto-valor"]').should('have.text', '75')

    // Paso 3: horizonte 10 años
    cy.get('[data-testid="horizonte-10"]').scrollIntoView().click({ force: true })

    // Paso 4: ejecuta simulación
    cy.get('[data-testid="simulador-submit"]').scrollIntoView().click()

    // Paso 5: espera resultados del backend
    cy.get('[data-testid="simulacion-resumen"]', { timeout: 30000 }).should('be.visible')
    cy.get('[data-testid="simulacion-resumen"]')
      .should('contain.text', 'prevalencia')
      .and('contain.text', 'muertes')
  })
})
