<template>
	<view class="content">
		<text class="success-icon yticon icon-xuanzhong2"></text>
		<text class="tit">支付成功</text>

		<view class="btn-group">
			<navigator v-if="comefrom=='cart'" url="/pages/order/order?state=0" open-type="redirect" class="mix-btn">查看订单</navigator>
			<navigator v-if="comefrom=='order'" :delta="delta" open-type="navigateBack" class="mix-btn">查看订单</navigator>
			
			<navigator url="/pages/index/fruit" open-type="switchTab" class="mix-btn hollow">返回首页</navigator>
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			id:"",
			delta:1,
			comefrom:"cart"
		};
	},
	onLoad(options) {
		if (options.comefrom) {
			this.comefrom = options.comefrom;
		}
		console.log(options)
		this.id = options.id;
	},
	methods: {
	}
};
</script>

<style lang="scss">
.content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.success-icon {
	font-size: 160upx;
	color: #fa436a;
	margin-top: 100upx;
}
.tit {
	font-size: 38upx;
	color: #303133;
}
.btn-group {
	padding-top: 100upx;
}
.mix-btn {
	margin-top: 30upx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 600upx;
	height: 80upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $base-color;
	border-radius: 10upx;
	&.hollow {
		background: #fff;
		color: #303133;
		border: 1px solid #ccc;
	}
}
</style>
