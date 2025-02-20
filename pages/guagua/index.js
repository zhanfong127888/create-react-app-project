/**
 * xquery是一套小程序的开发工具库
 * 说明: 在小程序中搜索 xquery，更多demo和说明
 * 源码: https://github.com/webkixi/aotoo-xquery
 * 小程序代码片段: https://developers.weixin.qq.com/s/oONQs1mf7Uem
 */
const Pager = require('../../components/aotoo/core/index')
const mkGuaguaka = require('../../components/modules/guaguaka')
let source = require('../common/source')

Pager({
  data: {
    guaguaConfig: mkGuaguaka({
      title: '天天向上'
    }, function() {
      console.log('===== 4444');
    }),
    ...source
  }, 
})
