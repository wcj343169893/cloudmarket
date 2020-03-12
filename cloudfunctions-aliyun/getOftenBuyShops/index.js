'use strict';
const db = uniCloud.database();
exports.main = async (event, context) => {
  const collection = db.collection('user_often_buy_shops');
  const data = await collection.where({"uid":event.uid}).orderBy("_id","desc").get();
  return data;
};
