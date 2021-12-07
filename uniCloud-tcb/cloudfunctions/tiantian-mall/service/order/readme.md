## 订单类型处理方法  
新增订单方式需要继承的方法  
```
/**
 * 付款前查询支付金额
 * @param {Object} order 
 */
async beforeSave(order) {
	//构造订单字段
}

/**
 * 更新支付单号，避免重复，支付成功之后，根据此id查询订单
 */
async updateOutTradeNo(order) {
}
/**
 * 付款后更新订单状态
 * @param {Object} payinfo
 */
async afterPayment(payinfo) {
	console.log("商城订单支付完成回调成功，更新订单信息")
}
/**
 * 订单退款
 * @param {Object} order
 */
async refund(order) {}
```