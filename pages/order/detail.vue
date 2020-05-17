<template>
	<view class="container">
		<view class="header">
			<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
			<view class="header_title">
				<text>{{ info.stateTip }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<view class="section message_notice m-t">
			<text>开启消息通知，及时获取订单配送信息</text>
			<button type="default" class="action-btn recom">去开启</button>
		</view>
		<view class="section m-t">
			<view class="sub-title">
				<text>{{ info.stateContent }}</text>
			</view>
			<view class="buttons" v-if="info.state == 1"><button type="default" class="action-btn" @click="confirmOrder">确定收货</button></view>
			<view class="buttons" v-else>
				<button type="default" class="action-btn" @click="deleteOrder">删除订单</button>
				<button type="default" class="action-btn" @click="buyAgain()">再次购买</button>
				<button type="default" class="action-btn recom" @click="evaluateOrder" v-if="info.state == 3">评价一下</button>
			</view>
		</view>
		<view class="section m-t weui-flex address" v-if="info.address">
			<view class=""><text>收货地址</text></view>
			<view class="weui-flex__item">
				<view class="">
					<text>{{ info.address.name }}</text>
					<text class="m-l">{{ info.address.mobile }}</text>
				</view>
				<text>{{ info.address.addressName }}</text>
			</view>
		</view>
		<view class="m-t"></view>

		<view class="cart-list">
			<block v-for="(item, index) in goodsList" :key="index">
				<view class="goodsList" v-if="item.amount > 0">
					<view class="weui-flex">
						<view class="weui-flex start">
							<view class="weui-flex-check">
								<view class="image-wrapper">
									<image
										:src="item.src"
										:class="[item.loaded]"
										mode="aspectFill"
										lazy-load
										@load="onImageLoad('goodsList', index)"
										@error="onImageError('goodsList', index)"
									></image>
								</view>
							</view>
							<view class="desc weui-flex__item">
								<view class="">
									<text class="title">{{ item.title }}</text>
								</view>
								<view class="">
									<text>{{ item.subName }}</text>
								</view>
								<view class="weui-flex">
									<view class=" prices">
										<view class="">
											<text>
												单价:
												<text class="price">{{ item.price }}</text>
											</text>
										</view>
										<view class="">
											<text>
												数量:
												<text>{{ item.amount }}</text>
											</text>
										</view>
										<view class="">
											<text>
												总价:
												<text class="price warning">{{ item.price * item.amount }}</text>
											</text>
										</view>
									</view>
									<view class="buttons weui-flex__item">
										<button type="default"  v-if="info.state > 2" class="action-btn" @click="refundOrder(item)">申请退款</button>
										<button type="default" class="action-btn" @click="buyAgain(item)">加购物车</button>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { orders, addManyCart } from '@/common/request.js';
import { navToGoodsPage, navToCreateOrder, getOrderStateExp } from '@/common/functions.js';
export default {
	data() {
		return {
			id: 0,
			goodsList: [],
			info: {}
		};
	},
	onLoad(options) {
		this.id = options.id;
		this.loadData();
	},
	computed: {
		...mapState(['stationId'])
	},
	methods: {
		async loadData() {
			orders({
				id: this.id,
				type: 'detail'
			}).then(res => {
				//订单状态
				let { stateTip, stateTipColor, stateContent } = getOrderStateExp(res);
				res.stateTip = stateTip;
				res.stateTipColor = stateTipColor;
				res.stateContent = stateContent;

				this.info = res;
				this.goodsList = res.goods;
			});
		},
		//删除订单
		deleteOrder() {
			uni.showModal({
				title: '确认删除订单？',
				content: '删除之后可以从回收站恢复',
				success: res => {
					if (res.confirm) {
						orders({
							id: this.id,
							type: 'delete'
						}).then(res => {
							console.log(res);
						});
						this.navBack();
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
		},
		//申请退款
		refundOrder(item) {
			uni.showToast({
				title: '请联系管理员!',
				icon: 'none'
			});
		},
		//再次购买
		buyAgain(item) {
			let data = [];
			if (item) {
				data.push({
					goods_id: item.id,
					sku_id: item.sku_id,
					price: item.price,
					src: item.src,
					checked: 1,
					amount: item.amount
				});
				addManyCart({
					id: this.info.shopId,
					stationId: this.stationId,
					data: data
				}).then(res => {
					console.log(res);
					this.$api.msg('加入购物车成功', 1500, false, 'success');
				});
			} else {
				//加入商品到购物车，再跳转到结算
				let goods = this.info.goods;
				for (let ele of this.info.goods) {
					data.push({
						goods_id: ele.id,
						sku_id: ele.sku_id,
						price: ele.price,
						src: ele.src,
						checked: 1,
						amount: ele.amount
					});
				}
				addManyCart({
					id: this.info.shopId,
					stationId: this.stationId,
					data: data
				}).then(res => {
					console.log(res);
					navToCreateOrder();
				});
			}
		},
		//确定收货
		confirmOrder(ele) {
			uni.showModal({
				content: '是否确认收到货物？',
				success: res => {
					if (res.confirm) {
						orders({
							id: this.id,
							type: 'makesure'
						}).then(res => {
							//重新刷新页面
							this.loadData();
						});
					}
				}
			});
		},
		//评价
		evaluateOrder() {
			uni.showLoading({
				title: '请稍后',
				mask: true
			});
		},
		//监听image加载完成
		onImageLoad(key, index) {
			this.$set(this[key][index], 'loaded', 'loaded');
		},
		//监听image加载失败
		onImageError(key, index) {
			this[key][index].image = '/static/errorImage.jpg';
		},
		//刷新数据
		refreshList() {
			this.loadData();
		},
		navBack() {
			uni.navigateBack();
		}
	}
};
</script>

<style lang="scss">
page {
	background: #f5f5f5;
	font-size: $font-base;
	color: $font-color-dark;
}
.container {
	padding: 20upx;
	padding-top: calc(160upx + var(--status-bar-height));
}
.m-t {
	margin-top: 20upx;
}
.weui-flex {
	display: flex;
	align-items: center;
	&.start {
		align-items: flex-start;
	}
}
.weui-flex__item {
	flex: 1;
}
.header {
	position: fixed;
	background: #f5f5f5;
	width: 100%;
	top: 0;
	left: 0;
	z-index: 99;
	padding-left: 20upx;
	padding-top: calc(40upx + var(--status-bar-height));
}
.header_title {
	font-size: $font-llg;
	display: flex;
	align-items: center;
	padding-top: 30upx;
	margin-bottom: 16upx;
	.icon-you {
		color: #9e9e9e;
		margin-top: 8upx;
	}
}
.section {
	background: #ffffff;
	padding: 30upx;
	border-radius: 20upx;
}
.message_notice {
	display: flex;
	justify-content: space-between;
	align-items: center;
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
	&:after {
		border-radius: 100px;
	}
	&.recom {
		background: $base-color;
		color: #fff;
	}
}
.sub-title {
	font-weight: 500;
	margin-bottom: 40upx;
}
.buttons {
	display: flex;
	justify-content: flex-end;
}
.cart-list {
	flex: 1;
	overflow: hidden;
	height: 100%;
	.space {
		padding-top: var(--window-bottom);
	}
	.s-item {
		display: flex;
		align-items: center;
		height: 70upx;
		font-size: 28upx;
		color: $font-color-dark;
	}
	.goodsList {
		position: relative;
		background: #ffffff;
		padding: 20upx 20upx 20upx;
		border-radius: 12upx;
		margin-bottom: 8upx;
		.start {
			flex: 1;
		}
		.sub-catename {
			padding-bottom: 10upx;
		}
	}
	.image-wrapper {
		width: 120upx;
		height: 120upx;
		border-radius: 4%;
		overflow: hidden;
		margin-right: 22upx;
		flex-shrink: 0;
		image {
			width: 100%;
			height: 100%;
			opacity: 1;
		}
	}
	.weui-flex-check {
		display: flex;
		align-items: center;
	}
	.checkbox {
		z-index: 8;
		font-size: 44upx;
		line-height: 1;
		padding: 4upx;
		border-radius: 50px;
		margin-right: 10upx;
	}
	.desc {
		flex: 1;
		font-size: $font-sm;
		color: $font-color-light;
		.title {
			font-size: $font-base;
			color: $font-color-dark;
			line-height: 1.1;
			font-weight: 400;
		}
		.desc2 {
			padding: 4upx 0 0;
		}

		.buttons {
			margin-top: 12upx;
			.empty {
				flex: 1;
			}
		}
	}
	.prices {
		justify-content: space-between;
	}
}
.m-l {
	margin-left: 10upx;
}
.address {
	align-items: flex-start;
	.weui-flex__item {
		text-align: right;
	}
}
</style>
