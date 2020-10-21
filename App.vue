<script>
	//#ifdef APP-PLUS
	//极光登录插件,提前预取号，提高登录速度
	const jv = uni.requireNativePlugin('JG-JVerification');
	//#endif
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapState,
		mapMutations
	} from 'vuex';
	import Vue from 'vue';
	import {
		client,
		auth
	} from '@/common/cloud.js';
	import {
		checkAppUpdate,
		cloudUser
	} from '@/common/functions.js';
	import {
		micLogin
	} from '@/common/request.js';

	const pushClientInfoKey = 'pushClientInfo';
	const userInfoKey = 'userInfo';
	let isCheckLogin=false;
	export default {
		computed: {
			...mapState(['inviteCode'])
		},
		methods: {
			...mapMutations(['login','checkStoreLogin', 'setUserLocation', 'setAdminShop', 'setStateAttr','updatePush']),
			/**
			 * 存储设备信息 参考colorUI
			 * @param {Object} 
			 */
			initSize(e) {
				const systemInfo = e;
				let navigationBarHeight;
				let custom = {};
				// #ifndef MP
				custom = {
					height: 36,
					width: 88
				};
				navigationBarHeight = 44;
				// #endif
				// #ifdef MP-WEIXIN
				custom = wx.getMenuButtonBoundingClientRect();
				navigationBarHeight = custom.bottom + custom.top - e.statusBarHeight * 2;
				// #endif	
				// #ifdef MP-TOUTIAO
				custom = tt.getMenuButtonBoundingClientRect();
				navigationBarHeight = custom.bottom + custom.top - e.statusBarHeight * 2;
				// #endif	
				systemInfo.custom = custom;
				systemInfo.navigationBarHeight = navigationBarHeight;
				console.log(systemInfo);
				Vue.prototype.systemInfo = systemInfo;
			},
			/**
			 * 初始化极光一键登录
			 */
			async initLogin() {
				if (!jv) {
					console.log('不支持jv');
					return;
				}
				jv.init({
						timeout: 7000,
						isProduction: true
					},
					result => {
						console.log('jv.init', result);
					}
				);
				jv.isInitSuccess(result => {
					console.log('jv.isInitSuccess', result);
					this.setStateAttr({
						jgLoginInit:result["enable"]
					})
				});
				jv.checkVerifyEnable(result => {
					console.log('jv.checkVerifyEnable', result);
				});
				//预取号
				jv.preLogin(7000, result => {
					console.log('jv.preLogin', result);
				});
			},
			/**
			 * 初始化push相关
			 */
			async initPush() {
				console.log('初始化push message');
				plus.push.addEventListener('receive', msg => {
					console.log('receive push message', msg);
					let data = JSON.parse(msg.payload);
					console.log('receive push message', data);
				});
				plus.push.addEventListener('click', msg => {
					console.log('click push message', msg);
				});
				plus.push.getClientInfoAsync(
					info => {
						console.log('push.getClientInfoAsync', info);
						//提交到服务器保存，第一步存到本地缓存
						uni.setStorage({
							key: pushClientInfoKey,
							data: info
						});
						this.updatePush(info)
					},
					err => {
						console.log('push.getClientInfoAsync', err);
					}
				);
			},
			//初始化店铺管理id
			async loadAdminShopId() {
				console.log("loadAdminShopId")
				uni.getStorage({
					key: 'adminShopId',
					success: info => {
						if (info.data && info.data > 0) {
							this.setAdminShop(info.data);
						}
					}
				});
			},
			//小程序如果用户曾经
			async micLogin() {
				console.log("小程序用户自动登录开始")
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						console.log(res)
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
									this.login(res);
								},err=>{
									console.log("小程序自动登录失败！")
								});
							}
						});
					}
				});
			},
			checkLogin() {
				console.log("checkLogin");
				//设置登录状态
				let token = uni.getStorageSync("uni_id_token");
				let tokenExpired = uni.getStorageSync("uni_id_token_expires");
				console.log(token,tokenExpired)
				if (token && tokenExpired > new Date().getTime() + 24 * 3600 * 1000) {
					//本地已经登录过，不再调用登录接口，有效期至少保证有1天时间
					this.checkStoreLogin({
						"token": token,
						"tokenExpired": tokenExpired
					});
				} else {
					//#ifdef MP
					this.micLogin();
					//#endif
				}
				setTimeout(()=>{
					isCheckLogin = true;
				},100)
			}
		},
		onLaunch: function() {
			console.log('App.vue 启动');

			let info = uni.getSystemInfoSync();
			this.initSize(info);
			//#ifdef APP-PLUS
			//检查应用更新，每日一次
			checkAppUpdate(false, this.systemInfo);
			//#endif
			this.loadAdminShopId();
			let userLocationInfo = uni.getStorageSync('userLocationInfo') || {};
			if (userLocationInfo.latitude > 0) {
				this.setUserLocation(userLocationInfo);
			}
			this.checkLogin();
			//#ifdef APP-PLUS
			//初始化极光一键登录
			this.initLogin();
			//初始化推送
			this.initPush();
			//#endif
		},
		onShow: function() {
			console.log('App Show');
			//#ifdef MP
			if(isCheckLogin){
				this.checkLogin();
			}
			//#endif
		},
		onHide: function() {
			console.log('App Hide');
			//#ifdef MP
			isCheckLogin = true;
			//#endif
		}
	};
</script>

<style lang="scss">
	@import url("./common/css/icon.css");

	view,
	scroll-view,
	swiper,
	swiper-item,
	cover-view,
	cover-image,
	icon,
	text,
	rich-text,
	progress,
	button,
	checkbox,
	form,
	input,
	label,
	radio,
	slider,
	switch,
	textarea,
	navigator,
	audio,
	camera,
	image,
	video {
		box-sizing: border-box;
	}

	/* 骨架屏替代方案 */
	.Skeleton {
		background: #f3f3f3;
		padding: 20upx 0;
		border-radius: 8upx;
	}

	.image-content {
		position: relative;

		image {
			position: relative;
			z-index: 1;
		}

		&:after {
			content: '';
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			background-image: url('/static/loadingbg.jpg');
			background-size: 100% 100%;
			opacity: 0.3;
		}
	}

	/* 图片载入替代方案 */
	.image-wrapper {
		font-size: 0;
		background: #f3f3f3;
		border-radius: 4px;

		image {
			width: 100%;
			height: 100%;
			transition: 0.6s;
			opacity: 0;

			&.loaded {
				opacity: 1;
			}
		}
	}

	.lazyload {
		position: relative;

		&.lazypic {
			&:after {
				content: '';
				position: absolute;
				left: 0;
				top: 0;
				width: 100%;
				height: 100%;
				background-image: url('/static/loadingbg.jpg');
				background-size: 100% 100%;
				opacity: 0.3;
			}
		}

		image {
			position: relative;
			z-index: 1;
			opacity: 0;
		}

		&.loaded image {
			transition: .7s;
			opacity: 1 !important;
		}
	}

	.clamp {
		/* #ifdef APP-PLUS-NVUE */
		lines: 1;
		/* #endif */
		/* #ifndef APP-PLUS-NVUE */
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		display: block;
		/* #endif */
	}

	.clamp2 {
		/* #ifdef APP-PLUS-NVUE */
		lines: 2;
		/* #endif */
		/* #ifndef APP-PLUS-NVUE */
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
		/* #endif */
	}

	/* 布局 */
	.row {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		align-items: center;
	}

	.column {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		flex-direction: column;
	}

	.center {
		/* #ifndef APP-PLUS-NVUE */
		display: flex;
		/* #endif */
		align-items: center;
		justify-content: center;
	}

	.fill {
		flex: 1;
	}

	/* input */
	.placeholder {
		color: #999 !important;
	}

	.common-hover {
		background: #f5f5f5;
	}

	/*边框*/
	.b-b:after,
	.b-t:after {
		position: absolute;
		z-index: 3;
		left: 0;
		right: 0;
		height: 0;
		content: '';
		transform: scaleY(0.5);
		border-bottom: 1px solid $border-color-base;
	}

	.b-b:after {
		bottom: 0;
	}

	.b-t:after {
		top: 0;
	}

	/* button样式改写 */
	uni-button,
	button {
		height: 70upx;
		line-height: 70upx;
		font-size: $font-lg + 2upx;
		font-weight: normal;

		&.no-border:before,
		&.no-border:after {
			border: 0;
		}
	}

	uni-button[type='default'],
	button[type='default'] {
		color: $font-color-dark;
	}

	/* input 样式 */
	.input-placeholder {
		color: #999999;
	}

	.placeholder {
		color: #999999;
	}

	.tags {
		margin-top: 6upx;
	}

	/* 标签 */
	.tag {
		font-size: $font-ssm;
		color: $base-color;
		margin-right: 10upx;
		border: 1px solid $base-color;
		border-radius: 4upx;
		padding: 2upx 6upx;
		line-height: 1;
		display: inline-block;

		&.info {}

		&.warning {
			color: $font-color-warning;
			border-color: $font-color-warning;
		}
	}

	/* 价格 */
	.price {
		color: $base-color;
		font-size: $font-base;
		margin-right: 12upx;

		&:before {
			content: '￥';
			font-size: 0.85em;
		}

		&.del {
			font-size: $font-sm;
			color: $font-color-light;
			text-decoration: line-through;

			&:before {
				font-size: $font-ssm;
			}
		}

		&.emphasis {
			font-size: $font-sm;
			color: $font-color-warning;
		}

		&.warning {
			color: $font-color-warning;
		}
	}
</style>
