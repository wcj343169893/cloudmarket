<template>
	<view class="">
		<view class="admin-section">
			<view class="admin-shops b-b" @click="edit">
				<image :src="src" mode="aspectFill"></image>
				<view class="right">
					<view class="content">
						<view class="title clamp">
							<text>{{name}}</text>
							<text v-if="!state" class="desc">（审核中）</text>
							<text class="price margin-left-xxs">{{commission | toFixed}}</text>
						</view>
						<view class="desc">
							<text>{{address}}</text>
						</view>
					</view>
					<text class="yticon icon-you"></text>
				</view>
			</view>
		</view>
		<!-- <view class="flex justify-between padding-xl bg-green margin radius">
			<view class="flex flex-column align-center" @click="btnZitiScan()">
				<text class="yticon icon-saomiao xxl"></text>
				<text class="">扫码提货</text>
			</view>
			<view class="flex flex-column align-center" @click="btnZiti()">
				<text class="yticon icon-bianji xxl"></text>
				<text class="">输码提货</text>
			</view>
			<view class="flex flex-column align-center">
				<text class="yticon icon-shouhoutuikuan xxl"></text>
				<text class="">收入记录</text>
			</view>
		</view> -->
		<scroll-view scroll-x class="bg-green nav text-center">
			<view class="cu-item" :class="0==tabCur?'text-white cur':''" @tap="tabSelect" data-id="0" data-state="2">
				<text>待提货</text>
			</view>
			<view class="cu-item" :class="1==tabCur?'text-white cur':''" @tap="tabSelect" data-id="1" data-state="1">
				<text>待入库</text>
			</view>
			<view class="cu-item" :class="2==tabCur?'text-white cur':''" @tap="tabSelect" data-id="2" data-state="3">
				<text>已收货</text>
			</view>
		</scroll-view>
		<view class="orderlist">
			<view v-for="(item,index) in dataList" :key="index" :class="[item.shop.currency]" class="order-item">
				<view class="i-top b-b">
					<text class="time">{{ item.created | dateFormat('yyyy-MM-dd hh:mm:ss') }}</text>
					<view class="state" v-if="item.raisingPoint">
						<text>佣金</text>
						<text class="price warning">{{item.raisingPoint.commission | toFixed}}</text>
					</view>
				</view>
				<view class="">
					<view class="goods-box-single" v-for="(goodsItem, goodsIndex) in item.goods" :key="goodsIndex">
						<image class="goods-img" :src="goodsItem.src" mode="aspectFill"></image>
						<view class="right">
							<view class="">
								<text class="title">{{ goodsItem.title }}</text>
							</view>
							<text class="attr-box" v-if="goodsItem.subName && goodsItem.subName.length > 0">{{ goodsItem.subName }}</text>
							<view class="attr-box">
								<text>单价:</text>
								<text class="price">{{ goodsItem.price | toFixed }}</text>
								<text>数量:</text>
								<text class="text-lg">{{ goodsItem.amount }}</text>
							</view>
						</view>
					</view>
				</view>
				<view class="price-box">
					<text class="num margin-right-xs">共{{ item.cartCount }}件</text>
					<text class="">总金额</text>
					<text class="price">{{item.totalMoney}}</text>
				</view>
				<view class="price-box" v-if="item.selfRaising" @click="tel(item.selfRaising.mobile)">
					<text class="margin-right-xs">{{item.selfRaising.name}}</text>
					<text class="">{{item.selfRaising.mobile}}</text>
				</view>
				<view class="price-box" v-if="item.deliveryHour">
					<text class="margin-right-xs">提货时间</text>
					<text class="margin-right-xs">{{item.deliveryHour.id | dateFormat('yyyy-MM-dd')}}</text>
					<text class="">{{item.deliveryHour.time}}</text>
				</view>
				<view class="price-box" v-if="item.deliveryHour">
					<text class="margin-right-xs">提货码</text>
					<text class="margin-right-xs text-red text-lg">{{item.deliveryHour.number}}</text>
					<text class=" text-red text-lg">{{item.deliveryHour.password}}</text>
				</view>
				<view class="action-box b-t" v-if="item.state == 2">
					<button class="action-btn recom" @click.stop="makesure(item,index)">确定提货</button>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		data() {
			return {
				_id: "",
				address: "",
				latitude: 0,
				longitude: 0,
				state: 0,
				commission: 0,
				mobile: "",
				name: "",
				src: "",
				dataList: [],
				tabCur: 0,
				orderState: 2
			};
		},
		onLoad() {
			this.loadInfo();
			this.loadData();
		},
		//滑到底部加载更多
		onReachBottom() {
			if (this.loadingType != 'noMore') {
				this.loadData();
			}
		},
		methods: {
			loadInfo() {
				this.getItemData(true);
			},
			async loadData() {
				this.page++;
				this.loadingType = "loading";
				if (this.page == 1) {
					this.dataList = [];
				}
				cloudMall("order", "listbyraisingpoint", {
					id: this._id,
					state: this.orderState,
					page: this.page,
					limit: this.limit
				}, false).then(res => {
					console.log(res)
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
					this.dataList = this.dataList.concat(res);
				}, err => {
					this.loadingType = "noMore";
				})
			},
			edit() {
				this.navTo('/pages/selfraisingpoint/add?id=${this._id}');
			},
			makesure(item, index) {
				uni.showModal({
					title: "提货提醒",
					content: "请核对提货码后再确定提货！！",
					success: (res) => {
						if (res.confirm) {
							cloudMall("order", "makesurebyraising", {
								id: item._id,
								rid: this._id,
							}).then(res => {
								this.$api.success("提货成功");
								this.dataList.splice(index, 1)
							}, err => {})
						}
					}
				})
			},
			tel(phone) {
				uni.makePhoneCall({
					phoneNumber: phone
				})
			},
			tabSelect(e) {
				this.tabCur = e.currentTarget.dataset.id;
				this.page = 0;
				this.orderState = e.currentTarget.dataset.state;
				this.loadData();
			}
		}
	}
</script>

<style lang="scss">
	.admin-section {
		padding: 10upx 0 0 30upx;
		background: #fff;
		font-size: $font-base;

		.admin-shops {
			display: flex;
			margin-top: 20upx;
			position: relative;
			padding-bottom: 20upx;
			//align-items: center;
			padding-right: 30upx;

			&:last-child::after {
				display: none;
			}
		}

		.right {
			display: flex;
			align-items: center;
			flex: 1;
		}

		image {
			width: 120upx;
			height: 120upx;
			border-radius: 4%;
			margin-right: 20upx;
		}

		.title {
			font-size: $font-lg;
		}

		.content {
			flex: 1;
			margin-right: 20upx;
		}

		.desc {
			margin-top: 12rpx;
			font-size: $font-base;
			color: $font-color-disabled;
		}

		.orders {
			display: flex;
			justify-content: space-between;
			padding-top: 12upx;

			view {
				display: flex;
				flex-direction: column;
				text-align: center;
			}
		}

		.num {
			color: $font-color-warning;
			font-size: $font-lg;
			font-weight: 500;
		}
	}

	.order-item {
		display: flex;
		flex-direction: column;
		padding-left: 30upx;
		background: #fff;
		margin-bottom: 16upx;

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
				color: $font-color-warning;
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
				width: 80upx;
				height: 80upx;
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
			padding: 10upx 30upx;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
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

			&.disabled {
				background-color: $font-color-disabled;
				color: #fff;
			}
		}
	}
</style>
