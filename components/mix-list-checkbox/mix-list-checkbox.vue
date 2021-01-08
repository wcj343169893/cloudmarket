<template>
	<view class="checkbox-container bg-white">
		<view v-if="type=='switch'" class="mix-list-cell" :class="[border,type]" hover-class="cell-hover">
			<text class="cell-tit clamp">{{ title }}</text>
			<view class="cell-content">
			</view>
			<text class="cell-tip">{{tips}}</text>
			<view class="cell-more">
				<switch :checked="!!content" :class="!!content?'checked':''" @change="changeSwitch" />
			</view>
		</view>
		<view v-else-if="type=='checkbox'" class="mix-list-cell" :class="[border,type]">
			<text class="cell-tit clamp">{{ title }}</text>
			<view class="cell-content content-right">
				<checkbox-group :name="field" @change="changeContent">
					<block v-for="(item,index) in options" :key="index">
						<label>
							<text class="m-r">{{item}}</text>
							<checkbox :value="index" :class="checkedList.indexOf(index) != -1?'checked':''" :checked="checkedList.indexOf(index) != -1" />
						</label>
					</block>
				</checkbox-group>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				content: '',
				//多选已选择
				checkedList: [],
			};
		},
		props: {
			title: {
				type: String,
				default: '标题'
			},
			field: {
				type: String,
				default: ''
			},
			border: {
				type: String,
				default: 'b-b'
			},
			tips: {
				type: String,
				default: ''
			},
			type: {
				type: String,
				default: 'switch'
			},
			isMust: {
				type: Boolean,
				default: false
			},
			defContent: {
				type: [String, Number, Boolean],
				default: ''
			},
			options: {
				type: Object,
				default: () => {}
			},
			defaultOption: {
				type: [String, Number],
				default: ''
			},
			defaultOptions: {
				type: Array,
				default: () => []
			},
			value: [Boolean, Number, String, Array],
		},
		watch: {
			value(newVal) {
				if (newVal && newVal.length != undefined) {
					this.checkedList = newVal;
				} else {
					this.content = newVal;
				}
			},
			defContent(val, oldVal) {
				if (val != oldVal) {
					this.content = val;
				}
				console.log(val)
			},
			defaultOptions(val, oldVal) {
				if (val != oldVal) {
					this.checkedList = val;
				}
				console.log(val)
			}
		},
		created() {
			if (this.value && this.value.length != undefined) {
				this.checkedList = this.value;
			} else {
				this.content = this.value;
			}
			if (this.defContent) {
				this.content = this.defContent;
			}
			if (this.defaultOptions) {
				this.checkedList = this.defaultOptions
			}
		},
		methods: {
			changeContent(e) {
				this.checkedList = e.detail.value;
				this.$emit('input', e.detail.value);
				this.$emit('change', e.detail.value, this.field);
			},
			blurContent(e) {
				this.$emit('blur', e.detail.value, this.field);
			},
			changeSwitch(e) {
				this.content = e.detail.value;
				this.$emit('input', e.detail.value);
				this.$emit('change', !!e.detail.value, this.field);
			},
		}
	}
</script>


<style lang="scss" scoped>
	.checkbox-container {
		.mix-list-cell {
			display: flex;
			align-items: center;
			padding: 20upx $page-row-spacing;
			line-height: 60upx;
			position: relative;

			&.b-b:after {
				left: 30upx;
			}

			&.cell-hover {
				background: #fafafa;
			}

			.cell-tit {
				font-size: $font-base;
				color: $font-color-dark;
				margin-right: 20upx;
			}

			.cell-tip {
				font-size: $font-sm;
				color: $font-color-light;
				max-width: 400upx;
			}

			.cell-content {
				flex: 1;
				font-size: $font-sm + 2upx;
				color: $font-color-light;
				text-align: right;
				height: 60rpx;

				&.content-left {
					text-align: left;
				}

				&.normal {
					color: $font-color-dark;
				}
			}

			.cell-more {
				align-self: center;
				font-size: 30upx;
				color: $font-color-base;
				margin-left: $uni-spacing-row-sm;
			}

			&.checkbox {
				.cell-content {
					height: auto;
				}

				checkbox-group {
					display: flex;
					flex-direction: column;
				}
			}
		}

		.m-r {
			margin-right: 12rpx;
		}
	}

	.desc {
		font-size: $font-sm;
		color: $font-color-disabled;
	}

	.cell-more.yticon {
		font-size: $font-llg;
		margin-left: 16rpx;
	}
</style>
