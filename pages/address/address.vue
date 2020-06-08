<template>
	<view class="content b-t">
		<view class="list b-b" v-for="(item, index) in addressList" :key="index" @click="checkAddress(item)">
			<view v-if="isEdit" class=""><view class="yticon icon-xuanzhong2 checkbox" :class="{ checked: item.checked }" @click.stop="check(index)"></view></view>
			<view class="wrapper">
				<view class="address-box">
					<text v-if="item.default" class="tag">默认</text>
					<text class="address">{{ item.address }} {{ item.addressName }} {{ item.area }}</text>
				</view>
				<view class="u-box">
					<text class="name">{{ item.name }}</text>
					<text class="mobile">{{ item.mobile }}</text>
				</view>
			</view>
			<text class="yticon icon-bianji" @click.stop="addAddress('edit', item._id)"></text>
		</view>
		<view class="buttons">
			<block  v-if="isEdit">
				<button class="btn_delete" @click="deleteAddress()">
					<text>批量删除</text>
					<text v-if="checkedCount > 0">({{ checkedCount }})</text>
				</button>
				<button type="default" class="btn_cancel" @click="cancelOptions()">取消</button>
			</block>
			<button v-else class="btn_add" @click="addAddress('new', 0)">新增地址</button>
		</view>
	</view>
</template>

<script>
import { address } from '@/common/request.js';
export default {
	data() {
		return {
			isEdit: false,
			source: 0,
			checkedCount: 0,
			addressList: []
		};
	},
	onLoad(option) {
		console.log(option.source);
		this.source = option.source;
		this.loadData();
	},
	onShow() {
		this.isEdit = false;
	},
	methods: {
		async loadData() {
			address({
				type: 'list'
			}).then(res => {
				this.addressList = res;
			});
		},
		//选择地址
		checkAddress(item) {
			if (this.source == "settlement") {
				//this.$api.prePage()获取上一页实例，在App.vue定义
				//this.$api.prePage().addressData = item;
				this.$api.prePage().refreshList(item, 'select');
				uni.navigateBack();
			} else {
				this.addAddress('edit', item._id);
			}
		},
		//选中需要删除的地址
		check(index) {
			this.addressList[index].checked = !this.addressList[index].checked;
			let checkedCount = 0;
			this.addressList.forEach(item => {
				if (item.checked) {
					checkedCount++;
				}
			});
			this.checkedCount = checkedCount;
		},
		//取消编辑
		cancelOptions(){
			this.isEdit = false;
		},
		//批量删除地址
		deleteAddress() {
			if (this.checkedCount > 0) {
				uni.showModal({
					title: '温馨提示',
					content: '确定删除吗？',
					success: res=> {
						if (res.confirm) {
							let ids = [];
							let data = [];
							this.addressList.forEach(item => {
								if (item.checked) {
									ids.push(item._id);
								}else{
									data.push(item);
								}
							});
							//移除本地内容
							this.addressList = data;
							address({
								ids: ids.join(','),
								type: 'deleteAll'
							}).then(res => {
								this.$api.msg('删除成功');
								this.cancelOptions();
								//如果是从填写订单过来的，需要刷新订单页面的收货地址
							});
							//全部清理完了，
							if (this.source == "settlement" && this.addressList.length == 0) {
								this.$api.prePage().refreshList({}, 'select');
							}
						}
					}
				});
			} else {
				this.$api.msg('请选择需要删除的地址');
			}
		},
		//修改地址
		addAddress(type, id) {
			uni.navigateTo({
				url: `/pages/address/addressManage?type=${type}&id=${id}`
			});
		},
		//添加或修改成功之后回调
		refreshList(data, type) {
			//添加或修改后事件，这里直接在最前面添加了一条数据，实际应用中直接刷新地址列表即可
			//this.addressList.unshift(data);
			this.loadData();
			console.log(data, type);
		}
	}, //点击导航栏 buttons 时触发
	onNavigationBarButtonTap(e) {
		const index = e.index;
		if (index == 0) {
			//开启编辑
			this.addressList.forEach(i => {
				i['checked'] = false;
			});
			this.isEdit = true;
			this.checkedCount = 0;
		}
	}
};
</script>

<style lang="scss">
page {
	padding-bottom: 120upx;
}
.content {
	position: relative;
}
.list {
	display: flex;
	align-items: center;
	padding: 20upx 30upx;
	background: #fff;
	position: relative;
}
.wrapper {
	display: flex;
	flex-direction: column;
	flex: 1;
}
.address-box {
	display: flex;
	align-items: center;
	.address {
		font-size: 30upx;
		color: $font-color-dark;
		flex: 1;
	}
}
.u-box {
	font-size: 28upx;
	color: $font-color-light;
	margin-top: 16upx;
	.name {
		margin-right: 30upx;
	}
}
.icon-bianji {
	display: flex;
	align-items: center;
	height: 80upx;
	font-size: 40upx;
	color: $font-color-light;
	padding-left: 30upx;
}
.buttons{
	position: fixed;
	left: 30upx;
	right: 30upx;
	bottom: calc(30upx + var(--window-bottom));
	z-index: 95;
	display: flex;
	align-items: center;
	justify-content: center;
	width: 690upx;
	height: 80upx;
	button{
		width: 100%;
		font-size: 32upx;
		color: #fff;
		background-color: $base-color;
		border-radius: 10upx;
		&.btn_cancel{
			background-color: $font-color-disabled;
		}
	}
}
.btn_add {
}
.btn_delete{
	margin-right: 30upx;
}

.checkbox {
	font-size: 40upx;
	margin-right: 24upx;
}
</style>
