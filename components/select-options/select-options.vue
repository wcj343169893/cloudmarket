<template>
	<view class="select-container">
		<view class="mix-list-cell" :class="border" @click="selectSpecsType" hover-class="cell-hover" :hover-stay-time="50">
			<text class="cell-tit clamp">{{ title }}</text>
			<text class="cell-more yticon" :class="typeList[navigateType]"></text>
		</view>

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

<!-- 与mix-list-select的区别在于，这里只有title,而且只有单选 -->
<script>
export default {
	data() {
		return {
			title: '请选择',
			def: '',
			typeList: {
				left: 'icon-zuo',
				right: 'icon-you',
				up: 'icon-shang',
				down: 'icon-xia'
			}
		};
	},
	props: {
		navigateType: {
			type: String,
			default: 'down'
		},
		border: {
			type: String,
			default: ''
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
	watch: {
		options(op) {
			console.log('select options changed');
			this.setDefaultValue();
		}
	},
	created() {
		this.setDefaultValue();
	},
	methods: {
		setDefaultValue() {
			if (this.defaultOption != '') {
				//console.log('this.defaultOption', this.defaultOption);
				this.title = this.options[this.defaultOption];
				this.def = this.defaultOption;
			}
		},
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

<style lang="scss" scoped>
.mix-list-cell {
	display: flex;
	align-items: baseline;
	padding: 20upx 10upx;
	line-height: 60upx;
	position: relative;
	margin-right: 10upx;

	&.cell-hover {
		background: #fafafa;
	}
	.cell-tit {
		font-size: $font-base;
		color: $font-color-dark;
		margin-right: 10upx;
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
