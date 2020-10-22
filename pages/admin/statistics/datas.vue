<template>
	<view class="container">
		<view class="menu">
			<view v-for="(item,index) in menus" :key="index" class="item" :class="{'checked':item.checked}">
				<text>{{item.name}}</text>
			</view>
		</view>
		<overviewPage v-if="menus[0].checked"></overviewPage>
	</view>
</template>

<script>
	import overviewPage from './components/overview.vue';
	export default {
		components: {
			overviewPage
		},
		data() {
			return {
				menus: [{
						name: "总览",
						checked: true
					},
					{
						name: "营业",
						checked: false
					},
					{
						name: "流量",
						checked: false
					},
					{
						name: "顾客",
						checked: false
					},
					{
						name: "商品",
						checked: false
					}
				]
			};
		}
	}
</script>

<style lang="scss" scoped>
	page,.container{
		background-color: $background-color;
	}
	.container{
		padding: 20rpx 0 0;
	}
	.menu {
		padding: 0 $page-row-spacing 20rpx;
		display: flex;
		justify-content: space-between;

		.item {
			border-bottom: 2rpx solid transparent;
			padding-bottom: 8rpx;

			&.checked {
				border-bottom-color: $font-color-emphasis;
			}
		}
	}
</style>
