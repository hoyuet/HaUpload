function HaUpload(options){
    var def_opt = {
        name: 'refund_pic',   // 表单名
        selector:'.input-file',//上传input的选择器
        url: '',  // 表单提交地址 默认(空: 当前页面地址)
        max_size: 1024 * 1024 * 1,  // 文件大小限制
        data: {},   // 附加数据  
        allowType:['jpg', 'jpeg', 'png', 'gif', 'bmp'],
        start: function () {}, // 开始上传触发事件
        success: function () {}//上传成功触发事件
    };
    

    if('object' == typeof options){
        for(k in options){
            def_opt[k] = options[k];
        }
    }
    // 获取元素
	var doms = document.querySelectorAll(def_opt.selector)
    [].forEach.call(doms, function(dom) {
        var opt = [];
        for(k in def_opt){
            opt[k] = def_opt[k];
        } 
        data = def_opt.data && typeof def_opt.data == 'object' ? def_opt.data : (def_opt.data ? {type: def_opt.data} : {});
        // 追加配置
        for(k in data) opt[k] = data[k];
        // 文件选择后的处理
        dom.onchange = function(){
            if(!this.files.length){return;}
            var fd = new FormData(), d = getTime();
            var files = this.files[0];
            d.name = files.name;
            d.size = files.size;
            var that_ = this;

            var ready=new FileReader();
            ready.readAsDataURL(files);
            
            ready.onload=function(){
                var re=ready.result;
                if(re.length>opt.max_size){
                    //图片压缩
                    dealImage(re, {
                        width : 1000
                    }, function(base){
                        opt.start.call('start', that_, base);
                        for(k in opt.data){
                            fd.append(k, _tpl(opt.data[k], d));
                        }
                        var extName = extname(d.name,opt.allowType);
                        var bl = convertBase64UrlToBlob(base);
                        fd.append(opt.name, bl, "file_"+Date.parse(new Date())+"."+extName); // 文件对象
                        picUpload(that_,opt,fd,dom);
                    })
                }else{
                    opt.start.call('start', that_);
                    fd.append(opt.name, files);
                    for(k in opt.data){
                        fd.append(k, _tpl(opt.data[k], d));
                    }
                    //验证图片格式
                    var extName = extname(d.name,opt.allowType);
                    picUpload(that_,opt,fd,dom)
                }
            }
        };
    });
    // 创建指定元素
    function newDom(n){return document.createElement(n);};
    // 获取日期时间
    function getTime(){
        var t = new Date(),
        pad = function (value) {
            value = String(value);
            while (value.length < 2)  { value = '0' + value; }
            return value;
        },
        Y = t.getFullYear(),
        m = pad(t.getMonth() + 1),
        d = pad(t.getDay()),
        H = pad(t.getHours()),
        i = t.getMinutes(),
        s = t.getSeconds();
        return {date: [Y,m,d].join('-'), time: [H,i,s].join(':'), U: Math.floor(t / 1000)};
    };
    function after(n, t){
        var parent = t.parentNode;
        if( parent.lastChild == t){
            parent.appendChild(n, t);
        }else{
            parent.insertBefore(n, t.nextSibling);
        };
    };
    // 模板解析 {{key}}
    function _tpl(t, obj) {
        return t.replace(/\{[a-z]+\}/gi, function(matchs) {
            var returns = obj[matchs.replace(/[\{\}-]/g, "")];
            return (returns + "") == "undefined" ? "": returns;
        });
    };
    //验证图片格式
    function extname(name,types){
        var extNameSplit = name.split('.');
        var extName = extNameSplit[extNameSplit.length-1].toLowerCase();
        var len = types.length;
        var n=0;
        for (var i = 0; i < len; i++) {
            if(extName!=types[i]){
                n++;
            }
            if(n==len){
                //layer.open({content:"图片格式不能为"+extName,skin: 'msg',time: 3});
				alert("图片格式不能为"+extName);
                return;
            }
        }
        return extName;
    }
    function picUpload(that,opt,fd,dom){
        console.log(that,154)
        // 文件上传
        var xhr = new XMLHttpRequest();
        xhr.open('POST', opt.url,true);
        if(csrf_token = document.head.querySelector('meta[name=csrf-token][content]')){
            xhr.setRequestHeader('X-CSRF-Token', csrf_token.content);
        }
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.onload = function(e) {
        // 上传返回数据处理
        if (xhr.status == 200 && xhr.responseText) {
            
            try{
                data = JSON.parse(xhr.responseText);
            } catch(err) {
                data = xhr.responseText;
            }
            if(typeof opt.value == 'function'){
                return dom.value = opt.value(data, dom);
            }else if(typeof opt.value == 'string'){
                var p = opt.value.split('.');
                if(p && data){
                    try{
                        return eval('dom.value = data["'+ p.join('"]["') +'"]');
                    } catch(err) {}
                }
            }
            opt.success.call('success', that, data);
        }else{
            //layer.open({content:"请求失败",skin: 'msg',time: 3});
				alert("请求失败");
                return;
            }
        }
        xhr.send(fd);
    }
        
    function convertBase64UrlToBlob(urlData){
        var arr = urlData.split(','), mime = arr[0].match(/:(.*?);/)[1],
            bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
        while(n--){
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new Blob([u8arr], {type:mime});
    }
    // 图片压缩 add by rengang 
    function dealImage(path, obj, callback){
        var img = new Image();
        img.src = path;
        img.onload = function(){
            var that = this;
            // 默认按比例压缩
        var w = that.width,
        h = that.height,
        scale = w / h;
        w = obj.width || w;
        h = obj.height || (w / scale);
        var quality = 0.7;  // 默认图片质量为0.7
        //生成canvas
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        // 创建属性节点
        var anw = document.createAttribute("width");
        anw.nodeValue = w;
        var anh = document.createAttribute("height");
        anh.nodeValue = h;
        canvas.setAttributeNode(anw);
        canvas.setAttributeNode(anh);
        ctx.drawImage(that, 0, 0, w, h);
        // 图像质量
        if(obj.quality && obj.quality <= 1 && obj.quality > 0){
           quality = obj.quality;
        }
        // quality值越小，所绘制出的图像越模糊
        var base64 = canvas.toDataURL('image/jpeg', quality );
        // 回调函数返回base64的值
          callback(base64);
        }
    }
}