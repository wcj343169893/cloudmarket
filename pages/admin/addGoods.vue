<template>
	<view class="container">
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*商品名称</text>
			<input type="text" class="cell-content" v-model="title" placeholder="请输入商品名称" />
		</view>
		<mix-list-cell title="商品分类" :tips="categoryName"></mix-list-cell>
		<mix-list-cell title="规格和库存" :tips="specsTypeName" navigateType="down" @eventClick="selectSpecsType()"></mix-list-cell>
		<block v-if="specsType == 'single'"><admin-goods-sku :info="singleInfo" title=""></admin-goods-sku></block>
		<block v-else>
			<view v-for="(item, index) in skus" :key="index"><admin-goods-sku :info="item" title=""></admin-goods-sku></view>
		</block>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">主图</text>
			<view class="cell-content"></view>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">轮播图</text>
			<view class="cell-content"></view>
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">图文介绍</text>
			<view class="cell-content"></view>
		</view>
		<uni-popup ref="showSpecsType" type="center">
			<view class="popup">
				<radio-group name="" @change="changeSpecsType">
					<block v-for="(item, index) in specsTypes" :key="index">
						<label class="mix-list-cell b-b">
							<text class="cell-tit clamp">{{ item }}</text>
							<radio :value="index" :checked="specsTypeTmp == index" />
						</label>
					</block>
				</radio-group>
				<block v-if="specsTypeTmp == 'multiple'">
					<view class="specsTitlesDesc">
						<text>最多选择{{ maxSpecsTitles }}种</text>
					</view>
					<view class="specsTitles">
						<block v-for="(item, index) in specsTitlesMap" :key="index">
							<view class="specsTitles_item" :class="{ checked: item.checked }" @click="selectSpecsTitle(index)">
								<text>{{ item.name }}</text>
								<text v-if="item.checked" class="specsTitles_item_number">{{ item.checkedIndex }}</text>
							</view>
						</block>
					</view>
					<view class="specsTitlesBtn" v-if="hasSpecs">
						<button class="add-btn cancel" @click="cancelSkuBuilder">取消</button>
						<button class="add-btn" @click="navToSkuBuilder">下一步</button>
					</view>
				</block>
			</view>
		</uni-popup>
	</view>
</template>

<script>
export default {
	data() {
		return {
			categories: [],
			categoryName: '',
			specsTypeName: '单规格',
			specsType: 'single', //single单规格，multiple多规格
			specsTypeTmp: 'single', //临时single单规格，multiple多规格
			specsTypes: {
				single: '单规格',
				multiple: '多规格'
			},
			specsTitlesMap: [],
			maxSpecsTitles: 2, //最多规格
			hasSpecs: false,
			specsTitles: [
				'尺寸',
				'型号',
				'颜色',
				'类别',
				'重量',
				'款式',
				'货号',
				'器型',
				'材质',
				'尺码',
				'口味',
				'色号',
				'容量',
				'花型',
				'地点',
				'香型',
				'成分',
				'版本',
				'度数',
				'属性',
				'地区',
				'套餐',
				'功效',
				'品类',
				'时间',
				'组合',
				'运营商',
				'适用年龄',
				'适用人群'
			],
			//单规格信息
			singleInfo: {},
			//多规格信息
			skus: [],
			description: '',
			id: 0,
			imgs: [],
			originPrice: 0,
			price: 0,
			src: '',
			stock: 0,
			title: ''
		};
	},
	onLoad(options) {
		if (!options.isnew) {
			//编辑
			this.loadData();
			uni.setNavigationBarTitle({
				title: '编辑商品'
			});
		} else {
			uni.setNavigationBarTitle({
				title: '新增商品'
			});
		}
		//默认单规格信息为主信息
		this.loadSkuInfo();
	},
	methods: {
		async loadData() {
			let data = uni.getStorageSync('adminEditGoods');
			if (data) {
				for (let index in data) {
					this[index] = data[index];
				}
			}
		},
		async loadSkuInfo() {
			this.singleInfo = {
				price: this.price,
				originPrice: this.originPrice,
				stock: this.stock,
				name: ''
			};
			this.specsTitlesMap = [];
			this.specsTitles.map((e, index) => {
				this.specsTitlesMap.push({
					index: index,
					name: e,
					checked: false,
					checkedIndex: 0
				});
			});
		},
		//选择规格类型，单规格/多规格
		selectSpecsType() {
			this.$refs['showSpecsType'].open();
		},
		setSpecsType(type) {
			this.specsType = type;
			this.specsTypeName = this.specsTypes[type];
		},
		changeSpecsType(n){
			this.specsTypeTmp = n.detail.value;
			if (this.specsTypeTmp == 'single') {
				this.setSpecsType(this.specsTypeTmp);
				this.$refs['showSpecsType'].close();
			} else {
				//多规格，选择规格名称
			}
			console.log(this.specsTypeTmp, this.specsTypeName);
		},
		//选择规格名称
		selectSpecsTitle(index) {
			//判断是否已选择2个
			let stm = this.specsTitlesMap.filter(e => {
				return e.checked;
			});
			console.log(stm);
			if (this.specsTitlesMap[index].checked) {
				this.specsTitlesMap[index].checked = false;
				this.specsTitlesMap[index].checkedIndex = 0;
				//更新另外一个的顺序
				stm = this.specsTitlesMap.filter(e => {
					return e.checked;
				});
				stm.sort((a, b) => {
					return a.checkedIndex - b.checkedIndex;
				});
				let index2 = 1;
				stm.forEach(ele => {
					ele.checkedIndex = index2;
					index2++;
				});
			} else if (stm.length < this.maxSpecsTitles) {
				this.specsTitlesMap[index].checked = true;
				this.specsTitlesMap[index].checkedIndex = stm.length + 1;
				stm.push(this.specsTitlesMap[index]);
			}
			this.hasSpecs = stm.length > 0;
			uni.setStorage({
				key: 'skuBuilder',
				data: stm
			});
		},
		cancelSkuBuilder(){
			this.$refs['showSpecsType'].close();
		},
		navToSkuBuilder() {
			uni.navigateTo({
				url: '/pages/admin/goodsSkusBuilder',
				success: () => {
					this.cancelSkuBuilder()
				}
			});
		},refreshList(data){
			this.setSpecsType(this.specsTypeTmp);
			this.skus = data;
		}
	}
};
</script>

<style lang="scss">
.icon .mix-list-cell.b-b:after {
	left: 90upx;
}
.mix-list-cell {
	display: flex;
	align-items: baseline;
	padding: 20upx $page-row-spacing;
	line-height: 60upx;
	position: relative;

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
	}
	.cell-tip {
		flex: 1;
		font-size: $font-sm + 2upx;
		color: $font-color-light;
		text-align: right;
	}
}
.popup {
	width: 700upx;
	background: #ffffff;
	border-radius: 12upx;
	.cell-tit {
		flex: 1;
	}
}
.specsTitlesDesc {
	font-size: $font-base;
	color: $font-color-disabled;
	padding: 20upx 30upx 0;
}
.specsTitles {
	display: flex;
	flex-wrap: wrap;
	font-size: $font-base;
	padding: 0 20upx 20upx;
	justify-content: space-between;
}
.specsTitles_item {
	margin-right: 18upx;
	padding: 8upx 12upx;
	position: relative;
	&.checked {
		color: $base-color;
	}
}
.specsTitles_item_number {
	position: absolute;
	right: 0;
	top: 0;
}
.m-r {
	margin-right: 8upx;
}
.specsTitlesBtn {
	padding-bottom: 30upx;
	display: flex;
}
.add-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	font-size: $font-lg;
	color: #fff;
	background-color: $btn-color-light;
	border-radius: 10upx;
	&.cancel{
		background-color: $btn-color-spec;
	}
}
</style>
