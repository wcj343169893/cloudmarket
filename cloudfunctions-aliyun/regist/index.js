'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	//服务端当前时间
	const day = new Date().toISOString();
	const collection = db.collection('users');
	//验证手机号是否已经存在，微信openid。。。
	event["regist"] = day	;
	event["lastLogin"] = day;
	console.log(event);
	let res = await collection.add(event);
	return res.inserted;
};
