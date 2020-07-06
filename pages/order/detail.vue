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
				<!-- 付尾款提示 ,只有付了定金，才能进入此详细页面-->
				<view class="" v-if="info.yuding && info.state == 0">
					<text>应付尾款：</text>
					<text class="price">{{ info.yuding.finishPaymentPrice  | toFixed}}</text>
					<text class="m-l">{{ info.yuding.finalPaymentBeginTime | dateFormat('yyyy-MM-dd hh:mm:ss') }}开始</text>
				</view>
				<!-- 退款进度 -->
				<view class="apply-list" v-if="info.cancelApply">
					<text class="title">取消进度：</text>
					<view class="apply-list-content">
						<view v-for="(ca, iCa) in info.cancelApply" :key="iCa" class="weui-flex">
							<text>{{ ca.message }}</text>
							<text>{{ ca.time | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</view>
				</view>
			</view>
			<view class="buttons">
				<block v-if="info.state == 0">
					<block v-if="info.yuding"><button class="action-btn disabled">去支付尾款</button></block>
				</block>
				<block v-else-if="info.state == 1"><button type="default" class="action-btn" @click="pusheDelivery">催发货</button></block>
				<block v-else-if="info.state == 2"><button type="default" class="action-btn" @click="confirmOrder">确定收货</button></block>
				<block v-else-if="info.state == 3"><button type="default" class="action-btn recom" @click="evaluateOrder">评价一下</button></block>
				<block v-else>
					<button type="default" class="action-btn" @click="deleteOrder">删除订单</button>
					<button type="default" class="action-btn" @click="buyAgain()">再次购买</button>
				</block>
			</view>
		</view>
		<view class="section ab m-t">
			<view class="weui-flex address b-b" v-if="info.address">
				<view class=""><text>收货地址</text></view>
				<view class="content">
					<view class="">
						<text>{{ info.address.name }}</text>
						<text class="m-l">{{ info.address.mobile }}</text>
					</view>
					<text>{{ info.address.addressName }}</text>
				</view>
			</view>
			<view class="weui-flex">
				<view class=""><text>备注</text></view>
				<view class="">
					<text>{{ info.remark || '无' }}</text>
				</view>
			</view>
		</view>
		<view class="m-t"></view>

		<view class="cart-list ">
			<block v-for="(item, index) in goodsList" :key="index">
				<view class="goodsList b-b" v-if="item.amount > 0" @click="navToGoodsPage(item)">
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
								<view class="weui-flex">
									<text class="title weui-flex__item">{{ item.title }}</text>
									<text class="price warning">{{ (item.price * item.amount) | toFixed }}</text>
								</view>
								<view class="">
									<text>{{ item.subName }}</text>
								</view>
								<view class=" prices">
									<view class="">
										<text>{{ priceTitle }}:</text>
										<text class="price">{{ item.price | toFixed}}</text>
										<text>数量:</text>
										<text>{{ item.amount }}</text>
									</view>
								</view>
								<view class="buttons">
									<button type="default" v-if="info.state > 0" class="action-btn" @click.stop="refundOrder(item)">申请退款</button>
									<block v-if="info.yuding"></block>
									<block v-else><button type="default" class="action-btn" @click.stop="buyAgain(item)">加购物车</button></block>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<view class="more-btn b-b" v-if="moreGoodsCount > 0" @click="showAllGoods">
				<text>还有{{ moreGoodsCount }}种商品</text>
				<text class="yticon icon-jiantour-copy"></text>
			</view>
			<view class="section ab">
				<block v-if="info.yuding">
					<view class="weui-flex">
						<text>阶段1：定金</text>
						<text class="price">{{ info.yuding.price }}</text>
					</view>
					<block v-if="info.yuding.payInfo">
						<view class="weui-flex">
							<text class="m-l2">支付方式</text>
							<text>{{ info.yuding.payInfo.name }}</text>
						</view>
						<view class="weui-flex">
							<text class="m-l2">支付时间</text>
							<text>{{ info.yuding.payInfo.time | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
						</view>
					</block>

					<view class="weui-flex">
						<text>阶段2：尾款</text>
						<text class="price">{{ info.yuding.finishPaymentPrice | toFixed }}</text>
					</view>
				</block>
				<block v-else>
					<view class="weui-flex">
						<text class="">商品金额</text>
						<text class="price">{{ (info.totalMoney + info.totalDiscount ) | toFixed}}</text>
					</view>
				</block>
				<view class="weui-flex">
					<view class=""><text>优惠金额</text></view>
					<view class="">
						<text>-</text>
						<text class="price">{{ info.totalDiscount | toFixed }}</text>
					</view>
				</view>
				<view class="weui-flex">
					<view class=""><text>实付金额</text></view>
					<text class="price warning">{{ info.totalMoney | toFixed }}</text>
				</view>
			</view>
		</view>
		<view class="m-t"></view>
		<view class="section ab">
			<view class="weui-flex">
				<view class=""><text>订单编号</text></view>
				<view class="">
					<text>{{ info.id }}</text>
				</view>
			</view>
			<view class="weui-flex">
				<view class=""><text>支付编号</text></view>
				<view class="">
					<text>{{ info._id }}</text>
				</view>
			</view>
			<view class="weui-flex">
				<view class=""><text>下单时间</text></view>
				<view class="">
					<text class="">{{ info.created | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
				</view>
			</view>
			<block v-if="info.payInfo">
				<view class="weui-flex">
					<view class=""><text>支付方式</text></view>
					<view class="">
						<text>{{ info.payInfo.name }}</text>
					</view>
				</view>
				<view class="weui-flex">
					<view class=""><text>支付时间</text></view>
					<view class="">
						<text>{{ info.payInfo.time | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { orders, addManyCart } from '@/common/request.js';
import { navToGoodsItemPage, navToCreateOrder, getOrderStateExp } from '@/common/functions.js';
export default {
	data() {
		return {
			id: 0,
			goodsList: [],
			moreGoodsCount: 0,
			priceTitle: '单价',
			maxShowCount: 3,
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
			//优先从缓存读取，有助于显示速度
			let item = uni.getStorageSync('orderDetail');
			if (item) {
				//从缓存读取
				this.orderInfo(item);
			} else {
				//从网络获取
				orders({
					id: this.id,
					type: 'detail'
				}).then(res => {
					this.orderInfo(res);
				});
			}
		},
		orderInfo(res) {
			//订单状态
			let { stateTip, stateTipColor, stateContent } = getOrderStateExp(res);
			res.stateTip = stateTip;
			res.stateTipColor = stateTipColor;
			res.stateContent = stateContent;
			this.moreGoodsCount = res.goods.length - this.maxShowCount;
			//颠倒顺序
			if(res.cancelApply){
				res.cancelApply = res.cancelApply.reverse();
			}
			this.info = res;
			if (this.moreGoodsCount > 0) {
				this.goodsList = res.goods.slice(0, this.maxShowCount);
			} else {
				this.goodsList = res.goods;
			}
			if (this.info.yuding) {
				this.priceTitle = '预售价';
			}
		},
		showAllGoods() {
			this.goodsList = this.info.goods;
			this.moreGoodsCount = 0;
		},
		navToGoodsPage(item) {
			navToGoodsItemPage(item);
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
					id: this.info.shopid,
					stationId: this.stationId,
					data: data
				}).then(res => {
					console.log(res);
					this.$api.msg('加入购物车成功', 1500, false, 'success');
				});
			} else {
				//直接提交订单，如果存在库存不足，将提交失败
				let goods = this.info.goods;
				uni.setStorage({
					key: 'settlementCartsIds',
					data: {
						shopid:this.info.shopid,
						goodslist: goods
					},
					success: () => {
						navToCreateOrder();
					}
				});
				//加入商品到购物车，再跳转到结算
				/* for (let ele of this.info.goods) {
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
					id: this.info.shopid,
					stationId: this.stationId,
					data: data
				}).then(res => {
					console.log(res);
					uni.setStorage({
						key:"settlementCartsIds",
						data:{
							settlement:true
						},
						success:()=> {
							navToCreateOrder();
						}
					})
					//navToCreateOrder();
				}); */
			}
		},
		//催老板发货
		pusheDelivery() {
			this.$api.msg('已发送消息给商家,请耐心等待');
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
	padding: 20upx 30upx;
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
	&.disabled {
		background-color: $font-color-disabled;
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
	background: #ffffff;
	border-radius: 20upx;
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
			padding-right: 20upx;
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
.m-l2 {
	margin-left: 20upx;
}
.address {
	position: relative;
	padding-bottom: 14upx;
	.content {
		text-align: right;
	}
}
.more-btn {
	background: #fff;
	text-align: center;
	padding: 20upx;
	position: relative;
}
.ab {
	.weui-flex {
		justify-content: space-between;
		margin-bottom: 14upx;
	}
}
.price {
	color: $font-color-dark;
	&.warning {
		color: $font-color-warning;
	}
}
.apply-list {
	.title{
		font-weight: 500;
	}
	.apply-list-content {
		flex: 1;
		color: $font-color-disabled;
		padding-left: 20upx;
		.weui-flex {
			flex-direction: column;
			align-items: inherit;
			margin-bottom: 10upx;
			&:nth-child(1){
				color: $base-color;
			}
		}
	}
}
</style>
