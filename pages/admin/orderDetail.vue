<template>
	<view class="container">
		<view class="header">
			<view class="back-btn yticon icon-zuojiantou-up" @click="navBack"></view>
			<view class="header_title">
				<text>{{ info.stateTip }}</text>
				<text class="yticon icon-you"></text>
			</view>
		</view>
		<view class="section m-t">
			<view class="sub-title">
				<text>{{ info.stateContent }}</text>
				<!-- 付尾款提示 ,只有付了定金，才能进入此详细页面-->
				<view class="" v-if="info.yuding && info.state == 0">
					<block v-if="info.yuding.state == 0">
						<text>未支付定金</text>
					</block>
					<block v-else>
						<text>应付尾款：</text>
						<text class="price">{{ info.yuding.finishPaymentPrice }}</text>
						<text class="m-l">{{ info.yuding.finalPaymentBeginTime | dateFormat('yyyy-MM-dd hh:mm:ss') }}开始</text>
					</block>
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
				<button type="default" class="action-btn" @click="printTicket">打印小票</button>
				<block v-if="info.state == 1"><button type="default" class="action-btn" @click="addDelivery(false)">确定发货</button></block>
				<block v-else-if="info.state == 2"></block>
				<block v-else-if="info.state == 4"><button type="default" class="action-btn recom" @click="evaluateOrder">查看评价</button></block>
				<block v-else></block>
			</view>
		</view>
		<view class="section ab m-t important">
			<view class="weui-flex address b-b" v-if="info.address" @click="openMap(info.address)">
				<view class=""><text>收货地址</text></view>
				<view class="content">
					<view class="">
						<text>{{ info.address.name }}</text>
						<text class="m-l">{{ info.address.mobile }}</text>
					</view>
					<text>{{ info.address.addressName }}{{info.address.area}}</text>
					<view class="">
						<text>{{ info.address.address }}</text>
					</view>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="weui-flex">
				<view class=""><text>备注</text></view>
				<view class="">
					<text>{{ info.remark || '无' }}</text>
				</view>
			</view>
		</view>
		<view class="m-t"></view>
		<view class="section ab important">
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
					<text class="price">{{ info.yuding.finishPaymentPrice }}</text>
				</view>
			</block>
			<block v-else>
				<view class="weui-flex">
					<text class="">商品金额</text>
					<text class="price">{{ info.totalMoney + info.totalDiscount }}</text>
				</view>
			</block>
			<view class="weui-flex">
				<view class=""><text>优惠金额</text></view>
				<view class="">
					<text>-</text>
					<text class="price">{{ info.totalDiscount }}</text>
				</view>
			</view>
			<view class="weui-flex b-b">
				<view class=""><text>实付金额</text></view>
				<view class="">
					<text class="price warning">{{ info.totalMoney }}</text>
				</view>
			</view>
			<view class="weui-flex">
				<view class=""><text>扣除服务费</text></view>
				<view class=""><text class="price warning">0</text></view>
			</view>
			<view class="weui-flex">
				<view class=""><text>实收金额</text></view>
				<view class="">
					<text class="price warning">{{ info.totalMoney }}</text>
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
									<text class="price warning">{{ item.price * item.amount }}</text>
								</view>
								<view class="">
									<text>{{ item.subName }}</text>
								</view>
								<view class=" prices">
									<view class="">
										<text>单价:</text>
										<text class="price">{{ item.price }}</text>
										<text>数量:</text>
										<text class="important">{{ item.amount }}</text>
									</view>
								</view>
								<view class="buttons">
									<button type="default" v-if="item.state && item.state == 4" class="action-btn" @click.stop="refundOrder(item)">查看退款申请</button>

									<button type="default" v-if="info.state == 1" class="action-btn" @click.stop="addDelivery(item)">单独发货</button>
								</view>
							</view>
						</view>
					</view>
				</view>
			</block>
			<view class="more-btn">
				<text><text class="important">{{ goodsCount }}</text>种商品，共<text class="important">{{ info.cartCount }}</text>件</text>
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
					<text class="">{{ info.created  | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
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
						<text>{{ info.payInfo.time   | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
					</view>
				</view>
			</block>
		</view>
	</view>
</template>

<script>
import { mapState } from 'vuex';
import { addManyCart, orderAdmin } from '@/common/admin_request.js';
import { orders } from '@/common/request.js';
import { navToGoodsItemPage, navToCreateOrder, getOrderStateExp } from '@/common/functions.js';
export default {
	data() {
		return {
			id: 0,
			goodsList: [],
			goodsCount: 0,
			maxShowCount: 3,
			shopid:0,
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
			//this.moreGoodsCount = res.goods.length - this.maxShowCount;
			this.goodsCount=res.goods.length;
			this.info = res;
			this.goodsList = res.goods;
			this.shopid = this.info.shopid;
		},
		navToGoodsPage(item) {
			navToGoodsItemPage(item);
		},
		//申请退款
		refundOrder(item) {
			uni.showToast({
				title: '请联系管理员!',
				icon: 'none'
			});
		},
		//发货
		addDelivery(item) {
			let data = [];
			if (item) {
				//单个商品发货
				this.$api.msg('暂不支持');
			} else {
				orderAdmin({
					shopid: this.shopid,
					id: this.id,
					type: 'addDelivery'
				}).then(
					res => {
						this.$api.msg('发货成功',2000,false,"success");
						this.info.state = 2;
						let { stateTip, stateTipColor } = getOrderStateExp(this.info);
						this.info.stateTip = stateTip;
						this.info.stateTipColor = stateTipColor;
						this.$api.prePage().refreshList();
					},
					err => {
						this.$api.msg('发货失败');
					}
				);
			}
		},
		//确定收货
		confirmOrder(ele) {},
		//打印小票,需要小票插件
		printTicket() {},
		//查看评价
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
		//打开地图
		openMap(address){
			uni.openLocation({
				name:address.addressName,
				address:address.address,
				latitude:address.latitude,
				longitude:address.longitude,
				success() {
					console.log("打开地图成功")
				}
			})
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
		flex: 1;
		margin-right: 12upx;
	}
}
.more-btn {
	background: #fff;
	text-align: center;
	padding: 20upx;
	position: relative;
	.important{
		font-size: 1.2em;
		padding: 0 4upx;
	}
}
.ab {
	.weui-flex {
		justify-content: space-between;
		margin-bottom: 14upx;
		position: relative;
	}
}
.price {
	color: $font-color-dark;
	&.warning {
		color: $font-color-warning;
	}
}
.important {
	color: $font-color-warning;
	font-weight: 500;
	.price {
		color: $font-color-warning;
	}
}
</style>
