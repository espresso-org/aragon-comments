const _ = require('lodash')
const { GasTracker } = require('../src/utils/gas-tracker')

const AragonComments = artifacts.require('AragonComments')
const DAOFactory = artifacts.require('@aragon/core/contracts/factory/DAOFactory')
const EVMScriptRegistryFactory = artifacts.require('@aragon/core/contracts/factory/EVMScriptRegistryFactory')
const ACL = artifacts.require('@aragon/core/contracts/acl/ACL')
const Kernel = artifacts.require('@aragon/core/contracts/kernel/Kernel')

// contract = () => 0

contract('AragonComments ', accounts => {
  let aragonComments
  let daoFact
  let acl
  let kernel
  let kernelBase
  let aclBase
  let APP_MANAGER_ROLE
  let objectACL
  let helper

  const root = accounts[0]
  const holder = accounts[1]
  const DUMMY_ROLE = 1
  const gasTracker = new GasTracker()

  before(async () => {
    aclBase = await ACL.new()
    kernelBase = await Kernel.new(true)
    helper = await TestDatastore.new()
  })

  after(async () => {
    console.log(gasTracker.summary())
  })

  beforeEach(async () => {
    const regFact = await EVMScriptRegistryFactory.new()
    daoFact = await DAOFactory.new(kernelBase.address, aclBase.address, regFact.address)

    const r = await daoFact.newDAO(root)
    kernel = Kernel.at(r.logs.filter(l => l.event == 'DeployDAO')[0].args.dao)
    acl = ACL.at(await kernel.acl())

    APP_MANAGER_ROLE = await kernelBase.APP_MANAGER_ROLE()

    await acl.createPermission(holder, kernel.address, APP_MANAGER_ROLE, holder, { from: root })

    const receipt = await kernel.newAppInstance(await helper.apmNamehash('aragon-comments'), (await Datastore.new()).address, { from: holder })
    aragonComments = AragonComments.at(receipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

    const daclReceipt = await kernel.newAppInstance(await helper.apmNamehash('datastore-acl'), (await ObjectACL.new()).address, { from: holder })
    objectACL = ObjectACL.at(daclReceipt.logs.filter(l => l.event == 'NewAppProxy')[0].args.proxy)

    await acl.createPermission(datastore.address, objectACL.address, await objectACL.OBJECTACL_ADMIN_ROLE(), root)
    await acl.createPermission(root, datastore.address, await datastore.DATASTORE_MANAGER_ROLE(), root)
    await acl.grantPermission(root, datastore.address, await datastore.DATASTORE_MANAGER_ROLE())
    await acl.grantPermission(holder, datastore.address, await datastore.DATASTORE_MANAGER_ROLE())

    await datastore.initialize()

    await acl.grantPermission(objectACL.address, acl.address, await acl.CREATE_PERMISSIONS_ROLE())
  })

  it('increases lastFileId by 1 after addFile', async () => {
    assert.equal(await datastore.lastFileId(), 0)
    gasTracker.track('addFile', await datastore.addFile('QmWWQSuPMS6aXCbZKpEjPHPUZN2NjB3YrhJTHsV4X3vb2t', 'file name', 100, true, ''))
    assert.equal(await datastore.lastFileId(), 1)
  })

})

async function assertThrow(fn) {
  try {
    await fn()
  } catch (e) {
    return true
  }
  assert.fail('Should have thrown')
}

async function assertEvent(contract, filter) {
  return new Promise((resolve, reject) => {
    if (!contract[filter.event])
      {return reject(`No event named ${filter.event} found`)}

    const event = contract[filter.event]()
    event.watch()
    event.get((error, logs) => {
      if (error)
        {return reject(`Error while filtering events for ${filter.event}: ${e.message}`)}

      const log = _.filter(logs, filter)

      if (log)
        {resolve(log)}
      else {
        assert.fail(`Failed to find filtered event for ${filter.event}`)
        reject()
      }
    })
    event.stopWatching()
  })
}
