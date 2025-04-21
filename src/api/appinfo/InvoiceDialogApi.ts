import request from '/@/utils/request'


// 编辑获得属性
export const selectById = (params: any) => {
    return request({
        method: 'GET',
        url: '/appsystem-invoice/selectVoByPid',
        params,

    });
}
export const addinvoice = (data: any) => {
    return request({
        method: 'POST',
        url: '/appsystem-invoice/add',
        data

    });
}


// 增加列表项
export const addfile = (data: any) => {
    return request({
        method: 'POST',
        url: '/appsystem-invoicefile/add',
        data,
        headers:{
            "Content-Type": ' multipart/form-data'
       }

    });
}
export const del = (params: any) => {
    return request({
        method: 'GET',
        url: '/appsystem-invoicefile/del',
        params,

    });
}
// 编辑列表项
export const update = (data: any) => {
    return request({
        method: 'POST',
        url: '/appsystem-invoice/update',
        data,

    });
}

