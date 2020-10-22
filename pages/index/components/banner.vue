<template>
	<view class="ad_banner" @click="navToAdDetail">
		<image :style="style" class="image" :src="ad.src" mode="aspectFill"></image>
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
				style: ""
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
				//图片尺寸
				this.style = `width:${width}rpx;height:${height}rpx`;
			}
		},
		methods: {
			navToAdDetail() {
				navToAdDetail(this.ad)
			},
		}
	}
</script>

<style lang="scss" scoped>
	.ad_banner {
		.image {
			width: 750rpx;
			height: 200rpx;
			display: block;
		}
	}
</style>
