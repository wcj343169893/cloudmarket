const {
	Controller
} = require('uni-cloud-router')
/**
 * 前端访问app信息相关接口
 */
module.exports = class AppController extends Controller {
	constructor(ctx) {
		super(ctx)
	}
	async init() {
		let isDebug = this.ctx.getConfigs.config("debug");
		//优先从配置文件获取，再读取数据库，查找顺序应用配置-->总配置
		let pageConfig = this.ctx.getAppConfigs.platformConfigs("pageConfig");
		if (!pageConfig) {
			pageConfig = await this.service.system.app.getHomePage(this.ctx.context.APPID, this.ctx.context
				.PLATFORM, isDebug, this.ctx.data);
		}

		let data = {
			mustUniverify: !!this.ctx.getConfigs.platformConfigs("mustUniverify"), //APP必须使用一键登录，防止作假
			mustBindMobile: !!this.ctx.getConfigs.platformConfigs("oauth.bindMobile"), //登录是否必须绑定手机号
			adConfig: {},
			share: this.ctx.getAppConfigs.platformConfigs("share"),
			navMenu: this.ctx.getConfigs.config("navMenu"),
			pageConfig: pageConfig,
			customer: this.ctx.getConfigs.config("customer"), //客服
			appName: "天天商城", //从后台读取
			member: 0 //根据登录用户，识别会员等级
		};
		//单个app配置是否关闭
		let isClosed = this.ctx.getAppConfigs.platformConfigs("systemClosed");
		if (isClosed) {
			return {
				code: -1,
				message: isClosed || "此系统已停用，请下载新版本"
			}
		}
		//是否强制设置邀请者，各个平台独立配置
		data.customer.mustSetInviter = !!this.ctx.getConfigs.platformConfigs("mustSetInviter");
		//从配置文件读取广告位，优先读取独立app配置，再读取公共配置
		let adConfig = this.ctx.getAppConfigs.platformConfigs("adConfig");
		if (adConfig) {
			let signins = adConfig.tasks && adConfig.tasks.signin ? adConfig.tasks.signin : [];
			let videos = adConfig.tasks && adConfig.tasks.video ? adConfig.tasks.video : [];
			let interstitials = adConfig.tasks && adConfig.tasks.interstitial ? adConfig.tasks.interstitial :
		[];
			data.adConfig = {
				...adConfig,
				tasks: {
					signin: this.getArrayRandom(signins), //随机激励广告
					video: this.getArrayRandom(videos), //全屏视频广告
					interstitial: this.getArrayRandom(interstitials), //插屏广告
				},
			}
		}
		//校验登录，没登录，就不用返回用户信息
		//检查token
		await this.service.user.user.checkToken(this.ctx.event.uniIdToken, true);
		if (this.ctx.auth) {
			data.userInfo = {
				...this.ctx.auth.userInfo,
				today_time: this.ctx.auth.todayTime,
				token: undefined,
				password: undefined,
				role: this.ctx.auth.role,
				permission: this.ctx.auth.role
			};
			
			//提现限制
			data.userInfo.cashoutType = this.ctx.getConfigs.config("user.cashoutType");
			let [min, max] = this.ctx.getConfigs.config("user.cashoutLimit");
			data.userInfo.cashoutLimit = {
				min,
				max
			}
		}
		//h5返回微信授权获得openid
		if (this.ctx.context.PLATFORM == "h5") {
			//获取多平台信息
			let oauth = this.ctx.getUniIdConfigs.appPlatformConfig("oauth");
			let domain = this.ctx.getConfigs.config("static-domain");
			let state = "bind";
			if (oauth && oauth.weixin) {
				data.customer.wx_auth =
					`https://open.weixin.qq.com/connect/oauth2/authorize?appid=${oauth.weixin.appid}&redirect_uri=${domain}/pages/app/wx/authorize&response_type=code&scope=snsapi_base&state=${state}#wechat_redirect`;
			}

		}
		return data
	}
	async message() {
		let {
			type,
			isHttp
		} = this.ctx.data;
		//如果是http访问，则不允许，防止漏洞
		if (isHttp) {
			return false;
		}
		console.log("微信消息推送", this.ctx.data)
		return this.service.weixin.message[type].send(this.ctx.data)
	}
	/**
	 * 随机获取数组
	 * @param {Object} signins
	 */
	getArrayRandom(signins) {
		if (signins.length > 0) {
			return signins[parseInt(Math.random() * signins.length)]
		}
		return false;
	}
}
