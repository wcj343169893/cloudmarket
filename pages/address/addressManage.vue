<template>
	<view class="content">
		<view class="row b-b">
			<text class="tit">联系人</text>
			<input class="input" type="text" v-model="addressData.name" placeholder="收货人姓名" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">手机号</text>
			<input class="input" type="number" v-model="addressData.mobile" placeholder="收货人手机号码" placeholder-class="placeholder" />
		</view>
		<view class="row b-b">
			<text class="tit">地址</text>
			<text @click="chooseLocation" class="input">{{ addressData.addressName }}</text>
			<text class="yticon icon-shouhuodizhi"></text>
		</view>
		<view class="row b-b">
			<text class="tit">门牌号</text>
			<input class="input" type="text" v-model="addressData.area" placeholder="楼号、门牌" placeholder-class="placeholder" />
		</view>

		<view class="row default-row">
			<text class="tit">设为默认</text>
			<switch :checked="addressData.defaule" color="#fa436a" @change="switchChange" />
		</view>
		<button class="add-btn" @click="confirm">提交</button>
	</view>
</template>

<script>
import { address } from '@/common/request.js';
export default {
	data() {
		return {
			manageType: '',
			addressData: {
				name: '',
				mobile: '',
				addressName: '在地图选择',
				address: '',
				area: '',
				default: false
			}
		};
	},
	onLoad(option) {
		let title = '新增收货地址';
		if (option.type === 'edit') {
			this.id = option.id;
			title = '编辑收货地址';
			this.getAddress();
		}
		this.manageType = option.type;
		uni.setNavigationBarTitle({
			title
		});
	},
	methods: {
		getAddress() {
			address({
				type: 'one',
				id:this.id
			}).then(res => {
				this.addressData = res;
			});
		},
		switchChange(e) {
			this.addressData.default = e.detail;
		},

		//地图选择地址
		chooseLocation() {
			uni.chooseLocation({
				success: data => {
					//广东省深圳市南山区桃园路1号
					this.addressData.address = data.address;
					//西海明珠大厦
					this.addressData.addressName = data.name;
					//22.531131
					this.addressData.latitude = data.latitude;
					//113.930507
					this.addressData.longitude = data.longitude;
				}
			});
		},

		//提交
		confirm() {
			let data = this.addressData;
			if (!data.name) {
				this.$api.msg('请填写收货人姓名');
				return;
			}
			if (!/(^1[3|4|5|7|8][0-9]{9}$)/.test(data.mobile)) {
				this.$api.msg('请输入正确的手机号码');
				return;
			}
			if (!data.address) {
				this.$api.msg('请在地图选择所在位置');
				return;
			}
			if (!data.area) {
				this.$api.msg('请填写门牌号信息');
				return;
			}
			//this.$api.prePage()获取上一页实例，可直接调用上页所有数据和方法，在App.vue定义
			//下面的方法，可以调用上一个页面的refreshList方法，navigateBack页面不刷新,新增的data，没有_id，在提交的时候，会默认查询一条
			this.$api.prePage().refreshList(data, this.manageType);
			this.$api.msg(`地址${this.manageType == 'edit' ? '修改' : '添加'}成功`);
			data["type"]=this.manageType;
			address(data).then(res => {
				uni.navigateBack();
			});
		}
	}
};
</script>

<style lang="scss">
page {
	background: $page-color-base;
	padding-top: 16upx;
}

.row {
	display: flex;
	align-items: center;
	position: relative;
	padding: 0 30upx;
	height: 110upx;
	background: #fff;

	.tit {
		flex-shrink: 0;
		width: 120upx;
		font-size: 30upx;
		color: $font-color-dark;
	}
	.input {
		flex: 1;
		font-size: 30upx;
		color: $font-color-dark;
	}
	.icon-shouhuodizhi {
		font-size: 36upx;
		color: $font-color-light;
	}
}
.default-row {
	margin-top: 16upx;
	.tit {
		flex: 1;
	}
	switch {
		transform: translateX(16upx) scale(0.9);
	}
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690upx;
	height: 80upx;
	margin: 60upx auto;
	font-size: $font-lg;
	color: #fff;
	background-color: $base-color;
	border-radius: 10upx;
}
</style>
