'use strict';
const db = uniCloud.database();
const cmd = db.command;
const docCollection = db.collection("cloud_documents");

const model = {
	/**
	 * 分页查询文档
	 */
	async list(data) {
		const {
			page,
			limit,
			key,
		} = data;
		let conditions = {
			shopid: data.shopid
		};
		if (key && key.trim().length > 0) {
			conditions = cmd.or({
				title: new RegExp(key.trim())
			}, {
				content: new RegExp(key.trim())
			}).and({
				shopid: data.shopid
			});
		}
		const result = await docCollection.where(conditions).field({
			title: 1,
			pageLink: 1,
			type: 1
		}).skip((page - 1) * limit).limit(limit).orderBy("type", "asc").get();
		if (result.data.length == 0) {
			data.message = "暂无数据";
			return false;
		}
		return result.data;
	},
	/**
	 * 增加/修改
	 */
	async add(data) {
		let _id = data._id;
		//update操作，不能有_id参数
		delete data._id;
		if (_id) {
			//修改
			const result = await docCollection.where({
				shopid: data.shopid,
				_id: _id
			}).limit(1).get();
			if (result.data.length == 0) {
				data.message = "原数据不存在";
				return false;
			}
			data.modified = new Date().toISOString();
			return await docCollection.where({
				shopid: data.shopid,
				_id: _id
			}).update(data);
		}
		data.created = new Date().toISOString();
		return await docCollection.add(data);
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
		return this.add(doc);
	},
	/**
	 * 查询详细
	 */
	async detail(data) {
		const result = await docCollection.where({
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
	 * 删除
	 */
	async delete(data) {
		if (data.ids) {
			return await docCollection.where({
				shopid: data.shopid,
				_id: cmd.in(data.ids)
			}).remove();
		}
		data.message = "ID不存在";
		return false;
	},
}

module.exports = model
