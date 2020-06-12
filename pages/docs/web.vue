<template>
	<view class="container">
		<web-view :src="src"></web-view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				src:"_blank"
			}
		},
		onLoad(options) {
			this.src = options.url;
			this.loadData();
		},
		methods: {
			async loadData(){
				var pages = getCurrentPages();
				var page = pages[pages.length - 1];
				// #ifdef APP-PLUS
				var currentWebview = page.$getAppWebview();
				console.log(currentWebview.id);//获得当前webview的id
				console.log(currentWebview.isVisible());//查询当前webview是否可见
				// #endif
			}
		}
	}
</script>

<style>

</style>
