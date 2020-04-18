<template>
	<view class="uni-numbox">
		<view @click="_calcValue('minus')" :class="{'uni-numbox__minus':1,'uni-numbox__minus_show':isFocus || inputValue > 0}">
			<text class="yticon icon--jianhao uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue <= min || disabled }"></text>
		</view>
		<input :disabled="disabled" @blur="_onBlur" @focus="_onFocus" :class="{'uni-numbox__value':1,'uni-numbox__value_show':isFocus || inputValue > 0}" type="number" pattern="[0-9]{3}" v-model="inputValue" />
		<view @click="_calcValue('plus')" :class="{'uni-numbox__plus':1,'uni-numbox__plus_left':inputValue == 0}">
			<text class="yticon icon-jia2 uni-numbox--text" :class="{ 'uni-numbox--disabled': inputValue >= max || disabled }"></text>
		</view>
	</view>
</template>
<script>

	/**
	 * NumberBox 数字输入框
	 * @description 带加减按钮的数字输入框
	 * @tutorial https://ext.dcloud.net.cn/plugin?id=31
	 * @property {Number} id 对象传入的id
	 * @property {Number} value 输入框当前值
	 * @property {Number} min 最小值
	 * @property {Number} max 最大值
	 * @property {Number} step 每次点击改变的间隔大小
	 * @property {Boolean} disabled = [true|false] 是否为禁用状态
	 * @event {Function} change 输入框值改变时触发的事件，参数为输入框当前的 value
	 */

	export default {
		name: "UniNumberBox",
		props: {
			id: {
				type: [Number, String],
				default: 1
			},
			value: {
				type: [Number, String],
				default: 0
			},
			min: {
				type: Number,
				default: 0
			},
			max: {
				type: Number,
				default: 100
			},
			step: {
				type: Number,
				default: 1
			},
			disabled: {
				type: Boolean,
				default: false
			}
		},
		data() {
			return {
				isFocus:false,
				inputValue: 0,
				isInit:false
			};
		},
		watch: {
			value(val) {
				this.isInit = true;
				this.inputValue = +val;
			},
			inputValue(newVal, oldVal) {
				if(this.isInit){
					//初始化
					this.isInit=false;
					console.log("inputValue初始化",newVal,+newVal,oldVal,+oldVal);
				}else if (+newVal !== +oldVal) {
					console.log("inputValue",newVal,+newVal,oldVal,+oldVal)
					this.$emit("change", +newVal,this.id);
				}
			}
		},
		created() {
			//传入的值不是0
			if(+this.value > 0){
				this.isInit = true;
			}
			this.inputValue = +this.value;
		},
		methods: {
			_onFocus(){
				this.isFocus=true;
			},
			_calcValue(type) {
				if (this.disabled) {
					this.$emit("disabledEvent",this.id);
					return;
				}
				const scale = this._getDecimalScale();
				let value = this.inputValue * scale;
				let step = this.step * scale;
				if (type === "minus") {
					value -= step;
					if (value < (this.min * scale)) {
						return;
					}
					if (value > (this.max * scale)) {
						value = this.max * scale
					}
				} else if (type === "plus") {
					value += step;
					if (value > (this.max * scale)) {
						return;
					}
					if (value < (this.min * scale)) {
						value = this.min * scale
					}
				}

				this.inputValue = String(value / scale);
			},
			_getDecimalScale() {
				let scale = 1;
				// 浮点型
				if (~~this.step !== this.step) {
					scale = Math.pow(10, (this.step + "").split(".")[1].length);
				}
				return scale;
			},
			_onBlur(event) {
				let value = event.detail.value;
				this.isFocus=false;
				if (!value) {
					this.inputValue = 0;
					return;
				}
				value = +value;
				if (value > this.max) {
					value = this.max;
				} else if (value < this.min) {
					value = this.min;
				}
				this.inputValue = value;
			}
		}
	};
</script>
<style lang="scss" scoped>
	$box-height: 42upx;
	/* #ifdef APP-NVUE */
	$box-line-height: $box-height;
	/* #endif */
	$box-line-height: $box-height;
	$box-width: $box-height;

	.uni-numbox {
		/* #ifndef APP-NVUE */
		display: flex;
		/* #endif */
		flex-direction: row;
		height: $box-height;
		line-height: $box-height;
		width: 100px;
		justify-content: flex-end;
	}
	image{
		width: 20upx;
		height: 20upx;
		display: block;
	}
	.uni-numbox__value {
		background-color: $uni-bg-color;
		/* width: 40px; */
		width: 0;
		overflow: hidden;
		height: $box-height;
		text-align: center;
		font-size: $uni-font-size-lg;
	}
	.uni-numbox__value_show{
		width: 60upx;
	}

	.uni-numbox__minus {
		overflow: hidden;
		width: 0;
		height: $box-height;
		background-color: $uni-bg-color-grey;
		display: flex;
		flex-direction: row;  /* 子元素横向排列 */
		justify-content: center; /* 相对父元素水平居中 */
		align-items: center; /*  子元素相对父元素垂直居中 */
		color: $font-color-dark;
	}
	.uni-numbox__minus_show{
		width: $box-width;
		border-radius: $box-width;
	}

	.uni-numbox__plus {
		width: $box-width;
		height: $box-height;
		border-radius: $box-width;
		background: $btn-color-light;
		text-align: center;
		display: flex;
		flex-direction: row;  /* 子元素横向排列 */
		justify-content: center; /* 相对父元素水平居中 */
		align-items: center; /*  子元素相对父元素垂直居中 */
		color: $font-color-white;
	}
</style>
