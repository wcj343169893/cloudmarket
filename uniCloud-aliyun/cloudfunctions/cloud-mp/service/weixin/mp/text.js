const {
	Service
} = require('uni-cloud-router');
const BasicService = require('./basic.js')
/**
 * 事件消息
 */
module.exports = class EventService extends BasicService {
	constructor(ctx) {
		super(ctx)
	}
	/**
	 * 普通文本消息
	 * @param {Object} data
	 */
	async info(data) {
		//查询用户信息
		const {
			Content
		} = data;
		console.log("处理text请求", Content)
		if (Content == "注册") {
			await this.bindAccount(data.FromUserName)
			return "注册完成"
		}

		return Content
		// 查询3篇文章，最多8条
		// const {
		// 	data: news
		// } = await this.db.collection("opendb-news-articles").orderBy("publish_date", "desc").limit(5).get();

		// return {
		// 	type: "news",
		// 	data: news
		// }
	}
}
