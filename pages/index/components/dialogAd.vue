<template>
	<view v-if="isShow" class="ad_dialog" @click="close">
		<view class="content" :style="imageStyle">
			<uni-icons class="content-image-icon" type="closeempty" size="50" color="#ffffff"></uni-icons>
			<image :style="style" class="image" :src="ad.src" mode="aspectFill" @click.stop="navToAdDetail"></image>
		</view>
	</view>
</template>


<script>
	import {
		navToAdDetail,
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				//图片尺寸
				style: "",
				imageStyle: "",
				isShow: true
			};
		},
		props: {
			ad: {
				type: Object,
				default: {}
			}
		},
		created() {
			if (this.ad && this.ad.size) {
				let {
					width,
					height
				} = this.ad.size;
				let left = (this.systemInfo.windowWidth - uni.upx2px(width)) / 2;
				let top = (this.systemInfo.windowHeight - uni.upx2px(height)) / 2-30;
				//图片尺寸
				this.style = `width:${width}rpx;height:${height}rpx;`;
				this.imageStyle = `width:${width}rpx;height:${height}rpx;left:${left}px;top:${top}px;`;
			}
		},
		methods: {
			navToAdDetail() {
				navToAdDetail(this.ad);
				this.isShow = false;
			},
			close() {
				this.isShow = false;
			}
		}
	}
</script>

<style lang="scss" scoped>
	.ad_dialog {
		position: fixed;
		top: 0;
		z-index: 990;
		left: 0;
		background: rgba(0, 0, 0, 0.26);
		width: 100%;
		height: 100%;

		.content {
			width: 750rpx;
			height: 200rpx;
			display: block;
			position: absolute;
		}

		.content-image-icon {
			position: absolute;
			z-index: 8;
			bottom: -140rpx;
			left: calc(50% - 60rpx);
			background: #ccc;
			border-radius: 50%;
			padding: 0 4rpx;
		}
	}
</style>
