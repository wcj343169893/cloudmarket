<template>
	<view class="container"></view>
</template>

<script>
//#ifdef APP-PLUS
const shanYanSDKModule = uni.requireNativePlugin('CLSDK-ShanYanSDKModule'); //调用
//#endif
import { mobileAutoLogin } from '@/common/request.js';
import { mapMutations } from 'vuex';

export default {
	data() {
		return {
			platform: '',
			loadingText: '安全检测中',
			loginErrorText:"登录失败!请打开4G网络后再尝试!",
			ios_uiConfigure: {},
			logining: false
		};
	},
	onLoad() {
		this.platform = uni.getSystemInfoSync().platform;
		//在应用初始化调用
		//#ifdef APP-PLUS
		this.initLogin();
		//#endif
		
		//#ifdef H5
		this.toLogin();
		//#endif
		//this.getPhoneInfo();
	},
	methods: {
		...mapMutations(['login']),
		async initLogin() {
			uni.showLoading({
				mask: true,
				title: this.loadingText
			});
			/* uni.getNetworkType({
			    success: function (res) {
			        console.log(res.networkType);
			    }
			});
			uni.onNetworkStatusChange(function (res) {
			    console.log(res.isConnected);
			    console.log(res.networkType);
			}); */
			//初始化自动登录
			let appid;
			let appkey;
			if (this.platform == 'android') {
				appid = '5AvWkYQj';
				appkey = 'MxqI3HJV';
			} else if (this.platform == 'ios') {
				appid = 'eWWfA2KJ';
				appkey = 'tDo3Ml2K';
				this.toLogin();
				return;
			}
			console.log('初始化自动登录', appid);
			shanYanSDKModule.init(
				{
					appid: appid
				},
				result => {
					//初始化回调
					console.log('初始化', result);
					if (result.code == 1022) {
						setTimeout(() => {
							this.setAuthCJSThemeConfig();
							this.getPhoneInfo();
						}, 3000);
					}
				}
			);
		},
		async getPhoneInfo() {
			//实际预取号建议提前调用，如将要调起授权页的前置页面的onLoad中、个人中心页面的onLoad等可预期会触发一键登录的时机
			if (this.platform == 'android') {
				//闪验SDK 预取号
				shanYanSDKModule.getPhoneInfo(result => {
					console.log('getPhoneInfo', result);
					if (result.code == 1022) {
						this.qulickLogin();
					} else {
						uni.hideLoading();
						//this.$api.msg(result.result);
						//this.$api.msg(this.loginErrorText);
						//this.navTimeBack();
						uni.showModal({
							title: "登录提示",
							content:this.loginErrorText,
							cancelText:"取消",
							confirmText:"重试",
							success: (res) => {
								if (res.confirm) {
									this.getPhoneInfo();
								}else{
									this.navBack();
								}
							}
						})
					}
				});
			} else if (this.platform == 'ios') {
				//闪验SDK 预取号
				shanYanSDKModule.preGetPhonenumber(complete => {
					console.log('getPhoneInfo', result);
					if (result.code == 1022) {
						this.qulickLogin();
					} else {
						uni.hideLoading();
						this.$api.msg(this.loginErrorText);
						this.navTimeBack();
					}
				});
			}
		},
		qulickLogin() {
			setTimeout(function() {
				uni.hideLoading();
			}, 5000);
			if (this.platform == 'android') {
				/*************************Android*************************/
				//闪验SDK  拉起授权页方法
				shanYanSDKModule.openLoginAuth(
					true,
					result => {
						uni.hideLoading();
						console.log('授权页面打开结果：', result);
					},
					result => {
						console.log('授权返回结果：', result);
						if (result.code == 1000) {
							//同意授权
							let res = JSON.parse(result.result);
							console.log(res.token);
							this.loginWithToken(res.token);
							//"{"token":"A3-v7l3nambShQoBlgZKkaNX5qcE01lV3SENSERL4bOv0ZkVs6dc-7mIACAraAog2X-3qqtQISP1cBdba9v-ty1Nf6MuzbfI7H0iIF-iBWRGHx3oKtvHrTeNogO8BabqCg7Z7PIN8TxOiYFDCtENzAKBeOrfTOdlb-1pzzp9dVyBgFmkC1rwFzBD2gz_uzwBHN3hHUg-PvM5NRWWMMloTT_2A"}"
						} else {
							this.navBack();
						}
					}
				);
			} else if (this.platform == 'ios') {
				/*************************iOS*************************/
				//闪验SDK  拉起授权页方法
				//一键登录
				shanYanSDKModule.quickAuthLoginWithConfigure(
					this.ios_uiConfigure,
					openLoginAuthListenerResult => {
						//拉起授权页面回调
						uni.hideLoading();

						//debug_test
						uni.showToast({
							icon: 'none',
							title: JSON.stringify(openLoginAuthListenerResult),
							duration: 3000
						});

						this.shanyan_code = JSON.stringify(openLoginAuthListenerResult.code);
						this.shanyan_result = JSON.stringify(openLoginAuthListenerResult);
						console.log(JSON.stringify(openLoginAuthListenerResult));
					},
					oneKeyLoginListenerResult => {
						uni.hideLoading();
						//点一键登录回调
						if (oneKeyLoginListenerResult.errorCode != null) {
							if (oneKeyLoginListenerResult.code == 1011) {
								//提示：错误无需提示给用户，可以在用户无感知的状态下直接切换登录方式
								//用户取消登录（点返回）
								//处理建议：如无特殊需求可不做处理，仅作为交互状态回调，此时已经回到当前用户自己的页面
								//点击sdk自带的返回，无论是否设置手动销毁，授权页面都会强制关闭
							} else {
								//处理建议：其他错误代码表示闪验通道无法继续，可以统一走开发者自己的其他登录方式，也可以对不同的错误单独处理
								//关闭授权页
								shanYanSDKModule.finishAuthControllerCompletion(oneKeyLoginListenerResult => {});
							}
						} else {
							//SDK获取Token成功

							//此处根据token调用户后台接口获取手机号，获取成功或失败后再调shanYanSDKModule.finishAuthControllerCompletion()关闭页面
							// //关闭授权页
							shanYanSDKModule.finishAuthControllerCompletion(oneKeyLoginListenerResult => {
								//如需跳转，code here:
							});

							//debug_test
							uni.showToast({
								icon: 'none',
								title: JSON.stringify(oneKeyLoginListenerResult),
								duration: 3000
							});
						}

						this.shanyan_code = JSON.stringify(oneKeyLoginListenerResult.code);
						this.shanyan_result = JSON.stringify(oneKeyLoginListenerResult);
						console.log(JSON.stringify(oneKeyLoginListenerResult));
					}
				);
			}
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
		},
		setAuthCJSThemeConfig() {
			let platform = uni.getSystemInfoSync().platform;
			if (platform == 'android') {
				//Android 全屏模式

				//闪验SDK  配置授权页方法
				shanYanSDKModule.setAuthThemeConfig(
					{
						//授权页已有元素配置
						uiConfig: {
							setAuthBGImgPath: 'static/eb9a0dae18491990a43fe02832d3cafa.jpg',
							setNavColor: '#ff0000',
							setLogoImgPath: 'static/logo_shanyan_text.png',
						}
					},
					result => {
						console.log(JSON.stringify(result));
					}
				);
			} else if (platform == 'ios') {
				//iOS 全屏模式

				let screenWidth_Portrait = plus.screen.resolutionWidth; //竖屏宽

				var screenScale = screenWidth_Portrait / 375.0; //相对iphone6屏幕
				if (screenScale > 1) {
					screenScale = 1; //大屏的无需放大
				}

				//竖屏
				let clLayoutLogoTop_Portrait = screenScale * 60;
				let clLayoutLogoWidth_Portrait = 60 * screenScale;
				let clLayoutLogoHeight_Portrait = 60 * screenScale;
				let clLayoutLogoCenterX_Portrait = 0;

				let clLayoutPhoneCenterY_Portrait = -20 * screenScale;
				let clLayoutPhoneLeft_Portrait = 50 * screenScale;
				let clLayoutPhoneRight_Portrait = -50 * screenScale;
				let clLayoutPhoneHeight_Portrait = 20 * screenScale;

				let clLayoutLoginBtnCenterY_Portrait = clLayoutPhoneCenterY_Portrait + clLayoutPhoneHeight_Portrait * 0.5 * screenScale + 20 * screenScale + 15 * screenScale;
				let clLayoutLoginBtnHeight_Portrait = 30 * screenScale;
				let clLayoutLoginBtnLeft_Portrait = 70 * screenScale;
				let clLayoutLoginBtnRight_Portrait = -70 * screenScale;

				let clLayoutAppPrivacyLeft_Portrait = 40 * screenScale;
				let clLayoutAppPrivacyRight_Portrait = -40 * screenScale;
				let clLayoutAppPrivacyBottom_Portrait = 0 * screenScale;
				let clLayoutAppPrivacyHeight_Portrait = 45 * screenScale;

				let clLayoutSloganLeft_Portrait = 0;
				let clLayoutSloganRight_Portrait = 0;
				let clLayoutSloganHeight_Portrait = 15 * screenScale;
				let clLayoutSloganBottom_Portrait = clLayoutAppPrivacyBottom_Portrait - clLayoutAppPrivacyHeight_Portrait;

				//横屏 （如app本身不支持横屏，可不需设置横屏下UI配置）

				let clLayoutLogoWidth_Landscape = 60 * screenScale;
				let clLayoutLogoHeight_Landscape = 60 * screenScale;
				let clLayoutLogoCenterX_Landscape = 0;
				let clLayoutLogoTop_Landscape = 25 * screenScale;

				let clLayoutPhoneCenterY_Landscape = -20 * screenScale;
				let clLayoutPhoneLeft_Landscape = 50 * screenScale;
				let clLayoutPhoneRight_Landscape = -50 * screenScale;
				let clLayoutPhoneHeight_Landscape = 20 * screenScale;

				let clLayoutLoginBtnCenterY_Landscape = clLayoutPhoneCenterY_Landscape + clLayoutPhoneHeight_Landscape * 0.5 * screenScale + 20 * screenScale + 15 * screenScale;
				let clLayoutLoginBtnHeight_Landscape = 30 * screenScale;
				let clLayoutLoginBtnLeft_Landscape = 70 * screenScale;
				let clLayoutLoginBtnRight_Landscape = -70 * screenScale;

				let clLayoutAppPrivacyLeft_Landscape = 40 * screenScale;
				let clLayoutAppPrivacyRight_Landscape = -40 * screenScale;
				let clLayoutAppPrivacyBottom_Landscape = 0 * screenScale;
				let clLayoutAppPrivacyHeight_Landscape = 45 * screenScale;

				let clLayoutSloganLeft_Landscape = 0;
				let clLayoutSloganRight_Landscape = 0;
				let clLayoutSloganHeight_Landscape = 15 * screenScale;
				let clLayoutSloganBottom_Landscape = clLayoutAppPrivacyBottom_Landscape - clLayoutAppPrivacyHeight_Landscape;

				this.ios_uiConfigure = {
					clBackgroundImg: 'static/img/eb9a0dae18491990a43fe02832d3cafa.jpg',

					shouldAutorotate: true,
					/**支持方向
					 * 如支持横竖屏，需同时设置 clOrientationLayOutPortrait 和 clOrientationLayOutLandscape
					 * 0:UIInterfaceOrientationMaskPortrait
					 * 1:UIInterfaceOrientationMaskLandscapeLeft
					 * 2:UIInterfaceOrientationMaskLandscapeRight
					 * 3:UIInterfaceOrientationMaskPortraitUpsideDown
					 * 4:UIInterfaceOrientationMaskLandscape
					 * 5:UIInterfaceOrientationMaskAll
					 * 6:UIInterfaceOrientationMaskAllButUpsideDown
					 * */
					supportedInterfaceOrientations: 5,

					/**偏好方向
					 * -1:UIInterfaceOrientationUnknown
					 * 0:UIInterfaceOrientationPortrait
					 * 1:UIInterfaceOrientationPortraitUpsideDown
					 * 2:UIInterfaceOrientationLandscapeLeft
					 * 3:UIInterfaceOrientationLandscapeRight
					 * */
					//偏好方向默认Portrait preferredInterfaceOrientationForPresentation: Number(5),

					clNavigationBackgroundClear: true, //导航栏透明
					clNavigationBackBtnImage: 'static/img/close-white.png', //返回按钮图片
					clNavBackBtnAlimentRight: false, //返回按钮居右,设置自定义导航栏返回按钮时，以自定义为准

					clLogoImage: 'static/img/logo_shanyan_text.png', //logo图片

					clLoginBtnText: '本机号一键登录', //一键登录按钮文字
					clLoginBtnTextColor: [1, 1, 1, 1.0], //rgba
					clLoginBtnBgColor: [0.2, 0.8, 0.2, 1.0], //rgba
					clLoginBtnTextFont: 15 * screenScale,
					clLoginBtnCornerRadius: 10,
					clLoginBtnBorderWidth: 0.5,
					clLoginBtnBorderColor: [0.1, 0.8, 0.1, 1.0], //rgba

					clPhoneNumberFont: 20.0 * screenScale,

					clAppPrivacyColor: [[0.6, 0.6, 0.6, 1.0], [0, 1, 0, 1.0]], //2 item,commomTextColor and appPrivacyTextColor
					clAppPrivacyTextFont: 11 * screenScale,
					clAppPrivacyTextAlignment: 0, //0: center 1: left 2: right
					clAppPrivacyFirst: ['测试连接A', 'https://www.baidu.com'], // 2 item, name and url
					clAppPrivacySecond: ['测试连接B', 'https://www.sina.com'], // 2 item, name and url

					clCheckBoxVerticalAlignmentToAppPrivacyCenterY: true,
					clCheckBoxSize: [30 * screenScale, 30 * screenScale], //2 item, width and height
					clCheckBoxImageEdgeInsets: [2 * screenScale, 10 * screenScale, 13 * screenScale, 5 * screenScale], //4 item, top left bottom right
					clCheckBoxUncheckedImage: 'static/img/checkBoxNor.png',
					clCheckBoxCheckedImage: 'static/img/checkBoxSEL.png',

					clLoadingSize: [50, 50], //2 item, width and height
					clLoadingTintColor: [0.2, 0.8, 0.2, 1],
					clLoadingBackgroundColor: [1, 1, 1, 1],
					clLoadingCornerRadius: 5,

					//竖屏布局对象
					clOrientationLayOutPortrait: {
						//控件
						clLayoutLogoWidth: clLayoutLogoWidth_Portrait,
						clLayoutLogoHeight: clLayoutLogoHeight_Portrait,
						clLayoutLogoCenterX: clLayoutLogoCenterX_Portrait,
						clLayoutLogoTop: clLayoutLogoTop_Portrait,

						clLayoutPhoneCenterY: clLayoutPhoneCenterY_Portrait,
						clLayoutPhoneHeight: clLayoutPhoneHeight_Portrait,
						clLayoutPhoneLeft: clLayoutPhoneLeft_Portrait,
						clLayoutPhoneRight: clLayoutPhoneRight_Portrait,

						clLayoutLoginBtnCenterY: clLayoutLoginBtnCenterY_Portrait,
						clLayoutLoginBtnHeight: clLayoutLoginBtnHeight_Portrait,
						clLayoutLoginBtnLeft: clLayoutLoginBtnLeft_Portrait,
						clLayoutLoginBtnRight: clLayoutLoginBtnRight_Portrait,

						clLayoutAppPrivacyLeft: clLayoutAppPrivacyLeft_Portrait,
						clLayoutAppPrivacyRight: clLayoutAppPrivacyRight_Portrait,
						clLayoutAppPrivacyBottom: clLayoutAppPrivacyBottom_Portrait,
						clLayoutAppPrivacyHeight: clLayoutAppPrivacyHeight_Portrait,

						clLayoutSloganLeft: clLayoutSloganLeft_Portrait,
						clLayoutSloganRight: clLayoutSloganRight_Portrait,
						clLayoutSloganHeight: clLayoutSloganHeight_Portrait,
						clLayoutSloganBottom: clLayoutSloganBottom_Portrait
					}
				};

				//设置自定义控件点击回调
				shanYanSDKModule.setCustomInterface(customInterface => {
					this.shanyan_result = JSON.stringify(customInterface);
					console.log(JSON.stringify(customInterface));
				});

				this.shanyan_code = 1000;
				this.shanyan_result = '授权页配置完成';
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
