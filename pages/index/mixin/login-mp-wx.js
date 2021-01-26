import {
	cloudUser
} from '@/common/request.js';
export default {
	// #ifdef MP-WEIXIN
	data() {
		return {
			mpCodeTimer: 0,
			mpWxCode: '',
		}
	},
	onShow() {
		this.getMpWxCode();
	},
	methods: {
		//微信小程序登录，获得用户信息，更新到服务器，只存在一次
		mpWxGetUserInfo(userInfoData) {
			if (!userInfoData.detail.userInfo) {
				return;
			}
			this.$api.throttle(async () => {
				const [err, userData] = await uni.getUserInfo();
				console.log(userData);
				cloudUser("info", "saveByMpWeixin", {
					code: this.mpWxCode,
					encryptedData: userData.encryptedData,
					iv: userData.iv,
					userInfo: JSON.parse(userData.rawData)
				}, true).then(res => {
					//更新成功，修改本地用户信息
					this.$store.dispatch('getUserInfo');
				}, err => {
					//更新失败
				})
			})
		},
		//获取code
		getMpWxCode() {
			uni.login({
				provider: 'weixin',
				success: res => {
					this.mpWxCode = res.code;
				}
			})
		},

	}
	// #endif
}
