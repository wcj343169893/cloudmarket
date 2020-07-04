'use strict';
exports.main = async (event, context) => {
	//event为客户端上传的参数
	console.log('event : ' + event)

	let result = {
		isUpdate: false
	}

	let appid = event.appid
	let clientVersion = event.version

	//这是通过HTTP接口访问的
	if (event.headers) {
		appid = event.queryStringParameters.appid
		clientVersion = event.queryStringParameters.version
	}

	//根据UA判断系统平台
	const os = /iPhone|iPad/.test(context.CLIENTUA) ? 'ios' : 'android'

	if (appid && clientVersion) {
		const db = uniCloud.database();

		const collection = db.collection('uni-app-version')
		const record = await collection.where({
			appid: appid
		}).limit(1).get()

		if (record && record.data && record.data.length > 0) {
			let versionInDb = record.data[0][os]
			if (compare(versionInDb.version, clientVersion) == 1) {
				result.isUpdate = true
				result.note = versionInDb.note
				result.url = versionInDb.url
			} else {
				result.msg = '当前版本已经是最新的，不需要更新！'
			}
		} else {
			result.msg = 'AppId不匹配'
		}
	}

	console.log('检查结果：', result);

	//返回数据给客户端
	return result
};

/**
 * 对比版本号
 * @param {Object} v1
 * @param {Object} v2
 */
function compare(v1, v2) {
	let arr_1 = v1.split('.')
	let arr_2 = v2.split('.')
	for (var i = 0; i < arr_1.length; i++) {
		if (parseInt(arr_1[i]) > parseInt(arr_2[i])) {
			return 1
		} else if (parseInt(arr_1[i]) < parseInt(arr_2[i])) {
			return -1
		}
	}
	return 0
}
