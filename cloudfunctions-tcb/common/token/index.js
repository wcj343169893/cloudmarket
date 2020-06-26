const app = uniCloud.init({
	spaceId: 'cloud-market-3c5868',
	credentials: require('./credentials.json')
});
const auth = app.auth();
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
	createTicket,
	getTokenExpire
}
