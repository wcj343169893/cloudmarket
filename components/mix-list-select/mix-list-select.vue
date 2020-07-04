<template>
	<view class="container">
		<mix-list-cell :title="title" :tips="tips2" :border="border" :navigateType="navigateType" @eventClick="selectSpecsType()"></mix-list-cell>
		<uni-popup ref="showSpecsType" type="center">
			<view class="popup">
				<radio-group name="" @change="changeSpecsType" v-if="selectType == 'radio'">
					<label class="mix-list-cell b-b" v-for="(item, index) in options" :key="index">
						<text class="cell-tit clamp">{{ item }}</text>
						<radio :value="index" :checked="def == index" />
					</label>
				</radio-group>
				<block v-else>
					<checkbox-group name="" @change="checkSpecsType">
						<label class="mix-list-cell b-b" v-for="(item, index) in options" :key="index">
							<text class="cell-tit clamp">{{ item }}</text>
							<checkbox :value="index + ''" :checked="checkedList.indexOf(index) != -1" />
						</label>
					</checkbox-group>
					<view class="specsTitlesBtn">
						<button class="add-btn cancel" @click="canceled">取消</button>
						<button class="add-btn" @click="next">确定</button>
					</view>
				</block>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			tips2: '',
			def: '',
			checkedList: []
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
			default: {}
		},
		defaultOption: {
			type: String || Array,
			default: ''
		},
		//单选还是多选
		selectType: {
			type: String,
			default: 'radio'
		}
	},
	created() {
		if (this.defaultOption != '') {
			//console.log('this.defaultOption', this.defaultOption,this.options);
			this.tips2 = this.options[this.defaultOption];
			this.def = this.defaultOption;
			//console.log(this.tips2)
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
			this.checkedList = n.detail.value;
		},
		canceled() {
			this.$refs['showSpecsType'].close();
		},
		next() {
			let checkedName = [];
			this.checkedList.forEach(e=>{
				checkedName.push(this.options[e]);
			})
			if(checkedName.length >0){
				this.tips2 = checkedName.join(",");
			}else{
				//默认提示
				this.tips2 = this.tips;
			}
			this.$emit('eventClick', this.checkedList);
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
</style>
