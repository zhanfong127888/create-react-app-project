import {
  isString,
  isObject,
  isArray,
  isNumber,
  isFunction,
  formatQuery,
  suid,
  resetSuidCount,
} from './util'

function formatImg(props) {
  let img = props.img
  if (isString(img)) {
    let ary = img.split('#')
    if (ary.length > 1) {
      img = img.replace('#', '?')
      let obj = formatQuery(img)
      props.img = { src: obj.url, ...obj.query }
    } 
  }
  return props
}

// 处理url
function formatUrl(props) {
  let url = props.url
  if (isString(url)) {
    let ary = url.split('#')
    if (ary.length === 1) {
      props.url = {title: props.title, url: url}
    } else {
      let obj = formatQuery('?'+ary[1])
      url = ary[0]
      props.url = {title: props.title, url, ...obj.query}
      
      // let tmp = {}
      // let param = ary[1]
      // tmp.url = ary[0]
      // let paramAry = param.split('&')
      // for (let ii = 0; ii < paramAry.length; ii++) {
      //   let val = paramAry[ii]
      //   let kv = val.split('=')
      //   if (!kv[1]) kv[1] = true
      //   if (kv[1]==='false' || kv[1]==='true') kv[1] = JSON.parse(kv[1])
      //   tmp[kv[0]] = kv[1]
      // }
      // props.url = {...tmp}
    }
    delete props.title
  }
  return props
}

const attrKey = [
  'aim', 'attr', 'class', 'itemClass', 'style', 'itemStyle', 'template',
  'tap', 'catchtap', 'longtap', 'catchlongtap', 'longpress', 'catchlongpress',
  'touchstart', 'touchmove', 'touchend', 'touchcancel',
  'data-treeid', 'id', 'treeid', 'src', '$$id', '__sort', 'tempName', 'idf', 'parent', 'show',
  'type', 'typeOptions',
  'hoverclass', '__actionMask',
  'data', 'mode'
]

const accessKey = [
  'title', 'img', 'icon', 'list', 'tree', 'item', 
  'header', 'body', 'footer', 'dot', 'li', 'k', 'v', 'url'
]

export function resetItem(data, context, loop, attrkey) {
  if (typeof data == 'string' || typeof data == 'number' || typeof data == 'boolean') return data
  if (isObject(data)) {
    let extAttrs = {}
    let incAttrs = []
    data['__sort'] = []
    data.show = data.hasOwnProperty('show') ? data.show : true

    if (attrkey!=='url' && data.url) {
      data = formatUrl(data)
    }

    if (attrkey!=='img' && data.img) {
      data = formatImg(data)
    }
  
    if (context) {
      data.fromComponent = context.data.fromComponent || data.fromComponent || context.data.uniqId
      data.__fromParent = context.data.__fromParent
      if (data.methods || data.itemMethod) {
        if (attrkey&&attrkey.indexOf('@')>-1) {
          /** 不处理 @组件的methods */
        } else {
          const methods = data.methods || data.itemMethod
          Object.keys(methods).forEach(key=>{
            let fun = methods[key]
            if (isFunction(fun)) {
              fun = fun.bind(context)
              context[key] = fun
            }
          })
          delete data.methods
          delete data.itemMethod
        }
      }

      if (context.$$is && (context.$$is === 'list' || context.$$is === 'tree')) {
        if (!data['__key']) data['__key'] = suid('arykey_')
      }
    }

    if (loop === 'itemSubArray') {
      if (!data['__key']) data['__key'] = suid('arykey_')
    }
    
    Object.keys(data).forEach(function (key) {
      // if (data.hasOwnProperty(key)) {
      if (data[key] || data[key]===0 || typeof data[key] === 'boolean') {
        if (accessKey.indexOf(key) > -1 || (key.indexOf('@') == 0 && key.length > 1)) {
          incAttrs.push(key)
        } else {
          if (key == 'aim') {
            data.catchtap = data[key]
            extAttrs['catchtap'] = data[key]
            delete data.aim
          } else {
            extAttrs[key] = data[key]
          }
        }
      } else {
        delete data[key]
      }
    })
    
    data['__sort'] = incAttrs
    for (var attr of incAttrs) {
      const sonItem = data[attr]
      if (isArray(sonItem)) {
        data[attr] = sonItem.filter(item => resetItem(item, context, 'itemSubArray'))
      } else {
        if (attrkey && attrkey.indexOf('@') > -1) {
          /** 不去污染内部的父级链，只做表层 */
        }
        else {
          data[attr] = resetItem(sonItem, context, true, attr)
        }
        // if (/^[^@]/.test(attr) && sonItem) {
        //   data[attr] = resetItem(sonItem, context, true)
        // } 
      }
    }
    if (!data.parent && !loop) data.itemDataRoot = true // 标识该item是最顶层item，class style用作容器描述
  }
  return data
}