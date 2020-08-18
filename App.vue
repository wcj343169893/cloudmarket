<script>
	//#ifdef APP-PLUS
	//极光登录插件,提前预取号，提高登录速度
	const jv = uni.requireNativePlugin('JG-JVerification');
	//#endif
	/**
	 * vuex管理登陆状态，具体可以参考官方登陆模板示例
	 */
	import {
		mapMutations
	} from 'vuex';
	import Vue from 'vue';
	import {
		client,
		auth
	} from '@/common/cloud.js';
	import {
		checkAppUpdate
	} from '@/common/functions.js';
	import {
		micLogin
	} from '@/common/request.js';

	const pushClientInfoKey = 'pushClientInfo';
	const userInfoKey = 'userInfo';
	export default {
		methods: {
			...mapMutations(['login', 'setUserLocation', 'setAdminShop', 'setStateAttr']),
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
				systemInfo.custom = custom;
				systemInfo.navigationBarHeight = navigationBarHeight;
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
					},
					err => {
						console.log('push.getClientInfoAsync', err);
					}
				);
			},
			//初始化店铺管理id
			async loadAdminShopId() {
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
				uni.getProvider({
					service: 'oauth',
					success: (res) => {
						let provider = res.provider[0];
						uni.login({
							provider: provider,
							success: (loginRes) => {
								console.log('loginRes', loginRes);
								//小程序自动登录
								micLogin({
									code: loginRes.code
								}, provider).then(res => {
									//写入缓存
									/*
									uni.setStorage({
										key: 'userOpenId',
										data: res.openid
									}); */
									console.log("login success", res);
									this.login(res);
								});
							}
						});
					}
				});
			}
		},
		onLaunch: function() {
			console.log('App.vue 启动');
			//#ifdef MP
			this.micLogin();
			//#endif

			uni.getSystemInfo({
				success: e => {
					this.initSize(e);
				}
			})

			this.loadAdminShopId();
			let userLocationInfo = uni.getStorageSync('userLocationInfo') || {};
			if (userLocationInfo.latitude > 0) {
				this.setUserLocation(userLocationInfo);
			}
			//设置登录状态
			let token = uni.getStorageSync("uni_id_token");
			let tokenExpired = uni.getStorageSync("uni_id_token_expires");
			if (token && tokenExpired > new Date().getTime()) {
				this.login({
					"token": token,
					"tokenExpired": tokenExpired
				});
			}
			//#ifdef APP-PLUS
			//初始化极光一键登录
			this.initLogin();
			//初始化推送
			this.initPush();
			//检查应用更新，每日一次
			checkAppUpdate();
			//#endif
		},
		onShow: function() {
			console.log('App Show');
		},
		onHide: function() {
			console.log('App Hide');
		}
	};
</script>

<style lang="scss">
	/*
		全局公共样式和字体图标
	*/
	@font-face {
		font-family: yticon;
		font-weight: normal;
		font-style: normal;
		src: url('/static/yticon2.ttf') format('truetype');
	}

	/* #ifndef APP-PLUS-NVUE */

	.yticon {
		font-family: 'yticon' !important;
		font-size: $font-lg;
		font-style: normal;
		-webkit-font-smoothing: antialiased;
		-moz-osx-font-smoothing: grayscale;
		transition: 0.4s;
	}

	.yticon.checked {
		color: $base-color;
	}

	.icon-yiguoqi1:before {
		content: '\e700';
	}

	.icon-iconfontshanchu1:before {
		content: '\e619';
	}

	.icon-iconfontweixin:before {
		content: '\e611';
	}

	.icon-alipay:before {
		content: '\e636';
	}

	.icon-shang:before {
		content: '\e624';
	}

	.icon-shouye:before {
		content: '\e626';
	}

	.icon-shanchu4:before {
		content: '\e622';
	}

	.icon-xiaoxi:before {
		content: '\e618';
	}

	.icon-jiantour-copy:before {
		content: '\e600';
	}

	.icon-fenxiang2:before {
		content: '\e61e';
	}

	.icon-pingjia:before {
		content: '\e67b';
	}

	.icon-daifukuan:before {
		content: '\e68f';
	}

	.icon-pinglun-copy:before {
		content: '\e612';
	}

	.icon-dianhua-copy:before {
		content: '\e621';
	}

	.icon-shoucang:before {
		content: '\e645';
	}

	.icon-xuanzhong2 {
		color: $font-color-disabled;
	}

	.icon-xuanzhong2:before {
		content: '\e62f';
	}

	.icon-gouwuche_:before {
		content: '\e630';
	}

	.icon-icon-test:before {
		content: '\e60c';
	}

	.icon-icon-test1:before {
		content: '\e632';
	}

	.icon-bianji:before {
		content: '\e646';
	}

	.icon-jiazailoading-A:before {
		content: '\e8fc';
	}

	.icon-zuoshang:before {
		content: '\e613';
	}

	.icon-jia2:before {
		content: '\e60a';
	}

	.icon-huifu:before {
		content: '\e68b';
	}

	.icon-sousuo:before {
		content: '\e7ce';
	}

	.icon-arrow-fine-up:before {
		content: '\e601';
	}

	.icon-hot:before {
		content: '\e60e';
	}

	.icon-lishijilu:before {
		content: '\e6b9';
	}

	.icon-zhengxinchaxun-zhifubaoceping-:before {
		content: '\e616';
	}

	.icon-naozhong:before {
		content: '\e64a';
	}

	.icon-xiatubiao--copy:before {
		content: '\e608';
	}

	.icon-shoucang_xuanzhongzhuangtai:before {
		content: '\e6a9';
	}

	.icon-jia1:before {
		content: '\e61c';
	}

	.icon-bangzhu1:before {
		content: '\e63d';
	}

	.icon-arrow-left-bottom:before {
		content: '\e602';
	}

	.icon-arrow-right-bottom:before {
		content: '\e603';
	}

	.icon-arrow-left-top:before {
		content: '\e604';
	}

	.icon-icon--:before {
		content: '\e744';
	}

	.icon-zuojiantou-up:before {
		content: '\e605';
	}

	.icon-xia:before {
		content: '\e62d';
	}

	.icon--jianhao:before {
		content: '\e60b';
	}

	.icon-weixinzhifu:before {
		content: '\e61a';
	}

	.icon-wxpay:before {
		content: '\e61a';
	}

	.icon-comment:before {
		content: '\e64f';
	}

	.icon-weixin:before {
		content: '\e61f';
	}

	.icon-fenlei1:before {
		content: '\e620';
	}

	.icon-erjiye-yucunkuan:before {
		content: '\e623';
	}

	.icon-balance:before {
		content: '\e623';
	}

	.icon-Group-:before {
		content: '\e688';
	}

	.icon-you:before {
		content: '\e606';
	}

	.icon-forward:before {
		content: '\e607';
	}

	.icon-tuijian:before {
		content: '\e610';
	}

	.icon-bangzhu:before {
		content: '\e679';
	}

	.icon-share:before {
		content: '\e656';
	}

	.icon-yiguoqi:before {
		content: '\e997';
	}

	.icon-shezhi1:before {
		content: '\e61d';
	}

	.icon-fork:before {
		content: '\e61b';
	}

	.icon-kafei:before {
		content: '\e66a';
	}

	.icon-iLinkapp-:before {
		content: '\e654';
	}

	.icon-saomiao:before {
		content: '\e60d';
	}

	.icon-shezhi:before {
		content: '\e60f';
	}

	.icon-shouhoutuikuan:before {
		content: '\e631';
	}

	.icon-gouwuche:before {
		content: '\e609';
	}

	.icon-dizhi:before {
		content: '\e614';
	}

	.icon-fenlei:before {
		content: '\e706';
	}

	.icon-xingxing:before {
		content: '\e70b';
	}

	.icon-tuandui:before {
		content: '\e633';
	}

	.icon-zuanshi:before {
		content: '\e615';
	}

	.icon-zuo:before {
		content: '\e63c';
	}

	.icon-shoucang2:before {
		content: '\e62e';
	}

	.icon-shouhuodizhi:before {
		content: '\e712';
	}

	.icon-yishouhuo:before {
		content: '\e71a';
	}

	.icon-dianzan-ash:before {
		content: '\e617';
	}

	.icon-right::before {
		content: '\e801';
	}

	.icon-money::before {
		content: '\e802';
	}

	.icon-chps::before {
		content: '\e803';
	}

	.icon-dingwei::before {
		content: '\e804';
	}

	.icon-dunpai::before {
		content: '\e805';
	}

	.icon-piliang::before {
		content: '\e806';
	}

	.icon-piliang-zhuanfa::before {
		content: '\e807';
	}

	.icon-dingdan::before {
		content: '\e808';
	}

	.icon-history::before {
		content: '\e809';
	}

	.icon-setting::before {
		content: '\e810';
	}

	.icon-shangpin::before {
		content: '\e811';
	}

	.icon-shangpin2::before {
		content: '\e812';
	}

	.icon-tongji::before {
		content: '\e813';
	}

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
		height: 80upx;
		line-height: 80upx;
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

	/* #endif*/
</style>
