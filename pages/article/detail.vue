<template>
	<view class="app column bg-white">
		<jyf-parser ref="article" :html="content" lazy-load show-with-animation></jyf-parser>
	</view>
</template>

<script>
	import {
		cloudMall
	} from '@/common/request.js';
	export default {
		data() {
			return {
				id: "",
				content: ""
			};
		},
		onLoad(options) {
			this.id = options.id;
			this.loadData();
		},
		methods: {
			async loadData() {
				cloudMall("article", "detail", {
					id: this.id
				}).then(res => {
					console.log(res)
					uni.setNavigationBarTitle({
						title: res.title
					})
					this.content = res.content.replace(/\<img/gi,
						'<img style="width:auto;height:auto;max-width:750rpx;border-radius: 6rpx;display:block;"')
				})
			}
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #FFFFFF;
	}
</style>
