import { createLogger, runWithContext } from '../dist/index.js'
import { installNodeContext } from '../dist/context/node.js'
import { faker } from '@faker-js/faker'

installNodeContext()

const log = createLogger({ level: 'debug', name: 'commerce' })

runWithContext({ route: '/products' }, () => {
  log.info(`Registering commerce products: ${faker.company.name()}`)

  for (let index = 0; index < 5; index++) {
    const product = faker.commerce.product()
    const child = log.child({ productId: String(index) })
    child.debug({ department: faker.commerce.department() }, `registering ${product}`)
    if (index === 3) {
      child.warn({ password: 'should-not-appear' }, 'missing price')
    }
  }

  log.info({ success: true }, 'batch complete')
})
