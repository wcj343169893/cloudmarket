'use strict';

const createConfig = require('uni-config-center');
const crypto = require('crypto')
const db = uniCloud.database();

/**
 * 微信小程序授权登录获取session_key
 * @param {Object} options
 * @param {String} options.code 小程序code
 * 
 * @param {String} options.encryptedData 可选，存在encryptedData和iv时返回用户信息（包含unionid）
 * @param {String} options.iv 可选
 */
const mpWxGetSessionKey = async (options, context) => {
	/**
	 * 微信相关业务
	 */
	const {
		getLoginConfig
	} = require("configs")
	const {
		code,
		encryptedData,
		iv
	} = options;
	const {
		appId,
		secret
	} = getLoginConfig(context.PLATFORM, "weixin");

	let url = 'https://api.weixin.qq.com/sns/jscode2session';
	url += '?appid=' + appId;
	url += '&secret=' + secret;
	url += '&js_code=' + code + '&grant_type=authorization_code';
	const res = await uniCloud.httpclient.request(url, {
		method: 'GET',
		dataType: 'json'
	})
	const data = res.res.data;
	if (data.errcode) {
		return {
			status: 0,
			msg: 'appid错误',
			data,
			appId
		}
	}
	if (!data.session_key) {
		return {
			status: 0,
			msg: '获取微信授权失败',
			data
		}
	}
	if (!encryptedData || !iv) {
		return {
			status: 1,
			openid: data.openid,
			session_key: data.session_key
		}
	}
	const userInfo = WXBizDataCrypt({
		sessionKey: data.session_key,
		encryptedData,
		iv
	})
	return {
		status: 1,
		session_key: data.session_key,
		...userInfo
	}
}
/**
 * 获取AccessToken
 */
const getAccessToken = async (options, context) => {
	const getConfigs = createConfig({
		pluginId: 'uni-id', // 插件id, 注意pluginId需和uni-config-center下的目录名一致
	});
	const wxConfig = getConfigs.config(`${context.PLATFORM}.oauth.weixin`);

	let key = `uni-id:${context.APPID}:${context.PLATFORM}:access-token`
	const data = await dbCache(key, async () => {
		let url = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential';
		url += '&appid=' + wxConfig.appid;
		url += '&secret=' + wxConfig.appsecret;
		const res = await uniCloud.httpclient.request(url, {
			method: 'GET',
			dataType: 'json'
		})
		if (!res.data.access_token) {
			return false;
		}
		return res.data
	}, 3600)
	if (data) {
		return data.access_token
	}
	return false;
}

const dbCache = async (key, data, expires_in = 3600) => {
	let hasRedis = false;
	try {
		uniCloud.redis()
		hasRedis = true;
	} catch (e) {
		//TODO handle the exception
	}
	if (hasRedis) {
		if (!data) {
			//读取数据
			data = await uniCloud.redis().get(key)
			if (data) {
				return JSON.parse(data)
			}
		}
		//写入缓存
		if (typeof(data) == "function") {
			data = await data()
		}
		if (data) {
			await uniCloud.redis().set(key, JSON.stringify(data), "EX", expires_in)
		}
		return data;
	}
	//数据库缓存
	if (!data) {
		const {
			data: dbData
		} = await db.collection("opendb-open-data").doc(key).get()
		//有效缓存
		if (dbData.length > 0 && dbData[0].expired > Date.now()) {
			return JSON.parse(dbData[0].value)
		}
	}
	//写入缓存
	if (typeof(data) == "function") {
		data = await data()
	}
	if (data) {
		await db.collection("opendb-open-data").doc(key).set({
			expired: Date.now() + expires_in * 1000,
			value: JSON.stringify(data)
		})
	}
	return data;
}

/**
 * 解密encryptedData 获取unionid
 * @param {Object} options
 * @param {String} options.sessionKey
 * @param {String} options.encryptedData
 * @param {String} options.iv
 */
const WXBizDataCrypt = options => {
	const appId = wxConfigMp.appId;
	let {
		sessionKey,
		encryptedData,
		iv
	} = options;
	sessionKey = new Buffer(sessionKey, 'base64')
	encryptedData = new Buffer(encryptedData, 'base64')
	iv = new Buffer(iv, 'base64')

	let decoded;
	try {
		// 解密
		let decipher = crypto.createDecipheriv('aes-128-cbc', sessionKey, iv)
		// 设置自动 padding 为 true，删除填充补位
		decipher.setAutoPadding(true)
		decoded = decipher.update(encryptedData, 'binary', 'utf8')
		decoded += decipher.final('utf8')
		decoded = JSON.parse(decoded)
	} catch (err) {
		throw new Error('Illegal Buffer')
	}
	if (decoded.watermark.appid !== appId) {
		throw new Error('Illegal Buffer')
	}
	return decoded
}


module.exports = {
	mpWxGetSessionKey,
	WXBizDataCrypt,
	getAccessToken,
	dbCache
}
