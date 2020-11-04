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
			goods: 1,
			banner: 1,
			beginTime: 1,
			endTime: 1
		}).orderBy("endTime", "desc").skip((page - 1) * limit).limit(limit).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data;
	},
	/**
	 * 查询详情
	 * @param {Object} data
	 */
	async detail(data) {
		const {
			id,
			shopid
		} = data;
		let res = await activitiesCollection.where({
			shopid,
			_id: id
		}).limit(1).get();
		if (res.data.length == 0) {
			return false;
		}
		return res.data[0];
	},
	/**
	 * 保存专题
	 * @param {Object} data
	 */
	async save(data) {
		const {
			id,
			shopid
		} = data;
		delete data.id;
		if (id) {
			return await activitiesCollection.doc(id).update(data);
		}
		return await activitiesCollection.add(data);
	},
	/**
	 * 结束专题
	 * @param {Object} data
	 */
	async closure(data) {
		const {
			id,
			operator
		} = data;
		let info = await this.detail(data);
		if (!info) {
			return false;
		}
		return await activitiesCollection.doc(id).update({
			closureUid: operator,
			endTime: Date.now()
		});
	},
	async banners() {
		return [
			"http://cdn.cjblog.org/banners/1.png",
			"http://cdn.cjblog.org/banners/2.png",
			"http://cdn.cjblog.org/banners/3.png",
			"http://cdn.cjblog.org/banners/4.png",
			"http://cdn.cjblog.org/banners/5.png",
			"http://cdn.cjblog.org/banners/6.png",
			"http://cdn.cjblog.org/banners/7.png",
		]
	}
}
module.exports = model
