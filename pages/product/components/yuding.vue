<template>
	<view class="yuding">
		<view class="yuding-section" :class="{ ready: !yuding.isBegin }">
			<view class="title">
				<view class="sub-title">
					<text class="name">定&nbsp;金</text>
					<text class="price">{{ yuding.price }}</text>
				</view>
				<view class="">
					<text class="name">预售价</text>
					<text class="price">{{ yudingPrice }}</text>
				</view>
			</view>
			<view class="time-area">
				<view class="">
					<text>{{ yuding.statusSubName }}:</text>
				</view>
				<view class="time">
					<text class="ti hour">{{ yuding.hour }}</text>
					<text>:</text>
					<text class="ti minute">{{ yuding.minute }}</text>
					<text>:</text>
					<text class="ti second">{{ yuding.second }}</text>
				</view>
			</view>
		</view>
		<view class="introduce-section">
			<text class="title">{{ title }}</text>
			<view class="sub-title" v-if="subTitle && subTitle != ''">
				<text>{{ subTitle }}</text>
			</view>
			<view class="info-box" v-if="!yuding.isBegin">
				<text class="name">定金</text>
				<view class="desc">
					<text class="price">{{ yuding.price }}</text>
					<text>({{ yuding.beginTime | dateFormat('MM月dd日hh:mm') }}-{{ yuding.endTime | dateFormat('MM月dd日hh:mm') }})</text>
				</view>
			</view>
			<view class="info-box">
				<text class="name">尾款</text>
				<view class="desc">
					<text class="price">{{ yudingFinalPay }}</text>
					<text>({{ yuding.finalPaymentBeginTime | dateFormat('MM月dd日hh:mm') }}-{{ yuding.finalPaymentEndTime | dateFormat('MM月dd日hh:mm') }})</text>
				</view>
			</view>
			<view class="info-box">
				<text class="name">流程</text>
				<text>1.付定金-2.付尾款-3.发货</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			}
		},
		props: {
			yuding: {
				type: Object,
				default: {}
			},
			price: {
				type: [Number,String],
				default: 0
			},
			title: {
				type: String,
				default: ""
			},
			subTitle: {
				type: String,
				default: ""
			}
		},
		computed: {
			//定金
			yudingPrice() {
				return (this.price).toFixed(2);
			},
			//尾款
			yudingFinalPay() {
				return (this.price - this.yuding.price).toFixed(2);
			}
		},
		methods: {

		}
	}
</script>

<style lang="scss">
	.yuding-section {
		$base-c: #e35650;
		display: flex;
		align-items: center;
		background: $base-c;
		font-size: $font-ssm;
		text-align: center;
		color: #fff;

		.price {
			color: #fff;
			font-size: 1.4em;
		}

		.title {
			flex: 1;
			text-align: left;
			padding: 0 20upx;
			line-height: 1;

			.name {
				margin-right: 12upx;
			}
		}

		.sub-title {
			font-size: 1.2em;
			color: #fff;
		}

		.time-area {
			width: 266upx;
			background: #fcefea;
			padding: 12upx 0;
			color: $base-c;

			.time{
				margin-top: 8rpx;
			}
			.ti {
				background: $base-c;
				color: #fff;
				margin: 0 8upx;
				padding: 0 4upx;
			}
		}

		&.ready {
			$base-c: #54b85d;
			background: $base-c;

			.time-area {
				color: $base-c;
				background: #f3f5f3;

				.ti {
					background: $base-c;
				}
			}
		}
	}

	/* 标题简介 */
	.introduce-section {
		background: #fff;
		padding: 20upx 30upx;
		color: $font-color-dark;

		.title {
			font-size: $font-lg;
		}

		.info-box {
			display: flex;
			align-items: baseline;
			font-size: $font-sm;
			margin-bottom: 8upx;

			.name {
				margin-right: 18upx;
				font-weight: 500;
			}

			.desc {
				display: flex;
				flex-direction: column;
			}
		}

		.price-box {
			display: flex;
			align-items: baseline;
			height: 64upx;
			padding: 10upx 0;
			font-size: 26upx;
			color: $uni-color-primary;
		}

		.price {
			font-size: $font-lg + 2upx;
		}

		.m-price {
			margin: 0 12upx;
			color: $font-color-light;
			text-decoration: line-through;
		}

		.coupon-tip {
			align-items: center;
			padding: 4upx 10upx;
			background: $uni-color-primary;
			font-size: $font-sm;
			color: #fff;
			border-radius: 6upx;
			line-height: 1;
			transform: translateY(-4upx);
		}

		.bot-row {
			display: flex;
			align-items: center;
			height: 50upx;
			font-size: $font-sm;
			color: $font-color-light;

			text {
				flex: 1;
			}
		}
	}

	.sub-title {
		font-size: $font-sm;
		color: $font-color-disabled;
	}
</style>
