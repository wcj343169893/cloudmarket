'use strict';
const db = uniCloud.database()
exports.main = async (event, context) => {
	if(!event.id){
		event.id="5e69ee4417fc3f25f8e122e7";
	}
	const collection = db.collection('user_recommend_shops');
	const data = await collection.where({"_id":event.id}).field({'shops':1}).limit(1).get();
	if(data.affectedDocs > 0 ){
		var shops=data.data[0]["shops"];
		var shop_out=[];
		 for (var i = 0; i < shops.length; i++) {
			 if(i>3){
				 break;
			 }
			let shop=shops[i];
			let goods=shop["goods"];
			shop["goods"]=goods[Math.floor(Math.random()*goods.length)];
			shop_out.push(shop);
		} 
		return shop_out;
	}
	return [];
};
