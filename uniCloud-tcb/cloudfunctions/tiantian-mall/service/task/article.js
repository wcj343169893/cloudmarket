const {
	Service
} = require('uni-cloud-router');
module.exports = class ArticleService extends Service {
	constructor(ctx) {
		super(ctx)
		this.collection = this.db.collection('opendb-news-article-read')
	}
	/**
	 * 检查此次阅读是否已加倍
	 * @param {Object} uid
	 * @param {Object} data
	 */
	async checkDouble(uid, data) {
		const cmd = this.db.command;
		//判断阅读记录是否已经加倍，必须是当天的数据
		let res = await this.collection.where({
			article_id: data.article_id,
			user_id: uid,
			_id: data.article_read_id,
		}).get();
		if (res.data.length == 0) {
			//存在今日阅读记录
			return false;
		}
		return !res.data[0].getdouble;
	}
	/**
	 * 设置文章阅读已加倍
	 * @param {Object} uid
	 * @param {Object} data
	 */
	async afterSetDouble(uid, data) {
		//加倍之后，更新记录
		return await this.collection.doc(data.article_read_id).update({
			getdouble: true
		})
	}
}
