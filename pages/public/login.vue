<template>
	<view class="container">
		<!-- #ifndef MP -->
		<view class="mix-list-cell b-b">
			<view class="region">
				<select-options defaultOption="+86" :options="regionOptions" @eventClick="changeRegion"></select-options>
			</view>
			<input type="number" maxlength="11" class="cell-content" v-model="mobile" placeholder="输入手机号(新号码自动注册)" />
		</view>
		<view class="mix-list-cell b-b">
			<input type="number" maxlength="6" class="cell-content" v-model="code" placeholder="输入验证码" />
			<button class="add-btn code" :class="{ disabled: disabled || processing }" @click="getCode()">{{ btnGetCodeText }}</button>
		</view>
		<view class="mix-list-cell-buttons"><button class="add-btn" :class="{ disabled: disabledLogin }" @click="btnLogin()">登录</button></view>
		<!-- #endif -->
		<!-- #ifdef MP -->
		<view class="mix-list-cell center">
			<text>自动登录中，请稍后...</text>
		</view>
		<!-- #endif -->

		<view class="bottom">
			<!-- #ifdef APP-PLUS-->
			<view class="line b-b"><text class="text">快捷登录</text></view>
			<view class="mix-list-cell-buttons">
				<button class="add-btn jglogin" @click="jgLogin()">{{loginBtnText}}</button>
				<button class="add-btn" @click="wxLogin()"><text class="yticon icon-weixin"></text>微信登录</button>
			</view>
			<!-- #endif-->
			<view class="">
				<text>登录即代表你同意</text>
				<text class="link" @click="navToDocPageByType('app_service')">《服务协议》</text>
				<text>和</text>
				<text class="link" @click="navToDocPageByType('app_user_private')">《隐私协议》</text>
			</view>
		</view>
	</view>
</template>

<script>
	//#ifdef APP-PLUS
	//极光登录插件
	const jv = uni.requireNativePlugin('JG-JVerification');
	//#endif
	import {
		mobileAutoLogin,
		getToken,
		mobileLogin,
		sendSms,
		micLogin
	} from '@/common/request.js';
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import {
		client,
		auth
	} from '@/common/cloud.js';
	import {
		navToDocPageByType
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				platform: '',
				loadingText: '安全检测中',
				loginErrorText: '检测失败!\n请打开4G网络后再尝试!',
				loginBtnText: '本机号码一键登录',
				ios_uiConfigure: {},
				logining: false,
				regionOptions: {
					"+86": "+86",
					"+40": "+40",
				},
				mobile: '',
				mobileReg: /^1[3456789]\d{9}$/,
				disabled: true,
				processing: false,
				disabledLogin: true,
				btnGetCodeOldText: '获取验证码',
				btnGetCodeText: '获取验证码',
				daojishiTotal: 60,
				code: ''
			};
		},
		watch: {
			mobile(newText, oldText) {
				if (this.mobileReg.test(newText)) {
					this.disabled = false;
				} else {
					this.disabled = true;
				}
			},
			code(newText, oldText) {
				if (/\d{6}$/.test(newText) && !this.disabled) {
					this.disabledLogin = false;
				} else {
					this.disabledLogin = true;
				}
			}
		},
		onLoad() {
			//在应用初始化调用
			//#ifdef APP-PLUS
			//this.jgLogin();
			//#endif
			//#ifdef MP
			//重新加载app，即可自动登录
			this.micLogin();
			//#endif
		},
		computed: {
			...mapState(['inviteCode', 'jgLoginInit'])
		},
		methods: {
			...mapMutations(['login']),
			async micLogin() {
				uni.showLoading({
					mask: true,
					title: "正在登录"
				});
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						let provider = res.provider[0];
						uni.login({
							provider: provider,
							success: (loginRes) => {
								console.log('loginRes', loginRes);
								console.log('inviteCode', this.inviteCode);
								//小程序自动登录
								micLogin({
									inviteCode: this.inviteCode,
									code: loginRes.code
								}, provider).then(res => {
									console.log("login success", res);
									this.loginSuccess(res);
								}, err => {
									console.log("小程序自动登录失败！")
								});
							}
						});
					}
				});
			},
			/**
			 * 微信授权登录
			 */
			async wxLogin() {
				let provider = "weixin";
				uni.login({
					provider: provider,
					success: (loginRes) => {
						console.log('loginRes', loginRes);
						console.log('inviteCode', this.inviteCode);
						//微信获取用户信息，并登录
						micLogin({
							inviteCode: this.inviteCode,
							code: loginRes.code
						}, provider).then(res => {
							console.log("login success", res);
							this.loginSuccess(res);
						}, err => {
							this.$api.msg(err.message || "企业必须认证才有登录能力")
						});
					}
				});
			},
			async jgLogin() {
				if (!this.jgLoginInit) {
					this.$api.msg(this.loginBtnText + "初始化失败!")
					return;
				}
				uni.showLoading({
					mask: true,
					title: this.loadingText
				});
				if (jv) {
					jv.checkVerifyEnable(result => {
						if (result.enable) {
							this.loginAuth();
						} else {
							//this.$api.msg(this.loginErrorText,2000);
							//this.navTimeBack();
							//页面输入手机号+验证码登录
							uni.hideLoading();
						}
					});
				} else {
					uni.hideLoading();
				}
			},
			loginAuth() {
				uni.hideLoading();
				jv.loginAuth({
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
					token: token,
					inviteCode: this.inviteCode
				}).then(
					res => {
						console.log(res);
						//this.login(res);
						this.loginSuccess(res);
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
			navToDocPageByType(type) {
				navToDocPageByType(type);
			},
			changeRegion(val) {
				console.log("changeRegion", val)
			},
			getCode() {
				if (this.disabled || this.processing) {
					return;
				}
				//再次验证手机号码
				if (!this.checkMobile()) {
					this.$api.msg('手机号格式不正确');
					return;
				}
				this.$api.throttle(() => {
					sendSms({
						mobile: this.mobile
					}).then(res => {
						this.$api.success("发送成功")
						//this.code = res;
					}, err => {
						this.$api.msg(err.message)
					})
				})
				//倒计时60秒
				this.daojishi(this.daojishiTotal);
			},
			daojishi(sec) {
				if (sec > 0) {
					sec--;
					this.btnGetCodeText = sec + 's后获取';
					this.processing = true;
					setTimeout(() => {
						this.daojishi(sec);
					}, 1000);
				} else {
					this.processing = false;
					this.btnGetCodeText = this.btnGetCodeOldText;
				}
			},
			btnLogin() {
				if (this.disabled || this.disabledLogin) {
					//测试入口，避免每次发送短信
					let token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5ZmZiMmE0ODVmMzg5NjQyMDA5OTliMWYwN2NiN2I4MCIsImNsaWVudElkIjoiMTg5MzkwMmQ2YWU5MGJkOWIyOTg0MWEyZTZiZmE4MzMiLCJpYXQiOjE2MDI1MDI3NDUsImV4cCI6MTYwNTA5NDc0NX0.vgFCvow1EPwsYN6RwvA1Dvf8AuD1p2X59k7w28ZXA_A";
					//#ifdef APP-PLUS
					token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiI5ZmZiMmE0ODVmMzg5NjQyMDA5OTliMWYwN2NiN2I4MCIsImNsaWVudElkIjoiY2QxNTkzMWM5NWZmYmFkY2QzMDhjODRjMjgzMzgyYTIiLCJpYXQiOjE2MDI4MTUyOTcsImV4cCI6MTYwNTQwNzI5N30.ANCBNBEPUgaQ2iIrbh6yVssPFoZukNwUgilyau12Puk";
					//#endif
					this.loginSuccess({
						token: token,
						tokenExpired: (new Date()).getTime() + 24 * 3600 * 1000 * 2
					});
					return;
				}
				//再次验证手机号码
				if (!this.checkMobile()) {
					this.$api.msg('手机号格式不正确');
					return;
				}
				this.disabledLogin = true;
				//登录，手机号+验证码
				mobileLogin({
					mobile: this.mobile,
					code: this.code,
					inviteCode: this.inviteCode
				}).then(
					res => {
						this.loginSuccess(res);
					},
					err => {
						this.$api.msg('登录失败');
						this.disabledLogin = false;
					}
				);
			},
			checkMobile() {
				return this.mobileReg.test(this.mobile);
			},
			loginSuccess(res) {
				uni.hideLoading();
				this.$api.success('登录成功');
				this.login(res);
				this.navTimeBack();
			}
		}
	};
</script>

<style lang="scss">
	page {}

	.mix-list-cell {
		display: flex;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		&.cell-hover {
			background: #fafafa;
		}

		&.b-b:after {
			left: 30upx;
		}

		.cell-icon {
			align-self: center;
			width: 56upx;
			max-height: 60upx;
			font-size: 38upx;
		}

		.cell-more {
			align-self: center;
			font-size: 30upx;
			color: $font-color-base;
			margin-left: $uni-spacing-row-sm;
		}

		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
		}

		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}
	}

	.region {
		font-size: $font-base;
		display: flex;
		align-items: center;
	}

	.add-btn {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: $font-base;
		color: #fff;
		background-color: $btn-color-light;
		border-radius: 10upx;
		margin: 0 10rpx;

		&.jglogin {
			flex: none;
		}

		&.code {
			flex: none;
		}

		&.disabled {
			background-color: $font-color-disabled;
		}
	}

	.mix-list-cell-buttons {
		padding: 40upx 100upx;
		display: flex;
	}

	.bottom {
		font-size: $font-sm;
		text-align: center;
		position: absolute;
		bottom: 80upx;
		width: 100%;
	}

	.link {
		color: $base-color;
	}

	.line {
		position: relative;

		.text {
			position: absolute;
			left: 50%;
			margin-left: -50upx;
			background: #ffffff;
			top: -20upx;
			z-index: 90;
			padding: 0 20upx;
		}
	}

	.center {
		text-align: center;
		padding: 50rpx 0;
	}
</style>
