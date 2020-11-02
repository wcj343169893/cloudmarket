'use strict';
const db = uniCloud.database();
const cmd = db.command;
const activitiesCollection = db.collection("cloud_goods_special_activities");
const model = {
	async list(event) {
		const {
			page,
			limit,
			shopid
		} = event;
		let res = await activitiesCollection.where({
			shopid
		}).field({
			title: 1,
			goods:1,
			beginTime: 1,
			endTime: 1
		}).orderBy("endTime", "desc").skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	}
}
module.exports = model
