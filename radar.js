const DEFAULT_COLOR = '#008488'

class Radar {
  constructor(options) {
    const {
      canvasId, // dom
      width, // 绘制宽度
      height, // 绘制高度
      categories, // 绘制标题
      data, // 绘制数据比例
      initrad = Math.PI, // 绘制角度
      colors = [] // 绘制的颜色 []
    } = options

    this.canvasId = canvasId
    this.width = width
    this.height = height
    this.colors = colors

    this.categories = categories
    // 直径
    const diameter = Math.min(width, height) - 80
    this.ctx = wx.createCanvasContext(canvasId)
    // 圆心
    this.center = { x: width / 2, y: height / 2 }
    // 半径
    this.radius = diameter / 2
    if (categories.length) {
      // 减去文字的高度 先定为20
      this.radius -= 30
    }
    // 几边形
    this.step = data.length

    const maxData = Math.max(...data)
    if (maxData == 0) {
      this.rateArray = data
    } else {
      this.rateArray = data.map(d => d / maxData)
    }
    this.dataArray = data // 值

    // 开始的角度
    this.initrad = initrad

    // 清空上次画的内容
    this.ctx.draw()
  }

  init(callBack) {
    this.drawBackground() // 背景
    this.drawRate() // 画比例
    this.drawBackLine() // 画白色的线
    this.drawRateLine() // 画中间的线
    this.drawCenter() // 画圆心
    this.drawRatePoint() // 画点
    this.drawText(callBack) // 画文本
  }

  // 画背景
  drawBackground() { // 测试画背景线
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad

    // 画蜘蛛网
    var isBlue = false
    for (var s = 8; s > 0; s--) {
      this.ctx.beginPath()
      this.ctx.setLineWidth(1)
      this.ctx.setStrokeStyle('#f8f8f8')
      let lineWidth = this.radius / 6
      for (var i = 0; i < this.step; i++) {
        initrad += rad
        this.ctx.setLineWidth(lineWidth)
        const x = this.center.x + Math.sin(initrad) * (this.radius - lineWidth / 2) * (s / 8)
        const y = this.center.y + Math.cos(initrad) * (this.radius - lineWidth / 2) * (s / 8)
        this.ctx.lineTo(x, y)
      }
      if (s > 6) {
        isBlue = !isBlue
      }
      this.ctx.closePath()
      if (isBlue) {
        this.ctx.setLineJoin('round')
        this.ctx.stroke()
      }
    }

    // 画内圈线
    isBlue = false
    for (s = 8; s > 0; s--) {
      this.ctx.beginPath()
      this.ctx.setLineWidth(0.5)
      this.ctx.setStrokeStyle('#eeeeee')
      for (i = 0; i < this.step; i++) {
        initrad += rad
        const x = this.center.x + Math.sin(initrad) * this.radius * (s / 8) * 0.66
        const y = this.center.y + Math.cos(initrad) * this.radius * (s / 8) * 0.66
        this.ctx.lineTo(x, y)
      }
      if (s > 6) {
        isBlue = !isBlue
      }
      this.ctx.closePath()
      if (isBlue) {
        this.ctx.setLineJoin('round')
        this.ctx.stroke()
      }
    }
    this.ctx.draw(true)
  }

  // 画比例
  drawRate() {
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad
    const initPoint = {
      x: this.center.x + Math.sin(initrad) * this.radius * this.rateArray[0],
      y: this.center.y + Math.cos(initrad) * this.radius * this.rateArray[0]
    }
    this.ctx.moveTo(initPoint.x, initPoint.y)
    this.ctx.beginPath()
    this.ctx.setStrokeStyle(DEFAULT_COLOR)
    this.ctx.setLineWidth(2)
    let isShowIf = false
    let arr = [] // 点数
    let arr1 = []
    let arr2 = []
    for (let i = 0; i < this.rateArray.length; i++) {
      if (this.rateArray[i]) {
        arr.push(1)
      }
      let index = i
      let index_ = i + 1
      let index2 = i + 2
      let index4 = i + 4
      let index5 = i + 5
      if (index2 > (this.step - 1)) index2 = index2 - this.step
      if (index4 > (this.step - 1)) index4 = index4 - this.step
      if (index5 > (this.step - 1)) index5 = index5 - this.step

      if (this.rateArray[index] && this.rateArray[index_]) {
        arr1.push(1)
      }
      if (this.rateArray[index] && this.rateArray[index_] && this.rateArray[index2]) {
        arr2.push(1)
      }
      if (this.rateArray[index] && this.rateArray[index4] && this.rateArray[index5]) {
        arr2.push(1)
      }
      if (this.rateArray[index] && this.rateArray[index4]) {
        arr1.push(1)
      }
      if (this.rateArray[index] && this.rateArray[index5]) {
        arr1.push(1)
      }
    }
    if (arr.length == 2 && arr1.length) isShowIf = true
    if (arr.length == 2 && !arr1.length) isShowIf = false
    if (arr.length == 3 && arr2.length) isShowIf = true
    if (arr.length == 3 && !arr2.length) isShowIf = false
    if (arr.length == 4) isShowIf = false

    for (let i = 0; i < this.step; i++) {
      const x = this.center.x + Math.sin(initrad) * this.radius * this.rateArray[i]
      const y = this.center.y + Math.cos(initrad) * this.radius * this.rateArray[i]
      if (isShowIf) {
        this.ctx.lineTo(x, y)
        this.ctx.stroke()
      } else {
        if (!(x === this.center.x && y === this.center.y)) { // 不连接圆心
          this.ctx.lineTo(x, y)
          this.ctx.stroke()
        }
      }
      initrad += rad
      var grd = this.ctx.createCircularGradient(this.center.x, this.center.y, this.radius)
      // grd.addColorStop(0, '#feeeb8')
      // grd.addColorStop(1, '#feeeb8')
    }
    this.ctx.lineTo(initPoint.x, initPoint.y)
    // this.ctx.setFillStyle(grd)
    // this.ctx.fill()
    this.ctx.stroke()
    this.ctx.closePath()
    this.ctx.draw(true)
  }

  // 画中间的线
  drawRateLine() {
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad
    const initPoint = {
      x: this.center.x + Math.sin(initrad) * this.radius * this.rateArray[0],
      y: this.center.y + Math.cos(initrad) * this.radius * this.rateArray[0]
    }
    this.ctx.setStrokeStyle('#cfd0d3')
    this.ctx.setLineWidth(0.2)
    this.ctx.moveTo(this.center.x, this.center.y)
    this.ctx.lineTo(initPoint.x, initPoint.y)
    this.ctx.stroke()
    for (let i = 0; i < this.step; i++) {
      const x = this.center.x + Math.sin(initrad) * this.radius * this.rateArray[i]
      const y = this.center.y + Math.cos(initrad) * this.radius * this.rateArray[i]
      this.ctx.moveTo(this.center.x, this.center.y)
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
      initrad += rad
    }
    this.ctx.draw(true)
  }

  // 画点
  drawRatePoint() {
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad
    const initPoint = {
      x: this.center.x + Math.sin(initrad) * this.radius * this.rateArray[0],
      y: this.center.y + Math.cos(initrad) * this.radius * this.rateArray[0]
    }
    this.ctx.beginPath()
    this.ctx.arc(initPoint.x, initPoint.y, 2, 0, 2 * Math.PI)
    this.ctx.setFillStyle('#ffffff')
    this.ctx.fill()
    this.ctx.closePath()

    let color = this.colors[0] || DEFAULT_COLOR

    this.ctx.beginPath()
    this.ctx.arc(initPoint.x, initPoint.y, 1, 0, 2 * Math.PI)
    this.ctx.setFillStyle(color)
    this.ctx.fill()
    this.ctx.closePath()
    for (let i = 0; i < this.step; i++) {
      const x = this.center.x + Math.sin(initrad) * this.radius * this.rateArray[i]
      const y = this.center.y + Math.cos(initrad) * this.radius * this.rateArray[i]

      let color = this.colors[i] || DEFAULT_COLOR

      this.ctx.beginPath()
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI)
      this.ctx.setFillStyle('#ffffff')
      this.ctx.fill()
      this.ctx.closePath()

      this.ctx.beginPath()
      this.ctx.arc(x, y, 3, 0, 2 * Math.PI)
      this.ctx.setFillStyle(color)
      this.ctx.fill()
      this.ctx.closePath()
      initrad += rad
    }
    this.ctx.draw(true)
  }

  // 画白色的线
  drawBackLine() {
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad
    this.ctx.setStrokeStyle('#eeeeee')
    this.ctx.setLineWidth(0.5)
    for (let i = 0; i < this.step; i++) {
      this.ctx.moveTo(this.center.x, this.center.y)
      const x = this.center.x + Math.sin(initrad) * this.radius
      const y = this.center.y + Math.cos(initrad) * this.radius
      this.ctx.lineTo(x, y)
      this.ctx.stroke()
      initrad += rad
    }
    this.ctx.draw(true)
  }

  // 画圆心
  drawCenter() {
    this.ctx.beginPath()
    this.ctx.arc(this.center.x, this.center.y, 1, 0, 2 * Math.PI)
    // this.ctx.setFillStyle('rgb(205, 241, 250)');
    this.ctx.setFillStyle('#cccccc')
    this.ctx.fill()
    this.ctx.draw(true)
    this.ctx.closePath()
  }

  // 绘制文本
  drawText(callBack) {
    const rad = 2 * Math.PI / this.step
    let initrad = this.initrad
    let data = this.dataArray
    this.ctx.setFontSize(13)
    this.ctx.setFillStyle('#cccdd1')
    this.ctx.setTextBaseline('middle')
    this.ctx.setTextAlign('center')
    for (let i = 0; i < this.step; i++) {
      const x = this.center.x + Math.sin(initrad) * this.radius
      const y = this.center.y + Math.cos(initrad) * this.radius
      const text = this.categories[i]

      // 偏移值
      let incX = 0, incY = 0
      let offsetX = x - this.center.x
      let offsetY = y - this.center.y

      // 水平方向上左右两边
      if (offsetX > 40) {
        incX = 40
      } else if (offsetX < -40) {
        incX = -40
      }

      // 垂直方向上距离雷达图
      if (offsetY > 41) {
        incY = 15
      } else if (offsetY < -41) {
        incY = -15
      }

      // 上下两个相邻元素的间距
      if (this.step == 6) {
        if (i === 4) incX = -40
        if (i === 3) incX = 40
        if (i === 1) incX = 40
        if (i === 0) incX = -40
      }

      let color = this.colors[i] || DEFAULT_COLOR
      let _text = (text || '').trim()

      // 数字和文本分成两列
      let number = data[i]
      let match = _text.match(/([0-9]+)$/)
      if (match) number = match[1] || number

      // 文本行
      let firstLine = _text.replace(number, '').trim()
      // 数字行
      let secondLine = number

      // 垂直方向第一行距离雷达图
      if (incY < 0) incY = -30
      if (incY > 0) incY = 20
      if (incY == 0) incY = 5

      this.ctx.setFillStyle(color)
      this.ctx.setFontSize(26)
      this.ctx.fillText(secondLine, x + incX, y + incY)

      this.ctx.setFontSize(12)
      this.ctx.setFillStyle('#cccdd1')
      this.ctx.fillText(firstLine, x + incX, y + incY + 18)
      this.ctx.setTextAlign('center')

      initrad += rad
    }

    const _this = this
    this.ctx.draw(true, function () { // 真机才能回调
      setTimeout(function () { // 安卓端可能渲染延迟
        wx.canvasToTempFilePath({
          x: 0,
          y: 0,
          width: _this.width,
          height: _this.height,
          // destWidth: 100,
          // destHeight: 100,
          canvasId: _this.canvasId,
          success(res) {
            if (callBack&&(typeof callBack === "function")) callBack(res.tempFilePath)
          }
        })
      }, 10)
    })
  }
}

module.exports = Radar
