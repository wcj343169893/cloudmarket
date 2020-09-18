<template>
	<view class="date-time-picker" v-if="visible">
		<view class="date-time-mask" @click.stop="hide"></view>
		<view class="date-time-container" @click.stop="handleEvent">
			<view class="time-picker-tool" v-if='isShowToolBar'>
				<view :class="[cancelButtonClass]" @click.stop="cancel">
					<text>{{cancelButtonText}}</text>
				</view>
				<view :class="[toolBarTitleClass]">
					<text>{{toolBarTitle}}</text>
				</view>
				<view :class="[confirmButtonClass]" @click.stop="confirm">
					<text>{{confirmButtonText}}</text>
				</view>
			</view>
			<picker-view class="picker-view" :indicator-style="indicatorStyleString" :value="dateTime" @change="dateTimePickerChange">
				<picker-view-column data-id='year' v-if='isShowYear'>
					<view class="item" v-for="(item,index) in years" :key="index">{{item}}年</view>
				</picker-view-column>
				<picker-view-column data-id='month' v-if='isShowMonth'>
					<view class="item" v-for="(item,index) in months" :key="index">{{item}}月</view>
				</picker-view-column>
				<picker-view-column data-id='day' v-if='isShowDay'>
					<view class="item" v-for="(item,index) in days" :key="index">{{item}}日</view>
				</picker-view-column>
				<picker-view-column data-id='hour' v-if='isShowHour'>
					<view class="item" v-for="(item,index) in hours" :key="index">{{item}}时</view>
				</picker-view-column>
				<picker-view-column data-id='minute' v-if='isShowMinute'>
					<view class="item" v-for="(item,index) in minutes" :key="index">{{item}}分</view>
				</picker-view-column>
				<picker-view-column data-id='second' v-if='isShowSecond'>
					<view class="item" v-for="(item,index) in seconds" :key="index">{{item}}秒</view>
				</picker-view-column>
			</picker-view>
		</view>
	</view>
</template>

<script>
	import {
		getOneMonthDays,
		getTimeArray,
		addZero,
		getIndexOfArray
	} from './uitls/util.js'
	export default {
		name: 'DateTimePicker',
		props: {
			startYear: {
				type: Number,
				default: 1900
			},
			endYear: {
				type: Number,
				default: new Date().getFullYear()
			},
			isShowToolBar: {
				type: Boolean,
				default: true
			},
			cancelButtonText: {
				type: String,
				default: '取消'
			},
			cancelButtonClass: {
				type: String,
				default: 'cancel-btn'
			},
			toolBarTitle: {
				type: String,
				default: '请选择'
			},
			toolBarTitleClass: {
				type: String,
				default: 'tool-title'
			},
			confirmButtonText: {
				type: String,
				default: '确定'
			},
			confirmButtonClass: {
				type: String,
				default: 'confirm-btn'
			},
			datestring: {
				type: String,
				default: ''
			},
			type: {
				/**
				 * date 年月日
				 * year-month 年月
				 * year 年
				 * datetime 年月日 时分
				 * datetime-all 年月日 时分秒
				 * time 时分秒
				 * hour-minute 时分
				 */
				type: String,
				default: 'date'
			},
			indicatorStyle: {
				type: Object,
				default: null
			}
		},
		data() {
			return {
				visible: false,
				dateTime: [],
				days: [],
				indicatorStyleString: ''
			}
		},
		watch: {
			indicatorStyle(val){
				this.getIndicatorStyle();
			},
			type() {
				this.initDateTime()
			},
			datestring(){
				this.initDateTime()
			}
		},
		computed: {
			years() {
				return this.initTimeData(this.endYear, this.startYear);
			},
			isShowYear() {
				return this.type !== 'time' && this.type !== 'hour-minute';
			},
			months() {
				return this.initTimeData(12, 1);
			},
			isShowMonth() {
				return this.type !== 'year' && this.type !== 'time' && this.type !== 'hour-minute';
			},
			isShowDay() {
				return this.type === 'date' || this.type === 'datetime' || this.type === 'datetime-all';
			},
			hours() {
				return this.initTimeData(23, 0);
			},
			isShowHour() {
				return this.type !== 'date' && this.type !== 'year-month' && this.type !== 'year';
			},
			minutes() {
				return this.initTimeData(59, 0);
			},
			isShowMinute() {
				return this.type !== 'date' && this.type !== 'year-month' && this.type !== 'year';
			},
			seconds() {
				return this.initTimeData(59, 0);
			},
			isShowSecond() {
				return this.type === 'datetime-all' || this.type === 'time';
			}
		},
		methods: {
			getIndicatorStyle(){
				if(this.indicatorStyle){
					for(let key in this.indicatorStyle){
						this.indicatorStyleString += `${key}:${this.indicatorStyle[key]};`
					}
				}
			},
			handleEvent() {
				return;
			},
			cancel() {
				this.hide();
			},
			confirm() {
				this.formatDate();
				this.hide();
			},
			show() {
				this.visible = true;
			},
			hide() {
				this.visible = false;
			},
			initDateTime() {
				let value;
				if (this.datestring.length > 0) {
					if (this.type === 'year') {
						value = new Date(this.datestring, 0);
					} else if (this.type === 'time' || this.type === 'hour-minute') {
						let date = new Date();
						let ary = this.datestring.split(':');
						ary.forEach((item, index) => {
							if (index == 0) {
								date.setHours(item)
							} else if (index == 1) {
								date.setMinutes(item)
							} else if (index == 2) {
								date.setSeconds(item)
							}
						})
						value = date;
					} else {
						value = new Date(this.datestring.replace(/-/g, '/'));
					}

				} else {
					value = new Date();
				}
				let len, timeArray, index;
				let array = getTimeArray(value);
				let [year, month, day, hour, minute, second] = array;
				this.days = this.initTimeData(getOneMonthDays(year, month), 1);
				let names = ['year', 'month', 'day', 'hour', 'minute', 'second'];
				switch (this.type) {
					case "date":
						len = 3;
						break;
					case "year-month":
						len = 2;
						break;
					case "year":
						len = 1;
						break;
					case "datetime":
						len = 5;
						break;
					case "datetime-all":
						len = 6;
						break;
					case "time":
						len = 3;
						break;
					case "hour-minute":
						len = 2;
						break;
				}
				timeArray = new Array(len).fill(0);
				if (this.type === 'time' || this.type === 'hour-minute') {
					names = names.slice(3);
					array = array.slice(3);
				}
				timeArray = timeArray.map((item, index) => {
					const name = names[index];
					return getIndexOfArray(array[index], this[name + 's'])
				})
				this.dateTime = timeArray;
			},
			initTimeData(end, start) {
				let timeArray = [];
				while (start <= end) {
					timeArray.push(start);
					start++;
				}
				return timeArray;
			},
			formatDate() {
				let names = ['year', 'month', 'day', 'hour', 'minute', 'second'];
				let dateString, formatDateArray = [];
				if (this.type === 'date' || this.type === 'year-month' || this.type === 'year') {
					formatDateArray = this.dateTime.map((item, index) => {
						return this[names[index] + 's'][item] < 10 ? addZero(this[names[index] + 's'][item]) : this[names[index] + 's'][item];
					})
					dateString = formatDateArray.join('-');
				} else if (this.type === 'time' || this.type === 'hour-minute') {
					names = names.splice(3);
					formatDateArray = this.dateTime.map((item, index) => {
						return this[names[index] + 's'][item] < 10 ? addZero(this[names[index] + 's'][item]) : this[names[index] + 's'][item];
					})
					dateString = formatDateArray.join(':');
				} else {
					let name1 = names.splice(0, 3);
					formatDateArray = this.dateTime.map((item, index) => {
						if (index > 2) {
							return this[names[index - 3] + 's'][item] < 10 ? addZero(this[names[index - 3] + 's'][item]) : this[names[index - 3] + 's'][item];
						} else {
							return this[name1[index] + 's'][item] < 10 ? addZero(this[name1[index] + 's'][item]) : this[name1[index] + 's'][item];
						}
					})
					dateString = formatDateArray.splice(0, 3).join('-') + ' ' + formatDateArray.join(':');
				}
				this.$emit('change', dateString)
			},
			dateTimePickerChange(e) {
				let columns = e.target.value;
				if (this.type === 'date' || this.type === 'datetime' || this.type === 'datetime-all') {
					this.dateTime.splice(0, 1, columns[0]);
					if (columns[0] != this.dateTime[0]) {
						this.days = this.initTimeData(getOneMonthDays(this.years[this.dateTime[0]], this.months[this.dateTime[1]]), 1);
						if (this.dateTime[1] == 1) {
							if (this.dateTime[2] === this.days.length - 1) {
								if (getOneMonthDays(this.years[columns[0]], this.dateTime[1]) < getOneMonthDays(this.years[this.dateTime[0]],this.dateTime[1])) {
									this.dateTime.splice(2, 1, this.days.length - 1)
								}
							}
						}
					} else {
						this.dateTime.splice(1, 1, columns[1]);
						this.days = this.initTimeData(getOneMonthDays(this.years[this.dateTime[0]], this.dateTime[1]), 1);
						if (columns[1] != this.dateTime[1]) {
							if (this.dateTime[1] == 1) {
								if (this.dateTime[2] === this.days.length - 1) {
									if (getOneMonthDays(this.years[columns[0]], this.dateTime[1]) < getOneMonthDays(this.years[this.dateTime[0]],
											this.dateTime[1])) {
										this.dateTime.splice(2, 1, this.days.length - 1)
									}
								}
							} else {
								if (this.dateTime[2] > this.days.length - 1) {
									this.dateTime.splice(2, 1, this.days.length - 1)
								} else {
									this.dateTime.splice(2, 1, columns[2])
								}
							}
						} else {
							this.dateTime.splice(2, 1, columns[2])
						}
					}
					if (columns.length > 2) {
						columns.splice(3).forEach((column, index) => {
							this.dateTime.splice(index + 3, 1, column);
						})
					}
				} else {
					columns.forEach((column, index) => {
						this.dateTime.splice(index, 1, column);
					})
				}
				if (!this.isShowToolBar) {
					this.formatDate();
				}
			},
		},
		mounted() {
			this.getIndicatorStyle();
			this.initDateTime();
		}
	}
</script>

<style lang='scss' scoped>
	.date-time-picker {
		.date-time-mask {
			position: fixed;
			top: 0;
			bottom: 0;
			left: 0;
			right: 0;
			background-color: rgba($color: #000000, $alpha: .5);
			z-index: 998;
		}

		.date-time-container {
			position: fixed;
			height: 50%;
			bottom: 0;
			right: 0;
			left: 0;
			background-color: #f6f6f6;
			z-index: 1000;
			display: flex;
			flex-direction: column;

			.time-picker-tool {
				height: 80rpx;
				display: flex;
				align-items: center;
				justify-content: space-between;
				font-size: 28rpx;

				.cancel-btn {
					padding: 0 28rpx;
					box-sizing: border-box;
					color: #969799;
				}

				.tool-title {
					font-weight: 500;
					font-size: 16px;
					max-width: 50%;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}

				.confirm-btn {
					padding: 0 28rpx;
					box-sizing: border-box;
					color: #576b95;
				}
			}

			.picker-view {
				width: 100%;
				flex: 1;

				.item {
					font-size: 34rpx;
					display: flex;
					align-items: center;
					justify-content: center;
				}
			}
		}
	}
</style>
