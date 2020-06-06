<template>
	<view class="content">
		<text class="success-icon yticon icon-xuanzhong2"></text>
		<text class="tit">支付成功</text>

		<view class="notice" v-if="yudingNotice!=''">
			<text>{{yudingNotice}}</text>
			<view class="">
				<text>{{yudingNotice2}}</text>
			</view>
		</view>
		<view class="btn-group">
			<block v-if="comefrom == 'cart'">
				<navigator url="/pages/order/order?state=0" open-type="redirect" class="mix-btn">查看订单</navigator>
				<navigator url="/pages/index/fruit" open-type="switchTab" class="mix-btn hollow">返回首页</navigator>
			</block>
			<block v-if="comefrom == 'order'">
				<navigator :url="detailUrl" open-type="redirect" class="mix-btn">查看订单</navigator>
				<navigator :delta="delta" open-type="navigateBack" class="mix-btn">返回</navigator>
			</block>
		</view>
	</view>
</template>

<script>
import {  dateFormat } from '@/common/functions.js';
export default {
	data() {
		return {
			id: '',
			delta: 1,
			detailUrl: '',
			yudingNotice:'',
			yudingNotice2:'',
			comefrom: 'cart'
		};
	},
	onLoad(options) {
		if (options.comefrom) {
			this.comefrom = options.comefrom;
		}
		console.log(options);
		this.id = options.id;
		this.detailUrl = '/pages/order/detail?id=' + this.id;
		this.loadData();
	},
	methods: {
		async loadData() {
			uni.getStorage({
				key: 'orderDetail',
				success: res => {
					if (res.data.yuding && res.data.yuding.payType == "dingjin") {
						//显示支付尾款时间
						let notice=["请在"];
						notice.push(dateFormat(res.data.yuding.finalPaymentBeginTime, 'MM月dd日hh:mm'));
						notice.push("-")
						notice.push(dateFormat(res.data.yuding.finalPaymentEndTime, 'MM月dd日hh:mm'));
						notice.push("时间内支付尾款");
						this.yudingNotice = notice.join("");
						this.yudingNotice2 = "您可留意短信及app消息提醒";
						if (this.comefrom == 'order') {
							this.changeOrderTabs(1);
						}
					}else{
						if (this.comefrom == 'order') {
							this.changeOrderTabs(2);
						}
					} 
					uni.removeStorage({
						key: 'orderDetail'
					});
				}
			});
		},
		async changeOrderTabs(index) {
			//把订单列表的选项卡切换到待收货 2
			this.$api.prePage().tabClick(index);
			console.log('切换订单列表选项卡',index);
		}
	}
};
</script>

<style lang="scss">
.content {
	display: flex;
	flex-direction: column;
	justify-content: center;
	align-items: center;
}
.success-icon {
	font-size: 160upx;
	color: #fa436a;
	margin-top: 100upx;
}
.tit {
	font-size: 38upx;
	color: #303133;
}
.notice{
	text-align: center;
	font-size: $font-ssm;
	margin-top: 40upx;
}
.btn-group {
	padding-top: 100upx;
}
.mix-btn {
	margin-top: 30upx;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 600upx;
	height: 80upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $base-color;
	border-radius: 10upx;
	&.hollow {
		background: #fff;
		color: #303133;
		border: 1px solid #ccc;
	}
}
</style>
