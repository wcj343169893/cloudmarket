<template>
	<view class="container">
		<mix-list-cell :title="title" border="" :navigateType="navigateType" @eventClick="selectSpecsType()"></mix-list-cell>
		<uni-popup ref="showSpecsType" type="center">
			<view class="popup">
				<radio-group name="" @change="changeSpecsType">
					<block v-for="(item, index) in options" :key="index">
						<label class="mix-list-cell b-b">
							<text class="cell-tit clamp">{{ item }}</text>
							<radio :value="index" :checked="def == index" />
						</label>
					</block>
				</radio-group>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			title: '请选择',
			def: ''
		};
	},
	props: {
		navigateType: {
			type: String,
			default: 'down'
		},
		options: {
			type: Object,
			default: {}
		},
		defaultOption: {
			type: String,
			default: ''
		}
	},
	created() {
		if (this.defaultOption != '') {
			console.log('this.defaultOption', this.defaultOption);
			this.title = this.options[this.defaultOption];
			this.def = this.defaultOption;
		}
	},
	methods: {
		selectSpecsType() {
			this.$refs['showSpecsType'].open();
		},
		changeSpecsType(n) {
			let val = n.detail.value;
			this.def = val;
			this.title = this.options[val];
			this.$emit('eventClick', val);
			this.$refs['showSpecsType'].close();
		}
	}
};
</script>

<style lang="scss">
.mix-list-cell {
	display: flex;
	align-items: baseline;
	padding: 20upx $page-row-spacing;
	line-height: 60upx;
	position: relative;

	&.cell-hover {
		background: #fafafa;
	}
	.cell-tit {
		font-size: $font-base;
		color: $font-color-dark;
		margin-right: 20upx;
	}
}
.popup {
	width: 700upx;
	background: #ffffff;
	border-radius: 12upx;
	.cell-tit {
		flex: 1;
	}
}
</style>
