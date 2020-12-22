'use strict';
const db = uniCloud.database();
const cmd = db.command;
const couponCollection = db.collection("cloud_coupons");
const model = {
	async list(data) {
		const {
			shopid,
			state
		} = data;
		let res = await couponCollection.where({
			shopid,
			state
		}).orderBy("_id", "desc").get();
		return res.data;
	},
	async save(data) {

	},
	async delete(data) {

	},
}
module.exports = model
