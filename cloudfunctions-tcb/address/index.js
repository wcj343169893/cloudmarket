'use strict';
const db = uniCloud.database();
const auth = uniCloud.auth();
/**
 * 收货地址处理，增加，修改，删除，列表
 */
exports.main = async (event, context) => {
	//id为5e9d61c31ee4a2004c55801e
	let {
		customUserId
	} = await auth.getUserInfo();
	if(customUserId < 1){
		return {
			"code": 401,
			"message": "用户信息不存在",
		};
	}
	let id = event.id || event._id;
	//let uid = +event.uid;
	let uid = +customUserId;
	let type = event.type;
	let data = [];
	if (event._id) {
		delete event._id;
	}
	delete event.uid;

	//强制转换数据类型
	event.uid = uid;
	//经纬度
	event.latitude = +event.latitude;
	event.longitude = +event.longitude;
	//是否默认,转化为boolean
	event.default = (event.default == 1);
	const collection = db.collection('addresses');

	//新增
	if (type == "new") {
		if (event.default) {
			let res = await collection.where({
				uid: uid
			}).update({
				default: false
			});
		}
		data = await collection.add(event);
	} else if (type == "deleteAll") {
		//批量删除
		let ids = event.ids.split(",");
		const cmd = db.command;
		let address = await collection.where({
			_id:cmd.in(ids),
			uid:uid
		}).remove();
		data = address;
	} else if (type == "delete") {
		//特意增加uid，防止删除其他用户数据
		let address = await collection.doc(id).get(); //居然是一个列表
		if (address.data.length > 0 && address.data[0].uid == uid) {
			let data = await collection.doc(id).remove();
			//如果删除的是默认数据，则需要重新指定一条默认
			if (address.data[0].default) {
				let address2 = await collection.where({
					uid: uid
				}).field({
					_id: 1
				}).orderBy("_id", "desc").limit(1).get();
				address2.data.map(async (document) => {
					return await collection.doc(document.id).update({
						default: true
					});
				});
			}
		}
	} else if (type == "one") {
		let address = await collection.doc(id).get();
		if (address.data.length > 0) {
			data = address.data[0];
		}
	} else if (type == "edit") {
		if (event.default) {
			await collection.where({
				uid: uid
			}).update({
				default: false
			});
		}
		data = await collection.doc(id).update(event);
	} else if (type == "default") {
		//查询一条默认收货地址
		let address = await collection.where({
			uid: uid
		}).orderBy("default", "desc").limit(1).get();
		if (address.data.length > 0) {
			data = address.data[0];
		}
	} else {
		//查询所有
		let address = await collection.where({
			uid: uid
		}).orderBy("default", "desc").get();
		if (address.data.length > 0) {
			data = address.data;
		}
	}

	return {
		"code": 200,
		"message": "操作成功",
		"data": data
	};
};
