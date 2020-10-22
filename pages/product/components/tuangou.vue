<template>
	<view class="yuding">
		<view class="yuding-section" :class="{ ready: !tuangou.isBegin }">
			<view class="title">
				<view class="">
					<text class="price">{{ tuangou.price | toFixed }}</text>
					<text class="price del">{{ price | toFixed }}</text>
				</view>
			</view>
			<view class="time-area">
				<view class="">
					<text>{{ tuangou.statusSubName }}:</text>
				</view>
				<view class="time">
					<text class="ti hour">{{ tuangou.hour }}</text>
					<text>:</text>
					<text class="ti minute">{{ tuangou.minute }}</text>
					<text>:</text>
					<text class="ti second">{{ tuangou.second }}</text>
				</view>
			</view>
		</view>
		<view class="introduce-section">
			<text class="title">{{ title }}</text>
			<view class="sub-title" v-if="subTitle && subTitle != ''">
				<text>{{ subTitle }}</text>
			</view>
			<view class="info-box">
				<text class="name">已售</text>
				<text class="m-lr warning">{{monthlySale}}</text>
				<text>{{tuangou.unit}}</text>
				<text class="m-lr">/</text>
				<text>还剩</text>
				<text class="m-lr">{{stock}}</text>
				<text>{{tuangou.unit}}</text>
			</view>
			<view class="steps">
				<view class="step step1">
					<text class="dot"></text>
					<text class="name">开始</text>
					<text class="time">{{ tuangou.beginTime | dateFormat('MM-dd hh:mm') }}</text>
				</view>
				<view class="step step2">
					<text class="dot"></text>
					<text class="name">结束</text>
					<text class="time">{{ tuangou.endTime | dateFormat('MM-dd hh:mm') }}</text>
				</view>
				<view class="step step3">
					<text class="dot"></text>
					<text class="name">提货</text>
					<text class="time">{{ tuangou.pickup | dateFormat('MM-dd hh:mm') }}</text>
				</view>
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
			tuangou: {
				type: Object,
				default: {}
			},
			price: {
				type: Number,
				default: 0
			},
			stock: {
				type: Number,
				default: 0
			},
			monthlySale: {
				type: Number,
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
		methods: {

		}
	}
</script>

<style lang="scss" scoped>
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
			font-size: 1.6em;
		}

		.del {
			font-size: 1.2em;
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

			.time {
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
			margin: 8upx 0;
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

	.steps {
		margin-top: 30rpx;
		display: flex;
		font-size: $font-sm;
		justify-content: space-between;

		.step {
			display: flex;
			flex-direction: column;
			align-items: center;
			flex: 1;
			position: relative;

			&::after {
				content: " ";
				position: absolute;
				top: 12rpx;
				left: 50%;
				width: 50%;
				border: 2rpx solid $base-color;
			}

			&.step2::after {
				left: 0;
				width: 100%;
			}

			&.step3::after {
				left: 0;
			}
		}

		.dot {
			width: 24rpx;
			height: 24rpx;
			background: $base-color;
			border-radius: 50%;
		}

		.name {
			margin: 8rpx 0;
		}

		.time {
			font-size: $font-ssm;
		}
	}

	.m-lr {
		margin: 0 8rpx;
	}

	.warning {
		color: $font-color-warning;
	}
</style>
