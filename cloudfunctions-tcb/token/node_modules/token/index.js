const app = uniCloud.init({
	spaceId: 'cloud-market-3c5868',
	credentials: require('./credentials.json')
});
const auth = app.auth();
/**
 * 获取登录用户信息
 */
const getUserInfo = function() {
	let info = auth.getUserInfo();
	console.log(info)
	return info;
}
/**
 * 生成票据
 * @param {Object} id
 */
const createTicket = function(id){
	return auth.createTicket(id + "", {
		refresh: 24 * 60 * 60 * 1000 //1天登录态， 默认为一小时
	});
}

module.exports = {
	getUserInfo,
	createTicket
}
