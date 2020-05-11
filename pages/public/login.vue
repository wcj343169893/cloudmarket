<template>
	<view class="container"></view>
</template>

<script>
//#ifdef APP-PLUS
//const shanYanSDKModule = uni.requireNativePlugin('CLSDK-ShanYanSDKModule'); //调用
//极光登录插件
const jv = uni.requireNativePlugin('JG-JVerification');
//#endif
import { mobileAutoLogin } from '@/common/request.js';
import { mapMutations } from 'vuex';

export default {
	data() {
		return {
			platform: '',
			loadingText: '安全检测中',
			loginErrorText: '登录失败!请打开4G网络后再尝试!',
			ios_uiConfigure: {},
			logining: false
		};
	},
	onLoad() {
		this.platform = uni.getSystemInfoSync().platform;
		//在应用初始化调用
		//#ifdef APP-PLUS
		//this.initLogin();

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
			//jv.setDebugMode(true);
			jv.init(
				{
					timeout: 7000,
					isProduction: true
				},
				result => {
					let code = result.code;
					let desc = result.content;
					console.log('jv.init', result);
				}
			);
			jv.isInitSuccess(result => {
				let isSucc = result.enable;
				console.log('jv.isInitSuccess', result);
			});
			jv.checkVerifyEnable(result => {
				let isSupport = result.enable;
				console.log('jv.checkVerifyEnable', result);
			});
			jv.getToken(7000, result => {
				let code = result.code;
				let token = result.content;
				let operator = result.operator;
				console.log('jv.getToken', result);

				jv.preLogin(7000, result => {
					let code = result.code;
					let token = result.content;
					console.log('jv.preLogin', result);
					this.loginAuth();
				});
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
					this.$api.msg('登录成功');
					console.log(res);
					this.login(res);
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
				this.login(result.data);
				setTimeout(() => {
					uni.navigateBack();
				}, 200);
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
	background: #fff;
}
.container {
	padding-top: 115px;
	position: relative;
	width: 100vw;
	height: 100vh;
	overflow: hidden;
	background: #fff;
}
.wrapper {
	position: relative;
	z-index: 90;
	background: #fff;
	padding-bottom: 40upx;
}
.back-btn {
	position: absolute;
	left: 40upx;
	z-index: 9999;
	padding-top: var(--status-bar-height);
	top: 40upx;
	font-size: 40upx;
	color: $font-color-dark;
}
.left-top-sign {
	font-size: 120upx;
	color: $page-color-base;
	position: relative;
	left: -16upx;
}
.right-top-sign {
	position: absolute;
	top: 80upx;
	right: -30upx;
	z-index: 95;
	&:before,
	&:after {
		display: block;
		content: '';
		width: 400upx;
		height: 80upx;
		background: #b4f3e2;
	}
	&:before {
		transform: rotate(50deg);
		border-radius: 0 50px 0 0;
	}
	&:after {
		position: absolute;
		right: -198upx;
		top: 0;
		transform: rotate(-50deg);
		border-radius: 50px 0 0 0;
		/* background: pink; */
	}
}
.left-bottom-sign {
	position: absolute;
	left: -270upx;
	bottom: -320upx;
	border: 100upx solid #d0d1fd;
	border-radius: 50%;
	padding: 180upx;
}
.welcome {
	position: relative;
	left: 50upx;
	top: -90upx;
	font-size: 46upx;
	color: #555;
	text-shadow: 1px 0px 1px rgba(0, 0, 0, 0.3);
}
.input-content {
	padding: 0 60upx;
}
.input-item {
	display: flex;
	flex-direction: column;
	align-items: flex-start;
	justify-content: center;
	padding: 0 30upx;
	background: $page-color-light;
	height: 120upx;
	border-radius: 4px;
	margin-bottom: 50upx;
	&:last-child {
		margin-bottom: 0;
	}
	.tit {
		height: 50upx;
		line-height: 56upx;
		font-size: $font-sm + 2upx;
		color: $font-color-base;
	}
	input {
		height: 60upx;
		font-size: $font-base + 2upx;
		color: $font-color-dark;
		width: 100%;
	}
}

.confirm-btn {
	width: 630upx;
	height: 76upx;
	line-height: 76upx;
	border-radius: 50px;
	margin-top: 70upx;
	background: $uni-color-primary;
	color: #fff;
	font-size: $font-lg;
	&:after {
		border-radius: 100px;
	}
}
.forget-section {
	font-size: $font-sm + 2upx;
	color: $font-color-spec;
	text-align: center;
	margin-top: 40upx;
}
.register-section {
	position: absolute;
	left: 0;
	bottom: 50upx;
	width: 100%;
	font-size: $font-sm + 2upx;
	color: $font-color-base;
	text-align: center;
	text {
		color: $font-color-spec;
		margin-left: 10upx;
	}
}
</style>
