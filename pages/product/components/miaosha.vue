<template>
	<view class="miaosha-section" :class="{ ready: !miaosha.isStart }">
		<view class="title">
			<text class="name">限时抢购</text>
			<text class="status">{{ miaosha.statusName }}</text>
		</view>
		<view class="time" v-if="!miaosha.isEnd">
			<text>{{ miaosha.statusSubName }}</text>
			<text class="ti hour">{{ miaosha.hour }}</text>
			<text>:</text>
			<text class="ti minute">{{ miaosha.minute }}</text>
			<text>:</text>
			<text class="ti second">{{ miaosha.second }}</text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		props:{
			miaosha:{
			type: Object,
				default: {}
			},
		}
	}
</script>

<style lang="scss">
.miaosha-section {
		$base-c: #e35650;
		display: flex;
		background: $base-c;
		font-size: $font-ssm;
		text-align: center;
		height: 43px;
		align-items: center;

		.title {
			flex: 1;
			color: #fff;

			.name {
				font-size: $font-base;
				margin-right: 12upx;
			}
		}

		.time {
			color: $base-c;
			width: 266upx;
			background: #fcefea;
			height: 100%;
			display: flex;
			align-items: center;
			justify-content: center;

			.ti {
				background: $base-c;
				color: #fff;
				margin: 0 8upx;
				padding: 0 4upx;
			}
		}

		/* 准备中 */
		&.ready {
			$base-c: #54b85d;
			background: $base-c;

			.time {
				color: $base-c;
				background: #f3f5f3;

				.ti {
					background: $base-c;
				}
			}
		}
	}
</style>
