<template>
	<view class="container">
		<empty v-if="loaded === true && refundList.length === 0"></empty>
		<view v-for="(item, index) in refundList" :key="index" class="items">
			<view class="header b-b">
				<text>退款单号:</text>
				<text>{{item.id}}</text>
			</view>
			<view class="content b-b" @click="navToDetail(item)">
				<view class="content-text">
					<view class="state">
						<text>{{item.stateTip}}</text>
					</view>
					<text class="desc">{{item.stateContent}}</text>
				</view>
				<text class="yticon icon-you"></text>
			</view>
			<view class="goods-box-single">
				<image class="goods-img" :src="item.goods.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title">{{ item.goods.title }}</text>
					</view>
					<view class="attr-box">
						<text>数量:</text>
						<text>{{item.refundApplyAmount}}</text>
					</view>
				</view>
			</view>
		</view>
		<uni-load-more :status="loadingType"></uni-load-more>
	</view>
</template>

<script>
	import {
		refunds
	} from '@/common/request.js';
	export default {
		data() {
			return {
				refundList: []
			};
		},
		onLoad() {
			this.loadData()
		},
		methods: {
			async loadData() {
				this.page++;
				refunds("getRefundApplys", {
					page: this.page,
					limit: this.limit
				}, false).then(res => {
					this.loaded = true;
					this.buildData(res);
					if (this.page == 1) {
						this.refundList = res;
					} else {
						this.refundList = Object.assign(this.refundList, res)
					}
					if (res.length < this.limit) {
						this.loadingType = "noMore";
					}
				},err=>{
					this.loadingType = "noMore";
					this.loaded = true;
				})
			},
			buildData(data) {
				let payname = "";
				data.forEach(item => {
					let step= item.steps[0];
					item.stateTip =step.title;
					item.stateContent =step.desc;
				})
			},
			navToDetail(item) {
				uni.setStorage({
					key: "refundDetail",
					data: item,
					success: () => {
						this.navTo('/pages/order/refundDetail')
					}
				})
			}
		}
	}
</script>

<style lang="scss">
	page,
	.container {
		background: $background-color;
		font-size: $font-base;
	}

	.items {
		background: #FFFFFF;
		margin-top: 20rpx;
		padding: 20rpx 0 20rpx 0rpx;
	}

	.goods-box-single {
		display: flex;
		padding: 20upx $page-row-spacing;

		.goods-img {
			display: block;
			width: 100upx;
			height: 100upx;
			border-radius: 4%;
		}

		.right {
			flex: 1;
			display: flex;
			flex-direction: column;
			padding: 0 30upx 0 24upx;
			overflow: hidden;

			.title {
				font-size: $font-base;
				color: $font-color-dark;
				line-height: 1;
			}

			.attr-box {
				font-size: $font-sm;
				color: $font-color-light;
				padding: 8upx 0upx 0;
			}
		}
	}

	.header {
		padding: 20rpx $page-row-spacing;
		position: relative;
		font-size: $font-sm;
	}

	.content {
		display: flex;
		align-items: center;
		position: relative;
		padding: 20rpx $page-row-spacing;

		.content-text {
			flex: 1;
		}

		.desc {
			font-size: $font-sm;
			color: $font-color-base;
		}

		.yticon {
			color: $font-color-light;
		}
	}
</style>
