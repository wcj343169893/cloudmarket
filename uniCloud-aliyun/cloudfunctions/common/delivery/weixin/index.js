'use strict';
const crypto = require('crypto');
const basic = require("../basic/index.js")
const parseAddress = require("../basic/parseAddress.js")
const wxAuth = require('wx-auth');
const createConfig = require('uni-config-center');
const {
	getDeliveryConfig
} = require("configs");
const models = {
	...basic,
	testUrl: "https://api.weixin.qq.com/cgi-bin/express/intracity/",
	productUrl: "https://api.weixin.qq.com/cgi-bin/express/intracity/",
	name: "weixin",
	delivery_id: "weixin",
	encryptType: "AES256",
	signType: "RSA",
	/**
	 * 在使用门店相关接口前需要先开通门店权限，开通门店权限前可以使用页面或者使用下面的API开通门店（无加密，可直接调用）。
	 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/intracity_service.html#_2-1-%E5%BC%80%E9%80%9A%E9%97%A8%E5%BA%97%E6%9D%83%E9%99%90
	 */
	async init() {
		//开通门店权限,每天只能调用10次，系统初始化的时候调用一次就行了
		return this.send({}, "apply");
	},
	/**
	 * 创建门店
	 * @param {Object} shop
	 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/intracity_service.html#_2-2-%E5%88%9B%E5%BB%BA%E9%97%A8%E5%BA%97
	 * @return wx_store_id
	 */
	async addShop(shop) {
		// console.log(shop);
		let address = parseAddress.parse(shop.address);
		let data = {
			out_store_id: `${shop.id}`,
			store_name: shop.name,
			order_pattern: 1, //1：价格优先，2：运力优先,默认价格优先
			address_info: {
				province: address.province,
				city: address.city,
				area: address.area,
				street: address.street,
				house: address.house,
				lat: shop.latitude,
				lng: shop.longitude,
				phone: shop.phone,
			}
		}
		// console.log(data);
		const result = await this.send(data, "createstore");
		if (result) {
			return result.wx_store_id;
		}
		return result;
	},
	async getShop(data) {
		let query = {}
		if (data.wx_store_id) {
			query.wx_store_id = data.wx_store_id;
		} else if (data.out_store_id) {
			query.out_store_id = data.out_store_id;
		}
		const result = await this.send(data, "querystore");
		if (result) {
			return result.store_list;
		}
		return result;
	},
	/**
	 * 统一发送接口
	 * @param {Object} data
	 * @param {Object} url
	 */
	async send(data, url, isTry) {
		this.config = getDeliveryConfig(this.name);
		this.config.weixin = this.getWxConfig()
		//获取access_token
		const accessToken = await wxAuth.getAccessToken({}, this.context)
		const baseUrl = this.config.product ? this.productUrl : this.testUrl;
		const urlPath = baseUrl + url;
		const requestData = this.encrypt(data, urlPath)
		const signature = this.sign(requestData, urlPath)
		// console.log({
		// 	"Wechatmp-Appid": this.config.weixin.appid,
		// 	"Wechatmp-TimeStamp": requestData.ts,
		// 	"Wechatmp-Signature": signature,
		// });
		// console.log(requestData)
		const res = await uniCloud.httpclient.request(urlPath + "?access_token=" + accessToken, {
			method: 'POST',
			headers: {
				"Wechatmp-Appid": this.config.weixin.appid,
				"Wechatmp-TimeStamp": requestData.ts,
				"Wechatmp-Signature": signature,
			},
			contentType: "json",
			data: JSON.parse(requestData.data),
			dataType: "json"
		});
		return this._afterSend(res, urlPath);
	},
	/**
	 * 统一发送接口结果处理
	 * @param {Object} data
	 * @param {Object} url
	 */
	async _afterSend(res, url) {
		// console.log(res);
		const {
			data,
			headers
		} = res
		//2.解密数据
		const decryptData = this.decrypt(res, url)
		console.log(decryptData);
		//1.验证签名
		const result = this.verifySign(res, url);
		// if (!result) {
		// 	console.error("安全验证失败")
		// 	return false;
		// }
		//{"iv":"92Hpo6PBZHbPgDVA","data":"kQL9keLnVgMq0X4cddGLDiNBO0yz1Vwatw2U2PKo8eSXpcf0pllQRtd2OPNZT4t5UvSpcszEL0S1hi/q6e448h25gW+9A0EdMUDRsjbUB9Q+uhdkxC/a+xTYa8gcQzjuFpEIkF988JKx0jY3kEgF+ItwZVfGn2k9pA==","authtag":"YaRk1UBC5fo7TuCBitDVEQ=="}
		if (decryptData.errcode == 0) {
			return decryptData;
		}
		console.log(decryptData.errmsg);
		return false;
	},
	/**
	 * 加密请求数据
	 * @param {Object} data
	 */
	encrypt(req, url) {
		//AES256_GCM
		const {
			sn: local_sym_sn,
			key: local_sym_key,
		} = this.config.encrypt // 开发者本地信息		
		const local_appid = this.config.weixin.appid

		const local_ts = Math.floor(Date.now() / 1000) //加密签名使用的统一时间戳
		const nonce = crypto.randomBytes(16).toString('base64').replace(/=/g, '')

		const reqex = {
			_n: nonce,
			_appid: local_appid,
			_timestamp: local_ts
		}

		const real_req = Object.assign({}, reqex, req) // 生成并添加安全校验字段
		const plaintext = JSON.stringify(real_req)

		const aad = `${url}|${local_appid}|${local_ts}|${local_sym_sn}`
		// console.log(local_sym_key);
		const real_key = Buffer.from(local_sym_key, "base64")
		const real_iv = crypto.randomBytes(12)
		const real_aad = Buffer.from(aad, "utf-8")
		const real_plaintext = Buffer.from(plaintext, "utf-8")

		const cipher = crypto.createCipheriv("aes-256-gcm", real_key, real_iv)
		cipher.setAAD(real_aad)

		let cipher_update = cipher.update(real_plaintext)
		let cipher_final = cipher.final()
		const real_ciphertext = Buffer.concat([cipher_update, cipher_final])
		const real_authTag = cipher.getAuthTag()

		const iv = real_iv.toString("base64")
		const data = real_ciphertext.toString("base64")
		const authtag = real_authTag.toString("base64")

		const req_data = {
			iv,
			data,
			authtag,
		}

		const new_req = {
			ts: local_ts,
			data: JSON.stringify(req_data)
		}
		// console.log(JSON.stringify(new_req));
		return new_req
	},
	/**
	 * 解密返回数据
	 * @param {Object} data
	 */
	decrypt(resp, url) {
		const {
			sn: local_sym_sn,
			key: local_sym_key,
		} = this.config.encrypt // 开发者本地信息		
		const local_appid = this.config.weixin.appid
		const resp_ts = resp.headers["wechatmp-timestamp"]
		const {
			iv,
			data,
			authtag
		} = resp.data

		const aad = `${url}|${local_appid}|${resp_ts}|${local_sym_sn}`

		const real_aad = Buffer.from(aad, "utf-8")
		const real_key = Buffer.from(local_sym_key, "base64")
		const real_iv = Buffer.from(iv, "base64")
		const real_data = Buffer.from(data, "base64")
		const real_authtag = Buffer.from(authtag, "base64")

		const decipher = crypto.createDecipheriv("aes-256-gcm", real_key, real_iv)
		decipher.setAAD(real_aad)
		decipher.setAuthTag(real_authtag)

		let decipher_update = decipher.update(real_data)
		let decipher_final
		try {
			decipher_final = decipher.final()
		} catch (error) {
			console.error("auth tag验证失败")
			return {}
		}

		const real_deciphertext = Buffer.concat([decipher_update, decipher_final])

		const deciphertext = real_deciphertext.toString("utf-8")
		const real_resp = JSON.parse(deciphertext)
		const local_ts = Math.floor(Date.now() / 1000)

		if (
			// 安全检查，根据业务实际需求判断
			real_resp["_appid"] != local_appid || // appid不匹配
			real_resp["_timestamp"] != resp_ts || // timestamp与Wechatmp-TimeStamp不匹配
			local_ts - real_resp["_timestamp"] > 3000 // 响应数据的时候与当前时间超过5分钟
		) {
			console.error("安全字段校验失败")
			return {}
		}

		return real_resp
	},
	/*
	 *  签名算法：
	 * delivery_sign
	 * @link https://developers.weixin.qq.com/miniprogram/dev/platform-capabilities/industry/express/business/intracity_service.html#_1-3-%E6%95%B0%E6%8D%AE%E7%AD%BE%E5%90%8D%E5%92%8C%E5%8A%A0%E5%AF%86
	 */
	sign(req, url) {
		const {
			sn: local_sn,
			key: local_private_key,
		} = this.config.sign // 开发者本地信息
		const local_appid = this.config.weixin.appid
		const {
			ts,
			data
		} = req // 待请求API数据

		const payload = `${url}\n${local_appid}\n${ts}\n${data}`
		const data_buffer = Buffer.from(payload, 'utf-8')
		const key_obj = {
			key: local_private_key,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
			saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST // salt长度，需与SHA256结果长度(32)一致
		}

		const sig_buffer = crypto.sign(
			'RSA-SHA256',
			data_buffer,
			key_obj
		)
		const sig = sig_buffer.toString('base64')
		return sig
	},
	/**
	 * 验证签名
	 */
	verifySign(resp, url) {
		const {
			data,
			headers
		} = resp
		const resp_data = JSON.stringify(data)

		const {
			sn: local_sn,
			certificate: local_certificate,
		} = this.config.verifySign // 开发者本地信息

		const local_appid = this.config.weixin.appid
		const resp_appid = headers["wechatmp-appid"]
		const resp_ts = headers["wechatmp-timestamp"]
		const resp_sn = headers["wechatmp-serial"]
		const resp_sig = headers["wechatmp-signature"]
		//Wechatmp-Serial-Deprecated
		const resp_serial = headers["wechatmp-serial-deprecated"]
		//Wechatmp-Signature-Deprecated
		const resp_signature = headers["wechatmp-signature-deprecated"]
		// console.log(headers)

		const local_ts = Math.floor(Date.now() / 1000)

		// 安全检查，根据业务实际需求判断
		if (local_appid != resp_appid || // 回包appid不正确
			local_ts - resp_ts > 300) { // 回包时间超过5分钟
			console.error("安全字段校验失败", resp_ts)
			return false
		}

		let signature = ''
		if (local_sn === resp_sn) {
			console.info("正常证书")
			signature = resp_sig
		} else if (local_sn === resp_serial) {
			console.warn("平台证书即将过期，请及时更换")
			signature = resp_signature
		} else {
			console.error("sn不匹配")
			return false
		}

		const payload = `${url}\n${resp_appid}\n${resp_ts}\n${resp_data}`
		// console.log(payload,signature)
		const data_buffer = Buffer.from(payload, 'utf-8')
		const sig_buffer = Buffer.from(signature, 'base64')
		// console.log(local_certificate)
		const key_obj = {
			key: local_certificate,
			padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
			saltLength: crypto.constants.RSA_PSS_SALTLEN_DIGEST
		}

		const result = crypto.verify(
			'RSA-SHA256',
			data_buffer,
			key_obj,
			sig_buffer
		)
		console.log("验证签名结果", result);
		return result
	},
	getWxConfig() {
		const getConfigs = createConfig({
			pluginId: 'uni-id', // 插件id, 注意pluginId需和uni-config-center下的目录名一致
		});
		return getConfigs.config(`${this.context.PLATFORM}.oauth.weixin`);
	}
}
module.exports = models;