<template>
	<view class="container">
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">*商品名称</text>
			<input type="text" class="cell-content" maxlength="40" v-model="title" placeholder="请输入商品名称" />
		</view>
		<view class="mix-list-cell b-b">
			<text class="cell-tit clamp">副 标 题</text>
			<input type="text" class="cell-content" maxlength="80" v-model="subTitle" placeholder="请输入副标题" />
		</view>
		<mix-list-cell title="*商品分类" :tips="categoryName" @eventClick="selectCategory()"></mix-list-cell>
		<mix-list-cell title="规格和库存" border="" :tips="specsTypeName" navigateType="down" @eventClick="selectSpecsType()"></mix-list-cell>
		<view class="skus">
			<block v-if="specsType == 'single'">
				<admin-goods-sku :info="singleInfo" title="" @change="changeSku"></admin-goods-sku>
			</block>
			<block v-else>
				<block v-for="(item, index) in skus" :key="index">
					<admin-goods-sku :info="item" :index="index" title="" :ismultiple="!0" @del="deleteSku" @change="changeSku"></admin-goods-sku>
					<view class="tmp" v-if="index< skus.length-1"></view>
				</block>
			</block>
		</view>
		<mix-list-input title="商品条码" :withScan="!0" :defContent="upc" field="upc" placeholder="请输入商品条码" @change="changeField"></mix-list-input>
		<mix-list-select title="*销售类型" :options="saleTypes" :border="saleType == 'normal' ? 'b-b' : ''" :defaultOption="saleType"
		 @eventClick="changeSaleType"></mix-list-select>
		<!-- saleType预定设置 -->
		<block v-if="saleType == 'yuding'">
			<view class="yuding-section">
				<view class="yuding-content">
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*定金</text>
						<input type="digit" class="cell-tip" v-model="yuding.price" placeholder="请输入定金" />
					</view>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*抵扣</text>
						<input type="digit" class="cell-tip" v-model="yuding.deduction" placeholder="请输入抵扣" />
					</view>
					<!-- 多规格商品选择支持的规格 -->
					<block v-if="specsType == 'multiple'">
						<mix-list-select title="*支持规格" :options="getSkuNames" :defaultOptions="yuding.sku_ids" selectType="checkbox"
						 @eventClick="changeYudingSku"></mix-list-select>
					</block>
					<view class="mix-list-cell b-b" @click="selectDatePicker('yuding.beginTime')">
						<text class="cell-tit clamp">*开始预定</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="yuding.beginTime">{{ yuding.beginTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b" @click="selectDatePicker('yuding.endTime')">
						<text class="cell-tit clamp">*结束预定</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="yuding.endTime">{{ yuding.endTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b" @click="selectDatePicker('yuding.finalPaymentBeginTime')">
						<text class="cell-tit clamp">*开始付尾款</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="yuding.finalPaymentBeginTime">{{ yuding.finalPaymentBeginTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell" @click="selectDatePicker('yuding.finalPaymentEndTime')">
						<text class="cell-tit clamp">*结束付尾款</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="yuding.finalPaymentEndTime">{{ yuding.finalPaymentEndTime | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
				</view>
			</view>
		</block>
		<block v-if="saleType == 'tuangou'">
			<view class="yuding-section">
				<view class="yuding-content">
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">*折扣价</text>
						<input type="digit" class="cell-tip" v-model="tuangou.price" placeholder="请输入折扣价" />
					</view>
					<view class="mix-list-cell b-b">
						<text class="cell-tit clamp">单位</text>
						<input type="text" class="cell-tip" v-model="tuangou.unit" placeholder="请输入单位" />
					</view>
					<view class="mix-list-cell b-b" @click="selectDatePicker('tuangou.beginTime')">
						<text class="cell-tit clamp">*开始团购</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="tuangou.beginTime">{{ tuangou.beginTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b" @click="selectDatePicker('tuangou.endTime')">
						<text class="cell-tit clamp">*结束团购</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="tuangou.endTime">{{ tuangou.endTime  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>
					<view class="mix-list-cell b-b" @click="selectDatePicker('tuangou.pickup')">
						<text class="cell-tit clamp">*开始提货</text>
						<view class="cell-tip">
							<view class="uni-input" v-if="tuangou.pickup">{{ tuangou.pickup  | dateFormat('yyyy-MM-dd hh:mm') }}</view>
							<view class="uni-input" v-else>选择时间</view>
						</view>
						<text class="cell-more yticon icon-you"></text>
					</view>

				</view>
			</view>
		</block>
		<view class="mix-list-cell" @click="uploadSrc">
			<text class="cell-tit clamp">*主图</text>
			<view class="cell-tip">尺寸800*800</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<view class="h-list" v-if="srcPreview && srcPreview != ''">
				<view class="h-list-image">
					<image :src="srcPreview" mode="aspectFill"></image>
				</view>
			</view>
		</view>
		<view class="mix-list-cell imgs" @click="uploadImgs">
			<text class="cell-tit clamp">轮播图</text>
			<view class="cell-tip">尺寸800*800</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<scroll-view scroll-x class="h-list" v-if="imgsPreview.length > 0">
				<view v-for="(item, index) in imgsPreview" :key="index" class="h-list-image">
					<image :src="item" mode="aspectFill"></image>
				</view>
			</scroll-view>
		</view>
		<view class="mix-list-cell" @click="uploadBanner">
			<text class="cell-tit clamp">横图</text>
			<view class="cell-tip">尺寸710*350</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b banner">
			<view class="h-list" v-if="bannerPreview && bannerPreview != ''">
				<view class="h-list-image">
					<image :src="bannerPreview" mode="aspectFill"></image>
				</view>
			</view>
		</view>
		<view class="mix-list-cell" @click="uploadDescImgs">
			<text class="cell-tit clamp">图文介绍</text>
			<view class="cell-tip">此处默认显示320*240,前端显示原始尺寸</view>
			<text class="cell-more yticon icon-you"></text>
		</view>
		<view class="imgs b-b">
			<view v-for="(item, index) in descriptionImgs" :key="index" class="d-list-image">
				<text class="number">{{ index + 1 }}</text>
				<image :src="item" mode="aspectFill"></image>
			</view>
		</view>
		<label class="mix-list-cell">
			<text class="cell-tit clamp">非必要信息</text>
		</label>
		<view class="skus">
			<view class="sub-container">
				<mix-list-input title="净含量" :defContent="net_weight" field="net_weight" placeholder="请输入净含量" @change="changeField"></mix-list-input>
				<mix-list-input title="保质期" :defContent="guarantee_period" field="guarantee_period" placeholder="请输入保质期" @change="changeField"></mix-list-input>
				<mix-list-input title="保存条件" :defContent="storage_condition" field="storage_condition" placeholder="请输入保存条件"
				 @change="changeField"></mix-list-input>
				<mix-list-input title="服务宗旨" :defContent="service_purpose" field="service_purpose" placeholder="请输入保质期" @change="changeField"></mix-list-input>
				<mix-list-input title="分享语" :defContent="share" field="share" placeholder="请输入分享语" @change="changeField"></mix-list-input>
				<view class="mix-list-cell b-b">
					<text class="cell-tit clamp">配送注意事项</text>
					<view class="cell-content content-right">
						<checkbox-group name="delivery_tags" @change="changeDeliveryTags">
							<view v-for="(itg,tindex) in deliveryTagNames" :key="tindex">
								<label>
									<text class="m-r">{{itg.name}}</text>
									<checkbox :value="itg.value" :checked="deliveryTags.indexOf(itg.value) != -1" />
								</label>
							</view>
						</checkbox-group>
						<checkbox-group name="onlySelfTake" @change="changeOnlySelfTake">
							<text class="m-r">仅自提</text>
							<checkbox value="1" :checked="onlySelfTake==1" />
						</checkbox-group>
					</view>
				</view>
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
		<bory-dateTimePicker ref='date-time' :startYear="startYear" :endYear="endYear" :datestring="dateString"
		 :indicatorStyle='indicatorStyle' type='datetime' @change='dateTimeChange'></bory-dateTimePicker>
	</view>
</template>

<script>
	import {
		mapState
	} from 'vuex';
	import {
		uploadFiles,
		dateFormat
	} from '@/common/functions.js';
	import {
		goodsAdmin,
		categoryAdmin
	} from '@/common/admin_request.js';
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
				deliveryTagNames: [
					{
						name:"加冰保鲜",
						value:"iceNeed"
					},
					{
						name:"独立包装",
						value:"package"
					}
				],
				id: false,
				upc: "", //商品条码
				share: "", //分享语
				imgs: [],
				imgsPreview: [],
				originPrice: 0,
				price: '',
				src: '',
				srcPreview: '',
				banner: '',
				bannerPreview: '',
				stock: '',
				title: '',
				subTitle: '',
				guarantee_period: '',
				storage_condition: '常温',
				service_purpose: '假一赔十',
				net_weight: '',
				submiting: false,
				saleType: 'normal',
				saleTypes: {
					normal: '正常销售',
					yuding: '提前预定',
					tuangou: '社区团购',
				},
				yuding: {},
				tuangou: {},
				dateKey: "",
				dateString: "",
				onlySelfTake: "0"
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
				return new Date().getFullYear() + 1;
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
				console.log(data)
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
					if (this.banner) {
						this.bannerPreview = this.banner;
					}
					if (this.skus && this.skus.length > 0) {
						this.setSpecsType('multiple');
						this.specsTypeTmp = 'multiple';
					}
					if (this.categories.length > 0) {
						this.categoryName = this.categories[this.categories.length - 1].name;
					}
					if (this.yuding && this.yuding.beginTime > 0) {
						this.saleType = 'yuding';
					}
					this.categoryIdTmp = this.categories;
					//异步查询商品详细
					/* goodsAdmin('info', {
						_id: this._id,
						shopid: this.shopid
					}).then(res => {
						this.description = res.description;
						if (res.description.trim() != '') {
							//多图
							this.descriptionImgs = res.description.split(';');
						}
					}); */
					if (this.description.trim() != '') {
						//多图
						this.descriptionImgs = this.description.split(';');
					}
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
								ele.children = [{
									id: ele.id,
									name: ele.name
								}];
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
			//banner横图
			uploadBanner() {
				uploadFiles(
					'goods_banner',
					1,
					srcs => {
						this.bannerPreview = srcs[0];
					},
					srcs => {
						this.banner = srcs[0];
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
			changeField(val, field) {
				console.log(val, field)
				this[field] = val;
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
					banner: this.banner,
					upc: this.upc,
					originPrice: this.originPrice,
					price: this.price,
					src: this.src,
					stock: this.stock,
					title: this.title,
					subTitle: this.subTitle,
					share: this.share,
					guarantee_period: this.guarantee_period,
					storage_condition: this.storage_condition,
					service_purpose: this.service_purpose,
					net_weight: this.net_weight,
					saleType: this.saleType,
					onlySelfTake: this.onlySelfTake, //是否仅支持自提
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
					fields = {
						beginTime: '开始预定时间',
						endTime: '结束预定时间',
						finalPaymentBeginTime: '开始付尾款时间',
						finalPaymentEndTime: '结束付尾款时间'
					};
					if (!this.checkTimeFields(info.yuding, fields)) {
						this.submiting = false;
						return;
					}
					//强转价格类型
					info.yuding.price = +info.yuding.price;
					info.yuding.deduction = +info.yuding.deduction;
					if (info.yuding.price + info.yuding.deduction >= info.price) {
						this.$api.msg("预售价必须小于零售价")
						return;
					}
				} else if (this.saleType == "tuangou") {
					info.tuangou = this.tuangou;
					fields = {
						price: '折扣价',
						beginTime: '开始团购时间',
						endTime: '结束团购时间',
						pickup: '提货时间',
					};
					if (!this.checkFields(info.tuangou, fields)) {
						this.submiting = false;
						return;
					}
					fields = {
						beginTime: '开始团购时间',
						endTime: '结束团购时间',
						pickup: '提货时间',
					};
					if (!this.checkTimeFields(info.tuangou, fields)) {
						this.submiting = false;
						return;
					}
					//强转价格类型
					info.tuangou.price = +info.tuangou.price;
					if (info.tuangou.price >= info.price) {
						this.$api.msg("团购价必须小于零售价")
						return;
					}
				}
				goodsAdmin('save', info, true).then(
					res => {
						console.log(res);
						setTimeout(() => {
							uni.navigateBack({
								delta: 1
							});
						}, 2000);
						this.$api.prePage().refreshList();
						this.$api.success('提交成功');
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
			/**
			 * 比较上一个字段与下一个自动的大小
			 * @param {Object} data
			 * @param {Object} fields
			 */
			checkTimeFields(data, fields) {
				let prev = 0;
				let prevField = "";
				for (let fie in fields) {
					if (prev > data[fie]) {
						this.$api.msg(`${fields[prevField]}必须大于或等于${fields[fie]}`);
						return false;
					}
					prev = data[fie];
					prevField = fie;
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
			},
			changeOnlySelfTake(e) {
				this.onlySelfTake = +e.detail.value;
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
				color: $font-color-light;
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
		margin-right: 16upx;
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
		padding: 20upx;
		background-color: $background-color;

		.sub-container {
			background: #FFFFFF;
			border-radius: 10upx;
		}
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

		&.b-b:after {
			left: $page-row-spacing;
		}
	}

	.h-list {
		white-space: nowrap;
		padding: 10upx 30upx 0;

	}

	.h-list-image {
		display: inline-block;
		margin-right: 20upx;

		image {
			width: 160upx;
			height: 160upx;
			border-radius: 4%;
		}
	}

	.banner {
		.h-list-image {
			image {
				width: 690rpx;
				height: 340rpx;
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
