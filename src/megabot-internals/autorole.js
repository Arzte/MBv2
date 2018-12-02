const db = require('../databases/lokijs')
const ids = require('./ids')

module.exports = {
  check: () => {
    if (process.env.DISABLE_AUTOROLE) return
    const aggregation = db.findManySync('users', {
      'properties.exp': {
        $gte: MB_CONSTANTS.thresholds.custodian
      }
    })
    logger.trace(aggregation)
    aggregation.forEach(async x => {
      const user = bot.guilds.get(ids.guild).members.get(x.wb_id) ? bot.guilds.get(ids.guild).members.get(x.wb_id) : await bot.guilds.get(ids.guild).getRESTMember(x.wb_id)
      if (!user) {
        logger.debug(`Found user document ${x.wb_id}, but user isn't in server? Deleting.`)
        return db.delete('users', x.wb_id)
      }
      if (!user.roles.includes(ids.custodianRole)) {
        logger.debug(`Granting ${x.wb_id} custodian due to autorole`)
        user.addRole(ids.custodianRole, 'Autorole: EXP threshold reached')
      }
    })
  }
}
