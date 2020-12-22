<template>
	<view>
		<mix-list-cell icon="taobaofont icon-circle" iconColor="#54b4ef" title="专题活动" @eventClick="navTo('/pages/admin/activities/special/list')"></mix-list-cell>
		<mix-list-cell icon="taobaofont icon-activity" iconColor="#54b4ef" title="限时秒杀" @eventClick="navTo('/pages/admin/goods/miaosha/list')"></mix-list-cell>
		<mix-list-cell icon="icon-fenlei1" iconColor="#54b4ef" title="优惠券" @eventClick="navTo('/pages/admin/coupon/list')"></mix-list-cell>
	</view>
</template>

<script>
	export default {
		data() {
			return {

			};
		}
	}
</script>

<style lang="scss">
	page {
		background: #FFFFFF;
	}
</style>
