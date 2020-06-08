'use strict';
const appId = '';
const appkey = '';
const appSecret = '';
const packageName = '';
const mastersecret = '';
const auth = uniCloud.auth();
const db = uniCloud.database();
const cmd = db.command;
let authtoken;
/**
 * 推送功能，测试ok，但是还需要优化
 */
exports.main = async (event, context) => {
	let type = event.type;
	let {
		customUserId
	} = await auth.getUserInfo();
	let uid = +customUserId;
	if (type && type == "regist") {
		//设备信息与用户绑定
		if (uid > 0) {
			let data = {};
			//按不同的appid来保存,兼容未来多设备
			data[event.appid] = event;
			let res = await db.collection("users").where({
				id: uid
			}).update({
				push: data
			});
			return {
				"code": 200,
				"message": "与用户" + uid + "绑定成功",
			};
		}
		return {
			"code": 404,
			"message": "未登录",
		};
	}
	authtoken = await getAuthToken();
	console.log(authtoken, '获取authtoken');

	let data = {
		"requestid": Date.now() + "abcdefg", //注意requestid不能为纯数字
		"title": Date.now() + "测试title3333",
		"text": Date.now() + "测试text222",
		"content": Date.now() + "测试content"
	}

	if (type == "single") {
		let toUid = +event.fuid;
		data = {
			"requestid": Date.now() + "_" + toUid, //注意requestid不能为纯数字
			"title": Date.now() + "单条推送",
			"text": Date.now() + "测试text223456",
			"content": Date.now() + "单条推送"
		}
		//必须存在指定推送配置
		let userInfo = await db.collection("users").where({
			id: toUid,
			push: cmd.exists(true)
		}).field({
			nickname: 1,
			push: 1
		}).get();
		if (userInfo.data.length == 0) {
			return {
				"code": 404,
				"message": "用户不存在",
			};
		}
		userInfo = userInfo.data[0];
		//console.log(userInfo.push[event.appid]);
		if (!userInfo.push[event.appid]) {
			return {
				"code": 404,
				"message": "推送配置不存在",
			};
		}
		let clientID = userInfo.push[event.appid].clientid;
		//查询用户信息和clientID
		//1.调用面向某个用户发
		//return await single(clientID, data);
		return await notice(clientID, data);
	}
	//2.调用群发
	return await tolist(data);


};
/**单条通知
 * @param {Object} clientID
 * @param {Object} data
 */
const notice = async function(clientID, data) {
	const {
		requestid,
		title,
		text,
		content
	} = data;

	const payload = `{"title":${title},"content":"${content}","sound":"default","payload":${requestid}}`;
	const intent =
		`intent:#Intent;action=android.intent.action.oppopush;
							launchFlags=0x14000000;component=${packageName}/io.dcloud.PandoraEntry;
							S.UP-OL-SU=true;S.title=${title};S.content=${content};
							S.payload=${requestid};end`;

	let res = await uniCloud.httpclient.request(`https://restapi.getui.com/v1/${appId}/push_single`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"authtoken": authtoken
		},
		contentType: 'json',
		dataType: "json",
		data: {
			"message": {
				"appkey": appkey,
				"is_offline": false,
				"msgtype": "notification"
			},
			'push_info': payload,
			'notification': {
				'style': {
					'type': 1,
					'text': text,
					'title': title,
					"big_style": 1,
					"big_image_url": "大图地址",
					"logo": "logo.png",
					"logourl": "https://xxxxxxxxx.tcb.qcloud.la/user/images/2020/5/27/1590561024816.jpg",
					"is_ring": true,
					"is_vibrate": true,
					"is_clearable": true,
					"notify_id":1234
				},
				"transmission_type": true,
				"transmission_content": intent
			},
			"cid": clientID,
			'requestid': requestid,
		},
	})
	return res.data;
}
/**
 * single 	单条透传  参数 1.clientID 2. {requestid,title,text,content}
 * @param {Object} clientID 别名
 * @param {Object} data 推送数据
 */
const single = async function(clientID, data) {
	const {
		requestid,
		title,
		text,
		content
	} = data;

	const payload = `{"title":${title},"content":"${content}","sound":"default","payload":${requestid}}`;
	const intent =
		`intent:#Intent;action=android.intent.action.oppopush;
							launchFlags=0x14000000;component=${packageName}/io.dcloud.PandoraEntry;
							S.UP-OL-SU=true;S.title=${title};S.content=${content};
							S.payload=${requestid};end`;

	let res = await uniCloud.httpclient.request(`https://restapi.getui.com/v1/${appId}/push_single`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"authtoken": authtoken
		},
		contentType: 'json',
		dataType: "json",
		data: {
			"message": {
				"appkey": appkey,
				"is_offline": true,
				"msgtype": "transmission"
			},
			"push_info": payload,
			"transmission": {
				"transmission_type": true,
				"transmission_content": text,
				"notify": {
					"title": title,
					"content": text,
					"intent": intent,
					"type": 1
				}
			},
			"cid": clientID,
			"requestid": requestid
		},
	})
	return res.data;
}
/**
 * tolist群推 
 * @param {Object} data
 */
const tolist = async function(data) {
	const {
		requestid,
		title,
		text,
		content
	} = data;

	const payload = `{"title":${title},"content":"${content}","sound":"default","payload":${requestid}}`;
	const intent =
		`intent:#Intent;action=android.intent.action.oppopush;
							launchFlags=0x14000000;component=${packageName}/io.dcloud.PandoraEntry;
							S.UP-OL-SU=true;S.title=${title};S.content=${content};
							S.payload=${requestid};end`;

	let res = await uniCloud.httpclient.request(`https://restapi.getui.com/v1/${appId}/push_app`, {
		method: 'POST',
		headers: {
			"Content-Type": "application/json",
			"authtoken": authtoken
		},
		contentType: 'json',
		dataType: 'json',
		data: {
			"message": {
				"appkey": appkey,
				"is_offline": true,
				"msgtype": "notification"
			},
			'push_info': payload,
			'notification': {
				'style': {
					'type': 1,
					'text': text,
					'title': title
				},
				"transmission_type": true,
				"transmission_content": intent
			},
			'requestid': requestid,
		},
	})
	return res.data;
}

/**
 * 权限令牌，推送消息时，需要提供auth_token有效期默认为1天，过期后无法使用
 * @link http://docs.getui.com/getui/server/rest/other_if/
 */
const getAuthToken = async function() {
	var timestamp = Date.now();
	let sign = await require('crypto').createHash('sha256')
		.update(appkey + timestamp + mastersecret)
		.digest('hex'); //hex是十六进制
	// sha256(appkey+timestamp+mastersecret)
	let res = await uniCloud.httpclient.request(`https://restapi.getui.com/v1/${appId}/auth_sign`, {
		method: 'POST',
		contentType: 'json',
		data: {
			sign,
			timestamp,
			appkey
		},
		dataType: 'json'
	})
	return res.data.auth_token;
}
