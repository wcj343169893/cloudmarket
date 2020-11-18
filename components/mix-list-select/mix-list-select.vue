<template>
	<view class="select-container bg-white">
		<mix-list-cell :title="title" :tips="tips2" :border="border" :navigateType="navigateType" @eventClick="selectSpecsType()"></mix-list-cell>
		<uni-popup ref="showSpecsType" type="center">
			<view class="flex bg-white cu-dialog">
				<radio-group class="flex-sub" name="" @change="changeSpecsType" v-if="selectType == 'radio'">
					<label class="cu-form-group" v-for="(item, index) in options" :key="index">
						<view class="title">{{ item }}</view>
						<radio :value="index" :checked="def == index" :class="def == index ?'checked':''"></radio>
					</label>
				</radio-group>
				<block v-else>
					<checkbox-group name="" @change="checkSpecsType">
						<label class="cu-form-group margin-top" v-for="(item, index) in options" :key="index">
							<text class="title">{{ item }}</text>
							<checkbox :value="index + ''" :checked="isChecked(index)" :class="isChecked(index) ?'checked':''"/>
						</label>
					</checkbox-group>
					<view class="flex justify-center">
						<button class="cu-btn bg-white margin-right-xs" @click="canceled">取消</button>
						<button class="cu-btn bg-green" @click="next">确定</button>
					</view>
				</block>
			</view>
		</uni-popup>
	</view>
</template>

<!-- 与select-options的区别在于，这里可以单选或者多选，title为左边名称，tip为选中文字 -->
<script>
export default {
	data() {
		return {
			tips2: '',
			def: '',
			//多选已选择
			checkedList: [],
			//多选临时选择
			checkedListTmp: []
		};
	},
	props: {
		title: {
			type: String,
			default: '标题'
		},
		tips: {
			type: String,
			default: '请选择'
		},
		navigateType: {
			type: String,
			default: 'down'
		},
		border: {
			type: String,
			default: 'b-b'
		},
		options: {
			type: Object,
			default: () => {}
		},
		defaultOption: {
			type: [String,Number],
			default: ''
		},
		defaultOptions: {
			type: Array,
			default: () => []
		},
		//单选还是多选
		selectType: {
			type: String,
			default: 'radio'
		}
	},
	watch:{
		defaultOption(val){
			console.log("watch",val);
			this.tips2 = this.options[this.defaultOption];
			this.def = this.defaultOption;
		}
	},
	created() {
		if (this.defaultOption != '') {
			//单选默认值
			console.log('this.defaultOption', this.defaultOption,this.options);
			this.tips2 = this.options[this.defaultOption];
			this.def = this.defaultOption;
			//console.log(this.tips2)
		} else if (this.defaultOptions) {
			//多选，默认值
			this.$set(this, 'checkedList', this.defaultOptions);
			this.setTips2();
		} else {
			this.tips2 = this.tips;
		}
	},
	methods: {
		selectSpecsType() {
			this.$refs['showSpecsType'].open();
		},
		changeSpecsType(n) {
			let val = n.detail.value;
			this.def = val;
			this.tips2 = this.options[val];
			this.$emit('eventClick', val);
			this.$refs['showSpecsType'].close();
		},
		checkSpecsType(n) {
			this.checkedListTmp = n.detail.value;
		},
		canceled() {
			this.$refs['showSpecsType'].close();
		},
		next() {
			this.checkedList = this.checkedListTmp;
			this.setTips2();
			this.$emit('eventClick', this.checkedList);
			this.$refs['showSpecsType'].close();
		},
		isChecked(index) {
			if (this.checkedList.length > 0) {
				return this.checkedList.indexOf(+index) != -1;
			}
			return false;
		},
		setTips2() {
			let checkedName = [];
			this.checkedList.forEach(e => {
				checkedName.push(this.options[e]);
			});
			if (checkedName.length > 0) {
				this.tips2 = checkedName.join(',');
			} else {
				//默认提示
				this.tips2 = this.tips;
			}
		}
	}
};
</script>

<style lang="scss" scoped>
.select-container {
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

	.specsTitlesBtn {
		display: flex;
		padding: 30upx 30upx 30upx;
		.add-btn {
			flex: 1;
			margin: 0 30upx;
			font-size: $font-lg;
			color: #fff;
			background-color: $btn-color-light;
			border-radius: 10upx;
			&.cancel {
				background-color: $btn-color-spec;
			}
		}
	}
}
</style>
