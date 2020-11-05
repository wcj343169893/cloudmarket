<template>
	<view class="container" :class="[globalAdminClass]">
		<empty v-if="loaded === true && orderList.length === 0"></empty>
		<view v-for="(item, index) in orderList" :key="index" class="order-item" @click="edit(item)">
			<view class="i-top b-b">
				<text class="time">{{ item.title  }}</text>
				<view class="price-box">
					<text>共</text>
					<text class="num">{{ item.goods.length }}</text>
					<text>件商品</text>
				</view>
			</view>
			<view class="">
				<scroll-view v-if="item.goods.length > 1" class="goods-box" scroll-x>
					<view v-for="(goodsItem, goodsIndex) in item.goods" :key="goodsIndex" class="goods-item" v-if="goodsIndex < 20">
						<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
					</view>
				</scroll-view>
				<view v-else class="goods-box-single" v-for="(goodsItem, goodsIndex) in item.goods" :key="goodsIndex">
					<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
					<view class="right">
						<view class="">
							<text class="title clamp">{{ goodsItem.title }}</text>
						</view>
						<text class="attr-box" v-if="goodsItem.subName && goodsItem.subName.length > 0">{{ goodsItem.subName }}</text>
						<view class="attr-box">
							<text>单价:</text>
							<text class="price">{{ goodsItem.price | toFixed}}</text>
						</view>
						<view class="attr-box">
							<text>库存:</text>
							<text>{{ goodsItem.stock }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="address">
				<text class="m-r">开始时间:</text>
				<text class="m-r">{{ item.beginTime  | dateFormat('yyyy-MM-dd hh:mm:ss')  }}</text>
			</view>
			<view class="address">
				<text class="m-r">结束时间:</text>
				<text class="m-r">{{ item.endTime  | dateFormat('yyyy-MM-dd hh:mm:ss')  }}</text>
			</view>
			<view class="action-box b-t">
				<button class="action-btn warning" @click.stop="closure(item)">结束</button>
				<button class="action-btn recom">修改</button>
				<button class="action-btn" @click.stop="preview(item)">预览</button>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
		<button class="fixed-add-btn" @click="navTo('/pages/admin/activities/special/add?isnew=1')">新增专题</button>
	</view>
</template>

<script>
	import {
		specialAdmin
	} from '@/common/admin_request.js';
	import {
		getOrderStateExp,
		checkDeliveryHour
	} from '@/common/functions.js';
	import searchMixin from '../../mixin/search.js'
	export default {
		mixins: [searchMixin],
		data() {
			return {
				shopid: 0,
				state: "",
				limit: 10,
				loaded: false,
				loadingType: 'more',
				orderList: []
			};
		},
		onLoad(options) {
			this.shopid = options.shopid;
			this.state = options.state;
			this.loadData();
		},
		methods: {
			async loadData() {
				this.loadingType = 'loading';
				this.page++;
				specialAdmin("list", {
					key: this.searchWord,
					page: this.page,
					limit: this.limit
				}).then(
					res => {
						this.orderList = this.orderList.concat(res);
						if (res.length < this.limit) {
							//没有数据了
							//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
							this.loaded = true;
							//判断是否还有数据， 有改为 more， 没有改为noMore
							this.loadingType = 'noMore';
						}
					},
					err => {
						this.loaded = true;
						this.loadingType = 'noMore';
					}
				);
			},
			navToOrderDetail(item) {
				uni.setStorage({
					key: 'orderDetail',
					data: item
				});
				uni.navigateTo({
					url: `/pages/admin/order/detail?id=${item._id}`
				});
			},
			//订单状态文字和颜色
			orderStateExp(item) {
				return getOrderStateExp(item);
			},
			closure(item) {
				uni.showModal({
					title: '确认结束专题？',
					content: '结束后，前端将自动下架',
					success: res => {
						if (res.confirm) {
							this.$submitData(() => {
								specialAdmin("closure", {
									id: item._id,
								}).then(
									res => {
										item.endTime = Date.now();
										this.$api.success("操作成功")
									},
									err => {}
								);
							});
						}
					}
				});
			},
			edit(item) {
				this.navToItem("/pages/admin/activities/special/add", item)
			},
			preview(item) {

			},
			//刷新页面数据
			refreshList() {
				console.log("重新刷新列表数据")
				this.page = 0;
				this.orderList = [];
				this.loadData();
			}
		}
	};
</script>

<style lang="scss">
	page,
	.container {
		background: $page-color-base;
	}

	.container {
		padding-bottom: 100rpx;
	}

	.order-item {
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-top: 16upx;

		.i-top {
			display: flex;
			align-items: center;
			height: 80upx;
			padding-right: 30upx;
			font-size: $font-base;
			color: $font-color-dark;
			position: relative;

			.time {
				flex: 1;
			}

			.state {
				color: $base-color;
			}

			.del-btn {
				padding: 10upx 0 10upx 36upx;
				font-size: $font-lg;
				color: $font-color-light;
				position: relative;

				&:after {
					content: '';
					width: 0;
					height: 30upx;
					border-left: 1px solid $border-color-dark;
					position: absolute;
					left: 20upx;
					top: 50%;
					transform: translateY(-50%);
				}
			}
		}

		/* 多条商品 */
		.goods-box {
			height: 160upx;
			padding: 20upx 0;
			white-space: nowrap;

			.goods-item {
				width: 120upx;
				height: 120upx;
				display: inline-block;
				margin-right: 24upx;
			}

			.goods-img {
				display: block;
				width: 100%;
				height: 100%;
				border-radius: 4%;
			}
		}

		/* 单条商品 */
		.goods-box-single {
			display: flex;
			padding: 20upx 0;

			.goods-img {
				display: block;
				width: 120upx;
				height: 120upx;
				border-radius: 4%;
			}

			.right {
				flex: 1;
				display: flex;
				flex-direction: column;
				padding: 0 30upx 0 24upx;
				overflow: hidden;

				.title {
					font-size: $font-base + 2upx;
					color: $font-color-dark;
					line-height: 1;
				}

				.attr-box {
					font-size: $font-sm + 2upx;
					color: $font-color-light;
					padding: 8upx 0upx 0;
				}
			}
		}

		.price-box {
			display: flex;
			justify-content: flex-end;
			align-items: baseline;
			padding: 20upx 30upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;

			.num {
				margin: 0 8upx;
				color: $font-color-dark;
			}
		}

		.action-box {
			display: flex;
			justify-content: flex-end;
			align-items: center;
			height: 100upx;
			position: relative;
			padding-right: 30upx;
			margin-top: 12rpx;
		}

		.action-btn {
			height: 60upx;
			margin: 0;
			padding: 0 30upx;
			margin-left: 24upx;
			text-align: center;
			line-height: 60upx;
			font-size: $font-sm + 2upx;
			color: $font-color-dark;
			background: #fff;
			border-radius: 100px;

			.time {
				width: 72upx;
				display: inline-block;
			}

			&:after {
				border-radius: 100px;
			}

			&.recom {
				background: $base-color;
				color: #fff;
			}

			&.warning {
				background: $btn-color-warning;
				color: #fff;
			}
		}

		.address {
			font-size: $font-base;
			color: $font-color-warning;
			text-align: right;
			padding-right: 30upx;
		}
	}

	.m-r {
		margin-right: 14upx;
	}

	.m-l {
		margin-left: 20upx;
	}

	.titleNview-placing {
		height: var(--status-bar-height);
		padding-top: 88rpx;
		box-sizing: content-box;
	}
</style>
