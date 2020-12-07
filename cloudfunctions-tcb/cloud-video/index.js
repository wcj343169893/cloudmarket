'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ', event)
	const res = await uniCloud.httpclient.request("https://v.douyin.com/JXveE1S/", {
		method: 'GET',
		dataType: 'text'
	})
	let url = res.headers.location;
	console.log(res.headers.location)
	let idArr = url.split("?")[0].split("/");
	let id = idArr[idArr.length - 2];
	let api = `https://www.iesdouyin.com/web/api/v2/aweme/iteminfo/?item_ids=${id}`;
	const res2 = await uniCloud.httpclient.request(api, {
		method: 'GET',
		dataType: 'json'
	})
	if(res2.data.item_list){
		return res2.data.item_list[0];
	}
	return res2
};
