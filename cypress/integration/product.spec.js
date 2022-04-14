const productResponse = require('../fixtures/product.json')

describe('product page', () => {
  beforeEach(() => { // TODO dont have it visit page beforeach
    cy.intercept(
      {
        method: 'GET',
        url: '**/product/*'
      },
      {
        statusCode: 200,
        body: { ...productResponse },
        headers: { 'access-control-allow-origin': '*' }
      },
    ).as('getProduct')
    cy.intercept(
      {
        method: "DELETE",
        url: '**/product/*',
      },
      {
        statusCode: 200,
        headers: { 'access-control-allow-origin': '*' }
      },
    ).as('deleteProductById')

    cy.setupPact('pactflow-example-bi-directional-consumer-cypress', Cypress.env('PACT_PROVIDER'))
    cy.visit('http://localhost:3000/products/09')
  })

  it('displays product item', () => {
    cy.get('.product-id').contains('09')
    cy.get('.product-name').contains('Gem Visa')
    cy.get('.product-type').contains('CREDIT_CARD')
    cy.get('.product-price').contains(99.99)

    cy.usePactWait(['getProduct'])
  })

  it('product delete', () => {
    cy.get('.delete-product').contains("Delete").click()
    cy.usePactWait(['deleteProductById'])
  })

  // after(() => {
  //   cy.usePactWait(['deleteProductById'])
  // })
})
