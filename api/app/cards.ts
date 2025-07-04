import instance from "../axios";
//import CommonUtils from "../utils/common";
import type { Params as PublicParams } from "../types/public";
import type { Params as CardsParams } from "../types/cards";

const APP_PATH = "/admin/cards";
const APP_PATH_ID = "/admin/card";

//获取卡片
const getCard = (params: PublicParams.IDOperate) => {
    return instance.get(APP_PATH_ID, {
        params: params,
    });
};

//获取卡片列表
const getCardIndex = (params: PublicParams.Index) => {
    //参数处理
    if (params.search_keys != undefined && params.search_keys.length > 0) {
        params.search_keys = JSON.stringify(params.search_keys) as any;
    }
    params.search_value ? params.search_value : delete params.search_value;
    params.order_key ? params.order_key : delete params.order_key;
    //params.order_desc ? params.order_desc : delete params.order_desc;
    return instance.get(APP_PATH, {
        params: params,
    });
};

//删除卡片
const deleteCard = (params: PublicParams.IDOperate) => {
    return instance.delete(APP_PATH, { params: params });
};

//编辑卡片
const patchCard = (params: CardsParams.Patch) => {
    return instance.patch(APP_PATH_ID, params);
};

//批量操作
const batchOperate = (params: PublicParams.BatchOperate) => {
    const data = {
        ids: JSON.stringify(params.ids),
        method: params.method,
    };
    return instance.post(APP_PATH + '/batch-operate', data);
};

const CardsApi = {
    getCardIndex,
    deleteCard,
    getCard,
    patchCard,
    batchOperate
};

export default CardsApi;