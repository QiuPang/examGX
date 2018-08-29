// YClist.js
var app = getApp();
var weburl = app.globalData.weburl;
Page({
  /**
   * 页面的初始数据
   */
  data: {
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      var username = wx.getStorageSync('username')
      if (username) {
        wx.request({
          url: 'https://www.examos.cn/bigdata/api/workReport/getReportsByCond.jspx', //仅为示例，并非真实的接口地址
          data: { "reportUser": username, "workType": "3" },
          method: "POST",
          header: {
            "content-type": 'application/x-www-form-urlencoded'
          },
          success: (res) => {
            if (res.data != null) {
              var dataMain = JSON.parse(res.data.dataMain);
              console.log('查询返回值',dataMain)
              dataMain.map(item => {
                item.photoPath = item.photoPath.split(',')
                return item;
              });
              if (res.data.dataStatus == "1") {
                this.setData({
                  dataList: dataMain
                });
                if (dataMain == null || dataMain.length == 0) {
                  wx.showToast({
                    title: "查询结果为空",
                    duration: 2000
                  })
                }
              }
              else {
                if (res.data.errorMsg != null
                  && res.data.errorMsg.length > 0) {
                  wx.showToast({
                    title: res.data.errorMsg,
                    duration: 2000
                  })
                }
              }
            }
          },
          fail: (res) => {
            wx.showToast({
              title: '查询失败，请检查网络连接',
              duration: 2000
            })
            return;
          }
        })
      }
    } catch (e) {
    }
  },
  previewImage: function (e) {
    var urls = [];
    urls.push(e.target.dataset.src);
    wx.previewImage({
      urls: urls
    })
  }
})