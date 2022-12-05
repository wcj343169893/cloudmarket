<template>
	<view class="container">
		<!-- #ifdef MP -->
		<page-header ref="pageHeader" :title="name"></page-header>
		<!-- #endif -->
		<view class="basic-section">
			<image class="bg" :src="banner"></image>
			<view class="user-info-box" @click="navToSet">
				<view class="portrait-box">
					<image class="portrait" :src="src"></image>
				</view>
				<view class="info-box">
					<text class="username">{{ name }}({{ id }})</text>
					<view class="desc">
						<view class="">
							<text>{{ address }}</text>
						</view>
					</view>
				</view>
			</view>
		</view>
		<view class="cover-container">
			<view class="fast-section m-t">
				<view class="fast-actions" @click="btnZitiScan()">
					<text class="yticon icon-saomiao"></text>
					<text class="">扫码验证</text>
				</view>
				<view class="fast-actions" @click="btnZiti()">
					<text class="yticon icon-bianji"></text>
					<text class="">输码验证</text>
				</view>
				<view class="fast-actions" @click="navTo('/pages/admin/selfrasingPoint/selfrasingPoint')">
					<text class="yticon icon-shangpin"></text>
					<text class="">自提点</text>
				</view>
				<view class="fast-actions" @click="navTo('/pages/admin/statistics/datas')">
					<text class="yticon icon-tongji"></text>
					<text class="">经营数据</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-dingdan" iconColor="#54b4ef" title="订单管理" @eventClick="navToOrder('all')" tips="全部">
		</mix-list-cell>
		<view class="cover-container">
			<!-- 订单信息统计 -->
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in orderTypes" :key="index"
					@click="navToOrder(item.state)" hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-shangpin" iconColor="#54b4ef" title="商品管理" @eventClick="navToAddGoods()" tips="新增">
		</mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in goodsTypes" :key="index"
					@click="navToGoods(item.state)" hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
				<view class="order-item" @click="btnEditGoodsScan" hover-class="common-hover" :hover-stay-time="50">
					<text class="yticon icon-saomiao"></text>
					<text>扫条码</text>
				</view>
			</view>
		</view>
		<!-- 		<mix-list-cell icon="icon-tuandui" iconColor="#54b4ef" title="用户管理" @eventClick="navToUsers('all','charge')" tips="账户充值"></mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in userTypes" :key="index" hover-class="common-hover" @click="navToUsers(item.state)"
				 :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view> -->
		<mix-list-cell icon="icon-tuijian" iconColor="#54b4ef" title="视频管理"
			@eventClick="navToItem('/pages/admin/video/add')" tips="添加视频"></mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in videoTypes" :key="index" hover-class="common-hover"
					@click="navTo('/pages/admin/video/list?state='+item.state)" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-fenlei1" iconColor="#54b4ef" title="分类管理"
			@eventClick="navTo('/pages/admin/goods/category')" tips="商品分类"></mix-list-cell>
		<mix-list-cell icon="taobaofont icon-activity" iconColor="#54b4ef" title="营销活动"
			@eventClick="navTo('/pages/admin/activities/list')" tips="秒杀/优惠券"></mix-list-cell>
		<mix-list-cell icon="icon-shouye" iconColor="#54b4ef" title="广告管理" @eventClick="navTo('/pages/admin/ad/list')"
			tips="首页滚动广告图"></mix-list-cell>
		<mix-list-cell icon="icon-bianji" iconColor="#54b4ef" title="文档管理" @eventClick="navTo('/pages/admin/docs/list')"
			tips="首页分享/功能说明"></mix-list-cell>
		<mix-list-cell icon="icon-setting" iconColor="#54b4ef" title="店铺设置" @eventClick="navTo('/pages/admin/set/set')"
			tips="基础信息设置"></mix-list-cell>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	import {
		shopAdmin,
		goodsAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				id: 0,
				secondPage: false,
				secondPageState: false,
				isSetTitle: false,
				name: '',
				src: '/static/store-face.png',
				banner: '/static/banner.jpg',
				address: '',
				notice: '',
				coupons: {},
				orderTypes: [],
				goodsTypes: [],
				userTypes: [],
				videoTypes: [],
			};
		},
		onLoad(options) {
			this.id = +options.shopid;
			console.log(this.id, options);
			if (options.second) {
				//进一步跳转到下一页页面
				this.secondPage = options.second;
				this.secondPageState = options.state;
			}
		},
		onShow() {
			this.loadData(false);
		},
		onUnload() {
			this.id = 0;
			uni.removeStorage({
				key: "adminShopInfo"
			});
			uni.removeStorage({
				key: "adminShopId"
			})
		},
		//下拉刷新,不会更新底部附近的店铺
		onPullDownRefresh() {
			console.log('刷新整页');
			uni.stopPullDownRefresh();
			this.loadData(true);
		},
		//#ifdef MP
		onPageScroll(e) {
			this.$refs.pageHeader && this.$refs.pageHeader.pageScroll(e);
		},
		// #endif
		// #ifndef MP
		onNavigationBarButtonTap(e) {
			const index = e.index;
			if (index === 0) {
				this.navToSet();
			}
		},
		// #endif
		methods: {
			...mapMutations(['setAdminShop']),
			async loadData(showLoading) {
				//优先读取缓存
				let info = uni.getStorageSync(`adminShopInfo_${this.id}`);
				if (!info) {
					info = uni.getStorageSync('adminShopInfo');
				}
				if (info) {
					this.buildShopInfo(info);
				}
				shopAdmin('info', {
					adminShopid: this.id
				}, showLoading).then(
					res => {
						uni.setStorage({
							key: `adminShopInfo`,
							data: res
						})
						uni.setStorage({
							key: `adminShopInfo_${this.id}`,
							data: res
						})
						this.buildShopInfo(res);
						if (this.secondPage) {
							//进一步跳转到下一页页面
							this["navTo" + this.secondPage](this.secondPageState);
							this.secondPage = false;
						}
						if (res.domain) {
							uni.setStorage({
								key: "web_domain",
								data: res.domain
							})
						}
					},
					err => {
						//获取店铺信息失败
						console.log('获取店铺信息失败');
					}
				);
			},
			navToSet() {
				this.navTo('/pages/admin/set/set');
			},
			buildShopInfo(data) {
				this.setAdminShop(data);
				if (!this.isSetTitle && data.name) {
					uni.setNavigationBarTitle({
						title: data.name
					});
					this.isSetTitle = true;
				}
				for (let i in data) {
					this[i] = data[i];
				}
			},
			navToOrder(state) {
				console.log(state)
				if (state.indexOf("/") > -1) {
					this.navTo(`/pages/admin/order/${state}`);
				} else if (state == "refunded") {
					this.navTo(`/pages/admin/order/refund/list?state=verifying`);
				} else {
					this.navTo(`/pages/admin/order/list?state=${state}&shopid=${this.id}`);
				}
			},
			navToGoods(state) {
				this.navTo(`/pages/admin/goods/list?state=${state}&shopid=${this.id}`);
			},
			navToUsers(state, type) {
				this.navTo(`/pages/admin/user/list?state=${state}&shopid=${this.id}&type=${type}`);
			},
			//新增商品
			navToAddGoods() {
				uni.navigateTo({
					url: '/pages/admin/goods/add?isnew=true'
				});
			},
			navTo(url) {
				uni.navigateTo({
					url
				});
			},
			//自提输码
			btnZiti() {
				uni.navigateTo({
					url: '/pages/admin/order/numbers'
				});
			},
			//自提扫码
			btnZitiScan() {
				// 只允许通过相机扫码
				uni.scanCode({
					onlyFromCamera: true,
					success: res => {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						if (res.result.indexOf('ziti::') === 0) {
							let code = res.result.substr(6).split('_');
							console.log(code);
							uni.navigateTo({
								url: `/pages/admin/order/detail?password=${code[1]}&number=${code[0]}`
							});
						} else {
							setTimeout(() => {
								this.$api.msg('二维码无法识别');
							}, 100);
						}
					},
					fail: () => {
						console.log('扫码失败');
						setTimeout(() => {
							this.$api.msg('二维码无法识别');
						}, 100);
					}
				});
			},
			btnEditGoodsScan() {
				// 只允许通过相机扫码
				uni.scanCode({
					onlyFromCamera: true,
					success: res => {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						if (res.result && res.result.trim() != "") {
							goodsAdmin("list", {
								page: 1,
								limit: 1,
								upc: res.result
							}, true).then(res => {
								uni.setStorage({
									key: 'adminEditGoods',
									data: res[0],
									success: () => {
										uni.navigateTo({
											url: '/pages/admin/goods/add'
										});
									}
								});
							}, err => {
								console.log("没有商品")
								this.$api.msg('没有商品');
							});
						}
					},
					fail: () => {
						console.log('扫码失败');
						setTimeout(() => {
							this.$api.msg('二维码无法识别');
						}, 100);
					}
				});
			},
			//重新加载数据
			refreshList() {
				this.loadData(false);
			}
		}
	};
</script>

<style lang="scss">
	.container {
		padding-bottom: 40rpx;
	}

	%flex-center {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
	}

	%section {
		display: flex;
		justify-content: space-around;
		align-content: center;
		background: #fff;
		border-radius: 10upx;
	}

	.basic-section {
		padding: 160upx 30upx 20rpx;
		position: relative;

		// padding-top: calc(var(--status-bar-height) + 80upx);
		.bg {
			position: absolute;
			left: 0;
			top: 0;
			width: 100%;
			height: 100%;
			filter: blur(1px);
			opacity: 0.7;
		}
	}

	.user-info-box {
		display: flex;
		position: relative;
		z-index: 1;

		.portrait {
			width: 130upx;
			height: 130upx;
			border: 2upx solid #fff;
			border-radius: 4%;
			margin-right: 20upx;
		}

		.username {
			font-size: $font-lg + 6upx;
			color: $font-color-dark;
		}

		.desc {
			font-size: $font-base;
			color: $font-color-base;
		}
	}

	.cover-container {
		margin-top: 0upx;
		position: relative;
		background: #f5f5f5;
		padding-bottom: 20upx;

		.arc {
			position: absolute;
			left: 0;
			top: -34upx;
			width: 100%;
			height: 36upx;
		}
	}

	.order-section {
		@extend %section;
		padding: 16upx 0;
		flex-wrap: wrap;
		justify-content: flex-start;

		// margin-top: 20upx;
		.order-item {
			@extend %flex-center;
			width: 20%;
			height: 120upx;
			border-radius: 10upx;
			font-size: $font-sm;
			color: $font-color-dark;

			.yticon {
				position: relative;
			}

			.sub {
				position: absolute;
				top: -20upx;
				right: -18upx;
				font-size: $font-ssm;
				color: #fff;
				background: #fa436a;
				border-radius: 50%;
				width: 36upx;
				height: 36upx;
				text-align: center;
				line-height: 36upx;
			}
		}

		.yticon {
			font-size: 48upx;
			color: #fa436a;
		}

		.icon-shouhoutuikuan {
			font-size: 44upx;
		}

		.number {
			font-size: $font-llg;
			font-weight: 500;
			color: $font-color-warning;
		}
	}

	.m-t {
		margin-top: 20upx;
	}

	.header {
		margin-top: 20upx;
		font-size: $font-base;
		display: flex;
		justify-content: space-between;

		.more {
			font-size: $font-base;
			color: $font-color-base;
		}

		.yticon {
			margin-right: 16rpx;
			font-size: 38rpx;
			color: #54b4ef;
		}
	}

	.fast-section {
		display: flex;
		font-size: $font-base;
		background: $base-color;
		padding: 20rpx;
		color: #ffffff;
		border-radius: 10rpx;
		justify-content: space-between;
		margin: 0 20rpx;

		.fast-actions {
			padding: 10rpx 20rpx;
			display: flex;
			flex-direction: column;
			text-align: center;
		}

		.yticon {
			font-size: 80rpx;
		}
	}
</style>
