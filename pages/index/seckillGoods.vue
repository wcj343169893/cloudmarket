<template>
	<view class="container">
		<miaoshaPage :dataList="goodsList" @saveCartAmount="saveCartAmount"></miaoshaPage>
		<view class="bottom" v-show="isLoaded"><text>以下没数据了</text></view>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		getMiaosha,
		editCart
	} from '@/common/request.js';
	import miaoshaPage from './components/miaosha.vue';
	import {
		navToGoodsItemPage,
		updateGoodsTags,
		showLoginDialog
	} from '@/common/functions.js';
	import tabbarMixin from './mixin/tabbar' 
	export default {
		mixins: [tabbarMixin], 
		components: {
			miaoshaPage
		},
		data() {
			return {
				goodsList: [],
				isLoaded: false,
				page: 1,
				limit: 10
			};
		},
		computed: {
			...mapState(['hasLogin', 'stationId', 'shopId'])
		},
		onLoad() {
			// this.loadCache();
			this.loadData();
			this.setNavTitle();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (!this.isLoaded) {
				this.page += 1;
				this.loadData();
			}
		},
		methods: {
			async loadCache() {
				uni.getStorage({
					key: 'secKillGoodsList',
					success: res => {
						this.goodsList = res.data;
						this.isLoaded = res.data.length < this.limit;
					}
				});
			},
			async loadData() {
				getMiaosha({
					shopid: this.shopId,
					page: this.page,
					limit: this.limit
				}).then(
					res => {
						if (this.page == 1) {
							this.goodsList = [];
						}
						this.isLoaded = res.length < this.limit;
						res.map(item => {
							updateGoodsTags(item);
							this.goodsList.push(item);
						});
					},
					err => {
						this.isLoaded = true;
					}
				);
			},
			async setNavTitle(){
				let shopInfo = uni.getStorageSync("serviceShopInfo");
				if(shopInfo.pages && shopInfo.pages.home.titles.miaosha){
					uni.setNavigationBarTitle({
						title: shopInfo.pages.home.titles.miaosha
					});
				}
			},
			//更新购物车数据到服务器
			saveCartAmount(item, sku_id) {
				let number = 1;
				if (!this.hasLogin) {
					showLoginDialog();
					return;
				}
				console.log(item)
				editCart({
					id: this.shopId,
					stationId: this.stationId,
					goods_id: item.id,
					sku_id: +sku_id,
					price: item.price,
					title: item.title,
					appends: 1,
					subTitle: item.subName,
					src: item.src,
					checked: 1,
					amount: number
				}).then(res => {
					console.log(res);
					this.incrCartNumber(1);
					this.$api.msg("加入成功", 2000, true, "success")
				}, err => {
					this.$api.msg(err.message);
				});
			},
			navToGoodsPage(item) {
				navToGoodsItemPage(item);
			}
		}
	};
</script>

<style lang="scss">
	page {
		background-color: $background-color;
	}

	.seckill-section {
		display: flex;
		flex-wrap: wrap;
		font-size: $font-base;
		padding-top: 20upx;

		.floor-item {
			background: #ffffff;
			width: 344upx;
			margin-left: 20upx;
			padding: 0 0 20upx;
			margin-bottom: 20upx;
			border-radius: 4%;
			overflow: hidden;

			.content {
				padding: 0 16upx;
			}

			image {
				width: 344upx;
				height: 344upx;
			}
		}

		.miaoshaTime {
			font-size: $font-sm;
			margin: 8rpx 0;
		}
	}

	.bottom {
		text-align: center;
		font-size: $font-sm;
		color: $font-color-disabled;
		padding: 20upx;
	}

	.sku_btn {
		color: $btn-color-light;
		font-size: 48rpx;
		line-height: 40rpx;
		float: right;
	}

	.sub-title {
		font-size: $font-sm;
		color: $font-color-disabled;
	}
</style>
