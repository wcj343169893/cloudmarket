<template>
	<view class="root">
		<view class="row center">
			<text>请录入快递信息</text>
		</view>
		<view class="row">
			<text class="expressTitle">快递公司</text>
			<picker class="picker" mode="selector" :value="expressIndex" @change="pickerChange" :range="expressList"
				range-key="com">
				<view class="flex">
					<text v-if="expressIndex === null" class="comText">请选择</text>
					<text v-else class="comText">{{expressList[expressIndex]['com']}}</text>
					<uni-icons class="pickerIcon" type="arrowdown" color="#999999"></uni-icons>
				</view>
			</picker>
		</view>
		<view class="row" v-if="showNumber">
			<text class="expressTitle">快递单号</text>
			<view class="inputBox flex">
				<input @blur="getCom" v-model="express.number" placeholder="请输入快递单号" class="expressNumber" type="text"
					maxlength="32" />
				<uni-icons v-if="express.number" @click="deteleNumber" class="closeIcon" type="close" color="#999999">
				</uni-icons>
			</view>
			<uni-icons @click="scanCode" class="scanIcon" type="scan"></uni-icons>
		</view>
		<view class="row">
			<button class="action-btn recom" @click="close()" type="default">取消录入</button>
			<button class="action-btn recom" @click="submit()" type="primary">确定录入</button>
		</view>
	</view>
</template>
<script>
	import expressList from '@/components/expressInput/express.js';
	/**
	 * @event {Function()} comfirm 
	 * @event {Function()} canceled 
	 */
	export default {
		data() {
			return {
				expressList: [], //物流公司列表
				expressIndex: null, //第几个索引
				//物流信息
				express: {
					company: "", //快递公司名称
					code: "", //对应快递公司code
					number: "" //快递单号
				}
			};
		},
		props:{
			showNumber:{
				type:Boolean,
				default:true
			}
		},
		created() {
			this.expressList = expressList;
		},
		methods: {
			//删除
			deteleNumber() {
				this.express.number = ""
			},
			//选择快递公司
			pickerChange(e) {
				this.expressIndex = e.detail.value;
				this.express.company = this.expressList[this.expressIndex].com;
				this.express.code = this.expressList[this.expressIndex].code;
			},
			//根据快递单号，识别是什么快递公司
			getCom() {
				if (!this.express.code) {
					const num = this.express.number;
					console.log(num);
					uniCloud.callFunction({
						name: 'cloud-express',
						data: {
							action: "company",
							data: {
								number: num
							}
						},
						success: ({
							result: {
								data: {
									company
								}
							}
						}) => {
							for (let key in this.expressList) {
								let exp = this.expressList[key];
								if (exp.code == company) {
									this.express.company = exp.com;
									this.express.code = exp.code;
								}
							}
						}
					})
				}
			},
			//扫码
			scanCode() {
				uni.scanCode({ // 允许从相机和相册扫码
					success: res => {
						console.log('条码类型：' + res.scanType);
						console.log('条码内容：' + res.result);
						this.express.number = res.result;
						this.getCom();
					}
				});
			},
			submit() {
				this.$emit('comfirm', this.express)
			},
			close() {
				console.log("close")
				this.$emit('canceled')
			}
		}
	}
</script>
<style lang="scss" scoped>
	.root {
		background-color: #F7F7F7;
		flex: 1;
	}

	.row {
		height: 50px;
		align-items: center;
		flex-direction: row;
		background-color: #FFFFFF;
	}

	.expressTitle {
		color: #333333;
		font-size: 30rpx;
		padding-left: 20rpx;
	}

	.picker,
	.inputBox {
		width: 450rpx;
		flex-direction: row;
		background-color: #F7F7F7;
		border-radius: 6px;
		margin-left: 15rpx;
		height: 35px;
		line-height: 35px;
		padding: 0 20rpx;
	}

	.picker {
		justify-content: center;
	}

	.inputBox {
		justify-content: space-between;
	}

	.comText {
		font-size: 30rpx;
		line-height: 35px;
		color: #007AFF;
		background-color: #F7F7F7;
		flex: 1;
	}

	.pickerIcon,
	.closeIcon {
		width: 50rpx;
		font-size: 30rpx;
		line-height: 35px;
	}

	.expressNumber {
		background-color: #F7F7F7;
		width: 360rpx;
		height: 35px;
		line-height: 35px;
		border-radius: 6px;
		font-size: 30rpx;
		color: #999999;
	}

	.scanIcon {
		margin-left: 30rpx;
		font-size: 50rpx;
		color: #007AFF;
	}

	.scanIcon:active {
		color: #348ffe;
	}

	.buttomBox {
		width: 710rpx;
		margin: 30rpx 20rpx;
		justify-content: space-around;
		flex-direction: row;
	}

	.btn {
		width: 200rpx;
	}
</style>
