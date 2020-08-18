'use strict';
const db = uniCloud.database();
const cmd = db.command;
const addressCollection = db.collection('cloud_addresses');
/**
 * 新增
 * @param {Object} data
 */
const createNew = async (data) => {
	const {
		uid
	} = data;
	if (data.default) {
		//将其他数据，全部设置为非默认
		let res = await addressCollection.where({
			uid: uid
		}).update({
			default: false
		});
	}
	return await addressCollection.add(data);
}
/**
 * 删除所有
 * @param {Object} data
 */
const deleteAll = async (data) => {
	const {
		ids,
		uid
	} = data;
	//批量删除
	if (typeof(ids) == "string") {
		ids = ids.split(",");
	}
	return await addressCollection.where({
		_id: cmd.in(ids),
		uid: uid
	}).remove();
}
/**
 * 删除一条
 * @param {Object} data
 */
const deleteOne = async (data) => {
	const {
		id,
		uid
	} = data;
	//特意增加uid，防止删除其他用户数据
	return await addressCollection.where({
		_id: id,
		uid: uid
	}).remove();
}
/**
 * 获得一条
 * @param {Object} data
 */
const getAddressById = async (data) => {
	const {
		id,
		uid
	} = data;
	let address = await addressCollection.where({
		_id: id,
		uid: uid
	}).get();
	if (address.data.length > 0) {
		return address.data[0];
	}
	return false;
}
/**
 * 修改
 * @param {Object} data
 */
const edit = async (data) => {
	const {
		_id,
		uid
	} = data;
	if (data.default) {
		await addressCollection.where({
			uid: uid
		}).update({
			default: false
		});
	}
	let id = _id;
	delete data._id;
	return await addressCollection.where({
		_id: id,
		uid: uid
	}).update(data);
}
/**
 * 查询一条默认收货地址
 * @param {Object} data
 */
const getDefault = async (data) => {
	const {
		uid
	} = data;
	let address = await addressCollection.where({
		uid: uid
	}).orderBy("default", "desc").limit(1).get();
	if (address.data.length > 0) {
		return address.data[0];
	}
	return false;
}
/**
 * 查询所有
 * @param {Object} data
 */
const list = async (data) => {
	const {
		uid
	} = data;
	let address = await addressCollection.where({
		uid: uid
	}).orderBy("default", "desc").limit(50).get();
	if (address.data.length > 0) {
		return address.data;
	}
	return false;
}
module.exports = {
	"new": createNew,
	deleteAll,
	"delete": deleteOne,
	detail: getAddressById,
	edit,
	"default": getDefault,
	list
};
