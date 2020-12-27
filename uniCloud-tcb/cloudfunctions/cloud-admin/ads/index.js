'use strict';
const db = uniCloud.database();
const cmd = db.command;
const adCollection = db.collection("cloud_ads");
const model = {
	/**
	 * 分页查询广告
	 */
	async list(data) {
		const {
			page,
			limit,
			key,
			shopid,
		} = data;
		const result = await adCollection.where({
			shopid
		}).skip((page - 1) * limit).limit(limit).orderBy("type", "asc").get();
		if (result.data.length == 0) {
			data.message = "暂无数据";
			return false;
		}
		return result.data;
	},
	/**
	 * 增加/修改广告
	 */
	async add(data) {
		if (data.redirectType == "goods") {
			data.link = `/pages/product/product?id=${data.goods.id}`;
		} else if (data.redirectType == "couponsList") {
			data.link = `/pages/coupons/coupons`;
		} else if (data.redirectType == "docs") {
			data.link = `/pages/docs/docs?id=${data.docs._id}`;
		} else if (data.redirectType == "none") {
			data.link = "";
		}
		let _id = data._id;
		if (_id) {
			//修改
			let doc = await this.detail(data);
			if (!doc) {
				return false;
			}
			//update操作，不能有_id参数
			delete data._id;
			return await adCollection.where({
				shopid: data.shopid,
				_id: _id
			}).update(data);
		}
		return await adCollection.add(data);
	},
	/**
	 * 复制一条文档
	 * @param {Object} data
	 */
	async copy(data) {
		let doc = await this.detail(data);
		if (!doc) {
			return false;
		}
		delete doc._id;
		return await this.add(doc);
	},
	/**
	 * 查询详细
	 */
	async detail(data) {
		const result = await adCollection.where({
			shopid: data.shopid,
			_id: data._id
		}).get();
		if (result.data.length == 0) {
			data.message = "数据不存在";
			return false;
		}
		return result.data[0];
	},
	/**
	 * 删除广告
	 */
	async delete(data) {
		if (data.ids) {
			return await adCollection.where({
				shopid: data.shopid,
				_id: cmd.in(data.ids)
			}).remove();
		}
		data.message = "ID不存在";
		return false;
	}
}

module.exports = model;
