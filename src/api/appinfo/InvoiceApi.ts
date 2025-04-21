import request from '/@/utils/request'


export const getDataListApi = (params:object)=>{
  return request({
    url: '/appsystem-invoice/selectMyByInvoiceDTO',
    method:'get',
    params
  })
}
export const getAllDataListApi = (params:object)=>{
  return request({
    url: '/appsystem-invoice/selectByInvoiceDTO',
    method:'get',
    params
  })
}
export const updateChecck = (data:any)=>{
  return request({
    url:'/appsystem-invoice/updateChecck',
    method: 'POST',
    data
  })
}

export const getbathStaticDownloadFileToken = (params:object)=>{
  return request({
    url:'/appsystem-invoice/getbathStaticDownloadFileToken',
    method: 'get',
    params
  })
}



export const del = (params:object)=>{
  return request({
    url:'/appsystem-invoice/del',
    method:'get',
    params
  })
}


export const putMultiDel = (params:object)=>{
  return request({
    url:'/appsystem-invoice/dels',
    method:'get',
    params
  })
}

export const baseUrl = `${window.VITE_APP_BASE_URL}/appsystem-invoice/bathStaticDownloadFile?token=`;
