const {
	Service
} = require('uni-cloud-router')

module.exports = class OrderService extends Service {

	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('cloud_orders')
	}
	async updateSelfTakeOrderByRid(id) {
		return await this.collection.where({
			"raisingPoint._id": id,
			state: 1,
			isRefundAll: this.db.command.exists(false)
		}).update({
			receivedTime: new Date().toISOString(),
			receivedUid: this.ctx.auth.uid,
			state: 3
		});
	}
}
