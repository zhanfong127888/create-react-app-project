const Core = require('../../aotoo/core/index')
const $lunar = require('./lunar').calendar
const lib = Core.lib

export let festival = $lunar.festival
export let lfestival = $lunar.lfestival
export const getFestival = function() {
  return festival
}
export function getLunarFestival() {
  return lfestival
}
export function setFestival(param = {}) {
  $lunar.festival = param
}
export function setLunarFestival(param = {}) {
  $lunar.lfestival = param
}

import { 
  getYmd,
  rightYmd,
  formatDate,
  newDate,
  sortDates,
  isLeapYear,
  getWeekday,
  getMonthCount,
  getNextMonthCount,
  getPreMonthCount
} from './util/index'

export {
  getYmd,
  rightYmd,
  formatDate,
  newDate,
  sortDates,
  isLeapYear,
  getWeekday,
  getMonthCount,
  getNextMonthCount,
  getPreMonthCount
}

function indexData(data=[]) {
  let tmp = {}
  data.forEach((item, ii)=>{
    if (item.date) {
      tmp[item.date] = {index: ii}
    }
  })
  return tmp
}

let aboutMonth = [
  31, null, 31, 30,
  31, 30, 31, 31,
  30, 31, 30, 31
]

// 这里获得我们第一次的 数据 数组
export function completeMonth(timestart) {
  let globalDisable = this.disable
  let fillupData = this.fillData
  let defaultDate = this.date // 默认日期显示，item类型
  let validFestival = this.coptions.festival
  let validLunar = this.coptions.lunar
  let alignMonth = this.coptions.alignMonth
  let dataIndexs = indexData(fillupData)
  // 生成日历数据，上个月的 x 天 + 当月的 [28,29,30,31]天 + 下个月的 y 天 = 42
  let res = [];
  let today = getYmd() // 今天
  let ymd = getYmd(timestart)
  let {year, month, day} = ymd
  let todayDate = `${today.year}-${today.month}-${today.day}`
  let todayStamp = newDate(todayDate).getTime()
  let currentMonth = getMonthCount(year, month-1);
  let preMonth = getPreMonthCount(year, month-1);
  let nextMonth = getNextMonthCount(year, month-1);
  let whereMonday = getWeekday(year, month-1);
  let preArr = preMonth.slice(-1 * (whereMonday || -(preMonth.length)));
  let patchDay = (42 - currentMonth.length - whereMonday)%7

  // 使每月日期总数为42
  if (alignMonth && (preArr.length + currentMonth.length + patchDay) < 42) {
    patchDay += 42 - (preArr.length + currentMonth.length + patchDay)
  }
  let nextArr = nextMonth.slice(0, patchDay);

  let startDayStamp = this.validStartDay
  let endDayStamp = this.validEndDay
  let sDate = getYmd(startDayStamp)
  let startDate = `${sDate.year}-${sDate.month}-${sDate.day}`
  
  let preYmd = rightYmd(ymd, -1)
  let nextYmd = rightYmd(ymd)
  preArr = preArr.map(num=>{
    let lunarDate = $lunar.solar2lunar(preYmd.year, preYmd.month, num)
    let date = {title: num, itemClass: 'invalid'}
    if (validLunar) {
      date.ltitle = lunarDate.lunarFestival || lunarDate.IDayCn
      date.lunar = lunarDate
    }
    if (date.ltitle) {
      date.dot = date.dot || []
      date.dot.push({title: date.ltitle, itemClass: 'lunar-date'})
    }
    return date
  })
  nextArr = nextArr.map(num=>{
    let lunarDate = $lunar.solar2lunar(nextYmd.year, nextYmd.month, num)
    let date = {title: num, itemClass: 'invalid'}
    if (validLunar) {
      date.ltitle = lunarDate.lunarFestival || lunarDate.IDayCn
      date.lunar = lunarDate
    }
    if (date.ltitle) {
      date.dot = date.dot || []
      date.dot.push({title: date.ltitle, itemClass: 'lunar-date'})
    }
    return date
  })
  // preArr = preArr.map(num=>({title: {title: num, itemClass: 'date-item-day'}, itemClass: 'invalid'}) )
  // nextArr = nextArr.map(num=>({title: {title: num, itemClass: 'date-item-day'}, itemClass: 'invalid'}))

  currentMonth = currentMonth.map(_num=>{
    let theDate = `${year}-${month}-${_num}`
    let lunarDate = $lunar.solar2lunar(year, month, _num)
    // console.log(lunarDate);

    let theStamp = newDate(theDate).getTime()
    let theMonthCount = getMonthCount(year, month-1).length
    let num = {title: _num, itemClass: 'date-item-day'}
    if (todayDate === theDate) num.title = '今天'

    if (validLunar && theDate === lunarDate.date) {
      validFestival = true
      num.ltitle = lunarDate.lunarFestival || lunarDate.IDayCn
      num.lunar = lunarDate
    }

    // 是否显示节日
    if (validFestival) {
      if (validFestival === true) {
        num.title = lunarDate.festival || lunarDate.lunarFestival || lunarDate.Term || num.title
      } else {
        // 按筛选条件显示节日
        if (lib.isArray(validFestival)) {
          let holiday = lunarDate.festival || lunarDate.lunarFestival || lunarDate.Term
          if (holiday) {
            let vf = []  // 有效节日
            validFestival.forEach((f, ii)=>{
              if (f) { vf.push((f.title||f)) }
            })

            if (vf.indexOf(holiday) > -1 || vf.indexOf((holiday + '节')) > -1) {
              let idx = ~(~vf.indexOf(holiday) || ~vf.indexOf((holiday+'节')))
              let val = validFestival[idx]
              if (lib.isString(val)) num.title = holiday
              else if(lib.isObject(val)) num = Object.assign(num, val.content)
            }
          }
        }
      }
    }

    if (num.ltitle) {
      num.dot = num.dot || []
      num.dot.push({title: num.ltitle, itemClass: 'lunar-date'})
    }

    // let ori = {title: num, timestamp: theStamp, date: theDate, year, month, day: _num, itemClass: 'valid'}
    let ori = {timestamp: theStamp, date: theDate, year, month, day: _num, itemClass: 'valid', ...num}
    if (theStamp <= endDayStamp) {
      if (lib.isObject(defaultDate)) {
        ori = Object.assign({}, ori, defaultDate)
      }
      if (lib.isFunction(defaultDate)) {
        ori = defaultDate.call(this, ori) || ori
      }
      
      let dateTap = `onSelected?type=date&date=${theDate}`
      if (globalDisable === false) {
        ori.tap = dateTap
      }

      // 是否匹配filldata中的数据，并设置该date的显示内容
      if (dataIndexs[theDate]) {
        let index = dataIndexs[theDate].index
        let fillData = fillupData[index].content || fillupData[index]
        if (ori.body && fillData.body) {
          fillData.body = ori.body.concat(fillData.body)
        }
        if (ori.footer && fillData.footer) {
          fillData.footer = ori.footer.concat(fillData.footer)
        }
        if (ori.dot && fillData.dot) {
          fillData.dot = ori.dot.concat(fillData.dot)
        }
        ori = Object.assign({}, ori, fillData)
        ori.valid = true // 有效日期
        if (theStamp < todayStamp) {
          ori.disable = true
        }
      } else {
        if (globalDisable && ori.disable !== false) ori.disable = true
      }

      // 小于开始日期
      if (theStamp < startDayStamp) {
        ori.disable = true
        // ori.itemClass = 'valid invalid'
        // delete ori.tap
      }

      if (ori.disable) {
        ori.itemClass = 'valid invalid'
        if (fillupData.length) ori.valid = false // 只有data有数据的时候才设置该值
        delete ori.tap
      } else {
        ori.itemClass = 'valid'
        ori.tap = dateTap
      }

      // if (ori.disable === false) {
      //   ori.itemClass = 'valid'
      //   ori.tap = dateTap
      // } else if(ori.disable) {
      //   ori.itemClass = 'valid invalid'
      //   delete ori.tap
      // }
      // return ori
    } else {
      if (_num <= theMonthCount) {
        ori.itemClass = 'valid invalid'
        ori.valid = false
        ori.tap = undefined
        // return ori
      } else {
        // return {title: num, itemClass: 'valid invalid'}
        ori =  {itemClass: 'valid invalid', ...num}
      }
    }
    // return {originalDate: JSON.stringify(ori), ...ori}
    // return {originalDate: lib.clone(ori), ...ori}
    
    return ori

    // _ori = {originalDate: JSON.stringify(_ori), ...ori,}
    // return _ori
  })

  res = [].concat(preArr, currentMonth, nextArr);
  return res
};

export function oneMonthListConfig(timestart) {
  let that = this
  let coptions = this.coptions
  let mode = coptions.mode
  let allowBox = this.allowBox
  let checkType = coptions.type   // single/range/mutiple
  let rangeCount = coptions.rangeCount
  let rangeMode = coptions.rangeMode
  let allMonths = this.allMonths
  let {year, month, day} = getYmd(timestart)
  let endPoint = getYmd(this.validEndDay)
  let monthDays = completeMonth.call(this, timestart)
  let originalMonthDays = lib.clone(monthDays)
  let rangeTip = (coptions.rangeTip && lib.isArray(coptions.rangeTip) && coptions.rangeTip.length >= 2) ? coptions.rangeTip : null


  function getFollowMonths(first, over) {
    let endMonth = endPoint.month // 最终月
    let firstPoint = first
    let edgePoint = over || {}
    let others = []
    let nexts = []
    let preset = []
    let firstStat = false
    let findStat = false
    for (let ii=0; ii<allMonths.length; ii++) {
      let mon = getYmd(allMonths[ii])

      if (mon.year === firstPoint.year && mon.month === firstPoint.month) {
        firstStat = ii
      }
      
      if ( 
        firstStat === false || 
        (~firstStat && ii >= firstStat && (findStat === false))

        // ((firstStat || firstStat === 0) && ii>firstStat && (findStat === false))
      ) {
        preset.push(`${that.calenderId}-${mon.year}-${mon.month}`)

        if ( (firstStat || firstStat===0) && ii >= firstStat) {
          nexts.push(`${that.calenderId}-${mon.year}-${mon.month}`)
        }
      }

      if (mon.year === edgePoint.year && mon.month === edgePoint.month) {
        findStat = ii
      }

      if ((findStat || findStat===0) && ii > findStat) {
        others.push(`${that.calenderId}-${mon.year}-${mon.month}`)
      }
    }
    return { others, nexts, preset }
  }
  

  // 点击住店日期后，有效期为一个月，隐藏有效期之后的月份
  function periodValidDays(param, period = 30) {
    // {date: "2019-11-14"}
    let curPoint = getYmd(param.date)
    let curDayStamp = newDate(param.date).getTime()
    let endDayStamp = curDayStamp + (period * 24 * 60 * 60 * 1000)
    let edgePoint = getYmd(endDayStamp)
    let edgeMonth = `${edgePoint.year}-${edgePoint.month}`
    let edgeDate = `${edgePoint.year}-${edgePoint.month}-${edgePoint.day}`

    let follow = getFollowMonths(curPoint, edgePoint)
    let others = follow.others
    let nexts = follow.nexts
    let preset = follow.preset
    // preset.pop()
    preset.forEach(monInstId=>{
      let handle = that.activePage.getElementsById(monInstId)
      handle&&handle.hooks.emit('restore-month-days')
    })

    // that.calendar.children.forEach(child=>{
    //   child.visible(true)
    //   child.show()
    //   if (child.lazyDisplay) {
    //     child.hooks.emit('emptyChecked', {itemClass: 'invalid'})
    //   }
    // })

    // 隐藏所有需要隐藏的月份
    others.forEach(monInstId => {
      let handle = that.activePage.getElementsById(monInstId)
      if (handle) {
        if (rangeMode === 2) {
          handle.hide()
        } else {
          handle.hooks.emit('disable-month-days')
        }
      }
    })

    if (!nexts.length) {
      nexts.push(that.calenderId + '-' + edgeMonth)
    } else {
      // nexts.unshift(`${that.calenderId}-${curPoint.year}-${curPoint.month}`)
    }

    let newEdgeDate = null // 自定义边界日期
    let myhandle = null

    if (allowBox.rangeEdge) {
      if (allowBox.rangeEdge && lib.isString(allowBox.rangeEdge)) {
        let ymd = getYmd(allowBox.rangeEdge)
        let newEdgeDateId = that.calenderId + '-' + '-' + ymd.year + '-' + ymd.month
        let handle = that.activePage.getElementsById(newEdgeDateId)
        handle && handle.tint(newEdgeDate, null, 'invalid')
      }
      if (allowBox.rangeEdge && lib.isFunction(allowBox.rangeEdge)) {
        let context = {
          current: curDayStamp,
          end: endDayStamp,
          getYmd,
          calenderId: that.calenderId,
          activePage: that.activePage
        }
        newEdgeDate = allowBox.rangeEdge.call(context, nexts)
        if (newEdgeDate) {
          let ymd = getYmd(newEdgeDate)
          let newEdgeDateId = that.calenderId + '-' + '-' + ymd.year + '-' + ymd.month
          let handle = that.activePage.getElementsById(newEdgeDateId)
          handle && handle.tint(newEdgeDate, null, 'invalid')
        }
      }
    } else {
      nexts.forEach(monInstId => {
        let edgeId = that.calenderId + '-' + edgeMonth
        let handle = that.activePage.getElementsById(monInstId)
        if (handle) {
          // handle.visible(true)
          handle.show()
          let handleData = handle.getData().data
          if (!handleData.length) {
            handle.fillMonth()
          }
          if (edgeId === monInstId) {
            handle.hooks.emit('restore-month-days')
            handle.tint(edgeDate, null, 'invalid')
          } else {
            handle.hooks.emit('restore-month-days')
          }
        }
      })
    }
  }

  let monthHeader = {
    title: `${year}年${month}月`,
    show: this.allowBox.monthHeader,
    aim: `onSelectedMonth?type=month&date=${year}-${month}`,
    itemClass: 'calendar-header'
  }

  if (mode === 2 || mode === 3 || mode === 4) {
    delete monthHeader.aim
    monthHeader.itemClass += ' month-watermark'
    monthHeader.title = month
  }
  
  return {
    "@list": {
      $$id: `${this.calenderId}-${year}-${month}`,
      header: monthHeader,
      data: [],
      _data: monthDays,
      itemClass: 'date-item',
      listClass: 'date-list',
      containerClass: 'date-list-wrap',
      methods: {
        __ready(){
          let theMon = this
          this.days = monthDays
          this.year = year
          this.month = month

          this.checkedIndex = [] // 当前月份选中的日期在数组中的index下标

          /**
           * 显示状态
           * false时， 整个结构去除， 包括占位容器
           * false时， 不响应tint， 不响应lazy
           */
          this.showStat = true   

          /**
           * 是否已经响应lazy
           * true时， 表示已经为展示状态
           * false时， 表示隐藏状态
           * 该状态值权重低于showStat
           * 该状态仅仅表示该月所有日期是否可见， 但不影响容器的占位
           */
          this.lazyDisplay = false  

          /**
           * 清空该月所有日期的选择状态
           */
          theMon.hooks.once('emptyChecked', function(cls={itemClass: 'selected'}) {
            theMon.hooks.emit('restore-month-days')
            // theMon.forEach(item => {
            //   if (item.data && item.data.date) {
            //     let date = item.data.date
            //     let stamp = newDate(date).getTime()
            //     if (stamp >= that.validStartDay && stamp <= that.validEndDay) {
            //       if (item.hasClass(cls.itemClass)) {
            //         // let $data = originalMonthDays.find(function(it){
            //         //   return it.date === date
            //         // })
            //         // if ($data) {
            //         //   $data = lib.clone($data)
            //         //   item.reset($data)
            //         // }
            //         item.removeClass(`${cls.itemClass} range`)
            //       }
            //     }
            //   }
            // })
          })

          that.hooks.on('update-month-days', function(param){
            if (lib.isArray(param)) {
              let hasChange = false
              monthDays = monthDays.map(day => {
                param.forEach(item=>{
                  let date = formatDate(item.date)
                  if (date === day.date) {
                    hasChange = true
                    day = Object.assign({}, day, (item.content||item))
                  }
                })
                return day
              })
              hasChange && theMon.fillMonth(monthDays)
            }
          })

          // 批量恢复初始月数据
          that.hooks.on('restore-month-days', function(param={}) {
            theMon.hooks.emit('restore-month-days')
          })

          // 当前月实例恢复初始数据
          theMon.hooks.once('restore-month-days', function(params) {
            monthDays = lib.clone(originalMonthDays)
            if (theMon.lazyDisplay) {
              theMon.fillMonth(monthDays)
            }
          })

          theMon.hooks.once('disable-month-days', function(params) {
            monthDays = lib.clone(originalMonthDays)
            monthDays = monthDays.map(item=>{
              let clss = item.itemClass && item.itemClass.split(' ')
              if (clss) {
                if (clss.indexOf('invalid') === -1) {
                  clss.push('invalid')
                }
                item.itemClass = clss.join(' ')
              }
              return item
            })
            theMon.fillMonth(monthDays)
          })

          theMon.hooks.once('enable-month-days', function(params) {
            theMon.forEach(item => item.removeClass('invalid'))
          })
          
          // 重置showStat，使所有月份都能正常显示
          that.hooks.on('monthShowStat', function(param={}){
            if (param.hasOwnProperty('stat')) theMon.showStat = param.stat
            else {
              theMon.showStat = true
            }
          })
        },

        // 恢复初始月数据
        restore(){
          monthDays = lib.clone(originalMonthDays)
          this.hooks.emit('restore-month-days')
        },

        // 当月是否可见
        // 在日历列表中隐藏当月结构
        // showStat为false时，完全隐藏结构且不会受到其他方法影响，如reset
        visible(bool=true){
          this.showStat = bool
        },

        getDate(){
          return {year: this.year, month: this.month}
        },

        // 渲染当月特定日期
        // spd = startPoint date
        // epd = endPoint Date
        // cls = className  指定样式
        tint(spd, epd, cls='selected', stat, fromInit){
          let theMon = this
          if (!stat || stat === 'start') that.rangeValue = []

          let stip = null
          let etip = null
          if (rangeTip && fromInit) {
            stip = rangeTip[0]
            etip = rangeTip[1]
          }

          // 该月处于lazy隐藏状态时，
          if (!this.lazyDisplay) {
            this.hooks.one('lazy', function(){
              theMon.tint(spd, epd, cls, stat, fromInit)
            })
            return
          }

          // 添加比如 住店， 离店等tip信息
          function appendTip(stip, etip, item) {
            if (!stip && !etip) return
            let data = item.data
            let date = data.date
            let dot = data.dot || []
            dot.push((stip||etip))
            item.update({dot})
          }

          theMon.forEach(item=>{
            let data = item.data
            let date = data.date
            let spoint = spd && getYmd(spd)
            let epoint = epd && getYmd(epd)
            let point = spoint || epoint
            if (date) {
              if (!spd && !epd) {
                stat ? that.rangeValue.push(item) : ''
                if (checkType === 'range') {
                  item.addClass(cls + ' range')
                } else {
                  item.addClass(cls)
                }
              }
  
              if (spd && epd) {
                let day = data.day
                if (day >= spoint.day && day<=epoint.day) {
                  stat ? that.rangeValue.push(item) : ''
                  if (day > spoint.day && day < epoint.day) {
                    item.addClass(cls+ ' range')
                  } else {
                    item.addClass(cls)
                    if (day === spoint.day && stip) {
                      appendTip(stip, null, item)
                    }
                    if (day === epoint.day && etip) {
                      appendTip(null, etip, item)
                    }
                  }
                }
              }
  
              if (spd && !epd) {
                let day = data.day
                if (day >= point.day) {
                  stat ? that.rangeValue.push(item) : ''
                  if (day > point.day) {
                    item.addClass(cls + ' range')
                  } else {
                    item.addClass(cls)
                    appendTip(stip, null, item)
                  }
                }
              }
  
              if (!spd && epd) {
                let day = data.day
                if (day <= point.day) {
                  stat ? that.rangeValue.push(item) : ''
                  if (day<point.day) {
                    item.addClass(cls+' range')
                  } else {
                    item.addClass(cls)
                    appendTip(null, etip, item)
                  }
                }
              }
            }
          })
        },

        // 选中状态处理
        checked(param, inst, cb){
          if (lib.isString(param)) this.setChecked(param)
          let theMon = this
          let date = param.date
          that.setValue(date, {inst: theMon}, function (val) {
            inst.removeClass('range')
            
            if (checkType === 'multiple' && inst.hasClass('selected')) {
              inst.removeClass('selected')
            } else {
              // 开始选择时间段，类似携程的入住，离店
              if (that.value.length === 1 && checkType === 'range') {
                // that.calendar.addClass('adjust-calendar-list-item')
                periodValidDays(param, rangeCount)
              }
              // if (rangeMode === 2) {
              //   if (that.value.length === 1 && checkType === 'range') {
              //     // that.calendar.addClass('adjust-calendar-list-item')
              //     periodValidDays(param, rangeCount)
              //   }
              // }
              theMon.setChecked(inst)
            }
            if (lib.isFunction(cb)) {
              cb()
            }
            // that.selectDate(e, param, inst) // tap=selected?date=2019-11-21 that.itemMethod.call(inst, e)
          })
        },
        
        // 响应tap事件
        onSelected(e, param, inst){
          if (inst.hasClass('invalid')) return
          this.checked(param, inst, function() {
            that.selectDate(e, param, inst) // tap=selected?date=2019-11-21 that.itemMethod.call(inst, e)
          })
        },

        setChecked(targetDate){
          let target = null
          if (targetDate) {
            if (targetDate.treeid) {
              let index = this.findIndex(targetDate.treeid)
              // this.checkedIndex = index
              this.checkedIndex.push(index)
              target = targetDate
              targetDate.addClass('selected')
            } else {
              this.forEach((item, ii)=>{
                let data = item.data
                let date = data.date
                let ts = data.timestamp
                if (date === targetDate || ts === targetDate) {
                  item.addClass('selected')
                  target = item
                  // this.checkedIndex = ii
                  this.checkedIndex.push(ii)
                }
              })
            }
          }
          return target
        },

        emptyChecked(){
          this.hooks.emit('emptyChecked')
        },

        unChecked(targetDate){
          // this.hooks.emit('emptyChecked')
          let findIt = false
          if (lib.isArray(targetDate)){
            let uids = []
            let uinst = []
            targetDate.forEach((item, ii)=>{
              item.removeClass('selected range')
              if (uids.indexOf(item.parentInst.uniqId)===-1) {
                uids.push(item.parentInst.uniqId)
                uinst.push(item)
              }
            })
            uinst.forEach(it=>it.exec())
            return 
          }

          if (this.checkedIndex.length) {
            findIt = true
            this.forEach((item, index)=>{
              if (this.checkedIndex.indexOf(index)>-1) {
                item.removeClass('selected range')
              }
            })
            this.checkedIndex = []
          }
          
          // if (this.checkedIndex || this.checkedIndex === 0) {
          //   let target = this.find(this.checkedIndex)
          //   if (target) {
          //     findIt = true
          //     target.removeClass('selected range')
          //   }
          // } 

          if (!findIt) {
            this.forEach(item=>{
              let data = item.data
              let date = data.date
              let ts = data.timestamp
              if (date === targetDate || ts === targetDate) {
                item.removeClass('selected range')
              }
            })
          }
        },

        onSelectedMonth(e, param, inst) {
          that.selectDate(e, param, inst)
        },

        // lazy时用于清空数据
        emptyMonth(){
          if (this.showStat===false) return
          this.lazyDisplay = false
          this.reset()
        },

        // lazy时用于填充数据
        fillMonth(param, cb){
          if (lib.isFunction(param)) {
            cb = param
            param = undefined
          }
          let that = this
          if (this.showStat===false) return
          this.lazyDisplay = true
          if (lib.isFunction(cb)) {
            let date = year+'+'+month
            cb.call(this, date, monthDays)
          } else {
            if (!param && this.data.$list.data.length) {
              return
            }
            let updata = monthDays
            if (lib.isArray(param)) {
              updata = param
            }

            let $data = this.data.$list.data
            if ($data.length) {
              let tmpData = {}
              updata.forEach((it, ii)=>{
                if (it.itemClass!==$data[ii].itemClass){
                  let key = `data[${ii}]`
                  tmpData[key] = it
                }
              })
              if (Object.keys(tmpData).length) {
                this.update(tmpData)
              }
            } else {
              this.update(updata, function() {
                that.hooks.emit('lazy')
              })
            }
          }
        }
      }
    },
    id: `id-${year}-${month}`,
    attr: {
      id: `${this.calenderId}-${year}-${month}`
    }
  }
}

// 以月为单位生成日历
export function calendarMonths(timestart, end=5) {
  let allowBox = this.allowBox
  let {year, month, day} = getYmd(timestart)
  let configs = []
  let yearLoop = month
  for (let ii=0; ii<end; ii++) {
    if (yearLoop > 1 && yearLoop % 12 === 1) {
      year++
      yearLoop = 1
    }
    yearLoop++
    if (month+ii <= 12) {
      // configs.push( `${year}-${month+ii}-${day}` )
      configs.push( `${year}-${month+ii}-1` )
    } else {
      let mon = (month + ii)%12||12
      // configs.push(`${year}-${mon}-${day}`)
      configs.push(`${year}-${mon}-1`)
    }
  }

  let diffYear = parseInt((month+end)/12)
  let endYear = year + ((month+end)%12 ? diffYear : diffYear-1)
  let endMonth = ((month+end)%12) || 12
  let endDay = aboutMonth[endMonth]
  if (!endDay && endMonth === 2) {
    endDay = (isLeapYear(endYear) ? 29 : 28)
  }
  
  let validMonths = configs
  let fillData = this.fillData
  if (allowBox.discontinue && fillData.length > 1) {
    let tmp = []
    for (let ii = 0; ii < fillData.length; ii++) {
      let date = fillData[ii].date
      let ymd = getYmd(date)
      let uniqMon = ymd.year+'-'+ymd.month+'-1'
      if (tmp.indexOf(uniqMon)===-1) {
        tmp.push(uniqMon)
      }
    }
    validMonths = tmp
  }

  this.allMonths = validMonths
  this.validStartDay = this.validStartDay || newDate(`${year}-${month}-${day}`).getTime()
  this.validEndDay = this.validEndDay || newDate(`${endYear}-${endMonth}-${endDay}`).getTime()
  
  return validMonths.map(timepoint => oneMonthListConfig.call(this, timepoint))
}

/**
 * 以天为单位生成日历
 * @param {Date/timestamp} timestart 开始时间，为空则自动从当前开始
 * @param {Number} total 结束时间，后多少天
 * 通过结算得到结束时间的年月日，用 calendarMonths 方法生成日历
 */
export function calendarDays(timestart, total=30) {
  if (total === 99999) total = 0
  let day = 24*60*60*1000
  let startPoint = getYmd(timestart)
  let sp = startPoint
  let nowTime = newDate(`${sp.year}-${sp.month}-${sp.day}`).getTime()
  let endTime = nowTime+(total*day)
  let endDay = newDate(endTime)
  let endPoint = getYmd(endDay)
  let count = 1
  if (startPoint.year === endPoint.year) {
    count = endPoint.month - startPoint.month + 1
  } else {
    let diffMonth = (endPoint.year - startPoint.year - 1) * 12
    count = 12 - startPoint.month + 1 + endPoint.month + diffMonth
  }

  this.validStartDay = nowTime
  this.validEndDay = endTime
  return calendarMonths.call(this, timestart, count)
}