<template>
	<view class="flex align-center flex-sub">
		<view class="uni-input flex-sub" v-if="timeStamp">{{ timeStamp  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
		<view class="uni-input flex-sub" v-else>{{tips}}</view>
		<button class="margin-left-xs cu-btn sm bg-green" @click="selectDatePicker('timeStamp')">{{btn}}</button>
		<bory-dateTimePicker ref='date-time' :startYear="startYear" :endYear="endYear" :datestring="dateString"
		 :indicatorStyle='indicatorStyle' type='datetime' @change='dateTimeChange'></bory-dateTimePicker>
	</view>
</template>

<script>
	import {
		dateFormat
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				timeStamp: 0,
				dateString: "",
			};
		},
		props: {
			value: [Number, String, Array],
			tips: {
				type: String,
				default: "请选择时间"
			},
			btn: {
				type: String,
				default: "选择"
			}
		},
		watch: {
			value(newVal) {
				this.timeStamp = newVal
				if (this.formItem) {
					this.formItem.setValue(newVal)
				}
			}
		},
		computed: {
			indicatorStyle() {
				return {
					background: 'rgba(255,0,0,.2)',
					height: '40px',
				};
			},
			startYear() {
				return new Date().getFullYear()
			},
			endYear() {
				return new Date().getFullYear() + 3;
			}
		},
		created() {
			this.timeStamp = this.value
			//this.val = this.value
			this.form = this.getForm('uniForms')
			this.formItem = this.getForm('uniFormsItem')
			if (this.formItem) {
				if (this.formItem.name) {
					this.rename = this.formItem.name
					this.form.inputChildrens.push(this)
				}
			}

		},
		methods: {
			/**
			 * 初始化变量值
			 */
			init() {

			},
			/**
			 * 获取父元素实例
			 */
			getForm(name = 'uniForms') {
				let parent = this.$parent;
				let parentName = parent.$options.name;
				while (parentName !== name) {
					parent = parent.$parent;
					if (!parent) return false;
					parentName = parent.$options.name;
				}
				return parent;
			},
			getArrData(string) {
				let arr = string.split(".");
				if (arr.length == 1) {
					return this[arr[0]];
				} else if (arr.length == 2) {
					return this[arr[0]] ? this[arr[0]][arr[1]] : "";
				} else if (arr.length == 3) {
					return this[arr[0]] && this[arr[0]][arr[1]] ? this[arr[0]][arr[1]][arr[2]] : "";
				}
			},
			selectDatePicker(key) {
				this.dateKey = key;
				this.dateString = dateFormat(this.getArrData(key), 'yyyy-MM-dd hh:mm:ss');
				console.log(this.dateString);
				this.$refs['date-time'].show();
			},
			dateTimeChange(e) {
				console.log("dateTimeChange", e);
				e = new Date(e.replace(/-/g, '/')).getTime();
				console.log("dateTimeChange", e);
				let arr = this.dateKey.split(".");
				console.log(arr);
				if (arr.length == 1) {
					this.$set(this, arr[0], e)
				} else if (arr.length == 2) {
					this.$set(this[arr[0]], arr[1], e)
				} else if (arr.length == 3) {
					this.$set(this[arr[0]][arr[1]], arr[2], e)
				}
				this.$emit('input', e);
				console.log(this[arr[0]])
			},
		}
	}
</script>

<style lang="scss">

</style>
