'use strict';
/* 店铺首页，查询店铺信息，分类 */
const db = uniCloud.database();
exports.main = async (event, context) => {
	let shopid =parseInt(event.id);
	//所以这里按店铺销量+评分排序，分页获取
	let getCollectionNamesFunc = await uniCloud.callFunction({
		name: "getCollectionNames",
		data: event
	});
	let collectionNames = getCollectionNamesFunc.result;
	let query = db.collection(collectionNames["shops"]);
	let data =await query.where({
		id: shopid
	}).limit(1).get();
	if (data.affectedDocs == 0) {
		return {};
	}
	let shopInfo=data.data[0];
	//查询分类
	let categoryData = await uniCloud
		.callFunction({
			name: 'getCategoryByShopid',
			data: {
				id: shopid,
				stationId: event.stationId
			}
		});
	if(categoryData.result.affectedDocs > 0){
		shopInfo["goods_categories"]=categoryData.result.data;
	}
	return shopInfo
};
