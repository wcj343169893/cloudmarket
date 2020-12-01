<template>
	<view class="container bg-white" :class="[globalAdminClass]">
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
			<mix-list-select border="b-b" @eventClick="changeMiaoshaSku" v-if="hasSku" title="商品型号" :options="skus"
			 :defaultOption="skusDef"></mix-list-select>
			<view class="mix-list-cell b-b">
				<text class="cell-tit clamp">*秒杀折扣</text>
				<slider :value="miaosha.rate" min="1" max="99" class="cell-content" @change="rateChange" show-value />
			</view>
			<mix-list-input title="折后售价" type="digit" :defContent="miaosha.price" field="miaosha.price" placeholder="请输入折扣价"
			 @change="changeField"></mix-list-input>
		</block>
		<!-- 沒有商品 -->
		<view v-else class="add_tmp b-b" @click="selectGoods()">
			<text class="yticon icon-jia1"></text>
			<text>请选择1件商品</text>
		</view>
		<view class="mix-list-cell b-b" @click="selectDatePicker('miaosha.showTime')">
			<text class="cell-tit clamp">*预告时间</text>
			<view class="cell-tip">
				<view class="uni-input" v-if="miaosha.showTime">{{ miaosha.showTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
				<view class="uni-input" v-else>选择时间</view>
			</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="mix-list-cell b-b" @click="selectDatePicker('miaosha.beginTime')">
			<text class="cell-tit clamp">*开始时间</text>
			<view class="cell-tip">
				<view class="uni-input" v-if="miaosha.beginTime">{{ miaosha.beginTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
				<view class="uni-input" v-else>选择时间</view>
			</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="mix-list-cell b-b" @click="selectDatePicker('miaosha.endTime')">
			<text class="cell-tit clamp">*结束时间</text>
			<view class="cell-tip">
				<view class="uni-input" v-if="miaosha.endTime">{{ miaosha.endTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
				<view class="uni-input" v-else>选择时间</view>
			</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="mix-list-cell b-b" @click="selectDatePicker('autoOffTime')">
			<text class="cell-tit clamp">*结束自动下架</text>
			<view class="cell-tip">
				<view class="uni-input" v-if="autoOffTime">{{ autoOffTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
				<view class="uni-input" v-else>选择时间</view>
			</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<mix-list-input title="秒杀库存" type="number" :defContent="miaosha.stock" field="miaosha.stock" placeholder="请输入库存"
		 @change="changeField"></mix-list-input>
		<view class="mix-list-cell" :class="{'b-b':isLimit}">
			<text class="cell-tit clamp">是否限购</text>
			<view class="cell-tip">
				<switch @change="limitChange" :checked="isLimit" :class="isLimit ?'checked':''" />
			</view>
		</view>
		<block v-if="isLimit">
			<mix-list-input title="订单限购" type="number" :defContent="miaosha.limit" field="miaosha.limit" placeholder="请输入限购数量"
			 @change="changeField"></mix-list-input>
			<view class="mix-list-cell">
				<text class="cell-tit clamp">新用户专享(首单)</text>
				<view class="cell-tip">
					<switch @change="newUserChange" :checked="miaosha.isNewUser" :class="miaosha.isNewUser ?'checked':''" />
				</view>
			</view>
		</block>

		<bory-dateTimePicker ref='date-time' :startYear="startYear" :endYear="endYear" :datestring="dateString"
		 :indicatorStyle='indicatorStyle' type='datetime' @change='dateTimeChange'></bory-dateTimePicker>
		<button class="fixed-add-btn" @click="save">提交保存</button>
	</view>
</template>

<script>
	import {
		uploadFiles,
		dateFormat
	} from '@/common/functions.js';
	import {
		goodsAdmin
	} from '@/common/admin_request.js';
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
					limit: 1,
					isNewUser: false,
					price: 0,
					sku_id: 0
				},
				hasSku: false,
				skus: {},
				skusDef: '',
				skuMap: {},
				isLimit: false,
				autoOffTime: false,
				dateKey: "",
				dateString: "",
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
		methods: {
			async loadData() {
				let data = uni.getStorageSync('goodsMiaoshaEdit');
				this.updateGoodsInfo(data);
				this.oldId = this.goods._id;
			},
			//处理商品信息
			updateGoodsInfo(data) {
				this.goods = data;
				if (this.goods.autoOffTime) {
					this.autoOffTime = this.goods.autoOffTime;
				}
				if (data[this.field]) {
					this.miaosha = data[this.field];
					if (!this.miaosha.rate) {
						//默认计算折扣
						this.$set(this.miaosha, 'rate', parseInt((this.miaosha.price / this.goods.price) * 100));
					}
					this.isLimit = this.miaosha.limit > 0;
					if (!this.miaosha.showTime) {
						//默认为开始时间的前34小时
						this.miaosha.showTime = this.miaosha.beginTime + 24 * 3600 * 1000;
					}
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
			//开始预告时间
			showTimeChange(e) {
				console.log(e);
				//苹果时间问题
				let d = new Date(e.replace(/-/g, '/'));
				this.$set(this.miaosha, 'showTime', d.getTime());
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
				this.isLimit = e.target.value;
			},
			newUserChange(e) {
				this.miaosha.isNewUser = !!e.target.value;
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
				console.log(this[arr[0]])
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
				this.miaosha.isLimit = this.isLimit;
				if (this.isLimit) {
					fields['limit'] = '限购数量';
				} else {
					this.miaosha.limit = 0;
					this.miaosha.isNewUser = false;
				}
				if (!this.checkFields(this.miaosha, fields)) {
					this.submiting = false;
					return;
				}
				//处理字段类型
				let intFields = ['limit', 'price', 'stock', 'sku_id', 'rate'];
				for (let s of intFields) {
					this.miaosha[s] = +this.miaosha[s];
				}
				if (this.submiting) {
					return;
				}
				this.submiting = true;
				goodsAdmin('addMiaosha', {
					oldId: this.oldId,
					_id: this.goods._id,
					autoOffTime: this.autoOffTime,
					miaosha: this.miaosha,
					field: this.field
				}, true).then(
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
		padding-bottom: 120rpx;
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

	.submit {
		padding-top: 40rpx;
		padding-bottom: 30rpx;
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
