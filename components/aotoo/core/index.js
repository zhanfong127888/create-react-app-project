const lib = require('../lib/index')
import {
  resetStoreEvts,
  commonBehavior,
  commonMethodBehavior,
  baseBehavior,
  itemBehavior,
  itemComponentBehavior,
  listBehavior,
  listComponentBehavior,
  treeBehavior,
  treeComponentBehavior,
  reactFun
} from "./behaviors/index";

import { 
  alert
} from "./ui";

import { 
  post,
  _get,
  upload,
  usualKit,
} from "./utils";

function pageDataElement(data) {
  let nData
  let eles = {}
  let acts = {}
  if (lib.isObject(data)) {
    if (data['$$id']) {
      const $id = data['$$id']
      eles[$id] = $id
      // if (data.methods) {
      //   const methods = data.methods
      //   if (lib.isObject(methods)) {
      //     acts[$id] = Object.assign(acts, methods)
      //     delete data.methods
      //   }
      // }
    } else {
      nData = {}
      Object.keys(data).forEach(key=>{
        let item = data[key]
        if (lib.isObject(item)) {
          if (item['$$id']) {
            const $id = item['$$id']
            eles[$id] = key
    
            // if (item.methods) {
            //   if (lib.isObject(item.methods)) {
            //     // acts[$id] = Object.assign(acts, item.methods)
            //     acts[$id] = item.methods
            //     delete item.methods
            //   }
            // }
    
            if (item.data && lib.isArray(item.data)) {
              item.data = item.data.map(sub => {
                // if (lib.isObject(sub) && sub['$$id']) {
                //   const obj = pageDataElement(sub)
                //   eles = Object.assign(eles, obj.eles)  // tree/@list 模式适用,  tree/li模式需要区分是否为idf项
                //   acts = Object.assign(acts, obj.acts)
                // }
                return sub
              })
            }
          }
        }
        nData[key] = item
      })
    }
  }
  nData = nData || data
  return {eles, acts, nData}
}

function mergeActions(inst, acts) {
  if (lib.isObject(acts)) {
    Object.entries(acts).forEach(function(item) {
      const mtdKey = item[0]
      const mtdFun = item[1]
      if (lib.isFunction(mtdFun)) {
        inst[mtdKey] = mtdFun
      }
    })
  }
}

let activePage
core.getElementsById = function (id) {
  if (activePage) {
    return activePage.getElementsById(id)
  }
}

function core(params) {
  if (lib.isObject(params)) {
    let app = getApp(params.appConfig)
    app.hooks = lib.hooks('aotoo')

    if (params.data) {
      let myData = params.data
      var {eles, acts, nData} = pageDataElement(myData)
      params.data = nData
      if (!app['_vars']) {
        app['_vars'] = {}
      }
    }

    const oldLoad = params.onLoad
    params.onLoad = function () {
      this.vars = {}
      this.elements = {}
      this.eles = eles || {}  // 存放id映射表
      this.acts = acts || {}
      this.uniqId = lib.suid('page')
      this.hooks = lib.hooks(this.uniqId)
      
      this.getElementsById = function(key) {
        if (key) {
          return this.elements[key] || this.selectComponent('#'+key)
        } else {
          return this.elements
        }
      }
      app.activePage = activePage = this
      app.hooks.emit('activePage', activePage)
      app.hooks.emit('changeActivePage', activePage)
      if (typeof oldLoad == 'function') {
        oldLoad.apply(this, arguments)
        // setTimeout(() => {
        //   oldLoad.apply(this, arguments)
        // }, 150);
      }
    }

    const oldReady = params.onReady
    params.onReady = function() {
      const that = this

      const elements = this.eles
      const actions = this.acts
      const actionIds = Object.keys(actions)
      actionIds.forEach($$id => {
        const defineMethods = actions[$$id]
        if (elements[$$id]) {
          const instId = elements[$$id]
          if (that.elements[instId]) {
            let $component = that.elements[instId]
            mergeActions($component, defineMethods)
          }
        }
      })

      
      if (typeof oldReady == 'function') {
        oldReady.apply(this, arguments)
        this.hooks.emit('onReady')
        // setTimeout(() => {
        //   oldReady.apply(this, arguments)
        //   this.hooks.emit('onReady')
        // }, 150);
      } else {
        this.hooks.emit('onReady')
      }
    }

    const oldSshow = params.onShow
    params.onShow = function(){
      if (this.__hide) {
        app.activePage = this
        activePage = this
      }
      this.__hide = false
      if (typeof oldSshow == 'function') {
        oldSshow.apply(this, arguments)
      }
    }

    const oldHide = params.onHide
    params.onHide = function () {
      this.__hide = true
      if (typeof oldHide == 'function') {
        oldHide.apply(this, arguments)
      }
    }

    const oldUnload = params.onUnload
    params.onUnload = function() {
      if (typeof oldUnload == 'function') {
        oldUnload.apply(this, arguments)
      }
      app.activePage = undefined
      activePage = null
      resetStoreEvts()
      app.hooks.emit('destory')
      this.hooks.emit('destory')
      // lib.resetSuidCount()
      this.hooks.destory()
      core.kit.destory()
      core.toolkit = null
    }

    Page(params)
  }
}

core.item = function(data, prefix) {
  if (data) {
    if (lib.isString(data) || lib.isNumber(data)) {
      data = {title: data}
    }

    if (lib.isObject(data)) {
      data['$$id'] = data['$$id'] || prefix || lib.suid('item__')
    }

    data.show = data.hasOwnProperty('show') ? data.show : true
  }
  return data
}

core.list = function(list, prefix) {
  if (typeof list == 'object') {
    if (lib.isArray(list)) {
      list = {data: list}
    }
    list['$$id'] = list['$$id'] || prefix || lib.suid('list__')
    list['show'] = list.hasOwnProperty('show') ? list.show : true
    return list
  }
}

core.tree = function(data) {
  return core.list(data, lib.suid('tree__'))
}

function setItem(item) {
  let $item = item
  if (!item.hasOwnProperty('show')){
    $item = core.item(item)
  }
  $item = lib.resetItem($item)
  return $item
}

core.lib = lib
core.kit = usualKit(null)
core.toolkit = core.kit
core.alert = alert
core.post = post
core.get = _get
core.upload = upload
core.setItem = setItem
core.reactFun = reactFun
core.commonBehavior = commonBehavior
core.commonMethodBehavior = commonMethodBehavior
core.baseBehavior = baseBehavior
core.itemBehavior = itemBehavior
core.itemComponentBehavior = itemComponentBehavior
core.listBehavior = listBehavior
core.listComponentBehavior = listComponentBehavior
core.treeBehavior = treeBehavior
core.treeComponentBehavior = treeComponentBehavior
core.hooks = lib.hooks
module.exports = core