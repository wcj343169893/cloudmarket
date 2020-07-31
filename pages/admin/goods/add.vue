<template>
	<view class="container">
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*商品名称</text>
			<input type="text" class="cell-content" maxlength="40" v-model="title" placeholder="请输入商品名称" />
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">商品副标题</text>
			<input type="text" class="cell-content" maxlength="30" v-model="subTitle" placeholder="请输入副标题" />
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
		<mix-list-select
			title="*销售类型"
			:options="saleTypes"
			:border="saleType == 'normal' ? 'b-b' : ''"
			:defaultOption="saleType"
			@eventClick="changeSaleType"
		></mix-list-select>
		<!-- saleType预定设置 -->
		<block v-if="saleType == 'yuding'">
			<view class="yuding-section">
				<view class="yuding-content">
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*定金</text>
						<input type="digit" class="cell-content" v-model="yuding.price" placeholder="请输入定金" />
					</view>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*抵扣</text>
						<input type="digit" class="cell-content" v-model="yuding.deduction" placeholder="请输入抵扣" />
					</view>
					<!-- 多规格商品选择支持的规格 -->
					<block v-if="specsType == 'multiple'">
						<mix-list-select
							title="*支持规格"
							:options="getSkuNames"
							:defaultOptions="yuding.sku_ids"
							selectType="checkbox"
							@eventClick="changeYudingSku"
						></mix-list-select>
					</block>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*开始预定</text>
						<picker
							mode="date"
							:value="yuding.beginTime | dateFormat('yyyy-MM-dd')"
							:start="yudingBeginTimeStartDate"
							:end="yudingBeginTimeEndDate"
							class="cell-tip"
							@change="bindYudingBeginDateChange"
						>
							<view class="uni-input" v-if="yuding.beginTime">{{ yuding.beginTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择日期</view>
						</picker>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*结束预定</text>
						<picker
							mode="date"
							:value="yuding.endTime | dateFormat('yyyy-MM-dd')"
							:start="yudingEndTimeStartDate"
							:end="yudingEndTimeEndDate"
							class="cell-tip"
							@change="bindYudingEndDateChange"
						>
							<view class="uni-input" v-if="yuding.endTime">{{ yuding.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择日期</view>
						</picker>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*开始付尾款</text>
						<picker
							mode="date"
							:value="yuding.finalPaymentBeginTime | dateFormat('yyyy-MM-dd')"
							:start="yudingFinalPaymentBeginTimeStartDate"
							:end="yudingFinalPaymentBeginTimeEndDate"
							class="cell-tip"
							@change="bindYudingFinalPaymentBeginDateChange"
						>
							<view class="uni-input" v-if="yuding.finalPaymentBeginTime">{{ yuding.finalPaymentBeginTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择日期</view>
						</picker>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell">
						<text class="cell-tit clamp">*结束付尾款</text>
						<picker
							mode="date"
							:value="yuding.finalPaymentEndTime | dateFormat('yyyy-MM-dd')"
							:start="yudingFinalPaymentEndTimeStartDate"
							:end="yudingFinalPaymentEndTimeEndDate"
							class="cell-tip"
							@change="bindYudingFinalPaymentEndDateChange"
						>
							<view class="uni-input" v-if="yuding.finalPaymentEndTime">{{ yuding.finalPaymentEndTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择日期</view>
						</picker>
						<text class="cell-more yticon icon-you"></text>
					</view>
				</view>
			</view>
		</block>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">配送</text>
			<view class="cell-content content-right">
				<checkbox-group name="delivery_tags" @change="changeDeliveryTags">
					<label class="m-r">
						<checkbox value="iceNeed" />
						<text>加冰</text>
					</label>
					<label>
						<checkbox value="package" />
						<text>独立包装</text>
					</label>
				</checkbox-group>
			</view>
		</view>
		<view class="mix-list-cell" @click="uploadSrc">
			<text class="cell-tit clamp">*主图</text>
			<view class="cell-tip">尺寸800*800</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<view class="h-list" v-if="srcPreview && srcPreview != ''">
				<view class="h-list-image"><image :src="srcPreview" mode="aspectFill"></image></view>
			</view>
		</view>
		<view class="mix-list-cell imgs" @click="uploadImgs">
			<text class="cell-tit clamp">轮播图</text>
			<view class="cell-tip">尺寸800*800</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<scroll-view scroll-x class="h-list" v-if="imgsPreview.length > 0">
				<view v-for="(item, index) in imgsPreview" :key="index" class="h-list-image"><image :src="item" mode="aspectFill"></image></view>
			</scroll-view>
		</view>
		<view class="mix-list-cell" @click="uploadDescImgs">
			<text class="cell-tit clamp">图文介绍</text>
			<view class="cell-tip">此处默认显示320*240,前端显示原始尺寸</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs">
			<view v-for="(item, index) in descriptionImgs" :key="index" class="d-list-image">
				<text class="number">{{ index + 1 }}</text>
				<image :src="item" mode="aspectFill"></image>
			</view>
		</view>

		<view class="tmp submit"></view>
		<view class="specsTitlesBtn submit"><button class="add-btn" @click="save">提交</button></view>
		<uni-popup ref="showCateory" type="bottom">
			<view class="specsTitlesBtn selectCategory b-b">
				<text class="add-btn cancel" @click="cancelSelectCategory">取消</text>
				<text class="add-btn" @click="savaSelectCategory">确定</text>
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
import { uploadFiles, dateFormat } from '@/common/functions.js';
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
			descriptionImgs: [], //图文
			deliveryTags: [],
			id: false,
			imgs: [],
			imgsPreview: [],
			originPrice: 0,
			price: '',
			src: '',
			srcPreview: '',
			stock: '',
			title: '',
			subTitle: '',
			submiting: false,
			saleType: 'normal',
			saleTypes: {
				normal: '正常销售',
				yuding: '提前预定'
			},
			yuding: {}
		};
	},
	computed: {
		getSkuNames() {
			let da = {};
			if (this.skus) {
				this.skus.map(sku => {
					da[sku.id] = sku.name.replace('&gt;', '-');
				});
			}
			return da;
		},
		yudingBeginTimeStartDate() {
			return dateFormat(false, 'yyyy-MM-dd');
		},
		//预定开始时间，默认1年内，如果设置了结束日期，则最大是结束
		yudingBeginTimeEndDate() {
			if (this.yuding.endTime) {
				return dateFormat(this.yuding.endTime, 'yyyy-MM-dd');
			}
			return this.getDefaultEndDate();
		},
		//预定结束日期开始，如果设置了开始日期，则必须大于等于开始
		yudingEndTimeStartDate() {
			if (this.yuding.beginTime) {
				return dateFormat(this.yuding.beginTime, 'yyyy-MM-dd');
			}
			return dateFormat(false, 'yyyy-MM-dd');
		},
		yudingEndTimeEndDate() {
			//预定时间一定小于付尾款时间,减少一天
			if (this.yuding.finalPaymentBeginTime) {
				return dateFormat(this.yuding.finalPaymentBeginTime - 3600 * 24 * 1000, 'yyyy-MM-dd');
			}
			return this.getDefaultEndDate();
		},
		yudingFinalPaymentBeginTimeStartDate() {
			if (this.yuding.endTime) {
				//增加1秒，即可到第二天
				return dateFormat(this.yuding.endTime + 1000, 'yyyy-MM-dd');
			} else if (this.yuding.beginTime) {
				//增加1天
				return dateFormat(this.yuding.beginTime + 3600 * 24 * 1000, 'yyyy-MM-dd');
			}
			return dateFormat(false, 'yyyy-MM-dd');
		},
		yudingFinalPaymentBeginTimeEndDate() {
			if (this.yuding.finalPaymentEndTime) {
				return dateFormat(this.yuding.finalPaymentEndTime, 'yyyy-MM-dd');
			}
			return this.getDefaultEndDate();
		},
		yudingFinalPaymentEndTimeStartDate() {
			if (this.yuding.finalPaymentBeginTime) {
				return dateFormat(this.yuding.finalPaymentBeginTime, 'yyyy-MM-dd');
			} else if (this.yuding.endTime) {
				return dateFormat(this.yuding.endTime, 'yyyy-MM-dd');
			} else if (this.yuding.beginTime) {
				return dateFormat(this.yuding.beginTime, 'yyyy-MM-dd');
			}
			return dateFormat(false, 'yyyy-MM-dd');
		},
		yudingFinalPaymentEndTimeEndDate() {
			return this.getDefaultEndDate();
		}
	},
	onLoad(options) {
		if (!options.isnew) {
			//编辑
			uni.setNavigationBarTitle({
				title: '编辑商品'
			});
			this.loadData();
		} else {
			uni.setNavigationBarTitle({
				title: '新增商品'
			});
			//默认单规格信息为主信息
			this.saleType = 'normal';
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
				if (this.yuding && this.yuding.price > 0) {
					this.saleType = 'yuding';
				} else {
					this.saleType = 'normal';
				}
				this.categoryIdTmp = this.categories;
				//异步查询商品详细
				goodsAdmin('info', {
					_id: this._id,
					shopid: this.shopid
				}).then(res => {
					this.description = res.description;
					if (res.description.trim() != '') {
						//多图
						this.descriptionImgs = res.description.split(';');
					}
				});
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
					//console.log(res);
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
		//关闭分类选择
		cancelSelectCategory() {
			this.$refs['showCateory'].close();
		},
		//确定选择的分类
		savaSelectCategory() {
			if (this.categoryIdTmp.length > 0) {
				this.categories = this.categoryIdTmp;
				this.categoryName = this.categoryIdTmp[this.categoryIdTmp.length - 1].name;

				//默认选中
				this.categoriesData.forEach(ele => {
					ele.children.forEach(chi => {
						chi.checked = this.categories.findIndex(f => f.id == chi.id) != -1;
					});
				});

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
				url: '/pages/admin/goods/skusBuilder',
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
		changeSaleType(val) {
			console.log('changeSaleType', val);
			this.saleType = val;
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
		//多图
		uploadDescImgs() {
			uploadFiles(
				'goods_imgs',
				20,
				srcs => {
					this.descriptionImgs = srcs;
				},
				srcs => {
					this.description = srcs.join(';');
				}
			);
		},
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
				title: this.title,
				subTitle: this.subTitle,
				deliveryTags: this.deliveryTags
			};
			//多规格
			if (this.skus && this.skus.length > 0) {
				Object.assign(info, {
					skus: this.skus,
					skuname: this.skuname
				});
				info.stock = 0;
				info.price = -1;
				info.default_sku_id = 0;
				this.skus.map(sku => {
					//价格取sku最低价
					if (info.price < 0 || info.price > sku.price) {
						info.price = sku.price;
						info.originPrice = +sku.originPrice;
						info.default_checked_sku_id = sku.id;
					}
					//库存累加
					info.stock += +sku.stock;
				});
			}
			let fields = {
				title: '标题',
				categories: '分类',
				src: '封面图',
				stock: '库存',
				price: '销售价格'
			};
			//判断必填项
			if (!this.checkFields(info, fields)) {
				this.submiting = false;
				return;
			}
			//开启预定功能
			if (this.saleType == 'yuding') {
				info.yuding = this.yuding;
				fields = {
					price: '定金',
					deduction: '抵扣金额',
					beginTime: '开始预定时间',
					endTime: '结束预定时间',
					finalPaymentBeginTime: '开始付尾款时间',
					finalPaymentEndTime: '结束付尾款时间'
				};
				if (!this.checkFields(info.yuding, fields)) {
					this.submiting = false;
					return;
				}
				//强转价格类型
				info.yuding.price = +info.yuding.price;
				info.yuding.deduction = +info.yuding.deduction;
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
		//获取默认结尾日期
		getDefaultEndDate() {
			let d = new Date();
			d.setFullYear(d.getFullYear() + 1);
			return dateFormat(d, 'yyyy-MM-dd');
		},
		//预定开始时间
		bindYudingBeginDateChange(e) {
			console.log(e);
			//https://www.cnblogs.com/qiu-Ann/p/11358803.html,IOS系统只识别 " / " 不识别 " - ".
			let time = new Date(e.detail.value.replace(/-/g, '/') + ' 00:00:00').getTime();
			//https://www.jianshu.com/p/991a5e979709  解决set之后页面不刷新问题
			this.$set(this.yuding, 'beginTime', time);
		},
		//预定结束时间
		bindYudingEndDateChange(e) {
			console.log(e);
			//这一天的最后一秒
			let time = new Date(e.detail.value.replace(/-/g, '/') + ' 23:59:59').getTime();
			this.$set(this.yuding, 'endTime', time);
		}, //付尾款开始时间
		bindYudingFinalPaymentBeginDateChange(e) {
			console.log(e);
			let time = new Date(e.detail.value.replace(/-/g, '/') + ' 00:00:00').getTime();
			this.$set(this.yuding, 'finalPaymentBeginTime', time);
		},
		//付尾款结束时间
		bindYudingFinalPaymentEndDateChange(e) {
			console.log(e);
			//这一天的最后一秒
			let time = new Date(e.detail.value.replace(/-/g, '/') + ' 23:59:59').getTime();
			this.$set(this.yuding, 'finalPaymentEndTime', time);
		},
		changeYudingSku(e) {
			//全部强转为int类型
			this.yuding.sku_ids = [];
			e.map(ele => {
				this.yuding.sku_ids.push(+ele);
			});
			console.log('changeYudingSku', this.yuding.sku_ids);
		},
		changeDeliveryTags(e) {
			this.deliveryTags = e.detail.value;
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
		z-index: 98;
		background: #ffffff;
	}
	&.selectCategory {
		background: #ffffff;
		justify-content: space-between;
		padding: 20upx 30upx 20upx;
		position: relative;
		height: 90upx;
		.add-btn {
			color: #007aff;
			flex: none;
			background: none;
			margin: 0;
			&.cancel {
				color: #888888;
			}
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
		color: #ffffff;
		text-align: center;
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
.yuding-section {
	padding: 20upx;
	background-color: #f5f5f5;
	.yuding-content {
		border-radius: 10px;
		position: relative;
		background-color: #ffffff;
	}
}
.d-list-image {
	text-align: center;
	position: relative;
	.number {
		position: absolute;
		left: 10rpx;
		top: 0;
	}
}
</style>
