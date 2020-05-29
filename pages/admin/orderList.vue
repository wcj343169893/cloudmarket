<template>
	<view></view>
</template>

<script>
export default {
	data() {
		return {
			shopid: 0,
			state: 0
		};
	},
	onLoad(options) {
		this.shopid = options.id;
		this.state = options.state;
	},
	methods: {
		async loadData() {
			
		}
	}
};
</script>

<style lang="scss"></style>
