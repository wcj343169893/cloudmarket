<template>
	<view class="container"></view>
</template>

<script>
//#ifdef APP-PLUS
//极光登录插件
const jv = uni.requireNativePlugin('JG-JVerification');
//#endif
import { mobileAutoLogin,getToken } from '@/common/request.js';
import { mapMutations } from 'vuex';
import { client, auth } from '@/common/cloud.js';
export default {
	data() {
		return {
			platform: '',
			loadingText: '安全检测中',
			loginErrorText: '检测失败!\n请打开4G网络后再尝试!',
			ios_uiConfigure: {},
			logining: false
		};
	},
	onLoad() {
		this.platform = uni.getSystemInfoSync().platform;
		//测试阶段，自动登录
		if(this.platform  == "ios"){
			this.toLogin();
			return;
		}
		//在应用初始化调用
		//#ifdef APP-PLUS
		this.jgLogin();
		//#endif

		//#ifdef H5
		this.toLogin();
		//#endif
		//this.getPhoneInfo();
	},
	methods: {
		...mapMutations(['login']),

		async jgLogin() {
			uni.showLoading({
				mask: true,
				title: this.loadingText
			});
			jv.checkVerifyEnable(result => {
				if (result.enable) {
					this.loginAuth();
				} else {
					this.$api.msg(this.loginErrorText,2000);
					this.navTimeBack();
				}
			});
		},
		loginAuth() {
			uni.hideLoading();
			jv.loginAuth(
				{
					autoFinish: true,
					timeout: 5000
				},
				result => {
					// 结果监听
					console.log('jv.loginAuth', result);
					if (result.code == 6000) {
						//登录成功
						this.loginWithToken(result.content);
					} else {
						//手动返回
						this.navBack();
					}
				},
				event => {
					// 事件监听
					let code = event.code;
					let eventDesc = event.content;
					console.log('jv.loginAuth', event);
				}
			);
		},
		loginWithToken(token) {
			mobileAutoLogin({
				token: token
			}).then(
				res => {
					this.$api.msg('登录成功', 2000, false, 'success');
					console.log(res);
					//this.login(res);
					//写入缓存
					uni.setStorage({
						key: "userInfo",
						data:res
					});
					auth.signInWithTicket(res.ticket).then(() => {
						// 登录成功
						console.log('客户端登录成功');
					});
					this.navTimeBack();
				},
				err => {
					this.$api.msg('登录失败' + err.message);
					this.navTimeBack();
				}
			);
		},
		navTimeBack() {
			setTimeout(() => {
				this.navBack();
			}, 2000);
		},
		navBack() {
			uni.navigateBack();
		},
		async toLogin() {
			this.logining = true;
			//const { mobile, password } = this;
			const result = await this.$api.json('userInfo');
			if (result.status === 1) {
				this.$api.msg('登录成功', 2000, false, 'success');
				//this.login(result.data);
				getToken({
					uid: result.data.id,
					token: result.data.token
				}).then(
					res => {
						console.log(res);
						//写入缓存
						uni.setStorage({
							key: "userInfo",
							data:res
						});
						auth.signInWithTicket(res.ticket).then(() => {
							// 登录成功
							console.log('客户端登录成功');
						});
					},
					err => {
						//登录信息失效
						uni.removeStorage({
							key: "userInfo"
						});
					}
				);
				setTimeout(() => {
					uni.navigateBack();
				}, 2000);
			} else {
				this.$api.msg(result.msg);
				this.logining = false;
			}
		}
	}
};
</script>

<style lang="scss">
page {
}
</style>
