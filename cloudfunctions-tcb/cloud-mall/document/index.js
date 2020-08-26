'use strict';
const db = uniCloud.database();
const cmd = db.command;
const documentCollection = db.collection('cloud_documents');
/**
 * 根据文档id查询
 */
const detail = async (data) => {
	let result = await documentCollection.doc(data.id).field({
		title: 1,
		content: 1
	}).get();
	//查询一条
	if (result.data.length == 0) {
		data.message = "文档不存在"
		return false;
	}
	return result.data[0];
}
/**
 * 根据类型，随机返回一条
 */
const getOneDocumentByType = async (data) => {
	let result = await documentCollection.where({
		type: data.type
	}).field({
		title: 1,
		content: 1
	}).limit(10).get();
	if (result.data.length == 0) {
		data.message = "文档不存在"
		return false;
	}
	let index = 0;
	//随机返回一条
	if (result.data.length > 1) {
		index = parseInt(Math.random() * result.data.length);
	}
	return result.data[index];
}
/**
 * 查询小程序分享
 */
const getShareInfoByPage = async (data) => {
	const {
		shopid,
		url
	} = data;
	//获取小程序默认分享信息
	let docs = await documentCollection.where({
		type: "mp_share",
		shopid: shopid,
		pageLink: url
	}).field({
		pageLinkQuery: 1,
		title: 1
	}).limit(10).get();
	if (docs.data.length > 0) {
		//随机返回一条
		let index = parseInt(Math.random() * docs.data.length)
		return docs.data[index];
	} else {
		return {
			pageLinkQuery: "",
			title: ""
		}
	}
}
module.exports = {
	detail,
	type: getOneDocumentByType,
	share: getShareInfoByPage
};
