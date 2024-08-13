<template>
	<view class="uni-pay" >

		<!-- PC版收银台弹窗开始 -->
		<uni-popup v-if="modeCom === 'pc'" ref="payPopup" type="center" :safe-area="false">
			<view class="pc-pay-popup">
				<view class="pc-pay-popup-title">收银台</view>
				<view class="pc-pay-popup-flex">
					<view class="pc-pay-popup-qrcode-box">
						<image class="pc-pay-popup-qrcode-image" :src="res.qr_code_image"></image>
						<view class="pc-pay-popup-amount-box">
							<view class="pc-pay-popup-amount-tips">扫一扫付款</view>
							<view class="pc-pay-popup-amount">{{ (options.total_fee / 100).toFixed(2) }}</view>
						</view>
						<view class="pc-pay-popup-complete-button" v-if="res.qr_code_image">
							<button type="primary" @click="_getOrder()">我已完成支付</button>
						</view>
					</view>
					<view class="pc-pay-popup-provider-list">
						<view class="pc-pay-popup-provider-item" v-if="currentProviders.indexOf('wxpay') > -1" :class="options.provider == 'wxpay' ? 'active' : ''" @click="_pcChooseProvider('wxpay')">
							<image :src="images.wxpay" class="pc-pay-popup-provider-image"></image>
							<text class="pc-pay-popup-provider-text">微信支付</text>
						</view>
						<view class="pc-pay-popup-provider-item" v-if="currentProviders.indexOf('alipay') > -1" :class="options.provider == 'alipay' ? 'active' : ''" @click="_pcChooseProvider('alipay')">
							<image :src="images.alipay" class="pc-pay-popup-provider-image"></image>
							<text class="pc-pay-popup-provider-text">支付宝支付</text>
						</view>
						<view class="pc-pay-popup-logo">
							<image :src="logo" mode="widthFix"></image>
						</view>
					</view>
				</view>
			</view>
		</uni-popup>
		<!-- PC版收银台弹窗结束 -->
		
		<!-- 手机版收银台弹窗开始 -->
		<uni-popup v-else ref="payPopup" type="bottom" :safe-area="false">
			<view class="mobile-pay-popup" :style="'min-height: '+height+';'">
				<view class="mobile-pay-popup-title">收银台</view>
				<view class="mobile-pay-popup-amount-box">
					<view>待支付金额：</view>
					<view class="mobile-pay-popup-amount">{{ (options.total_fee / 100).toFixed(2) }}</view>
				</view>
				<view class="mobile-pay-popup-provider-list">
					<uni-list>
						<!-- #ifdef MP-WEIXIN || H5 || APP -->
						<uni-list-item v-if="currentProviders.indexOf('wxpay') > -1" :thumb="images.wxpay" title="微信支付" @click="createOrder({ provider: 'wxpay' })" clickable link></uni-list-item>
						<!-- #endif -->
						<!-- #ifdef MP-ALIPAY || H5 || APP -->
						<uni-list-item v-if="currentProviders.indexOf('alipay') > -1" :thumb="images.alipay" title="支付宝" @click="createOrder({ provider: 'alipay' })" clickable link></uni-list-item>
						<!-- #endif -->
					</uni-list>
				</view>
			</view>
		</uni-popup>
		<!-- 手机版收银台弹窗结束 -->

		<!-- 二维码支付弹窗开始 -->
		<uni-popup ref="qrcodePopup" type="center" :safe-area="false" :animation="false" :mask-click="false" @close="clearQrcode">
			<view class="qrcode-popup-content">
				<image :src="res.qr_code_image" class="qrcode-image"></image>
				<view class="qrcode-popup-info">
					<view>
						<text class="qrcode-popup-info-fee">{{ (options.total_fee / 100).toFixed(2) }}</text>
						<text>元</text>
					</view>
					<view v-if="options.provider == 'wxpay'">请用微信扫码支付</view>
					<view v-else-if="options.provider == 'alipay'">请用支付宝扫码支付</view>
				</view>
				<button type="primary" @click="_getOrder()">我已完成支付</button>
				<view class="qrcode-popup-cancel" @click="closePopup('qrcodePopup')">暂不支付</view>
			</view>
		</uni-popup>
		<!-- 二维码支付弹窗结束 -->

		<!-- 外部浏览器确认支付弹窗开始 -->
		<uni-popup ref="payConfirmPopup" type="center" :safe-area="false" :animation="false" :mask-click="false">
			<view class="pay-confirm-popup-content">
				<view class="pay-confirm-popup-title">请确认支付是否已完成</view>
				<view><button type="primary" @click="_getOrder()">已完成支付</button></view>
				<view class="pay-confirm-popup-refresh"><button type="default" @click="_afreshPayment()">支付遇到问题，重新支付</button></view>
				<view class="pay-confirm-popup-cancel" @click="closePopup('payConfirmPopup')">暂不支付</view>
			</view>
		</uni-popup>
		<!-- 外部浏览器确认支付弹窗结束 -->


	</view>
</template>

<script>
	// 引入支付云对象
	const uniPayCo = uniCloud.importObject("uni-pay-co");
	import jsSdk from "../../js_sdk/js_sdk.js"
	var myOpenid; // 将openid临时缓存，避免重复获取openid
	// #ifdef APP
	import appleiapSdk from "../../js_sdk/appleiap.js"
	// #endif

	export default {
		name: "uni-pay",
		emits: ["success", "cancel", "fail", "create", "mounted","qrcode"],
		props: {
			/**
			 * Banner广告位id
			 */
			adpid: {
				Type: String,
				default: ""
			},
			/**
			 * 是否自动跳转到插件内置的支付成功页面（具有看广告功能，可以增加开发者收益）默认true
			 */
			toSuccessPage:{
				Type: Boolean,
				default: true
			},
			/**
			 * 支付成功后，点击查看订单按钮时跳转的页面地址
			 */
			returnUrl:{
				Type: String,
				default: ""
			},
			/**
			 * 支付结果页主色调，默认支付宝小程序为#108ee9，其他端均为#01be6e
			 * 建议：绿色系 #01be6e 蓝色系 #108ee9 咖啡色 #816a4e 粉红 #fe4070 橙黄 #ffac0c 橘黄 #ff7100
			 */
			mainColor:{
				Type: String,
				default: ""
			},
			/**
			 * 收银台模式
			 * mobile 手机版
			 * pc 电脑版
			 */
			mode:{
				Type: String,
				default: ""
			},
			/**
			 * PC收银台模式时，展示的logo
			 */
			logo:{
				Type: String,
				default: "/static/logo.png"
			},
			/**
			 * 收银台高度（默认70vh）
			 */
			height: {
				Type: [String],
				default: "70vh"
			},
			/**
			 * 是否打印运行过程日志
			 */
			debug: {
				Type: Boolean,
				default: false
			}
		},
		data() {
			return {
				// 支付参数
				options: {},
				// 支付云对象返回结果
				res: {},
				images: {
					wxpay: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAABC9JREFUeF7tWk1a20AMlUzv0bDr13AAYAOcpLCBcoqQU1DYEE6C2QAHIP26q3sPPOqniU2cZMYj+SeGxN5kEXlm9ObpjaQxwpY/uOX+Qw9Az4AtR6APgS0nQC+CfQi0FQLfrvcHXwAGPP4bQMK/fy5f7O9HehphwPfb/dOIogEhHQHBcamDCDESPoIxMQPTNSi1ABj+OrwDpNMaO5og4P2bMZOugFADwNTewWhU0/FVzAgnKZnxuoFQAbB3vX9MET7U2PHgq4R09vv8ZRI0bMhADMDw9uAhGN8NLQrWyAYRAGt1PgcRIU5TOms7JIIAdOL8nElJauikTRBKAdi7ObwioFFTzHaMw3mBzRV8DwKOXy+ertpagxcAq/YR/g2d6TlNrUDu4EiiE0Why4T1rgyINoXRC4DgjE+mF8+7RYAkp4RrRyVztRUKTgCkuz89fz4pAiB5z7WbklBrKxScAEgWxI6joZPXy5c4B0H0nkPdhzcHFIxxhHgZ8OA7AgMnAMObA479UnF6H5twQpF5RBMdibPDvB4AAAL6IZ0rNbTb9IngAyC8IwJ0K5okQBgzqFEKSV4wcXg17bxl8fIiJXFc0bHAgYLjYlHEFaZlVUQDoAIbcVZaN1VRrgAgUfImASiKW6Yh4pAohmHVQqpLABI0dMYiKhJPCeoV0ueuQsDmEJrkSeJ/bqNJnOqfApqVzWznzrdYWkvzhnUDYGnPKLTdV5gpfLiOqJUIaTefF8RKH6wxtAOX2IdA8NcCmmRItmBLfVF5jRBnR58kGQtWlGUJlBeAxpQ5A4eFKTu/ufLzPQv1f2mRRDiZ/nyyYwYrypI0OlQOc/9PsgshDsh2v+BUwTFnD3K5DglVlD4WlDZEsqywNgiK2F9gQBkLi7EtyV59WhBsiTURCjy5QZMgYRn9cxbZWgCQ+IKlnH2sFQYTURHmCYMgAJaKs9aYPkXNXGK6QhQdt9xeC4UhTC+eV/wVASASmrKj6IMA4NIBMQDsX1VN4IlbuU0K7vmiQS0G5EOpmiW6I1Dpjtp8pYc5yxYVj0RtXcMJcwDFSiqYLh2x+QgqAJwnAuEEydxbkZtdj+fKPVfwbPIq7KngqvMVX4WoAmDBAcH9HTMmXw23s0LJSlPOOsZx0l8VAu/0Fzjuc2Td3aY5zf1VoZgBvPgmvuhoIrFSMSXQThcDoJo0YLxGLfBSv5IINgVC1XxCOb/oZrkTBtRJqkQgKG6ROgPgPbGq/6HVIiYK51WngAj5ikbBhoZi3FALbHmozhlQXFChTc75g6wRM2ufzb9N/IwMcG0wg8HZJf9HBF/tFZnBBBH+cW/BpBDnd4XLDNJcon4oBiiY7jS194mEI0IaSz+12ygAclSYEcXvFsqA3UgANEzqAdCgtYm2PQM2cVc1PvUM0KC1ibY9AzZxVzU+bT0D/gPs/oxfcUEcJAAAAABJRU5ErkJggg==",
					alipay: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA2FJREFUeF7tmU122jAQx2cMB2hp9yULeK+naHISwhJyiIRDBJaQkwRO0fdgEWff0h4ANH0yFc+m+hhbckKNvJUsaX76z4ckhAv/8MLthwggKuDCCUQXuHABxCAYXSC6wIUTiC7wFgL4MPveTaj9optrO+696ya8yeQRQFRAdIEYAxoVBD/PNtdCwHWpDIJwr+1PMCk1DgAkCSx/jHrLsv/p+lfKAp3HzQOYDAqxKtcYBJPtXe/B1Y3TXgmATGst0WIrgAC7JmBINOQsNN8HE0zfVQFlFxzrgFgHNLQOkNJuQ7vrcgkS1CXEua5fgnDj+l+172CX/h59Tbn9Of0qBUE1cGe2ngPhLWeiEH0krFDBT63HC8Cnx/VtFuFDfgl90UOldDvuX4WcSo7lBSD0YuR4H6ebZwRNkRUw9xdSah1G+IzZmW5IW7ERDX/e9Rc+YwerBEMvQo1nrhfqkf/ZuYCxxK5J/t4AjkFQBi71CXxFoFSWq2XTlkn+AndXodNf5SwgT4J7gnttoNL6BqUEmCZET/tkvzQZYj5g1Sf/0goIkfcJYIkEK5HsFnkYnen6BXQptUb5lwJgMz4zCihXD/BqAwVDuoy+Uqx399kACrkZaYECVjY5qxJZXpoQwrcDHB6UghfVvPssAMo35W4R7oZVg5EMmAJxUCZ2CNzfVJ2Pm6qdleDBNwFClaHZdRrQAEhWe25VSPCuAMo1tnQhdIzMNUixfDYBqAOGVQEKQB15OFMCwXPV3QsFww7g73E39Pudr/Gn0EyplQPXCkBF/5AKsBtPKRA+AdKAEx/0BhYLL9nHFkhZLiBvbkOcxFzG5wPtoe7gBUrrTiMttqO+8ebZCkAtWErs17jHvrrSLcj+lkCpKeV5g/ABIA05lqgVM4Er2nPhZgev7DHGnToLG+ALIC9budgWwoRzyuMUPlzj8waVBuELIFOB5iksi7xIKQh8PS4wu8/j+a3vBScbRAgABVfg5BZbH6SFgP0kVIl7UCjNja4RCkAGwecaPLDhp4yNsSYkADlp/mncdNLLu8fpud9XQK7//wERGoBrAefSfgRBsLI9pTtPg+diUNV1yLuJypVg1Un/p/8arwDXZkQALkJNb48KaPoOu+yLCnARanp7VEDTd9hlX1SAi1DT2/8AaakVXysj5qkAAAAASUVORK5CYII="
				},
				originalRroviders: ["wxpay","alipay"],
				currentProviders: ["wxpay","alipay"],
				openid: ""
			}
		},
		async mounted() {
			let code;
			let res;
			if (!myOpenid) {
				// #ifdef MP-WEIXIN
				code = await this.getCode();
				res = await this.getOpenid({
					provider: "wxpay",
					code
				});
				if (res) {
					myOpenid = res.openid;
					this.openid = res.openid;
				} 
				// #endif
				// #ifdef MP-ALIPAY
				code = await this.getCode();
				res = await this.getOpenid({
					provider: "alipay",
					code
				});
				if (res) {
					myOpenid = res.openid;
					this.openid = res.openid;
				}
				// #endif
			}
			// #ifndef MP
			// 如果不是小程序，则请求云端获取支持的支付方式
			let getPayProviderFromCloudRes = await this.getPayProviderFromCloud();
			if (getPayProviderFromCloudRes.errCode === 0) {
				this.originalRroviders = getPayProviderFromCloudRes.provider;
				this.currentProviders = JSON.parse(JSON.stringify(this.originalRroviders));
			}
			// #endif
			// #ifdef MP-WEIXIN
			// 如果是微信小程序，则设置只支持微信支付
			this.originalRroviders = ["wxpay"];
			this.currentProviders = JSON.parse(JSON.stringify(this.originalRroviders));
			// #endif
			// #ifdef MP-ALIPAY
			// 如果是支付宝小程序，则设置只支持支付宝支付
			this.originalRroviders = ["alipay"];
			this.currentProviders = JSON.parse(JSON.stringify(this.originalRroviders));
			// #endif
			this.$emit("mounted", {
				images: this.images,
				originalRroviders: this.originalRroviders,
				currentProviders: this.currentProviders,
				// #ifdef APP
				appleiapSdk: appleiapSdk,
				// #endif
			});
		},
		methods: {
			// 发起支付 - 打开支付选项弹窗
			async open(options = {}) {
				if (options.provider) {
					let providers = [];
					this.originalRroviders.map((item, index) => {
						if (options.provider.indexOf(item) > -1) {
							providers.push(item);
						}
					});
					this.currentProviders = providers;
					delete options.provider;
				} else {
					this.currentProviders = JSON.parse(JSON.stringify(this.originalRroviders));
				}
				this.options = options;
				if (this.currentProviders.length === 1) {
					this.createOrder({ provider: this.currentProviders[0] });
				} else {
					if (this.modeCom === "pc") {
						this._pcChooseProvider(this.currentProviders[0]);
					}
					this.openPopup("payPopup");
				}
			},
			// 创建支付
			async createOrder(data = {}) {
				let { options } = this;
				Object.assign(options, data);
				if (options.provider === "appleiap") {
					// ios内购走特殊逻辑
					return this._appleiapCreateOrder(options);
				}
				// #ifdef H5
				// 判断如果是pc访问，则强制扫码模式
				if (["pc", "pc-weixin"].indexOf(jsSdk.checkPlatform()) > -1) {
					options.qr_code = true;
				}
				// #endif
				let createOrderData = {
					provider: options.provider,
					total_fee: options.total_fee,
					openid: myOpenid,
					order_no: options.order_no,
					out_trade_no: options.out_trade_no,
					description: options.description,
					type: options.type,
					qr_code: options.qr_code,
					custom: options.custom,
					other: options.other,
					wxpay_virtual: options.wxpay_virtual, // 微信小程序虚拟支付需要
				};
				if (myOpenid) {
					createOrderData.openid = myOpenid;
				}
				// #ifdef H5
				if (options.openid && options.provider === "wxpay") createOrderData.openid = options.openid;
				// #endif
				try {
					let res = await uniPayCo.createOrder(createOrderData);
					if (!res.errCode) {
						this.$emit("create", res);
						if (res.qr_code && !options.cancel_popup) {
							this.res = res;
							// 展示组件内置的二维码弹窗
							if (this.modeCom === "pc") {
								this.openPopup("payPopup");
								this._pcChooseProvider(options.provider);
							} else {
								this.openPopup("qrcodePopup");
							}
						} else {
							// 调起支付
							this.orderPayment(res);
						}
					} else {
						this.$emit("fail", res);
					}
				} catch(err){
					this.$emit("fail", err);
				}
			},
			// 调起支付
			orderPayment(res){
				this.res = res;
				if (res.qr_code) {
					this.$emit("qrcode", res);
				} else if (res.order) {
					// #ifdef H5
					if (res.provider_pay_type === "jsapi") {
						// 微信公众号支付
						WeixinJSBridge.invoke("getBrandWCPayRequest", res.order, (res) => {
							if (res.err_msg == "get_brand_wcpay_request:ok") {
								// 用户支付成功回调
								this._getOrder();
							} else if (res.err_msg == "get_brand_wcpay_request:cancel") {
								// 用户取消支付回调
								this.$emit("cancel", res);
							} else if (res.err_msg == "get_brand_wcpay_request:fail") {
								// 用户支付失败回调
								console.error('getBrandWCPayRequest-fail: ', res);
								this.$emit("fail", res);
							}
						});
					} else {
						// 外部浏览器支付
						let codeUrl = res.order.codeUrl;
						let mwebUrl = res.order.mwebUrl || res.order.mweb_url;
						setTimeout(() => {
							this.openPopup("payConfirmPopup");
							window.location.href = codeUrl || mwebUrl;
						}, 200);
					}
					// #endif
					// #ifndef H5
					if (res.provider === "wxpay-virtual") {
						uni.requestVirtualPayment({
							...res.order,
							success: (res) => {
								this._getOrder();
							},
							fail: (err) => {
								if (err.errMsg.indexOf("fail cancel") == -1) {
									// 发起支付失败
									console.error("uni.requestVirtualPayment:fail", err);
									this.$emit("fail", err);
								} else {
									// 用户取消支付
									this.$emit("cancel", err);
								}
							}
						})
					} else {
						uni.requestPayment({
							// #ifdef APP-PLUS
							provider: res.provider, // App端此参数必填，可以通过uni.getProvider获取
							// #endif
							// #ifdef MP-WEIXIN
							...res.order,
							// #endif
							// #ifdef APP-PLUS || MP-ALIPAY
							orderInfo: res.order,
							// #endif
							...res.order,
							success:(res)=>{
								this._getOrder();
							},
							fail:(err)=>{
								if (err.errMsg.indexOf("fail cancel") == -1) {
									// 发起支付失败
									console.error("uni.requestPayment:fail", err);
									this.$emit("fail", err);
								} else {
									// 用户取消支付
									this.$emit("cancel", err);
								}
							}
						});
					}
					// #endif
				}
			},
			// 打开弹窗
			openPopup(name){
				if (!this.$refs[name].showPopup) this.$refs[name].open();
			},
			// 关闭弹窗
			closePopup(name){
				this.$refs[name].close();
			},
			// 查询订单（查询支付情况）
			async getOrder(data = {}) {
				try {
					let res = await uniPayCo.getOrder(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 发起退款（此接口需要admin角色才可以访问）
			async refund(data = {}) {
				try {
					let res = await uniPayCo.refund(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 查询退款（查询退款情况）
			async getRefund(data = {}) {
				try {
					let res = await uniPayCo.getRefund(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 关闭订单
			async closeOrder(data = {}) {
				try {
					let res = await uniPayCo.closeOrder(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 获取支持的支付供应商
			async getPayProviderFromCloud(data = {}) {
				try {
					let res = await uniPayCo.getPayProviderFromCloud(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 获取支付配置内的appid（主要用于获取获取微信公众号的appid，用以获取code）
			async getProviderAppId(data = {}) {
				try {
					let res = await uniPayCo.getProviderAppId(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 根据code获取openid
			async getOpenid(data = {}) {
				try {
					let res = await uniPayCo.getOpenid(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 验证iosIap苹果内购支付凭据
			async verifyReceiptFromAppleiap(data = {}) {
				try {
					let res = await uniPayCo.verifyReceiptFromAppleiap(data);
					if (typeof data.success === "function") data.success(res);
					return res;
				} catch (err) {
					if (typeof data.fail === "function") data.fail(err);
				}
			},
			// 获取code
			async getCode() {
				// #ifdef MP-WEIXIN
				return jsSdk.getWeixinCode();
				// #endif
				// #ifdef MP-ALIPAY
				return jsSdk.getAlipayCode();
				// #endif
			},
			// 支付成功后的逻辑
			paySuccess(res={}) {
				this.closePopup("payPopup");
				this.closePopup("payConfirmPopup");
				this.clearQrcode();
				if (this.toSuccessPage){
					// 跳转到支付成功的内置页面
					this.pageToSuccess(res);
				}
				this.$emit("success", res);
			},
			pageToSuccess(res){
				if (this.modeCom !== "pc") {
					uni.navigateTo({
						url:`/uni_modules/uni-pay/pages/success/success?out_trade_no=${res.out_trade_no}&order_no=${res.pay_order.order_no}&pay_date=${res.pay_order.pay_date}&total_fee=${res.pay_order.total_fee}&adpid=${this.adpid}&return_url=${this.returnUrl}&main_color=${this.mainColor}`
					});
				} else {
					if (this.returnUrl) {
						let url = this.returnUrl + `?out_trade_no=${res.out_trade_no}&order_no=${res.pay_order.order_no}`;
						if (url.indexOf("/") !== 0) url = `/${url}`;
						uni.navigateTo({
							url,
						});
					}
				}
			},
			// 监听 - 关闭二维码弹窗
			clearQrcode() {
				this.res.codeUrl = "";
				this.res.qr_code_image = "";
			},
			// 内部函数查询支付状态
			async _getOrder() {
				this.getOrder({
					out_trade_no: this.res.out_trade_no,
					await_notify: true,
					success: (res) => {
						if (res.has_paid) {
							this.closePopup("qrcodePopup");
							this.paySuccess(res);
						}
					}
				});
			},
			// 重新发起支付
			_afreshPayment(){
				this.orderPayment(this.res);
			},
			// pc版弹窗选择支付方式
			_pcChooseProvider(provider){
				if (provider === this.options.provider) {
					return;
				}
				return this.createOrder({ provider: provider })
			},
			// ios内购支付逻辑
			async _appleiapCreateOrder(options){
				// 初始化ios内购商品
				let appleiap = new appleiapSdk.Iap({
					// products为苹果开发者后台的商品id数组
					products: [options.productid]
				});
				uni.showLoading({
					title: '加载中...'
				});
				// 初始化，获取iap支付通道
				await appleiap.init();
				// 从苹果服务器获取产品列表
				let productList = await appleiap.getProduct();
				let productInfo = productList[0];
				options.total_fee = productInfo.price * 100;
				options.description = productInfo.description;
				let createOrderData = {
					provider: options.provider,
					total_fee: options.total_fee,
					order_no: options.order_no,
					out_trade_no: options.out_trade_no,
					description: options.description,
					type: options.type,
					custom: options.custom,
				};
				let res = await uniPayCo.createOrder(createOrderData);
				if (res.errCode === 0) {
					this.$emit("create", res);
					this.res = res;
					uni.showLoading({
						title: '支付请求中...'
					});
					try {
						// 请求苹果支付
						if (this.debug) console.log("正在请求苹果服务器", options.productid, res.out_trade_no);
						let requestPaymentRes = await appleiap.requestPayment({
							productid: options.productid,
							username: res.out_trade_no
						});
						if (this.debug) console.log('用户支付成功', requestPaymentRes);
						uni.showLoading({
							title: '正在处理支付结果...'
						});
						if (!requestPaymentRes.payment.username) {
							requestPaymentRes.payment.username = this.getAppleiapUserName(requestPaymentRes);
						}
						if (!requestPaymentRes.payment.username) {
							// 如果运行到了这里，代表这单丢失了username，只能做丢单处理，否则用户会一直卡在丢单检测
							// 完结订单
							await appleiap.finishTransaction(requestPaymentRes);
							uni.hideLoading();
							console.log(`您可能已支付成功，但很抱歉丢单了，请联系客服处理。`, requestPaymentRes);
							return false;
						}
						// 将凭据和username缓存起来
						this.addAppleiapOrder(requestPaymentRes);
						// 云端请求苹果服务器验证票据
						let verifyRes = await this.verifyReceiptFromAppleiap({
							out_trade_no: requestPaymentRes.payment.username,
							transaction_receipt: requestPaymentRes.transactionReceipt,
							transaction_identifier: requestPaymentRes.transactionIdentifier
						});
						if (verifyRes.errCode === 0) {
							// 完结订单
							await appleiap.finishTransaction(requestPaymentRes);
							this.removeAppleiapOrder(requestPaymentRes);
							uni.hideLoading();
							this.paySuccess(verifyRes);
						}
					} catch (err) {
						let code = err.errCode || err.code;
						if (code === 2) {
							// 用户取消支付
							if (this.debug) console.log("用户取消支付");
							this.$emit("cancel", err);
						} else {
							// 发起支付失败
							console.error("appleiapCreateOrder:fail", err);
							this.$emit("fail", err);
						}
						uni.hideLoading();
					}
				}
			},
			// ios内购支付漏单重试
			async appleiapRestore(){
				uni.showLoading({
					title: '检测支付环境...'
				});
				// 初始化
				let appleiap = new appleiapSdk.Iap();
				// 初始化，获取iap支付通道
				await appleiap.init();
				try {
					if (this.debug) console.log("正在查询是否有漏单信息");
					const transactions = await appleiap.restoreCompletedTransactions({
						username: ""
					});
					if (this.debug) console.log('漏单查询结果：' + (transactions.length === 0 ? '未漏单' : "有漏单"), transactions);
					if (!transactions.length) {
						return;
					}
					// 开发者业务逻辑，从服务器获取当前用户未完成的订单列表，和本地的比较
					for (let i = 0; i < transactions.length; i++) {
						let requestPaymentRes = transactions[i];
						switch (requestPaymentRes.transactionState) {
							case appleiapSdk.IapTransactionState.purchased:
								// 云端请求苹果服务器验证票据
								if (!requestPaymentRes.payment.username) {
									requestPaymentRes.payment.username = this.getAppleiapUserName(requestPaymentRes);
								}
								if (!requestPaymentRes.payment.username) {
									// 如果运行到了这里，代表这单丢失了username，只能做丢单处理，否则用户会一直卡在丢单检测
									// 完结订单
									await appleiap.finishTransaction(requestPaymentRes);
									console.log(`您可能已支付成功，但很抱歉丢单了，请联系客服处理。`, requestPaymentRes);
									continue;
								}
								console.log('requestPaymentRes: ', requestPaymentRes);
								let verifyRes = await this.verifyReceiptFromAppleiap({
									out_trade_no: requestPaymentRes.payment.username,
									transaction_receipt: requestPaymentRes.transactionReceipt,
									transaction_identifier: requestPaymentRes.transactionIdentifier
								});
								console.log('verifyRes: ', verifyRes);
								if (verifyRes.errCode === 0) {
									// 完结订单
									console.log("完结订单："+requestPaymentRes.payment.username);
									await appleiap.finishTransaction(requestPaymentRes);
									this.removeAppleiapOrder(requestPaymentRes);
								}
								break;
							case appleiapSdk.IapTransactionState.failed:
								// 关闭未支付的订单
								await appleiap.finishTransaction(requestPaymentRes);
								break;
							default:
								break;
						}
					}
				} catch (e) {
					console.error(e)
				} finally {
					uni.hideLoading();
				}
			},
			// 保存ios内购订单至本地缓存（丢单时可找回username）
			addAppleiapOrder(requestPaymentRes){
				let key = "uni-pay-appleiap-order";
				let list = uni.getStorageSync(key) || [];
				list.push(requestPaymentRes);
				uni.setStorageSync(key, list);
			},
			// 从本地缓存中根据订单信息获取username
			getAppleiapUserName(requestPaymentRes){
				let key = "uni-pay-appleiap-order";
				let list = uni.getStorageSync(key) || [];
				let info = list.find((item) => {
					return item.transactionIdentifier === requestPaymentRes.transactionIdentifier && item.transactionDate === requestPaymentRes.transactionDate;
				});
				let username = info && info.payment && info.payment.username;
				return username;
			},
			// 从本地缓存中删除ios内购订单
			removeAppleiapOrder(requestPaymentRes){
				let key = "uni-pay-appleiap-order";
				let list = uni.getStorageSync(key) || [];
				let index = list.findIndex((item) => {
					return item.transactionIdentifier === requestPaymentRes.transactionIdentifier && item.transactionDate === requestPaymentRes.transactionDate;
				});
				if (index > -1) {
					list.splice(index, 1);
				}
				uni.setStorageSync(key, list);
			},
		},
		watch: {

		},
		computed: {
			modeCom(){
				if (this.mode) return this.mode;
				let systemInfo = uni.getSystemInfoSync();
				return systemInfo && systemInfo.deviceType === "pc" ? "pc" : "mobile";
			}
		},
	}
</script>
<style lang="scss" scoped>
	.uni-pay {
		--bgcolor: #f3f3f3;
	}

	/* 手机版收银台弹窗开始 */
	.mobile-pay-popup {
		min-height: 70vh;
		background-color: var(--bgcolor);
		border-radius: 30rpx 30rpx 0 0;
		overflow: hidden;

		.mobile-pay-popup-title {
			background-color: #ffffff;
			text-align: center;
			font-weight: bold;
			font-size: 40rpx;
			padding: 20rpx;
		}

		.mobile-pay-popup-amount-box {
			background-color: #ffffff;
			padding: 30rpx;

			.mobile-pay-popup-amount {
				color: #e43d33;
				font-size: 60rpx;
				margin-top: 20rpx;
			}
		}

		.mobile-pay-popup-provider-list {
			background-color: #ffffff;
			margin-top: 20rpx;
		}
	}
	/* 手机版收银台弹窗结束 */

	/* PC版收银台弹窗开始 */
	.pc-pay-popup {
		width: 800px;
		height: 600px;
		background-color: var(--bgcolor);
		border-radius: 10px;
		overflow: hidden;
		.pc-pay-popup-title{
			background-color: #ffffff;
			text-align: center;
			font-weight: bold;
			font-size: 20px;
			height: 66px;
			line-height: 66px;
		}
		.pc-pay-popup-flex{
			width: 100%;
			/* #ifndef APP-NVUE */
			display: flex;
			/* #endif */
			.pc-pay-popup-qrcode-box{
				height: calc(600px - 66px);
				flex: 1;
				background-color: #ffffff;
				/* #ifndef APP-NVUE */
				display: flex;
				/* #endif */
				flex-direction: column;
				justify-content: center;
				align-items: center;
				.pc-pay-popup-qrcode-image{
					width: 225px;
					height: 225px;
				}
				.pc-pay-popup-amount-box{
					text-align: center;
					.pc-pay-popup-amount-tips{
						color: #333;
						font-size: 20px;
						margin-top: 20px;
					}
					.pc-pay-popup-amount{
						color: #dd524d;
						font-weight: bold;
						font-size: 32px;
						margin-top: 20px;
					}
				}
				.pc-pay-popup-complete-button{
					margin-top: 20px;
				}

			}
			.pc-pay-popup-provider-list{
				width: 300px;
				/* #ifndef APP-NVUE */
				display: flex;
				/* #endif */
				flex-direction: column;
				.pc-pay-popup-provider-item{
					padding: 20px;
					/* #ifndef APP-NVUE */
					display: flex;
					/* #endif */
					align-items: center;
					.pc-pay-popup-provider-image{
						width: 60px;
						height: 60px;
					}
					.pc-pay-popup-provider-text{
						color: #333;
						font-size: 20px;
						margin-left: 10px;
					}
				}
				.pc-pay-popup-provider-item.active{
					background-color: #ffffff;
				}
				.pc-pay-popup-provider-item:hover{
					background-color: #ffffff;
					cursor: pointer;
				}
				.pc-pay-popup-logo{
					flex: 1;
					/* #ifndef APP-NVUE */
					display: flex;
					/* #endif */
					align-items: center;
					justify-content: center;
					image{
						width: 120px;
					}
				}

			}
		}
	}
	/* PC版收银台弹窗结束 */

	/* 二维码支付弹窗开始 */
	.qrcode-popup-content {
		width: 600rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		padding: 40rpx;
		box-sizing: border-box;
		text-align: center;

		.qrcode-image {
			width: 450rpx;
			height: 450rpx;
		}

		.qrcode-popup-info {
			text-align: center;
			padding: 20rpx;

			.qrcode-popup-info-fee {
				color: red;
				font-size: 60rpx;
				font-weight: bold;
			}
		}

		.qrcode-popup-cancel{
			margin-top: 20rpx;
			text-align: center;
		}
	}
	/* 二维码支付弹窗结束 */

	/* 外部浏览器H5支付弹窗确认开始 */
	.pay-confirm-popup-content {
		width: 550rpx;
		background-color: #ffffff;
		border-radius: 10rpx;
		padding: 40rpx;
		.pay-confirm-popup-title {
			text-align: center;
			padding: 20rpx 0;
			margin-bottom: 30rpx;
		}
		.pay-confirm-popup-refresh{
			margin-top: 20rpx;
		}
		.pay-confirm-popup-cancel{
			margin-top: 20rpx;
			text-align: center;
		}
	}
	/* 外部浏览器H5支付弹窗确认结束 */

</style>
