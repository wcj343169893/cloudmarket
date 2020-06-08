<template>
	<view class="content">
		<view class="navbar">
			<view v-for="(item, index) in navList" :key="index" class="nav-item" :class="{ current: tabCurrentIndex === index }" @click="tabClick(index)">{{ item.text }}</view>
		</view>

		<swiper :current="tabCurrentIndex" class="swiper-box" duration="300" @change="changeTab">
			<swiper-item class="tab-content" v-for="(tabItem, tabIndex) in navList" :key="tabIndex">
				<scroll-view class="list-scroll-content" scroll-y @scrolltolower="loadData">
					<!-- 空白页 -->
					<empty v-if="tabItem.loaded === true && tabItem.orderList.length === 0"></empty>
					<!-- 订单列表 -->
					<view v-for="(item, index) in tabItem.orderList" :key="index" class="order-item" @click="navToOrderDetail(item)">
						<view class="i-top b-b">
							<text class="time">{{ item.created | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
							<text class="state" :style="{ color: item.stateTipColor }">{{ item.stateTip }}</text>
						</view>
						<view class="">
							<scroll-view v-if="item.goods.length > 1" class="goods-box" scroll-x>
								<view v-for="(goodsItem, goodsIndex) in item.goods" :key="goodsIndex" class="goods-item">
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
										<text>{{item.priceTitle}}:</text>
										<text class="price">{{ goodsItem.price }}</text>
										<text>数量:</text>
										<text>{{ goodsItem.amount }}</text>
									</view>
								</view>
							</view>
						</view>
						<view class="price-box">
							<text>共</text>	
							<text class="num">{{ item.cartCount }}</text>
							<text>件商品</text>	
							<block v-if="item.yuding">
								<text class="m-l">定金</text>
								<text class="price warning">{{ item.yuding.price }}</text>
								<text class="m-l">尾款</text>
								<text class="price warning">{{ item.yuding.finishPaymentPrice }}</text>
							</block>
							<block v-else>
								<text class="m-l">实付款</text>	
								<text class="price warning">{{ item.totalMoney }}</text>
							</block>
						</view>
						<!-- 已取消 -->
						<view class="action-box b-t" v-if="item.state == -1"><button class="action-btn" @click.stop="deleteOrder(item)">删除订单</button></view>
						<!-- 未付款 -->
						<view class="action-box b-t" v-if="item.state == 0">
							<button class="action-btn" @click.stop="cancelOrderConfirm(item, index)">取消订单</button>
							<block v-if="item.yuding">
								<button class="action-btn recom" v-if="item.yuding.state == 0" @click.stop="payOrder(item)">去支付定金<text class="time">{{ item.payment.minute }}:{{ item.payment.second }}</text></button>
								<button class="action-btn recom" v-else-if="item.yuding.finalpay == 1" @click.stop="payOrder(item)">去支付尾款<text class="time">{{ item.payment.minute }}:{{ item.payment.second }}</text></button>
								<button class="action-btn disabled" v-else>去支付尾款</button>
							</block>
							<button class="action-btn recom" v-else @click.stop="payOrder(item)">去支付<text class="time">{{ item.payment.minute }}:{{ item.payment.second }}</text></button>
						</view>
						<!-- 已付款 -->
						<block v-if="item.state == 1">
							<view class="action-box b-t" ><button class="action-btn" @click.stop="pusheDelivery(item)">催发货</button></view>
						</block>
						<!-- 已发货 -->
						<block v-if="item.state == 2">
							<view class="action-box b-t" ><button class="action-btn" @click.stop="confirmOrder(item)">确定收货</button></view>
						</block>
						<!-- 已收货，待评价 -->
						<view class="action-box b-t" v-if="item.state == 3">
							<button class="action-btn" @click.stop="deleteOrder(item)">删除订单</button>
							<button class="action-btn" @click.stop="evaluateOrder(item)">评价</button>
						</view>
					</view>

					<uni-load-more :status="tabItem.loadingType"></uni-load-more>
				</scroll-view>
			</swiper-item>
		</swiper>
	</view>
</template>

<script>
import { orders } from '@/common/request.js';
import { navToPayOrder, navToOrderGoodsList, miaoshaCountDown, navToOrderDetail,getOrderStateExp,clearCountDownTimer } from '@/common/functions.js';
export default {
	data() {
		return {
			tabCurrentIndex: 0,
			isChanged: false,
			navList: [
				{
					state: 0,
					text: '全部',
					loadingType: 'more',
					page: 0,
					orderList: []
				},
				{
					state: 1,
					text: '待付款',
					loadingType: 'more',
					page: 0,
					orderList: []
				},
				{
					state: 2,
					text: '待收货',
					loadingType: 'more',
					page: 0,
					orderList: []
				},
				{
					state: 3,
					text: '待评价',
					loadingType: 'more',
					page: 0,
					orderList: []
				},
				{
					state: 4,
					text: '售后',
					loadingType: 'more',
					page: 0,
					orderList: []
				}
			]
		};
	},

	onLoad(options) {
		/**
		 * 修复app端点击除全部订单外的按钮进入时不加载数据的问题
		 * 替换onLoad下代码即可
		 */
		this.tabCurrentIndex = +options.state;
		//关闭秒杀定时器
		clearCountDownTimer();
		// #ifndef MP
		this.loadData();
		// #endif
		// #ifdef MP
		if (options.state == 0) {
			this.loadData();
		}
		// #endif
	},
	onUnload(){
		console.log("order onUnload")
		//关闭秒杀定时器
		clearCountDownTimer();
	},
	methods: {
		//获取订单列表
		async loadData(source) {
			//这里是将订单挂载到tab列表下
			let index = this.tabCurrentIndex;
			let navItem = this.navList[index];
			let state = navItem.state;
			if (source === 'tabChange' && navItem.loaded === true) {
				//tab切换只有第一次需要加载数据
				return;
			}
			if (navItem.loadingType === 'loading' || navItem.loadingType === 'noMore') {
				//防止重复加载
				return;
			}
			navItem.page++;
			let limit = 20;
			navItem.loadingType = 'loading';
			orders({
				state: state,
				page: navItem.page,
				type: 'list',
				limit: limit
			}).then(res => {
				let time = new Date().getTime();
				if (res.data.length > 0) {
					//格式化时间
					res.data.forEach(ele => {
						console.log(ele)
						let isPay = true;
						ele.priceTitle="单价";
						//预定yuding  item.yuding.finalpay
						ele.showPayMoney = ele.totalMoney;
						if(ele.yuding){
							ele.priceTitle="预售价";
							ele.yuding.finalpay = 0;
							//定金
							ele.showPayMoney = ele.yuding.price;
							if(ele.yuding.finalPaymentBeginTime < time){
								ele.yuding.finalpay = 1;
								//尾款
								ele.showPayMoney = ele.yuding.finishPaymentPrice;
							}else if(ele.yuding.state == 1){
								//已支付定金，但是未开始支付尾款间隙
								isPay = false;
							}
						}
						//支付倒计时
						if (ele.state == 0 && isPay) {
							ele.payment = {
								id:ele._id,
								subId:index+"",
								startTime: time,
								minute: '00',
								second: '00'
							};
							if (ele.lastPayTime > time) {
								miaoshaCountDown(ele.payment, ele.lastPayTime, () => {
									console.log('自动取消订单', ele);
									this.cancelOrder(ele, index, 'auto');
								});
							} else {
								ele.state = -1;
								//直接取消
								orders({
									id: ele._id,
									type: 'cancel',
									style: 'auto'
								}).then(res => {
									console.log("自动取消订单")
								});
							}
						}
						//状态名称 Object.assign
						let { stateTip, stateTipColor } = this.orderStateExp(ele);
						ele.stateTip = stateTip;
						ele.stateTipColor = stateTipColor;
					});
					navItem.orderList = navItem.orderList.concat(res.data);
					navItem.loadingType = 'more';
				}
				if (res.data.length < limit) {
					//没有数据了
					//loaded新字段用于表示数据加载完毕，如果为空可以显示空白页
					this.$set(navItem, 'loaded', true);
					//判断是否还有数据， 有改为 more， 没有改为noMore
					navItem.loadingType = 'noMore';
				}
			});
		},

		//swiper 切换
		changeTab(e) {
			this.tabCurrentIndex = e.target.current;
			this.loadData('tabChange');
		},
		//顶部tab点击
		tabClick(index) {
			this.tabCurrentIndex = index;
		},
		//所有数据重新刷新
		refreshList() {
			this.isChanged = true;
			this.navList.forEach(nav => {
				nav.page = 0;
				nav.loadingType = 'more';
				nav.orderList = [];
			});
			//重新加载数据
			this.loadData();
		},
		//去支付
		payOrder(item) {
			console.log(item);
			navToPayOrder(item._id, item.showPayMoney,"order");
		},
		//删除订单
		deleteOrder(item) {
			uni.showModal({
				title: '确认删除订单？',
				content: '删除之后可以从回收站恢复',
				success: res => {
					if (res.confirm) {
						orders({
							id: item._id,
							type: 'delete'
						}).then(res => {
							console.log(res);
							//更改所有订单的状态
							this.navList.map((tabs, index) => {
								tabs.orderList.map((ord, index2) => {
									if (ord._id == item._id) {
										//所有列表全部删除
										this.navList[index].orderList.splice(index2, 1);
									}
								});
							});
						});
					} else if (res.cancel) {
						console.log('用户点击取消');
					}
				}
			});
			/* setTimeout(() => {
				this.navList[this.tabCurrentIndex].orderList.splice(index, 1);
				uni.hideLoading();
			}, 600); */
		},
		cancelOrderConfirm(item, index) {
			uni.showModal({
				title: '操作提示',
				content: '是否确定取消？',
				success: res => {
					if (res.confirm) {
						this.cancelOrder(item, index, 'user');
					}
				}
			});
		},
		//取消订单
		cancelOrder(item, index, style) {
			//style 取消方式，auto自动，user用户点击取消
			orders({
				id: item._id,
				type: 'cancel',
				style: style
			}).then(res => {
				console.log(res);
				this.$api.msg("取消订单申请提交成功!")
				//刷新当前列表数据 
				//this.navList[this.tabCurrentIndex].orderList[index].state = -1;
				//更改所有订单的状态
				this.navList.map((tabs, index) => {
					tabs.orderList.map((ord, index2) => {
						if (ord._id == item._id) {
							//ord.state= -1;
							if (index == 1) {
								//如果在待付款列表，则直接删除掉
								this.navList[index].orderList.splice(index2, 1);
							} else {
								let state = -1;
								ord.state = state;
								//状态名称 Object.assign
								let { stateTip, stateTipColor } = this.orderStateExp(ord);
								Object.assign(this.navList[index].orderList[index2], {
									state,
									stateTip,
									stateTipColor
								});
							}
						}
					});
				});
			},err=>{
				console.log("取消订单失败");
				this.$api.msg("取消订单申请提交失败!")
				//重新刷新页面数据
				this.refreshList();
			});
		},
		pusheDelivery(ele){
			this.$api.msg("已发送消息给商家,请耐心等待");
		},
		//确定收货
		confirmOrder(ele){
			uni.showModal({
				content: '是否确认收到货物？',
				success: res => {
					if (res.confirm) {
						orders({
							id: ele._id,
							type: 'makesure'
						}).then(res => {
							//重新刷新页面
							ele.state = 3;
							let { stateTip, stateTipColor } = this.orderStateExp(ele);
							ele.stateTip=stateTip;
							ele.stateTipColor =stateTipColor;
							//this.loadData();
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
		navToOrderDetail(item) {
			//pages/order/detail
			if(item.state == 0){
				if(item.yuding){
					//支付定金或者支付尾款
					if(item.yuding.state == 0 || item.yuding.finalpay == 1){
						console.log(item.yuding)
						this.payOrder(item);
						return;
					}
				}else{
					this.payOrder(item);
					return;
				} 
			}
			uni.setStorage({
				key:"orderDetail",
				data:item
			})
			navToOrderDetail(item._id);
		},
		showGoods(item) {
			uni.setStorage({
				key: 'create_order_goods',
				data: item.goods
			});
			navToOrderGoodsList();
		},
		//订单状态文字和颜色
		orderStateExp(item) {
			return getOrderStateExp(item);
		}
	}
};
</script>

<style lang="scss">
page,
.content {
	background: $page-color-base;
	height: 100%;
}

.swiper-box {
	height: calc(100% - 40px);
}
.list-scroll-content {
	height: 100%;
}

.navbar {
	display: flex;
	height: 40px;
	padding: 0 5px;
	background: #fff;
	box-shadow: 0 1px 5px rgba(0, 0, 0, 0.06);
	position: relative;
	z-index: 10;
	.nav-item {
		flex: 1;
		display: flex;
		justify-content: center;
		align-items: center;
		height: 100%;
		font-size: 15px;
		color: $font-color-dark;
		position: relative;
		&.current {
			color: $base-color;
			&:after {
				content: '';
				position: absolute;
				left: 50%;
				bottom: 0;
				transform: translateX(-50%);
				width: 44px;
				height: 0;
				border-bottom: 2px solid $base-color;
			}
		}
	}
}

.uni-swiper-item {
	height: auto;
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
		.time{
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
		&.disabled{
			background-color: $font-color-disabled;
			color: #fff;
		}
	}
}

/* load-more */
.uni-load-more {
	display: flex;
	flex-direction: row;
	height: 80upx;
	align-items: center;
	justify-content: center;
}

.uni-load-more__text {
	font-size: 28upx;
	color: #999;
}

.uni-load-more__img {
	height: 24px;
	width: 24px;
	margin-right: 10px;
}

.uni-load-more__img > view {
	position: absolute;
}

.uni-load-more__img > view view {
	width: 6px;
	height: 2px;
	border-top-left-radius: 1px;
	border-bottom-left-radius: 1px;
	background: #999;
	position: absolute;
	opacity: 0.2;
	transform-origin: 50%;
	animation: load 1.56s ease infinite;
}

.uni-load-more__img > view view:nth-child(1) {
	transform: rotate(90deg);
	top: 2px;
	left: 9px;
}

.uni-load-more__img > view view:nth-child(2) {
	transform: rotate(180deg);
	top: 11px;
	right: 0;
}

.uni-load-more__img > view view:nth-child(3) {
	transform: rotate(270deg);
	bottom: 2px;
	left: 9px;
}

.uni-load-more__img > view view:nth-child(4) {
	top: 11px;
	left: 0;
}

.load1,
.load2,
.load3 {
	height: 24px;
	width: 24px;
}

.load2 {
	transform: rotate(30deg);
}

.load3 {
	transform: rotate(60deg);
}

.load1 view:nth-child(1) {
	animation-delay: 0s;
}

.load2 view:nth-child(1) {
	animation-delay: 0.13s;
}

.load3 view:nth-child(1) {
	animation-delay: 0.26s;
}

.load1 view:nth-child(2) {
	animation-delay: 0.39s;
}

.load2 view:nth-child(2) {
	animation-delay: 0.52s;
}

.load3 view:nth-child(2) {
	animation-delay: 0.65s;
}

.load1 view:nth-child(3) {
	animation-delay: 0.78s;
}

.load2 view:nth-child(3) {
	animation-delay: 0.91s;
}

.load3 view:nth-child(3) {
	animation-delay: 1.04s;
}

.load1 view:nth-child(4) {
	animation-delay: 1.17s;
}

.load2 view:nth-child(4) {
	animation-delay: 1.3s;
}

.load3 view:nth-child(4) {
	animation-delay: 1.43s;
}

@-webkit-keyframes load {
	0% {
		opacity: 1;
	}

	100% {
		opacity: 0.2;
	}
}
.m-l{
	margin-left: 20upx;
}
</style>
