<template>
	<view class="container">
		<empty v-if="loaded === true && orderList.length === 0"></empty>
		<view v-for="(item, index) in orderList" :key="index" class="order-item" @click="navToOrderDetail(item)">
			<view class="i-top b-b">
				<text class="time">{{ item.created  | dateFormat('yyyy-MM-dd hh:mm:ss')  }}</text>
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
			<view class="address" v-if="item.state ==1 && item.address">
				<text class="m-r">{{item.address.name}}</text>
				<text class="m-r">{{item.address.mobile}}</text>
				<text>{{item.address.addressName}}{{item.address.area}}</text>
			</view>
			<view class="price-box">
				<text>共</text>	
				<text class="num">{{ item.cartCount }}</text>
				<text>件商品</text>	
				<block v-if="item.yuding">
					<text class="m-l"><text v-if="item.yuding.state==1">已付</text>定金</text>
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
			<!-- 未付款 -->
			<view class="action-box b-t" v-if="item.state == 0">
				<button class="action-btn" @click.stop="editOrderMoney(item)">改价格</button>
				<button class="action-btn" @click.stop="sendPayMessage(item, index)">发送付款提醒</button>
			</view>
			<!-- 已付款 -->
			<block v-if="item.state == 1">
				<view class="action-box b-t"><button class="action-btn" @click.stop="addDelivery(item)">确定发货</button></view>
			</block>
			<!-- 已发货 -->
			<block v-if="item.state == 2"></block>
			<!-- 已收货，待评价 -->
			<view class="action-box b-t" v-if="item.state == 3"><button class="action-btn" @click.stop="evaluateOrder(item)">查看评价</button></view>
		</view>

		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
import { orderAdmin } from '@/common/admin_request.js';
import { getOrderStateExp,getOrderTypes } from '@/common/functions.js';
export default {
	data() {
		return {
			shopid: 0,
			state: 0,
			page: 0,
			limit: 20,
			loaded:false,
			loadingType: 'more',
			orderList: []
		};
	},
	onLoad(options) {
		this.shopid = options.shopid;
		this.state = options.state;
		this.loadData();
		//设置标题
		this.setNavTitle();
	},
	//滑到底部加载更多
	onReachBottom() {
		if (this.loadingType != 'noMore') {
			this.loadData();
		}
	},
	methods: {
		async loadData() {
			this.loadingType = 'loading';
			this.page++;
			orderAdmin("list",{
				state: this.state,
				page: this.page,
				limit: this.limit
			}).then(
				res => {
					//格式化时间
					res.forEach(ele => {
						//状态名称 Object.assign
						let { stateTip, stateTipColor } = this.orderStateExp(ele);
						ele.stateTip = stateTip;
						ele.stateTipColor = stateTipColor;
						ele.priceTitle="单价";
						if(ele.yuding){
							ele.priceTitle="预售价";
						}
					});
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
		setNavTitle(){
			let types = getOrderTypes();
			uni.setNavigationBarTitle({
				title:types[this.state]
			})
		},
		//修改订单价格
		editOrderMoney(item){
			
		},
		//发送支付提醒
		sendPayMessage() {},
		//发货
		addDelivery(item) {
			orderAdmin("addDelivery",{
				_id:item._id,
			}).then(res=>{
				this.$api.msg("发货成功");
				item.state = 2;
				let { stateTip, stateTipColor } = this.orderStateExp(item);
				item.stateTip = stateTip;
				item.stateTipColor = stateTipColor;
			},err=>{
				this.$api.msg("发货失败");
			})
		},
		navToOrderDetail(item) {
			uni.setStorage({
				key: 'orderDetail',
				data: item
			});
			uni.navigateTo({
				url: `/pages/admin/orderDetail?id=${item._id}`
			});
		},
		//订单状态文字和颜色
		orderStateExp(item) {
			return getOrderStateExp(item);
		},
		//刷新页面数据
		refreshList(){
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
.content {
	background: $page-color-base;
	height: 100%;
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
	}
	.address{
		font-size: $font-base;
		color: $font-color-warning;
		text-align: right;
		padding-right: 30upx;
	}
}
.m-r{
	margin-right: 14upx;
}
.m-l{
	margin-left: 20upx;
}
</style>
