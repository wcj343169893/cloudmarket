<template>
	<view class="goods_sku_container">
		<view class="mix-list-cell b-b" v-if="name != ''">
			<text class="index">{{index+1}}</text>
			<text class="cell-content title">{{ name }}</text>
			<text class="yticon icon-iconfontshanchu1" v-if="ismultiple" @click="delSku()"></text>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*库存总量</text>
			<input type="number" class="cell-content" v-model="stock" placeholder="请输入库存总量" />
			<text class="yticon icon-shanchu4" @click="cleanInput('stock')"></text>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">市场价格</text>
			<input type="digit" class="cell-content" v-model="originPrice" placeholder="请输入市场价" />
			<text class="cell-tip">留空或0不显示</text>
			<text class="yticon icon-shanchu4" @click="cleanInput('originPrice')"></text>
		</view>
		<view class="mix-list-cell">
			<text class="cell-tit clamp">*销售价格</text>
			<input type="digit" class="cell-content" v-model="price" placeholder="请输入销售价" />
			<text class="yticon icon-shanchu4" @click="cleanInput('price')"></text>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				id: 0,
				stock: 0,
				originPrice: 0,
				price: 0,
				realName: '',
				name: '',
				isInit: true
			};
		},
		props: {
			index: {
				type: Number,
				default: 0
			},
			title: {
				type: String,
				default: '标题'
			},
			ismultiple: {
				type: Boolean,
				default: false
			},
			info: {
				type: Object,
				default: {}
			}
		},
		watch: {
			price(newVal, OldVal) {
				this.change();
			},
			originPrice(newVal, OldVal) {
				this.change();
			},
			stock(newVal, OldVal) {
				this.change();
			},
			info(newVal, OldVal) {
				this.setData();
			}
		},
		created() {
			if (this.info) {
				this.setData();
			}
			setTimeout(() => {
				this.isInit = false;
			}, 500);
		},
		methods: {
			async setData() {
				this.id = this.info.id;
				this.price = this.info.price;
				this.originPrice = this.info.originPrice;
				this.stock = this.info.stock;
				if (this.info.name != '') {
					this.realName = this.info.name;
					this.name = this.info.name ? this.info.name.replace('&gt;', ' - ') : "";
				}
			},
			cleanInput(name) {
				this[name] = "";
			},
			change() {
				if (this.isInit) {
					return;
				}
				let info = {
					id: this.id,
					price: +this.price,
					originPrice: +this.originPrice,
					stock: +this.stock,
					name: this.realName
				};
				this.$emit('change', this.index, info);
			},
			delSku() {
				this.$emit('del', this.index);
			}
		}
	};
</script>

<style lang="scss">
	.goods_sku_container {
		background-color: #ffffff;
		border-radius: 20upx;
		position: relative;
	}

	.icon .mix-list-cell.b-b:after {
		left: 90upx;
	}

	.mix-list-cell {
		display: flex;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		.index {
			margin-right: 10upx;
		}

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

		.cell-tit {
			font-size: $font-base;
			color: $font-color-dark;
			margin-right: 20upx;
		}

		.cell-content {
			flex: 1;
			font-size: $font-sm + 2upx;

			&.title {
				font-weight: 500;
			}
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
			margin-right: 8upx;
		}
	}

	.icon-iconfontshanchu1 {
		font-size: $font-lg + 4upx;
		color: $font-color-warning;
	}

	.icon-shanchu4 {
		color: $font-color-disabled;
	}
</style>
