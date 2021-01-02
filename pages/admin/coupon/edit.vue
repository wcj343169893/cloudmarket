<template>
	<view class="uni-container container-fixed">
		<uni-forms ref="form" :value="formData" validate-trigger="submit" err-show-type="toast">
			<uni-forms-item name="title" label="标题">
				<uni-easyinput v-model="formData.title" />
			</uni-forms-item>
			<uni-forms-item name="type" label="优惠类型">
				<uni-data-checkbox v-model="formData.type" :localdata="formOptions.type_localdata" />
			</uni-forms-item>
			<uni-forms-item name="goods" label="商品列表" v-if="formData.type==1">
				<block v-if="formData.goods && formData.goods.length > 0">
					<view v-for="(g , index) in formData.goods" :key="index" class="flex align-center margin-bottom-sm">
						<image class="suoluetu" :src="g.src | thumbImg('120x120')" mode="aspectFill"></image>
						<view class="text-sm flex-sub margin-left-sm">
							<view class="">
								<text class="title">{{ g.title }}</text>
							</view>
							<view class="attr-box">
								<text>单价:</text>
								<text class="price">{{ g.price }}</text>
							</view>
						</view>
						<view class="margin-left-xs">
							<button class="cu-btn sm bg-red" @click="deleteGoods(index)">删除</button>
						</view>
					</view>
				</block>
				<button class="cu-btn sm bg-green" @click="selectGoods()">选择商品</button>
			</uni-forms-item>
			<uni-forms-item name="category" label="商品分类" v-else-if="formData.type==2" class="flex-item">
				<view class="uni-input flex-sub" v-if="formData.category && formData.category.length>0">{{ formData.category.map(g=>g.name).join("、") }}</view>
				<view class="uni-input flex-sub" v-else>请选择分类</view>
				<button class="margin-left-xs cu-btn sm bg-green" @click="navToGoodsCategory()">{{categoryBtn}}</button>
			</uni-forms-item>
			<uni-forms-item name="style" label="优惠方式">
				<uni-data-checkbox v-model="formData.style" :localdata="formOptions.style_localdata" />
			</uni-forms-item>
			<block v-if="formData.style == 'manjine'">
				<uni-forms-item label="满足条件" class="flex-item">
					<uni-easyinput type="number" v-model="formData.manjine.condition" />
					<text class="margin-left-sm">元</text>
				</uni-forms-item>
				<uni-forms-item label="优惠金额" class="flex-item">
					<uni-easyinput type="number" v-model="formData.manjine.amount" />
					<text class="margin-left-sm">元</text>
				</uni-forms-item>
			</block>
			<block v-else-if="formData.style == 'manshuliang'">
				<uni-forms-item label="满足条件" class="flex-item">
					<uni-easyinput type="number" v-model="formData.manshuliang.condition" />
					<text class="margin-left-sm">件</text>
				</uni-forms-item>
				<uni-forms-item label="优惠金额" class="flex-item">
					<uni-easyinput type="number" v-model="formData.manshuliang.amount" />
					<text class="margin-left-sm">元</text>
				</uni-forms-item>
			</block>
			<uni-forms-item name="beginTime" label="开始时间" class="flex-item">
				<cloud-date v-model="formData.beginTime"></cloud-date>
			</uni-forms-item>
			<uni-forms-item name="endTime" label="结束时间" class="flex-item">
				<cloud-date v-model="formData.endTime"></cloud-date>
			</uni-forms-item>
			<uni-forms-item name="limit" label="限制张数">
				<uni-easyinput type="number" v-model="formData.limit" />
			</uni-forms-item>
			<uni-forms-item name="stock" label="总库存">
				<uni-easyinput type="number" v-model="formData.stock" />
			</uni-forms-item>
			<uni-forms-item name="state" label="状态">
				<uni-data-checkbox v-model="formData.state" :localdata="formOptions.state_localdata" />
			</uni-forms-item>
			<uni-forms-item name="today" label="当日可用" class="flex-item">
				<view class="uni-input flex-sub"></view>
				<switch @change="binddata('today', $event.detail.value)" :checked="formData.today" :class="{checked:formData.today}" />
			</uni-forms-item>
			<uni-forms-item name="memo" label="说明">
				<uni-easyinput v-model="formData.memo" type="textarea" />
			</uni-forms-item>
		</uni-forms>
		<button class="fixed-add-btn" @click="submit">提交</button>
	</view>
</template>

<script>
	import validator from '@/js_sdk/validator/cloud_coupons.js';

	const db = uniCloud.database();
	const dbCmd = db.command;
	const dbCollectionName = 'cloud_coupons';

	function getValidator(fields) {
		let reuslt = {}
		for (let key in validator) {
			if (fields.indexOf(key) > -1) {
				reuslt[key] = validator[key]
			}
		}
		return reuslt
	}

	import {
		dateFormat
	} from '@/common/functions.js';
	export default {
		data() {
			return {
				categoryBtn: "选择",
				formData: {
					"beginTime": null,
					"endTime": null,
					"goods": [],
					"category": [],
					"limit": 1,
					"manshuliang": {},
					"manjine": {},
					"memo": "",
					"shopid": null,
					"state": 0,
					"stock": 1000,
					"title": "",
					"today": null,
					"type": 1,
					"style": 1
				},
				formOptions: {
					"state_localdata": [{
							"text": "草稿箱",
							"value": 0
						},
						{
							"text": "已发布",
							"value": 1
						},
						{
							"text": "已停用",
							"value": 2
						}
					],
					"type_localdata": [{
							"text": "商品券",
							"value": 1
						},
						{
							"text": "分类券",
							"value": 2
						},
						{
							"text": "店铺券",
							"value": 3
						}
					],
					"style_localdata": [{
							"text": "满金额减",
							"value": "manjine"
						},
						{
							"text": "满数量减",
							"value": "manshuliang"
						}
					]
				},
				rules: {
					...getValidator(["beginTime", "endTime", "goods", "category", "limit", "manjine", "memo", "shopid", "state",
						"title", "today", "type", "stock"
					])
				}
			}
		},
		onLoad(e) {
			const id = e.id
			this.formDataId = id
			this.getDetail(id)
		},
		onReady() {
			this.$refs.form.setRules(this.rules)
		},
		methods: {
			/**
			 * 触发表单提交
			 */
			submit() {
				uni.showLoading({
					mask: true
				})
				console.log(this.formData)
				this.$refs.form.submit().then((res) => {
					res.shopid = this.adminShopId;
					res[res.style] = this.formData[res.style];
					res.price = Number(res[res.style].amount);
					res.modified = Date.now();
					this.submitForm(res)
				}).catch((errors) => {
					uni.hideLoading()
				})
			},

			submitForm(value) {
				// 使用 uni-clientDB 提交数据
				db.collection(dbCollectionName).doc(this.formDataId).update(value).then((res) => {
					this.$api.success("修改成功")
					this.$api.prePage().refreshList();
					this.navTimeBack();
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},

			/**
			 * 获取表单数据
			 * @param {Object} id
			 */
			getDetail(id) {
				uni.showLoading({
					mask: true
				})
				db.collection(dbCollectionName).doc(id).get().then((res) => {
					const data = res.result.data[0]
					if (data) {
						this.formData = data;
						if (!data.manjine) {
							this.formData.manjine = {}
						}
						if (!data.manshuliang) {
							this.formData.manshuliang = {}
						}
						if (!data.category) {
							this.formData.category = []
						}
					}
				}).catch((err) => {
					uni.showModal({
						content: err.message || '请求服务失败',
						showCancel: false
					})
				}).finally(() => {
					uni.hideLoading()
				})
			},
			//选择多件商品
			selectGoods() {
				let gids = [];
				if (this.formData.goods) {
					this.formData.goods.map(g => {
						gids.push(g._id);
					})
				}
				uni.setStorageSync("selectedIds", gids);
				uni.navigateTo({
					url: `/pages/admin/goods/list?type=choosemany&state=coupons`
				});
			},
			deleteGoods(index) {
				this.formData.goods.splice(index, 1)
			},
			refreshList(data) {
				this.formData.goods = data;
			},
			navToGoodsCategory() {
				uni.navigateTo({
					url: "/pages/admin/goods/category/select"
				})
			},
			refreshCategory(cates) {
				this.formData.category = cates;
				console.log("refreshCategory", cates)
				this.categoryBtn = "更改"
			}
		}
	}
</script>

<style>
	.uni-container {
		background: #FFFFFF;
	}

	.uni-input-border,
	.uni-textarea-border {
		width: 100%;
		font-size: 14px;
		color: #666;
		border: 1px #e5e5e5 solid;
		border-radius: 5px;
		box-sizing: border-box;
	}

	.uni-input-border {
		padding: 0 10px;
		height: 35px;

	}

	.uni-textarea-border {
		padding: 10px;
		height: 80px;
	}

	.uni-button-group {
		margin-top: 50px;
		display: flex;
		justify-content: center;
	}

	.uni-button {
		width: 184px;
		padding: 12px 20px;
		font-size: 14px;
		border-radius: 4px;
		line-height: 1;
		margin: 0;
	}
</style>
