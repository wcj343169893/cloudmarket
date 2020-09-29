<template>
	<view class="container">
		<view class="header b-b">
			<text>退款单号:{{id}}</text>
			<text>申请时间:{{created | dateFormat('yyyy-MM-dd hh:mm:ss')}}</text>
		</view>
		<view class="money">
			<view class="">
				<text>退款金额</text>
				<text class="price">{{fee/100 | toFixed}}</text>
			</view>
			<view class="">
				<text>{{stateTip}}</text>
			</view>
		</view>
		<view class="header header2 b-b">
			<text>退款进度</text>
		</view>
		<view class="steps" v-if="steps && steps.length>0">
			<cloud-steps :options="steps" direction="column" :active="0"></cloud-steps>
		</view>
		<view class="header header2 b-b">
			<text>退款类型</text>
		</view>
		<view class="content">
			<text>{{refundType}}</text>
		</view>
		<view class="header header2 b-b">
			<text>退款原因</text>
		</view>
		<view class="content">
			<text>{{refundReason}}</text>
		</view>
		<view class="header header2 b-b">
			<text>问题描述</text>
		</view>
		<view class="content">
			<text v-if="refundContent">{{refundContent}}</text>
			<text v-else>无</text>
			<view class="imgs" v-if="refundImgs && refundImgs.length>0">
				<view v-for="(item,index) in refundImgs" :key="index" @click="preview(refundImgs,index)">
					<image :src="item" mode="aspectFill"></image>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		dateFormat
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				id: "",
				created: "",
				fee: 0,
				stateTip: "",
				refundType: "",
				refundReason: "",
				refundContent: "",
				steps: [],
				refundImgs: [],
				goods: {}
			};
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				let detail = uni.getStorageSync("refundDetail");
				console.log(detail)
				for (let key in detail) {
					//处理step的时间
					if (key == "steps") {
						detail[key].forEach(step => {
							step.time = dateFormat(step.time, "yyyy-MM-dd hh:mm:ss")
						})
					}
					this[key] = detail[key]
				}
			},
			preview(urls, index) {
				uni.previewImage({
					urls: urls,
					current: index
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

	.header {
		margin-top: 20rpx;
		background-color: #FFFFFF;
		position: relative;
		display: flex;
		justify-content: space-between;
		padding: 20upx $page-row-spacing;
		color: $font-color-base;
		font-size: $font-sm;
	}

	.header2 {
		font-size: $font-base;
		color: $font-color-dark;
		font-weight: 400;
	}

	.money {
		background-color: #FFFFFF;
		text-align: center;
		padding: 20upx $page-row-spacing;
		line-height: 2;
		font-weight: 400;
	}

	.steps {
		background-color: #FFFFFF;
	}

	.content {
		background-color: #FFFFFF;
		padding: 20upx $page-row-spacing;
		font-size: $font-sm;
	}

	.imgs {
		display: flex;
		flex-wrap: wrap;
		margin-top: 12rpx;

		image {
			width: 120rpx;
			height: 120rpx;
			margin-right: 16rpx;
			border-radius: 12rpx;
		}
	}
</style>
