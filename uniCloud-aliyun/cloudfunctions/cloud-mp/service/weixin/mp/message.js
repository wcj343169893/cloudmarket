const {
	Service
} = require('uni-cloud-router');
const BasicService = require('./basic.js')
/**
 * 事件消息
 */
module.exports = class MessageService extends BasicService {
	constructor(ctx) {
		super(ctx)
	}
	async news(data) {
		let domain = this.ctx.getConfigs.config("static-domain");
		//文章前缀，后面直接跟文章的ID
		let articleUrl = this.ctx.getConfigs.config("article-url");
		//返回新闻结构的数据
		return {
			MsgType: "news",
			Content: "",
			ArticleCount: data.length,
			Articles: data.map(e => {
				let url = e.url;
				if (!url) {
					if (articleUrl) {
						url = articleUrl + e._id
					} else {
						url = [domain, "/#/uni_modules/tian-article/pages/article/detail?id=", e._id]
							.join("")
					}
				}
				return {
					Title: e.title,
					Description: e.excerpt,
					PicUrl: e.avatar,
					Url: url
				}
			})
		}
	}
}
