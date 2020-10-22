<template>
	<view class="container">
		<mix-list-input title="起送金额" type="digit" :defContent="minPrice" placeholder="请输入" @blur="changeMinPrice">
			<text class="moreText">元</text>
		</mix-list-input>
		<mix-list-input title="不满起送金额运费" type="digit" :defContent="money" placeholder="请输入" @blur="changeMoney"><text class="moreText">元</text></mix-list-input>
		<mix-list-input title="满金额免运费" type="digit" :defContent="freeMoney" placeholder="请输入" @blur="changeFreeMoney"><text
			 class="moreText">元</text></mix-list-input>
		<mix-list-input title="服务里程" type="number" :defContent="minDistance" placeholder="请输入" @blur="changeMinDistance"><text
			 class="moreText">公里</text></mix-list-input>
		<mix-list-input title="超里程/公里" type="digit" :defContent="perMoney" placeholder="请输入" @blur="changePerMoney"><text
			 class="moreText">元</text></mix-list-input>
		<mix-list-input title="最远服务里程" type="number" :defContent="maxDistance" placeholder="请输入" @blur="changeMaxDistance"><text
			 class="moreText">公里</text></mix-list-input>
		<mix-list-input title="预计送达时间" type="number" :defContent="time" placeholder="请输入" @blur="changeTime"><text class="moreText">分钟</text></mix-list-input>
		<mix-list-input title="最多可预订天数" type="number" :defContent="deliveryDay" placeholder="请输入" @blur="changeDeliveryDay"><text
			 class="moreText">天</text></mix-list-input>
		<view class="mix-list-cell">
			<text class="cell-tit clamp">每日预定时段</text>
		</view>
		<mix-list-select title="每日预定时段" :options="deliverySteps" :defaultOption="timeStep" @eventClick="changeDeliveryStep"></mix-list-select>
		<view class="deliveryPeriods">
			<view class="mix-list-cell b-b" v-for="(item,index) in deliveryPeriodHour" :key="index">
				<text class="cell-content" v-if="item.begin" @click="selectDatePicker('begin',item.begin,index)">{{item.begin}}</text>
				<text class="cell-content" v-else @click="selectDatePicker('begin','',index)">开始时间</text>
				<text class="cell-content" v-if="item.end" @click="selectDatePicker('end',item.end,index)">{{item.end}}</text>
				<text class="cell-content" v-else @click="selectDatePicker('end','',index)">结束时间</text>
				<text class="yticon icon-jia2" v-if="deliveryPeriodHour.length == index + 1" @click="add(index)"></text>
				<text class="yticon icon-shanchu4" v-else @click="del(index)"></text>
			</view>
		</view>
		<view class="specsTitlesBtn">
			<button class="action-btn" @click="btnSave()">保存</button>
		</view>
		<bory-dateTimePicker ref='date-time' :datestring="dateString" :indicatorStyle='indicatorStyle' type='hour-minute'
		 @change='dateTimeChange'></bory-dateTimePicker>
	</view>
</template>
<script>
	import {
		shopAdmin
	} from '@/common/admin_request.js';
	export default {
		data() {
			return {
				deliveryDay: 4,
				deliveryPeriodHour: [],
				deliveryPeriod: [],
				freeMoney: 20,
				maxDistance: 5000,
				minDistance: 5,
				minPrice: 20,
				money: 5,
				perMoney: 1,
				time: 30,
				isSubmit: false,
				shopInfo: {},
				dateString: "",
				dateKey: "",
				dateIndex: "",
				indicatorStyle: {
					background: 'rgba(255,0,0,.2)',
					height: '40px',
				},
				timeStep: 1800,
				deliverySteps: {
					"1800": "半小时",
					"3600": "1小时",
				}
			}
		},
		onLoad() {
			this.loadData();
		},
		methods: {
			async loadData() {
				this.shopInfo = uni.getStorageSync('adminShopInfo');
				for (let i in this.shopInfo.delivery) {
					this[i] = this.shopInfo.delivery[i];
				}
				//处理时间
				this.deliveryPeriod.map(e => {
					this.deliveryPeriodHour.push({
						begin: this.getTimeStr(e.begin),
						end: this.getTimeStr(e.end)
					})
				});
			},
			changeMinPrice(e) {
				this.minPrice = +e;
			},
			changeMoney(e) {
				this.money = +e;
			},
			changeFreeMoney(e) {
				this.freeMoney = +e;
			},
			changeMinDistance(e) {
				this.minDistance = +e;
			},
			changePerMoney(e) {
				this.perMoney = +e;
			},
			changeMaxDistance(e) {
				this.maxDistance = +e;
			},
			changeTime(e) {
				this.time = +e;
			},
			changeDeliveryStep(e) {
				this.timeStep = +e;
			},
			changeDeliveryDay(e) {
				this.deliveryDay = +e;
			},
			add(index) {
				let last;
				//默认增加半小时
				if (this.deliveryPeriodHour.length == 0) {
					last = {
						end: "08:00"
					};
				} else {
					last = this.deliveryPeriodHour[this.deliveryPeriodHour.length - 1];
				}
				let end = this.formartTime(last.end) + this.timeStep;
				this.deliveryPeriodHour.push({
					begin: last.end,
					end: this.getTimeStr(end)
				})
			},
			del(index) {
				this.deliveryPeriodHour.splice(index, 1);
			},
			btnSave() {
				if (this.isSubmit) {
					return;
				}
				let deliveryPeriod = [];
				let data = {
					deliveryDay: this.deliveryDay,
					freeMoney: this.freeMoney,
					maxDistance: this.maxDistance,
					minDistance: this.minDistance,
					minPrice: this.minPrice,
					money: this.money,
					timeStep:this.timeStep,
					perMoney: this.perMoney,
					time: this.time
				};
				//尽量保证时段不重叠
				this.deliveryPeriodHour.map(e => {
					deliveryPeriod.push({
						begin: this.formartTime(e.begin),
						end: this.formartTime(e.end)
					});
				});
				this.deliveryPeriod.sort((a, b) => {
					return a.begin - b.begin;
				});
				data["deliveryPeriod"] = deliveryPeriod;
				this.isSubmit = true;
				shopAdmin("save", {
					delivery: data
				},true).then(res => {
					this.$api.success("修改成功");
					this.shopInfo["delivery"] = data;
					uni.setStorage({
						key: 'adminShopInfo',
						data: this.shopInfo
					})
					this.navTimeBack(() => {
						//上一个页面刷新
						this.$api.prePage().refreshList();
					})
				}, err => {
					this.isSubmit = false;
					this.$api.msg("修改失败");
				})
			},
			getTimeStr(time) {
				let hour = Math.floor(time / 3600);
				let minute = (time - hour * 3600) / 60;

				if (hour < 10) {
					hour = "0" + hour;
				}
				if (minute < 10) {
					minute = "0" + minute;
				}
				return hour + ":" + minute
			},
			formartTime(str) {
				let arr = str.split(":");
				return arr[0] * 3600 + arr[1] * 60;
			},
			selectDatePicker(key, val, index) {
				console.log(val)
				this.dateKey = key;
				this.dateString = val;
				this.dateIndex = index;
				this.$refs['date-time'].show();
			},
			dateTimeChange(e) {
				console.log("dateTimeChange", e);
				this.deliveryPeriodHour[this.dateIndex][this.dateKey] = e;
			},
		}
	}
</script>

<style lang="scss">
	.icon .mix-list-cell.b-b:after {
		left: 90upx;
	}

	.mix-list-cell {
		display: flex;
		align-items: baseline;
		align-items: center;
		padding: 20upx $page-row-spacing;
		line-height: 60upx;
		position: relative;

		&.imgs {
			padding-bottom: 0;
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
			color: $font-color-light;
		}

		.cell-tip {
			flex: 1;
			font-size: $font-sm + 2upx;
			color: $font-color-light;
			text-align: right;
		}
	}

	.m-r {
		margin-right: 16upx;
	}

	.deliveryPeriods {
		position: relative;
		margin-left: 40rpx;
	}

	.specsTitlesBtn {
		display: flex;
		padding: 40upx 30upx 30upx;
		background-color: #ffffff;
		justify-content: space-between;

		.action-btn {
			flex: 1;
			margin: 0 30rpx;
			background-color: $btn-color-light;
			color: #FFFFFF;
		}
	}

	.moreText {
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		margin-left: 4rpx;
	}
</style>
