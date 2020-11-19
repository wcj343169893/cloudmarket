<template>
	<view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		onLoad() {
			setTimeout(()=>{
				uni.switchTab({
					url:"/pages/index/fruit"
				})
			},100)
		}
	}
</script>

<style lang="scss">

</style>
