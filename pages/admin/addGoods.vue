<template>
	<view class="container">
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*商品名称</text>
			<input type="text" class="cell-content" v-model="title" placeholder="请输入商品名称" />
		</view>
		<mix-list-cell title="*商品分类" :tips="categoryName" @eventClick="selectCategory()"></mix-list-cell>
		<mix-list-cell title="规格和库存" border="" :tips="specsTypeName" navigateType="down" @eventClick="selectSpecsType()"></mix-list-cell>
		<view class="skus">
			<block v-if="specsType == 'single'">
				<admin-goods-sku :info="singleInfo" title="" @change="changeSku"></admin-goods-sku>
				<view class="tmp"></view>
			</block>
			<block v-else>
				<block v-for="(item, index) in skus" :key="index">
					<admin-goods-sku :info="item" :index="index" title="" :ismultiple="!0" @del="deleteSku" @change="changeSku"></admin-goods-sku>
					<view class="tmp"></view>
				</block>
			</block>
		</view>
		<view class="mix-list-cell" @click="uploadSrc">
			<text class="cell-tit clamp">*主图</text>
			<view class="cell-content"></view>
			<text class="yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<view class="h-list" v-if="srcPreview && srcPreview != ''">
				<view class="h-list-image"><image :src="srcPreview" mode="aspectFill"></image></view>
			</view>
		</view>
		<view class="mix-list-cell imgs" @click="uploadImgs">
			<text class="cell-tit clamp">轮播图</text>
			<view class="cell-content"></view>
			<text class="yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<scroll-view scroll-x class="h-list" v-if="imgsPreview.length > 0">
				<view v-for="(item, index) in imgsPreview" :key="index" class="h-list-image"><image :src="item" mode="aspectFill"></image></view>
			</scroll-view>
		</view>
		<view class="mix-list-cell b-b" @click="uploadDescImgs">
			<text class="cell-tit clamp">图文介绍</text>
			<view class="cell-content"></view>
			<text class="yticon icon-you"></text>
		</view>
		<view class="tmp submit"></view>
		<view class="specsTitlesBtn submit"><button class="add-btn" @click="save">提交</button></view>
		<uni-popup ref="showCateory" type="bottom">
			<view class="specsTitlesBtn selectCategory">
				<button class="add-btn cancel" @click="cancelSelectCategory">取消</button>
				<button class="add-btn" @click="savaSelectCategory">确定</button>
			</view>
			<view class="catespopup">
				<scroll-view scroll-y="true" class="catespopupScroll">
					<radio-group name="categorys" @change="changeCategory">
						<view class="cates" v-for="(item, index) in categoriesData" :key="index">
							<view class="header">
								<text>{{ item.name }}</text>
							</view>
							<view class="children">
								<label class="mix-list-cell b-b" v-for="(child, childindex) in item.children" :key="childindex">
									<radio :value="index + '_' + item.id + '_' + child.id" :checked="child.checked" />
									<text class="cell-tit clamp">{{ child.name }}</text>
								</label>
							</view>
						</view>
					</radio-group>
				</scroll-view>
			</view>
		</uni-popup>
		<uni-popup ref="showSpecsType" type="center">
			<view class="popup">
				<radio-group name="skus" @change="changeSpecsType">
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
import { mapState } from 'vuex';
import { uploadFiles } from '@/common/functions.js';
import { goodsAdmin, categoryAdmin } from '@/common/admin_request.js';
export default {
	data() {
		return {
			_id: false,
			categories: [],
			categoriesData: [],
			categoryIdTmp: [],
			categoryName: '请选择',
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
			skuname: [],
			skunameTmp: [],
			description: '',
			id: false,
			imgs: [],
			imgsPreview: [],
			originPrice: 0,
			price: '',
			src: '',
			srcPreview: '',
			stock: '',
			title: '',
			submiting: false
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
			//默认单规格信息为主信息
			this.loadSkuInfo();
		}
		this.loadCategory();
	},
	methods: {
		async loadData() {
			let data = uni.getStorageSync('adminEditGoods');
			if (data) {
				for (let index in data) {
					this[index] = data[index];
				}
				if (this.src) {
					this.srcPreview = this.src;
				}
				if (this.imgs) {
					this.imgsPreview = this.imgs;
				}
				if (this.skus && this.skus.length > 0) {
					this.setSpecsType('multiple');
					this.specsTypeTmp = 'multiple';
				}
				if (this.categories.length > 0) {
					this.categoryName = this.categories[this.categories.length - 1].name;
				}
				console.log(data);
			}
			//默认单规格信息为主信息
			this.loadSkuInfo();
		},
		async loadCategory() {
			categoryAdmin('list', {}).then(
				res => {
					//处理没有children的数据
					res.forEach(ele => {
						if (!ele.children || ele.children.length == 0) {
							ele.children = [{ id: ele.id, name: ele.name }];
						}
						ele.children.forEach(chi => {
							chi.checked = this.categories.findIndex(f => f.id == chi.id) != -1;
						});
					});
					console.log(res);
					this.categoriesData = res;
				},
				err => {
					//没有分类
					this.categoryName = '没有分类';
				}
			);
		},
		async loadSkuInfo() {
			this.singleInfo = {
				id: 0,
				price: this.price,
				originPrice: this.originPrice,
				stock: this.stock,
				name: ''
			};
			this.specsTitlesMap = [];
			let checkedIndex = [];
			//默认选中
			if (this.skuname && this.skuname.length > 0) {
				this.skuname.map(name => {
					let index = this.specsTitles.findIndex(e => e == name);
					if (index == -1) {
						checkedIndex.push(this.specsTitles.length);
						this.specsTitles.push(name);
					} else {
						checkedIndex.push(index);
					}
				});
			}
			this.specsTitles.map((e, index) => {
				this.specsTitlesMap.push({
					index: index,
					name: e,
					checked: false,
					checkedIndex: 0
				});
			});
			checkedIndex.map(ind => {
				this.selectSpecsTitle(ind);
			});
		},
		selectCategory() {
			this.$refs['showCateory'].open();
		},
		//单项选择商品分类，如果要多选，有点麻烦
		changeCategory(e) {
			console.log(e);
			this.categoryIdTmp = [];
			let ids = e.detail.value;
			ids = ids.split('_');
			let cates = this.categoriesData[+ids[0]];
			this.categoryIdTmp.push({
				id: cates.id,
				pid: 0,
				name: cates.name
			});
			cates.children.map(child => {
				if (ids[1] != ids[2] && child.id == +ids[2]) {
					child.pid = cates.id;
					this.categoryIdTmp.push(child);
				}
			});
		},
		cancelSelectCategory() {
			this.$refs['showCateory'].close();
		},
		savaSelectCategory() {
			if (this.categoryIdTmp.length > 0) {
				this.categories = this.categoryIdTmp;
				this.categoryName = this.categoryIdTmp[this.categoryIdTmp.length - 1].name;
				this.$refs['showCateory'].close();
			} else {
				this.$api.msg('请选择分类');
			}
		},
		//选择规格类型，单规格/多规格
		selectSpecsType() {
			this.$refs['showSpecsType'].open();
		},
		setSpecsType(type) {
			this.specsType = type;
			this.specsTypeName = this.specsTypes[type];
		},
		changeSpecsType(n) {
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
			this.skunameTmp = stm;
			uni.setStorage({
				key: 'skuBuilder',
				data: stm
			});
		},
		cancelSkuBuilder() {
			this.$refs['showSpecsType'].close();
		},
		navToSkuBuilder() {
			uni.navigateTo({
				url: '/pages/admin/goodsSkusBuilder',
				success: () => {
					this.cancelSkuBuilder();
				}
			});
		},
		refreshList(data) {
			this.setSpecsType(this.specsTypeTmp);
			this.skus = data;
			this.skuname = this.skunameTmp.map(st => st.name);
		},
		deleteSku(index) {
			console.log('deleteSku', index);
			this.skus.splice(index, 1);
		},
		//修改规格数据
		changeSku(index, info) {
			//console.log('changeSku', index, info);
			if (!this.hasSpecs) {
				//单规格
				this.price = +info.price;
				this.originPrice = +info.originPrice;
				this.stock = +info.stock;
			} else {
				this.skus[index] = info;
			}
		},
		//上传图片
		uploadSrc() {
			uploadFiles(
				'goods_face',
				1,
				srcs => {
					this.srcPreview = srcs[0];
				},
				srcs => {
					this.src = srcs[0];
				}
			);
		},
		//上传轮播图
		uploadImgs() {
			uploadFiles(
				'goods_imgs',
				5,
				srcs => {
					this.imgsPreview = srcs;
				},
				srcs => {
					this.imgs = srcs;
				}
			);
		},
		//多图新开一页
		uploadDescImgs() {},
		//提交到服务器
		save() {
			if (this.submiting) {
				return;
			}
			this.submiting = true;
			let info = {
				_id: this._id,
				categories: this.categories,
				description: this.description,
				id: this.id,
				imgs: this.imgs,
				originPrice: this.originPrice,
				price: this.price,
				src: this.src,
				stock: this.stock,
				title: this.title
			};
			//多规格
			if (this.skus && this.skus.length > 0) {
				Object.assign(info, {
					skus: this.skus,
					skuname: this.skuname
				});
				info.stock = 0;
				info.price = -1;
				this.skus.map(sku => {
					//价格取sku最低价
					if (info.price < 0 || info.price > sku.price) {
						info.price = sku.price;
						info.originPrice = +sku.originPrice;
					}
					//库存累加
					info.stock += +sku.stock;
				});
			}
			//判断必填项
			if (!info.title) {
				this.$api.msg('标题不能为空');
				return;
			}
			if (!info.src) {
				this.$api.msg('主图不能为空');
				return;
			}
			goodsAdmin('save', info).then(
				res => {
					console.log(res);
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 2000);
					this.$api.prePage().refreshList();
					this.$api.msg('提交成功');
				},
				err => {
					this.submiting = false;
					this.$api.msg(err.message || '提交失败');
				}
			);
		}
	}
};
</script>

<style lang="scss" scoped>
.icon .mix-list-cell.b-b:after {
	left: 90upx;
}
.mix-list-cell {
	display: flex;
	align-items: baseline;
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
	right: -12upx;
	top: -6upx;
	background: $base-color;
	border-radius: 50%;
	width: 30upx;
	height: 30upx;
	line-height: 30upx;
	text-align: center;
	color: #fff;
	font-size: $font-sm;
}
.m-r {
	margin-right: 8upx;
}
.specsTitlesBtn {
	display: flex;
	padding: 10upx 30upx 30upx;
	&.submit {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 99;
		background: #ffffff;
	}
	&.selectCategory {
		background: #ffffff;
		justify-content: space-between;
		padding: 10upx 30upx 10upx;
		.add-btn {
			flex: none;
			margin: 0;
			height: 60upx;
			line-height: 60upx;
			font-size: $font-base;
		}
	}
}
.add-btn {
	flex: 1;
	margin: 0 30upx;
	font-size: $font-lg;
	color: #fff;
	background-color: $btn-color-light;
	border-radius: 10upx;
	&.cancel {
		background-color: $btn-color-spec;
	}
}
.skus {
	padding: 20upx 20upx 0;
	background-color: $background-color;
}
.tmp {
	padding-bottom: 20upx;
	&.submit {
		padding-bottom: 160upx;
	}
}
.withImages {
	align-items: center;
}
.facePath {
	width: 200upx;
	height: 200upx;
}
.imgs {
	position: relative;
	padding-bottom: 20upx;
}
.h-list {
	white-space: nowrap;
	padding: 10upx 30upx 0;
	.h-list-image {
		display: inline-block;
		margin-right: 20upx;
		image {
			width: 160upx;
			height: 160upx;
			border-radius: 4%;
		}
	}
}
.catespopupScroll {
	height: 700upx;
}
.catespopup {
	background: #ffffff;
	padding: 20upx;
	font-size: $font-base;
	.header {
		font-size: $font-lg;
	}
	.cates {
		padding-bottom: 20upx;
	}
}
</style>
