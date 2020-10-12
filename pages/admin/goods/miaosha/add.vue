<template>
	<view class="container">
		<!-- 商品 -->
		<block v-if="goods.id > 0">
			<view class="goods-box-single b-b" @click="selectGoods()">
				<image class="goods-img" :src="goods.src" mode="aspectFill"></image>
				<view class="right">
					<view class="">
						<text class="title clamp">{{ goods.title }}</text>
					</view>
					<view class="sub-title" v-if="goods.subTitle && goods.subTitle != ''">
						<text>{{ goods.subTitle }}</text>
					</view>
					<view class="attr-box">
						<text>单价:</text>
						<text class="price">{{ goods.price }}</text>
						<block v-if="goods.originPrice > 0">
							<text class="price del">{{ goods.originPrice }}</text>
						</block>
						<text>库存:</text>
						<text class="m-r">{{ goods.stock }}</text>
					</view>
					<view class="attr-box">
						<text>月售:</text>
						<text class="m-r">{{ goods.monthlySale }}</text>
						<text>浏览:</text>
						<text>{{ goods.visite }}</text>
					</view>
				</view>
			</view>
			<mix-list-select border="b-b" @eventClick="changeMiaoshaSku" v-if="hasSku" title="商品型号" :options="skus" :defaultOption="skusDef"></mix-list-select>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">*秒杀折扣</text>
				<slider :value="miaosha.rate" min="1" max="99" class="cell-content" @change="rateChange" show-value />
			</view>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">折后售价</text>
				<input type="digit" class="cell-content" @input="changeMiaoshaPrice" v-model="miaosha.price" placeholder="请输入折扣价" />
			</view>
		</block>
		<!-- 沒有商品 -->
		<view v-else class="add_tmp b-b" @click="selectGoods()">
			<text class="yticon icon-jia1"></text>
			<text>请选择1件商品</text>
		</view>
		<!-- 折扣 -->
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*开始时间</text>
			<kx-datetime
				class="cell-tip"
				:time="miaosha.beginTime | dateFormat('yyyy-MM-dd hh:mm')"
				:end="beginTimeEndDate"
				@rundata="beginTimeChange"
				:start="beginTimeStartDate"
				default="start"
			></kx-datetime>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*结束时间</text>
			<kx-datetime
				class="cell-tip"
				:time="miaosha.endTime | dateFormat('yyyy-MM-dd hh:mm')"
				:end="endTimeEndDate"
				@rundata="endTimeChange"
				:start="endTimeStartDate"
				default="start"
			></kx-datetime>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*秒杀库存</text>
			<input type="digit" class="cell-content" v-model="miaosha.stock" placeholder="请输入库存" />
		</view>

		<view class="mix-list-cell" :class="{'b-b':isLimit}">
			<text class="cell-tit clamp">是否限购</text>
			<view class="cell-tip"><switch @change="limitChange" :checked="isLimit" /></view>
		</view>
		<view class="mix-list-cell" v-if="isLimit">
			<text class="cell-tit clamp">订单限购</text>
			<input type="digit" class="cell-content" v-model="miaosha.limit" placeholder="请输入限购数量" />
		</view>
		<view class="submit"><button class="add-btn" @click="save">提交保存</button></view>
	</view>
</template>

<script>
import { uploadFiles, dateFormat } from '@/common/functions.js';
import { goodsAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			type: 1,
			field: 'miaosha',
			goods: {},
			oldId: '',
			miaosha: {
				rate: 80,
				stock: '',
				limit: '',
				price: 0,
				sku_id: 0
			},
			hasSku: false,
			skus: {},
			skusDef: '',
			skuMap: {},
			isLimit: false,
			submiting: false
		};
	},
	onLoad(options) {
		if (options.id) {
			//类型，1正在进行，2已暂停
			this.type = options.type;
			if (this.type == 2) {
				this.field = 'miaoshaBackUp';
			}
			this.loadData();
			uni.setNavigationBarTitle({
				title: '修改秒杀'
			});
		}
	},
	computed: {
		beginTimeStartDate() {
			return dateFormat(false, 'yyyy-MM-dd');
		},
		beginTimeEndDate() {
			return this.getDefaultEndDate();
		},
		endTimeStartDate() {
			if (this.miaosha && this.miaosha.beginTime) {
				return dateFormat(this.miaosha.beginTime, 'yyyy-MM-dd hh:mm');
			}
			return dateFormat(false, 'yyyy-MM-dd');
		},
		endTimeEndDate() {
			return this.getDefaultEndDate();
		}
	},
	methods: {
		async loadData() {
			let data = uni.getStorageSync('goodsMiaoshaEdit');
			this.updateGoodsInfo(data);
			this.oldId = this.goods._id;
		},
		//处理商品信息
		updateGoodsInfo(data) {
			this.goods = data;
			if (data[this.field]) {
				this.miaosha = data[this.field];
				if (!this.miaosha.rate) {
					//默认计算折扣
					this.$set(this.miaosha, 'rate', parseInt((this.miaosha.price / this.goods.price) * 100));
				}
				this.isLimit = this.miaosha.limit > 0;
			} else {
				//默认参数
				this.miaosha = {
					rate: 80,
					stock: '',
					limit: '',
					price: 0,
					sku_id: 0
				};
			}
			if (this.goods.skus) {
				this.hasSku = true;
				this.skus = {};
				this.skusDef = '';
				if (this.miaosha && this.miaosha.sku_id) {
					this.skusDef = this.miaosha.sku_id + '';
				}
				this.goods.skus.map(ele => {
					if (this.skusDef == '') {
						this.miaosha.sku_id = this.skusDef = ele.id + '';
					}
					this.skus[ele.id] = '￥' + ele.price + ' ' + (ele.name + '').replace(/\&gt\;/g, '-');
					this.skuMap[ele.id] = ele;
				});
			} else {
				this.hasSku = false;
			}
			this.getMiaoshaPrice();
		},
		//获取默认结尾日期
		getDefaultEndDate() {
			let d = new Date();
			d.setFullYear(d.getFullYear() + 1);
			return dateFormat(d, 'yyyy-MM-dd');
		},
		beginTimeChange(e) {
			console.log(e);
			//苹果时间问题
			let d = new Date(e.replace(/-/g, '/'));
			this.$set(this.miaosha, 'beginTime', d.getTime());
		},
		endTimeChange(e) {
			console.log(e);
			//苹果时间问题
			let d = new Date(e.replace(/-/g, '/'));
			this.$set(this.miaosha, 'endTime', d.getTime());
		},
		rateChange(e) {
			let rate = +e.detail.value;
			this.$set(this.miaosha, 'rate', rate);
			if (this.goods.id > 0) {
				this.getMiaoshaPrice();
			}
		},
		limitChange(e) {
			console.log('switch1 发生 change 事件，携带值为', e.target.value);
			this.isLimit = e.target.value;
			this.$api.msg(e.target.value);
		},
		changeMiaoshaPrice(e) {
			let price = +e.detail.value;
			if (price > this.goods.price) {
				return false;
			}
			//动态改变rate
			this.miaosha.rate = parseInt((price / this.goods.price) * 100);
		},
		//切换型号，更新商品价格
		changeMiaoshaSku(skuId) {
			console.log('changeMiaoshaSku', skuId);
			let skuInfo = this.skuMap[skuId];
			this.goods.price = skuInfo.price;
			this.getMiaoshaPrice();
		},
		//保存秒杀信息
		save() {
			if (!this.goods.id) {
				this.$api.msg('请选择商品');
				return;
			}
			let fields = {
				rate: '折扣',
				beginTime: '开始秒杀时间',
				endTime: '结束秒杀时间',
				stock: '秒杀库存'
			};
			if (this.isLimit) {
				fields['limit'] = '限购数量';
			}
			if (!this.checkFields(this.miaosha, fields)) {
				this.submiting = false;
				return;
			}
			//处理字段类型
			let intFields = ['limit', 'price', 'stock','sku_id','rate'];
			for (let s of intFields) {
				this.miaosha[s] = +this.miaosha[s];
			}
			if(this.submiting){
				return;
			}
			this.submiting = true;
			goodsAdmin('addMiaosha', {
				oldId: this.oldId,
				_id: this.goods._id,
				miaosha: this.miaosha,
				field: this.field
			},true).then(
				res => {
					this.$api.msg('提交成功', 2000, true, 'success');
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
					this.$api.prePage().refreshList();
				},
				err => {
					this.submiting = false;
					this.$api.msg(err.message || '提交失败');
				}
			);
		},
		//检查字段是否为空
		checkFields(data, fields) {
			for (let fie in fields) {
				if (typeof data[fie] == 'undefined' || data[fie] == '') {
					this.$api.msg(fields[fie] + '不能为空');
					return false;
				}
			}
			return true;
		},
		//选择一件商品
		selectGoods() {
			uni.navigateTo({
				url: `/pages/admin/goods/list?type=chooseone&state=exmiaosha`
			});
		},
		getMiaoshaPrice() {
			this.$set(this.miaosha, 'price', ((this.goods.price * this.miaosha.rate) / 100).toFixed(2));
		},
		refreshList(data) {
			this.updateGoodsInfo(data);
		}
	}
};
</script>

<style lang="scss">
.container {
}
.goods-box-single {
	display: flex;
	position: relative;
	padding: 20upx;
	.goods-img {
		display: block;
		width: 120upx;
		height: 120upx;
		border-radius: 4%;
	}
	.right {
		flex: 1;
		display: flex;
		flex-direction: column;
		padding: 0 30upx 0 24upx;
		overflow: hidden;
		.title {
			font-size: $font-base + 2upx;
			color: $font-color-dark;
			line-height: 1;
		}
	}
}
.attr-box {
	font-size: $font-sm + 2upx;
	color: $font-color-light;
	padding: 8upx 0upx 0;
	&.notstart {
		color: $base-color;
	}
	&.started {
		color: $font-color-warning;
		.price {
			color: $font-color-warning;
		}
	}
	&.ended {
		text-decoration: line-through;
	}
}

.price-box {
	display: flex;
	justify-content: flex-end;
	align-items: baseline;
	padding: 20upx 30upx;
	font-size: $font-sm + 2upx;
	color: $font-color-light;
	.num {
		margin: 0 8upx;
		color: $font-color-dark;
	}
}
.sub-title {
	font-size: $font-sm;
	color: $font-color-disabled;
}
.m-r {
	margin-right: 8upx;
}
.m-lr {
	margin: 0 8upx 0;
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
		&.content-right {
			text-align: right;
		}
	}
	.cell-tip {
		flex: 1;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		text-align: right;
	}
}
slider {
	padding-right: 0;
	margin-right: 0;
}
.add_tmp {
	font-size: $font-base;
	text-align: center;
	padding: 40rpx 0;
	position: relative;
	.yticon {
		color: $base-color;
		font-size: $font-sm;
	}
}
.submit{
	padding-top: 40rpx;
}
.add-btn {
	flex: 1;
	margin: 0 30upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $btn-color-light;
	border-radius: 10upx;
}
</style>
