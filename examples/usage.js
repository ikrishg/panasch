// @ts-check
const { Panasch } = require('../')
const { faker } = require('@faker-js/faker')

const log = new Panasch({ pretty: true })

log.info(`Registering commerce products: ${faker.company.name()}`)

for (let index = 0; index < 50; index++) {
  const product = faker.commerce.product()
  const department = faker.commerce.department()

  log.debug(`Registering product: ${product} (${department})`)

  if (index === 30) {
    log.warn(`Product ${product} is missing property price`)
  } else if (index === 45) {
    log.error(`Product ${product} is missing required property name`)
  } else {
    log.success(`Registered new product ${product}`)
  }
}

log.success('Registered 50 commerce products')

log.fatal(new Error(`Failed to deploy to ${faker.internet.url()}`))
