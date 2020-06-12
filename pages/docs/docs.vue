<template>
	<view class="container">
		<view class="markdown-body" v-html="content"></view>
	</view>
</template>

<script>
import marked from '@/common/marked.js';
import { getDocContent } from '@/common/request.js';
export default {
	data() {
		return {
			id: '',
			content:""
		};
	},
	onLoad(e) {
		this.id = e.id;
		this.loadData();
	},
	methods: {
		async loadData() {
			getDocContent({
				id: this.id
			}).then(res => {
				uni.setNavigationBarTitle({
					title:res.title
				})
				this.content = marked(res.content);
			});
		}
	}
};
</script>

<style lang="scss">
@import '@/common/github-markdown.css';
.container {
}
.markdown-body {
	box-sizing: border-box;
	min-width: 200px;
	max-width: 980px;
	margin: 0 auto;
	padding: 45px;
}
@media (max-width: 767px) {
	.markdown-body {
		padding: 15px;
	}
}
</style>
