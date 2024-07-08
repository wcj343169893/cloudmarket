const {
	Service
} = require('uni-cloud-router')
module.exports = class OrderService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('uni-id-base-order')
	}
	async getInfo(id) {
		const res = await this.collection.doc(id).field({
			title: 1,
			type: 1,
			total_fee: 1,
			status: 1,
			title: 1,
		}).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data[0];
	}
	/**
	 * 创建公共订单
	 * @param {String} uid
	 * @param {Object} data title,type,total_fee,info,score
	 * @param {String} platform
	 */
	async save(uid, data, platform) {
		await this.collection.add({
			...data,
			status: 0,
			create_time: Date.now(),
			update_time: Date.now(),
			user_id: uid
		})
	}
}
