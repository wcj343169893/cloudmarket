<template>
	<view class="introduce-section">
		<text class="title">{{ title }}</text>
		<view class="sub-title" v-if="subTitle && subTitle != ''">
			<text>{{ subTitle }}</text>
		</view>
		<view class="price-box">
			<text class="price">{{ price }}</text>
			<block v-if="originPrice > 0 && originPrice > price">
				<text class="price del">{{ originPrice }}</text>
				<text class="coupon-tip">{{ zhekou }}折</text>
			</block>
		</view>
		<view class="bot-row">
			<text>月售: {{ monthlySale }}</text>
			<text>库存: {{ stock }}</text>
			<text>浏览量: {{ visite }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		},
		props: {
			title: {
				type: String,
				default: ""
			},
			subTitle: {
				type: String,
				default: ""
			},
			price: {
				type: Number,
				default: 0
			},
			originPrice: {
				type: Number,
				default: 0
			},
			zhekou: {
				type: [Number,String],
				default: 0
			},
			monthlySale: {
				type: Number,
				default: 0
			},
			stock: {
				type: Number,
				default: 0
			},
			visite: {
				type: Number,
				default: 0
			},
		}
	}
</script>

<style lang="scss">
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
</style>
