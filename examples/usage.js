// @ts-check
const { Trevenant } = require('../')
const { faker } = require('@faker-js/faker')
const trevenant = new Trevenant()

trevenant.info(`Registering Commerce Products: ${faker.company.name()}`)

for (let index = 0; index < 50; index++) {
  const product = faker.commerce.product()
  const department = faker.commerce.department()

  trevenant.debug(`Registering Product: ${product} (${department})`)

  if (index === 30) {
    trevenant.warn(`Product ${product} is missing property price`)
  } else if (index === 45) {
    trevenant.error(`Product ${product} is missing required property name`)
  } else {
    trevenant.success(`Registered new product ${product}`)
  }
}

trevenant.success('Registered 50 Commerce Products')

trevenant.fatal(new Error(`Failed to deploy to (${faker.internet.url()})`))
