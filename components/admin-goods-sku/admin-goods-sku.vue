<template>
	<view class="container">
		<view class="mix-list-cell b-b" v-if="name != ''">
			<text class="cell-tit clamp">*名称</text>
			<input type="text" class="cell-content" :value="name" />
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*库存总量</text>
			<input type="number" class="cell-content" v-model="stock" placeholder="请输入库存总量" />
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">市场价格</text>
			<input type="number" class="cell-content" v-model="originPrice" placeholder="请输入市场价" />
			<text class="cell-tip">0为不显示</text>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*销售价格</text>
			<input type="number" class="cell-content" v-model="price" placeholder="请输入销售价" />
		</view>
	</view>
</template>

<script>
export default {
	data() {
		return {
			stock: 0,
			originPrice: 0,
			price: 0,
			name: ''
		};
	},
	props: {
		title: {
			type: String,
			default: '标题'
		},
		info: {
			type: Object,
			default: {}
		}
	},
	watch: {},
	created() {
		if (this.info) {
			this.price = this.info.price;
			this.originPrice = this.info.originPrice;
			this.stock = this.info.stock;
			if (this.info.name != '') {
				this.name = this.info.name;
			}
		}
	},
	methods: {
		eventClick() {
			this.$emit('eventClick');
		}
	}
};
</script>

<style lang="scss">
.icon .mix-list-cell.b-b:after {
	left: 90upx;
}
.mix-list-cell {
	display: flex;
	align-items: baseline;
	padding: 20upx $page-row-spacing;
	line-height: 60upx;
	position: relative;

	&.cell-hover {
		background: #fafafa;
	}
	&.b-b:after {
		left: 30upx;
	}

	.cell-icon {
		align-self: center;
		width: 56upx;
		max-height: 60upx;
		font-size: 38upx;
	}
	.cell-more {
		align-self: center;
		font-size: 30upx;
		color: $font-color-base;
		margin-left: $uni-spacing-row-sm;
	}
	.cell-tit {
		font-size: $font-base;
		color: $font-color-dark;
		margin-right: 20upx;
	}
	.cell-content {
		flex: 1;
		font-size: $font-sm + 2upx;
	}
	.cell-tip {
		flex: 1;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		text-align: right;
	}
}
</style>
