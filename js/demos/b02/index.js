//index.js
//获取应用实例
const app = getApp()
const Pager = require('../common/extpager')

Pager({
  data: {
    targetConfig: {
      title: 'Button',
      itemClass: 'button button02',
    },
  },
})
