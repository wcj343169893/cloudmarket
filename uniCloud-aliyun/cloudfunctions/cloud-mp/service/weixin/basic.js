const {
	Service
} = require('uni-cloud-router')
const md5 = require('md5-node');
/**
 * 微信总体父类
 */
module.exports = class BasicService extends Service {
	constructor(ctx) {
		super(ctx)
	}

	/**
	 * 获取当前时间，2021-11-13 14:42:43
	 */
	getDateTime(t) {
		//发单时间
		let date = new Date();
		if (t) {
			data = new Date(t)
		}
		//8小时时差
		date.setHours(date.getHours() + 8)
		return `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
	}
	/**
	 * 获取access token
	 */
	async getAccessToken({
		api,
		appid,
		refresh,
		appsecret
	}) {
		let key = `uni-id:${appid}:${appsecret}:access-token`
		return this.ctx.dbcache(key, null, 3600, async () => {
			console.log({
				appid,
				refresh,
				appsecret
			})
			let {
				data
			} = await this.curl(
				`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${appsecret}`, {
					dataType: "json"
				});
			console.log(data)
			if (data.errcode) {
				//获取失败了
				return false;
			}
			return data.access_token;
		})
	}
	/**
	 * 获取微信票据
	 */
	async getApiTicket() {
		return this.ctx.dbcache("weixin_api_ticket_" + this.configs.appid, null, 3600, async () => {
			let access_token = await this.getAccessToken({
				appid: this.configs.appid,
				appsecret: this.configs.appsecret,
			});
			if (!access_token) {
				console.log("access_token无效")
				return false;
			}
			let {
				data
			} = await this.curl(
				`https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token=${access_token}&type=wx_card`, {
					dataType: "json"
				});
			console.log(data)
			if (data.errcode) {
				//获取失败了
				return false;
			}
			return data.ticket;
		})
	}

	/**
	 * 获取小程序 scheme 码，适用于短信、邮件、外部网页、微信内等拉起小程序的业务场景。通过该接口，可以选择生成到期失效和永久有效的小程序码，有数量限制，目前仅针对国内非个人主体的小程序开放
	 * @param {Object} data
	 * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
	 */
	async generatescheme(data) {
		return this.ctx.dbcache("generatescheme" + md5(JSON.stringify(data)), null, 3600, async () => {
			let token = await this.getAccessToken({
				appid: this.configs.appid,
				appsecret: this.configs.appsecret,
			});
			let {
				data: resultData
			} = await this.curl(
				`https://api.weixin.qq.com/wxa/generate_urllink?access_token=${token}`, {
					method: "POST",
					contentType: "json",
					dataType: "json",
					data: {
						jump_wxa: data,
						is_expire: true,
						expire_type: 1,
						expire_interval: 30
					},
				});
			console.log(resultData)
			if (resultData.errcode) {
				//获取失败了
				return false;
			}
			return resultData.openlink;
		})
	}

	/**
	 * 获取小程序 URL Link，适用于短信、邮件、网页、微信内等拉起小程序的业务场景。通过该接口，可以选择生成到期失效和永久有效的小程序链接，有数量限制，目前仅针对国内非个人主体的小程序开放Object} data
	 * @link https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-link/urllink.generate.html#method-http
	 */
	async generateUrlLink(data) {
		return this.ctx.dbcache("generateUrlLink" + md5(JSON.stringify(data)), null, 3600, async () => {
			let token = await this.getAccessToken({
				appid: this.configs.appid,
				appsecret: this.configs.appsecret,
			});
			let {
				data: resultData
			} = await this.curl(
				`https://api.weixin.qq.com/wxa/generate_urllink?access_token=${token}`, {
					method: "POST",
					contentType: "json",
					dataType: "json",
					data: {
						...data,
						is_expire: true,
						expire_type: 1,
						expire_interval: 30
					},
				});
			console.log(resultData)
			if (resultData.errcode) {
				//获取失败了
				return false;
			}
			return resultData.url_link;
		})
	}

	/**
	 * 从uni-id配置中获取微信平台配置
	 * @param {Object} appid
	 */
	async getUniIdWeixinConfig(appid) {
		//获得此app的全部配置
		let platform = this.ctx.context.PLATFORM
		let configs = await this.ctx.getAppConfigsByAppId(appid)
		if (configs[platform] && configs[platform].oauth && configs[platform].oauth.weixin) {
			this.configs = configs[platform].oauth.weixin;
		}
		return this.configs //= this.ctx.getUniIdConfigs.appPlatformConfig("oauth", null, appid).weixin;
	}
}
