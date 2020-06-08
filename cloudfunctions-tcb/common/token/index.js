const app = uniCloud.init({
	spaceId: 'cloud-market-00000',
	credentials: require('./credentials.json')
});
const auth = app.auth();
/**
 * 获取登录用户信息
 * @param {Object} data data.accessToken
 */
const getLoginUser = async function(data) {
	//临时兼容获取用户信息,从数据库查询
	/* const db = uniCloud.database();
	let token = data.token || "unknown";
	let uid = parseInt(data.uid);
	let isExists = await db.collection("users").where({
		id: uid,
		token: token
	}).count();
	if (isExists.total > 0) {
		return {
			openId: '',
			appId: '',
			uid: '',
			customUserId: uid
		};
	} */
	let userInfo = await auth.getUserInfo();
	return {
		openId: '',
		appId: '',
		uid: '',
		customUserId: +userInfo.customUserId
	}
	/* 
	let info = auth.getUserInfo();
	console.log(info)
	return info; */
}
/**
 * 生成票据
 * @param {int} id
 */
const createTicket = function(id) {
	return auth.createTicket(id + "", {
		refresh: 24 * 60 * 60 * 1000 //1天登录态， 默认为一小时
	});
}
/**
 * 获得用户token有效期,暂时默认365天
 */
const getTokenExpire = function(){
	//30天有效期
	return new Date().getTime() + 1000 * 3600 * 24 * 365;
}

module.exports = {
	getLoginUser,
	createTicket,
	getTokenExpire
}
