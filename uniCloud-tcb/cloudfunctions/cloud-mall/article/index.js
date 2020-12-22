'use strict';
const db = uniCloud.database();
const cmd = db.command;
const articleCollection = db.collection('opendb-news-articles');
const model = {
	/**
	 * 查询文档详细
	 * @param {Object} data
	 */
	async detail(data) {
		const {
			id
		} = data;
		let res = await articleCollection.doc(id).field({
			title: 1,
			content: 1,
			like_count: 1,
			mode: 1,
			publish_date: 1,
			article_status: 1,
			comment_count: 1,
			category_id: 1,
		}).get();
		if (res.data.length == 0) {
			return false;
		}
		let article = res.data[0];
		if (!article.article_status) {
			return {
				title: "文章不存在",
				content: "文章不存在",
			}
		}
		return article;
	}
}
module.exports = model;
