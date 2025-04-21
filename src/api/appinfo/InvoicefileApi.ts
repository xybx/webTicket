import request from '/@/utils/request'


export const getDataListApi = (params:object)=>{
  return request({
    url: '/appsystem-invoicefile/selectByInvoicefileDTO',
    method:'get',
    params
  })
}
export const selectAllInvoicefile
= (params:object)=>{
  return request({
    url: '/appsystem-invoicefile/selectAllInvoicefile',
    method:'get',
    params
  })
}


export const downloadfiletoken = (params:object)=>{
  return request({
    url:'/appsystem-invoicefile/downloadfiletoken',
    method:'get',
    params
  })
}



export const del = (params:object)=>{
  return request({
    url:'/appsystem-invoicefile/del',
    method:'get',
    params
  })
}

export const putMultiDel = (params:object)=>{
  return request({
    url:'/appsystem-invoicefile/dels',
    method:'get',
    params
  })
}

export const baseUrl = `${window.VITE_APP_BASE_URL}/appsystem-invoicefile/downloadfile?token=`;

