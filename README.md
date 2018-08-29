# HaUpload
This is a picture upload plugin, including image compression, verification of image format, conversion of Base64 format.
# How to Use
##### 由于提示信息采用layer,所以首先要引入layer.js和对应的layer.css
##### html按正常布局就好
##### js引用
` HaUpload({ `
	`name: 'pic',// 表单名`
	`selector:'input-file',//点击上传的input类`
	`url: '', // 表单提交地址 默认(空: 当前页面地址)`
	`max_size: 1024 * 1024 * 1, // 文件大小限制`
	`data: {},// 附加数据`
	`allowType:['jpg', 'jpeg', 'png', 'gif', 'bmp'],//允许上传的图片格式`
	`start: function (element,base) {`
		`//这里写开始上传触发的事件`
	`},`
	`success: function (element, result) {`
		`//这里写上传成功触发的事件`
	`}`
`});`
*如果对您有用，希望给个star*

