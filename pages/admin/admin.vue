<template>
	<view class="container">
		<view class="basic-section">
			<image class="bg" :src="banner"></image>
			<view class="user-info-box" @click="navToSet">
				<view class="portrait-box">
					<image class="portrait" :src="src"></image>
				</view>
				<view class="info-box">
					<text class="username">{{ name }}({{ shopid }})</text>
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
				<view class="fast-actions">
					<text class="yticon icon-daifukuan"></text>
					<text class="">财务结算</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-dingdan" iconColor="#54b4ef" title="订单管理" @eventClick="navToOrder('all')" tips="全部"></mix-list-cell>
		<view class="cover-container">
			<!-- 订单信息统计 -->
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in orderTypes" :key="index" @click="navToOrder(item.state)"
				 hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-shangpin" iconColor="#54b4ef" title="商品管理" @eventClick="navToAddGoods()" tips="新增"></mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in goodsTypes" :key="index" @click="navToGoods(item.state)"
				 hover-class="common-hover" :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-tuandui" iconColor="#54b4ef" title="用户管理" @eventClick="navToUsers('all')"
		 tips="账户充值"></mix-list-cell>
		<view class="cover-container">
			<view class="order-section">
				<view class="order-item" v-for="(item, index) in userTypes" :key="index" hover-class="common-hover" @click="navToUsers(item.state)"
				 :hover-stay-time="50">
					<text class="number">{{ item.number }}</text>
					<text>{{ item.name }}</text>
				</view>
			</view>
		</view>
		<mix-list-cell icon="icon-fenlei1" iconColor="#54b4ef" title="分类管理" @eventClick="navTo('/pages/admin/goods/category')"
		 tips="商品分类"></mix-list-cell>
		<mix-list-cell icon="icon-shouhoutuikuan" iconColor="#54b4ef" title="营销活动" @eventClick="navTo('/pages/admin/goods/miaosha/list')"
		 tips="限时秒杀"></mix-list-cell>
		<mix-list-cell icon="icon-shouye" iconColor="#54b4ef" title="广告管理" @eventClick="navTo('/pages/admin/ad/list')" tips="首页滚动广告图"></mix-list-cell>
		<mix-list-cell icon="icon-bianji" iconColor="#54b4ef" title="文档管理" @eventClick="navTo('/pages/admin/docs/list')" tips="首页分享/功能说明"></mix-list-cell>
		<mix-list-cell icon="icon-tongji" iconColor="#54b4ef" title="经营数据" tips=" "></mix-list-cell>
	</view>
</template>

<script>
	import {
		mapMutations
	} from 'vuex';
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				shopid: 0,
				isSetTitle: false,
				name: '',
				src: '/static/store-face.png',
				banner: '/static/banner.jpg',
				address: '',
				notice: '',
				orderTypes: [],
				goodsTypes: [],
				userTypes: []
			};
		},
		onLoad(options) {
			this.shopid = +options.shopid;
			this.setAdminShop(this.shopid);
			console.log(this.shopid, options);
			if (options.second) {
				//进一步跳转到下一页页面
				let func = "navTo" + options.second;
				this[func](options.state);
			}
		},
		onShow() {
			this.loadData(false);
		},
		//下拉刷新,不会更新底部附近的店铺
		onPullDownRefresh() {
			console.log('刷新整页');
			uni.stopPullDownRefresh();
			this.loadData(true);
		},
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
				let info = uni.getStorageSync('adminShopInfo');
				if (info) {
					this.buildShopInfo(info);
				}
				shopAdmin('info', {}, showLoading).then(
					res => {
						uni.setStorage({
							key: "adminShopInfo",
							data: res
						})
						this.buildShopInfo(res);
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
				if (state == "refunded") {
					this.navTo(`/pages/admin/order/refund/list?state=verifying&shopid=${this.shopid}`);
				} else {
					this.navTo(`/pages/admin/order/list?state=${state}&shopid=${this.shopid}`);
				}
			},
			navToGoods(state) {
				this.navTo(`/pages/admin/goods/list?state=${state}&shopid=${this.shopid}`);
			},
			navToUsers(state) {
				this.navTo(`/pages/admin/user/list?state=${state}&shopid=${this.shopid}`);
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
		background: $page-color-base;
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
			margin-bottom: 18upx;
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
