<template>
	<view>
		<!-- 地址 -->
		<navigator v-if="addressData.uid" url="/pages/address/address?source=settlement" class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen">
					<view class="top">
						<text class="name">{{ addressData.name }}</text>
						<text class="mobile">{{ addressData.mobile }}</text>
						<text v-if="addressData.default" class="tag">默认</text>
					</view>
					<text class="address">{{ addressData.addressName }} {{ addressData.area }}</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>

			<image class="a-bg" src="/static/address_bottom.png"></image>
		</navigator>
		<!-- 新增地址 -->
		<navigator v-else url="/pages/address/addressManage?type=new" class="address-section">
			<view class="order-content">
				<text class="yticon icon-shouhuodizhi"></text>
				<view class="cen"><text>暂无收货地址，去添加</text></view>
				<text class="yticon icon-you"></text>
			</view>
			<image class="a-bg" src="/static/address_bottom.png"></image>
		</navigator>
		<view class="goods-section">
			<view class="g-header b-b"><text class="name">产地直供，新鲜到家</text></view>
			<block v-if="dataList.length > 1">
				<view class="weui-flex">
					<!-- 商品列表 -->
					<scroll-view scroll-x="true" class="goods_list">
						<view class="scoll-wrapper">
							<view class="g-item" v-for="(item, index) in dataList" :key="index"><image :src="item.src"></image></view>
						</view>
					</scroll-view>
					<!-- 总计 -->
					<navigator url="/pages/order/goods" class="weui-flex__item">
						<view class="total">
							<text>共{{ cartCount }}件</text>
							<text class="yticon icon-you"></text>
						</view>
					</navigator>
				</view>
			</block>
			<block v-else>
				<view class="goods-box-single" v-for="(goodsItem, index) in dataList" :key="index">
					<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
					<view class="right">
						<view class="">
							<text class="title">{{ goodsItem.title }}</text>
						</view>
						<text class="attr-box" v-if="goodsItem.subName && goodsItem.subName.length > 0">{{ goodsItem.subName }}</text>
						<view class="attr-box">
							<text>{{ priceTitle }}:</text>
							<text class="price">{{ goodsItem.originPrice > 0 ? goodsItem.originPrice : goodsItem.price }}</text>
							<text>数量:</text>
							<text>{{ goodsItem.amount }}</text>
						</view>
					</view>
				</view>
			</block>
		</view>

		<!-- 优惠明细 -->
		<view class="yt-list">
			<!-- <view class="yt-list-cell b-b" @click="toggleMask('show')">
				<view class="cell-icon">券</view>
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip active">选择优惠券</text>
				<text class="cell-more wanjia wanjia-gengduo-d"></text>
			</view> -->
			<view class="yt-list-cell b-b">
				<view class="cell-icon hb">减</view>
				<text class="cell-tit clamp">优惠券</text>
				<text class="cell-tip disabled">暂无可用优惠</text>
			</view>
		</view>
		<!-- 金额明细 -->
		<view class="yt-list">
			<block v-if="yuding">
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">阶段1：定金</text>
					<text class="cell-tip">
						<text class="price">{{ yuding.price }}</text>
					</text>
				</view>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">阶段2：尾款</text>
					<text class="cell-tip">
						<text class="price">{{ yuding.finishPaymentPrice }}</text>
					</text>
				</view>
			</block>
			<block v-else>
				<view class="yt-list-cell b-b">
					<text class="cell-tit clamp">商品金额</text>
					<text class="cell-tip">
						<text class="price">{{ totalMoney + totalDiscount }}</text>
					</text>
				</view>
			</block>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">优惠金额</text>
				<text class="cell-tip red">
					<text>-</text>
					<text class="price">{{ totalDiscount }}</text>
				</text>
			</view>
			<view class="yt-list-cell b-b">
				<text class="cell-tit clamp">运费</text>
				<text class="cell-tip" v-if="freight > 0">
					<text class="price">{{ freight }}</text>
				</text>
				<text class="cell-tip" v-else>免运费</text>
			</view>
			<view class="yt-list-cell desc-cell">
				<text class="cell-tit clamp">备注</text>
				<input class="desc" type="text" v-model="remark" placeholder="请填写备注信息" placeholder-class="placeholder" />
			</view>
		</view>

		<!-- 底部 -->
		<view class="footer">
			<view class="price-content">
				<text>{{totalTitle}}</text>
				<text class="price warning">{{ totalMoney }}</text>
			</view>
			<text class="submit" @click="submit">提交订单</text>
		</view>

		<!-- 优惠券面板 -->
		<view class="mask" :class="maskState === 0 ? 'none' : maskState === 1 ? 'show' : ''" @click="toggleMask">
			<view class="mask-content" @click.stop.prevent="stopPrevent">
				<!-- 优惠券页面，仿mt -->
				<view class="coupon-item" v-for="(item, index) in couponList" :key="index">
					<view class="con">
						<view class="left">
							<text class="title">{{ item.title }}</text>
							<text class="time">有效期至</text>
						</view>
						<view class="right">
							<text class="price">{{ item.price }}</text>
							<text>满30可用</text>
						</view>

						<view class="circle l"></view>
						<view class="circle r"></view>
					</view>
					<text class="tips">限新用户使用</text>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { settlement, selectCart } from '@/common/request.js';
import { navToLoginPage } from '@/common/functions.js';
export default {
	data() {
		return {
			maskState: 0, //优惠券面板显示状态
			remark: '', //备注
			couponList: [
				{
					title: '新用户专享优惠券',
					price: 5
				}
			],
			ids: [],
			dataList: [],
			priceTitle: '单价',
			totalTitle: '实付款',
			//库存不足商品
			stockNotEnough: [],
			cartCount: 0,
			totalMoney: 0,
			totalDiscount: 0,
			freight: 0, //运费
			isSubmit: false,
			yuding: false,
			addressData: {}
		};
	},
	onLoad(option) {
		this.loadData();
	},
	computed: {
		...mapState(['hasLogin', 'shopId', 'stationId', 'location'])
	},
	methods: {
		async loadData() {
			this.ids = uni.getStorageSync('settlementCartsIds');
			if (!this.ids) {
				console.log('结算信息不存在');
				return;
			}
			settlement({
				id: this.shopId,//对此变量依赖性太强
				addressid: this.location.id,
				stationId: this.stationId,
				...this.ids
			}).then(
				res => {
					console.log(res);
					//默认收货地址
					this.addressData = res.address;
					//结算商品列表，写到本地临时缓存
					this.dataList = res.goods;
					uni.setStorage({
						key: 'create_order_goods',
						data: res.goods
					});
					this.cartCount = res.cartCount;
					this.totalMoney = res.totalMoney;
					this.totalDiscount = res.totalDiscount;
					this.stockNotEnough = res.stockNotEnough;
					this.freight = res.freight;
					this.yuding = res.yuding;
					if (this.yuding) {
						this.priceTitle = '预售价';
						this.totalTitle = "定金";
						this.totalMoney = this.yuding.price;
					}
					if (this.stockNotEnough.length > 0) {
						uni.showModal({
							title: '库存不足提醒',
							content:
								'商品:' +
								this.stockNotEnough
									.map(m => {
										return m.title;
									})
									.join(',') +
								' 库存不足\n是否移除后继续提交？',
							success: e => {
								if (e.confirm) {
									//更新库存不足的商品为未选中状态
									selectCart({
										id: this.shopId,
										stationId: this.stationId,
										checked: false,
										cartIds: this.stockNotEnough
											.map(m => {
												return m.cartId;
											})
											.join(',')
									}).then(res => {
										console.log(res);
									});
								} else {
									uni.navigateBack();
								}
							}
						});
					}
				},
				err => {
					//购物车没有需要结算的商品
					this.$api.msg(`商品不存在`);
					setTimeout(() => {
						uni.navigateBack();
					}, 3000);
				}
			);
		},
		//显示优惠券面板
		toggleMask(type) {
			let timer = type === 'show' ? 10 : 300;
			let state = type === 'show' ? 1 : 0;
			this.maskState = 2;
			setTimeout(() => {
				this.maskState = state;
			}, timer);
		},
		//提交订单，并跳转到支付页面
		submit() {
			//判断收货地址
			if (!this.addressData || !this.addressData._id) {
				this.$api.msg('请填写收货地址');
				return;
			}
			if (this.isSubmit) {
				return;
			}
			this.isSubmit = true;
			settlement({
				id: this.shopId,
				stationId: this.stationId,
				type: 'submit',
				remark: this.remark,
				addressid: this.addressData._id,
				...this.ids
			}).then(
				res => {
					let id = res;
					let money = this.totalMoney;
					uni.redirectTo({
						url: `/pages/money/pay?id=${id}&money=${money}&comefrom=cart`
					});
					//this.isSubmit = false;
					//刷新购物车列表
					this.$api.prePage().refreshList();
				},
				err => {
					this.isSubmit = false;
					this.$api.msg(err.message);
				}
			);
		},
		refreshList(data, type) {
			console.log(data, type);
			this.addressData = data;
		},
		stopPrevent() {}
	}
};
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-bottom: 100upx;
}

.address-section {
	padding: 32upx 0;
	background: #fff;
	position: relative;
	font-size: $font-base;

	.order-content {
		display: flex;
		align-items: center;
	}

	.icon-shouhuodizhi {
		flex-shrink: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 90upx;
		color: #888;
		font-size: 44upx;
	}

	.cen {
		display: flex;
		flex-direction: column;
		flex: 1;
		font-size: $font-sm;
		color: $font-color-dark;
	}

	.name {
		font-size: $font-lg;
		margin-right: 24upx;
	}

	.address {
		margin-top: 8upx;
		margin-right: 20upx;
		color: $font-color-light;
	}

	.icon-you {
		font-size: 32upx;
		color: $font-color-light;
		margin-right: 30upx;
	}

	.a-bg {
		position: absolute;
		left: 0;
		bottom: 0;
		display: block;
		width: 100%;
		height: 5upx;
	}
	.tag {
		font-size: $font-sm;
		margin-left: 10upx;
	}
}

.goods-section {
	margin-top: 16upx;
	background: #fff;
	padding-bottom: 1px;
	font-size: $font-base;

	.g-header {
		display: flex;
		align-items: center;
		height: 84upx;
		padding: 0 30upx;
		position: relative;
		margin-bottom: 12upx;
	}
	.goods_list {
		width: 80%;
	}
	.scoll-wrapper {
		display: inline-flex;
		align-items: flex-start;
	}
	.total {
		text-align: center;
		font-size: $font-sm;
	}
	.yticon {
		font-size: $font-sm;
	}
	.g-item {
		margin-left: 16upx;
		image {
			border-radius: 4%;
			width: 100upx;
			height: 100upx;
		}
	}
}
.weui-flex {
	display: flex;
	align-items: center;
}
.weui-flex__item {
	flex: 1;
}
.yt-list {
	margin-top: 16upx;
	background: #fff;
}

.yt-list-cell {
	display: flex;
	align-items: center;
	padding: 10upx 30upx 10upx 40upx;
	line-height: 70upx;
	position: relative;

	&.cell-hover {
		background: #fafafa;
	}

	&.b-b:after {
		left: 30upx;
	}

	.cell-icon {
		height: 32upx;
		width: 32upx;
		font-size: 22upx;
		color: #fff;
		text-align: center;
		line-height: 32upx;
		background: #f85e52;
		border-radius: 4upx;
		margin-right: 12upx;

		&.hb {
			background: #ffaa0e;
		}

		&.lpk {
			background: #3ab54a;
		}
	}

	.cell-more {
		align-self: center;
		font-size: 24upx;
		color: $font-color-light;
		margin-left: 8upx;
		margin-right: -10upx;
	}

	.cell-tit {
		flex: 1;
		font-size: 26upx;
		color: $font-color-light;
		margin-right: 10upx;
	}

	.cell-tip {
		font-size: 26upx;
		color: $font-color-dark;

		&.disabled {
			color: $font-color-light;
		}

		&.active {
			color: $base-color;
		}
		&.red {
			color: $base-color;
		}
	}

	&.desc-cell {
		.cell-tit {
			max-width: 90upx;
		}
	}

	.desc {
		flex: 1;
		font-size: $font-base;
		color: $font-color-dark;
	}
}

.footer {
	position: fixed;
	left: 30upx;
	right: 30upx;
	bottom: calc(30upx + var(--window-bottom));
	z-index: 995;
	display: flex;
	align-items: center;
	width: 92%;
	height: 90upx;
	justify-content: space-between;
	font-size: 30upx;
	background-color: #fff;
	z-index: 998;
	color: $font-color-base;
	box-shadow: 0 -1px 5px rgba(0, 0, 0, 0.1);
	border-radius: 10upx;
	overflow: hidden;
	.price-content {
		padding-left: 30upx;
	}
	.price-tip {
		color: $base-color;
		margin-left: 8upx;
	}
	.price {
		font-size: 36upx;
	}
	.submit {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 280upx;
		height: 100%;
		color: #fff;
		font-size: 32upx;
		background-color: $base-color;
	}
}

/* 优惠券面板 */
.mask {
	display: flex;
	align-items: flex-end;
	position: fixed;
	left: 0;
	top: var(--window-top);
	bottom: 0;
	width: 100%;
	background: rgba(0, 0, 0, 0);
	z-index: 9995;
	transition: 0.3s;

	.mask-content {
		width: 100%;
		min-height: 30vh;
		max-height: 70vh;
		background: #f3f3f3;
		transform: translateY(100%);
		transition: 0.3s;
		overflow-y: scroll;
	}
	&.none {
		display: none;
	}
	&.show {
		background: rgba(0, 0, 0, 0.4);

		.mask-content {
			transform: translateY(0);
		}
	}
}

/* 优惠券列表 */
.coupon-item {
	display: flex;
	flex-direction: column;
	margin: 20upx 24upx;
	background: #fff;
	.con {
		display: flex;
		align-items: center;
		position: relative;
		height: 120upx;
		padding: 0 30upx;
		&:after {
			position: absolute;
			left: 0;
			bottom: 0;
			content: '';
			width: 100%;
			height: 0;
			border-bottom: 1px dashed #f3f3f3;
			transform: scaleY(50%);
		}
	}
	.left {
		display: flex;
		flex-direction: column;
		justify-content: center;
		flex: 1;
		overflow: hidden;
		height: 100upx;
	}
	.title {
		font-size: 32upx;
		color: $font-color-dark;
		margin-bottom: 10upx;
	}
	.time {
		font-size: 24upx;
		color: $font-color-light;
	}
	.right {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		font-size: 26upx;
		color: $font-color-base;
		height: 100upx;
	}
	.price {
		font-size: 44upx;
		color: $base-color;
		&:before {
			content: '￥';
			font-size: 34upx;
		}
	}
	.tips {
		font-size: 24upx;
		color: $font-color-light;
		line-height: 60upx;
		padding-left: 30upx;
	}
	.circle {
		position: absolute;
		left: -6upx;
		bottom: -10upx;
		z-index: 10;
		width: 20upx;
		height: 20upx;
		background: #f3f3f3;
		border-radius: 100px;
		&.r {
			left: auto;
			right: -6upx;
		}
	}
}
/* 单条商品 */
.goods-box-single {
	display: flex;
	padding: 20upx;
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
</style>
