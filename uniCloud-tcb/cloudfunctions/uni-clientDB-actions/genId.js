// 开发文档：https://uniapp.dcloud.io/uniCloud/clientdb?id=action
module.exports = {
	before: async (state, event) => {
		let key = state.collection.split("_")[1];
		state.newData.id = await genIdentityId(key);
	},
	after: async (state, event, error, result) => {
		if (error) {
			throw error
		}
		return result
	}
}
const db = uniCloud.database();
const cmd = db.command;
const identityCollection = db.collection("cloud_identity");
const genIdentityId = async function(key, inc) {
	//生成用户id----开始-----
	inc = inc ? +inc : 1;
	let res = await identityCollection.where({
		key
	}).update({
		value: cmd.inc(inc)
	});
	if (res.updated == 0) {
		let value = 10000;
		await identityCollection.add({
			key,
			value
		});
		return value;
	}
	//立马查询出来，可能值是对的
	let res2 = await identityCollection.where({
		key
	}).field({
		value: 1
	}).limit(1).get();
	return res2.data[0].value;
	//生成用户id----结束-----
}
