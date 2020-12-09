'use strict';
const models = {
	async getInfo(data) {
		const {
			content
		} = data;
		let reg = /(https?|http|ftp|file):\/\/[-A-Za-z0-9+&@#/%?=~_|!:,.;]+[-A-Za-z0-9+&@#/%=~_|]/g;
		//reg = /(http:\/\/|https:\/\/)((\w|=|\?|\.|\/|&|-)+)/g;
		let result = content.match(reg);
		console.log(result);
		if (!result) {
			return false;
		}
		let url = result[0];
		const res = await uniCloud.httpclient.request(url, {
			method: 'GET',
			dataType: 'text'
		})
		let url2 = res.headers.location;
		console.log(res.headers.location)
		let idArr = url2.split("?")[0].split("/");
		let id = idArr[idArr.length - 2];
		let api = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${id}`;
		const res2 = await uniCloud.httpclient.request(api, {
			method: 'GET',
			dataType: 'json'
		})
		if (res2.data.item_list) {
			let videoInfo = res2.data.item_list[0];
			//描述，封面，视频
			return {
				originUrl: url,
				title: videoInfo.desc,
				poster: videoInfo.video.cover.url_list[0],
				//poster: videoInfo.video.dynamic_cover.url_list[0],
				url: videoInfo.video.play_addr.url_list[0],
				duration: videoInfo.video.duration,
				width: videoInfo.video.width,
				height: videoInfo.video.height,
			}
		}
		return false;
	}
}
module.exports = models;
