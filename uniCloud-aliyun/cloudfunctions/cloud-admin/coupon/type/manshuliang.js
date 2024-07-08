'use strict';
/**
 * 满数量减，例如：满2件减3元，满4件打2折
 */
const model = {
	check(cou) {
		//实际优惠金额，为将来的满数量打折做准备
		cou.discount = +cou.manshuliang.amount;
		//取值范围，0-99
		if (cou.manshuliang.rate) {
			cou.discount = parseInt((100 - cou.manshuliang.rate) * cou.totalMoney) / 100;
		}
		return cou.totalAmount >= parseInt(cou.manshuliang.condition);
	},
	/**
	 * 统计符合此优惠券的商品信息
	 * @param {Object} cou
	 * @param {Object} data
	 */
	statistical(cou, data) {
		cou.totalAmount = 0;
		cou.totalMoney = 0;
		cou.innerGoodsIds = [];
		if (cou.type == 3) {
			//所有商品id
			cou.innerGoodsIds = data.goodsTotalIds;
			//所有数量
			cou.totalAmount = data.goodsTotalAmount;
			//所有金额
			cou.totalMoney = data.goodsTotalMoney;
		} else if (cou.type == 2) {
			//分类券，统计分类id
			let categoryIds = [];
			cou.category.map(cate => {
				//排除父级id
				categoryIds = categoryIds.filter(x => cate.pid != x);
				categoryIds.push(cate.id)
			});
			categoryIds.map(cid => {
				if (data.goodsTotalCategoryMap[cid]) {
					cou.totalAmount += data.goodsTotalCategoryMap[cid].totalAmount;
					cou.totalMoney += data.goodsTotalCategoryMap[cid].totalMoney;
					cou.innerGoodsIds.concat(data.goodsTotalCategoryMap[cid].gids);
				}
			})
		} else if (cou.type == 1) {
			//商品券，满金额减，此张优惠券统计到的总金额，可能是多个商品累加的
			cou.goods.map(g => {
				if (data.goodsTotalAmountMap[g._id]) {
					cou.totalAmount += data.goodsTotalAmountMap[g._id];
					cou.totalMoney += data.goodsTotalMoneyMap[g._id];
					cou.innerGoodsIds.push(g._id);
				}
			})
		}
		//去除重复商品id
		let gids = []
		if (cou.innerGoodsIds.length > 0) {
			cou.innerGoodsIds.map(g => {
				if (gids.indexOf(g) == -1) {
					gids.push(g);
				}
			});
		}
		cou.innerGoodsIds = gids;
	},
}

module.exports = model;
