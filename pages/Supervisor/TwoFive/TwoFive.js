// fpage.js
var app = getApp();
var weburl = app.globalData.weburl;
// 引用百度地图微信小程序JSAPI模块 
var bmap = require('../../../utils/bmap-wx.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    imageList: [],
    array: ['1.系统运行情况', '2.主数据包下载情况', '3.切片下载情况', '4、密钥下载情况', '5、考生入场情况', '6、开考情况'],
    array1: ['未开始', '进行中', '已完成', '其他情况'],
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      var placename = wx.getStorageSync("placename");
      var placeid = wx.getStorageSync("placeid");
      this.setData({
        placename: placename,
        placeid: placeid
      })
    } catch (e) {
    }
    this.getLocation();
    this.getAddress();
  },
  getLocation: function () {
    wx.getLocation({
      type: 'wgs84',
      success: (res) => {
        this.setData({
          longitude: res.longitude,
          latitude: res.latitude
        })
      }
    })
  },
  getAddress: function () {
    // 新建百度地图对象 
    var BMap = new bmap.BMapWX({
      ak: 'KxvCAjHu94fsEDMBYtrUMt8e5QDWqPc2'
    });
    // 发起regeocoding检索请求 
    BMap.regeocoding({
      //location: this.data.latitude + "," +this.data.longitude,
      fail: (data) => {
        console.log("解析地址失败" + data)
      },
      success: (data) => {
        this.setData({
          markers: data.wxMarkerData
        });
      }
    })
  },
  bindPickerChange: function (e) {
    this.setData({
      index: e.detail.value
    })
  },
  bindPickerChange1: function (e) {
    this.setData({
      index1: e.detail.value
    })
  },
  formSubmit: function (e) {
    this.getLocation();
    this.getAddress();
    var data = e.detail.value;
    if (this.data.array[this.data.index]) {
      try {
        var username = wx.getStorageSync("username");
        var userid = wx.getStorageSync("userid");
        var placename = wx.getStorageSync("placename");
        var placeid = wx.getStorageSync("placeid");
        if (username && userid && placename && placeid) {
          // data["examExceptionVo.examPlaceId"] = placeid;
          data["examExceptionVo.examPlaceName"] = placename;
          data["reportUser"] = username;
          data['workType'] = '4';
          // data["examExceptionVo.linkManId"] = userid;
          // data["examExceptionVo.loginAddr"] = this.data.markers[0].address,
          //   data["examExceptionVo.loginLat"] = this.data.latitude,
          //   data["examExceptionVo.loginLng"] = this.data.longitude,
          data["reportType"] = this.data.array[this.data.index],
            data["reportType"] = this.data.array1[this.data.index1],

            data["photoPath"] = weburl + "sinosafe/wxPhoto/" + this.data.imgurl,
            console.log("上报前端传值", data);
          //data.photo = this.data.photo;
          wx.request({
            url: weburl + 'sinosafe/wx/addExamException.action', //仅为示例，并非真实的接口地址
            data: data,
            method: "POST",
            header: {
              "content-type": 'application/x-www-form-urlencoded'
            },
            success: function (res) {
              console.log("异常上报后台返值：", res)
              if (res.data != null) {
                var dataMain = res.data.dataMain;
                if (res.data.dataStatus == "1") {
                  wx.showToast({
                    title: "上报成功",
                    duration: 2000
                  })
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
              //返回上一个页面
              //wx.navigateBack();
            }
          })
        }
      } catch (e) {
      }
    } else {
      wx.showToast({
        title: '请填写必要信息',
        duration: 2000
      })
    }

  },
  formReset: function () {
    this.setData({
      // photo: ''
    })
    console.log('form发生了reset事件')
  },
  // bindDateChange: function (e) {
  //   this.setData({
  //     date: e.detail.value
  //   })
  // },
  // choosePhoto: function () {
  //   wx.chooseImage({
  //     success: function (res) {
  //       var tempFilePaths = res.tempFilePaths
  //       console.log("前台tempFilePaths：", tempFilePaths)
  //       wx.uploadFile({
  //         url: 'http://192.168.10.51/SHSFKS/admin/sh_linkman/wxUploadImg.action', //仅为示例，非真实的接口地址
  //         filePath: tempFilePaths[0],
  //         name: 'upload',
  //         formData: {},
  //         success: function (res) {
  //           console.log("yc照片后台返回值：",res)
  //           var data = res.data
  //         }
  //       })
  //     }
  //   })
  // },

  //图片

  chooseImage: function () {
    wx.chooseImage({
      count: 9, // 默认9
      sourceType: ['camera', 'album'],
      sizeType: ['compressed', 'original'],
      success: (res) => {
        var tempFilePaths = res.tempFilePaths
        console.log("前台tempFilePaths：", tempFilePaths)
        this.setData({
          imageList: tempFilePaths
        })
        wx.uploadFile({
          url: weburl + 'sinosafe/wx/wxUploadImg.action', //仅为示例，非真实的接口地址
          filePath: tempFilePaths[0],
          name: 'upload',
          formData: tempFilePaths,
          success: (res) => {
            var data = JSON.parse(res.data);
            var dataMain = data.dataMain;
            console.log("yc照片后台返回值：", res, dataMain)
            this.setData({
              imgurl: dataMain
            })
          }
        })

      }
    })
  },
  previewImage: function (e) {
    let index = e.target.dataset.index;
    wx.previewImage({
      current: this.data.imageList[index],
      urls: this.data.imageList
    })
  }
})