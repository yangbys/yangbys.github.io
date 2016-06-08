
//yangbys
;(function($){

    $.fn.loadImg = function(option){
        var opt = $.extend({}, {
            placeholder : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC",
            dataSrc : "data-original",
            container : null,
            callback : null
        }, option);
        return new loadLazy(this, opt);
    };

    function loadLazy(img, opt){
        return this.init.apply(this, arguments);
    };

    loadLazy.prototype = {
        init : function(imgArr, option){
            this.opt = option;
            this.imgArr = [];
            var self = this;
            var imgArr = option.container ? option.container.find("["+option.dataSrc+"]") : imgArr;
            $.each(imgArr, function(i, item){
                if(!item.getAttribute("src")){
                    item.setAttribute("src", self.opt.placeholder);
                }
                if(item && item.getAttribute(self.opt.dataSrc)){
                    self.imgArr.push({
                        obj : item,
                        isLoad : false,
                        tagName : item.tagName.toLocaleLowerCase()
                    });
                }
            });
            this.bindUI();
        },
        bindUI : function(){
            var self = this;
            (this.opt.container ? this.opt.container[0] : window).addEventListener("scroll", $.proxy(this.loadImg, this));
            // window.addEventListener("load", function(){
            //     setTimeout($.proxy(self.loadImg, self),10);
            // },false);
            window.addEventListener("resize", $.proxy(this.loadImg, this));
            this.imgArr.length && this.loadImg();
            this.bindUI = function(){};
        },
        isArea : function(img){
            var scrollTop     = document.body.scrollTop || document.documentElement.scrollTop,
                scrollLeft    = document.body.scrollLeft || document.documentElement.scrollLeft,
                imgOffsetTop  = $(img).offset().top,
                imgOffsetLeft = $(img).offset().left,
                winHeight     = this.win().h,
                winWidth      = this.win().w,
                imgTop        = imgOffsetTop + $(img).height();

            if(scrollTop + winHeight >= imgOffsetTop && scrollTop < imgTop && scrollLeft + winWidth >= imgOffsetLeft){
                return true;
            }
            return false;
        },
        loadImg : function(){
            var _item, _src, img;

            for(var i=0,len=this.imgArr.length; i<len; i++){
                _item = this.imgArr[i];
                img = _item.obj;
                if(this.isArea(img) && !_item.isLoad && img.getAttribute(this.opt.dataSrc)){
                    _src = img.getAttribute(this.opt.dataSrc);
                    //加载img
                    if(_item.tagName === "img" && _src){
                        //img.setAttribute("src", _src);
                        $(img).css("opacity", 0).attr("src", _src).animate({opacity:1},200);
                        this.callback(img);
                    }else{
                        //加载文件
                        $(document).load(img.getAttribute(this.opt.dataSrc),function(){
                            return this.callback(this);
                        }.bind(this));
                    };
                    _item.isLoad = true;
                }
            };

        },
        callback : function(img){
            this.opt.callback && this.opt.callback.call(img);
        },
        win : function(){
            return {
                w : document.body.clientWidth || document.documentElement.clientWidth,
                h : document.body.clientHeight || document.documentElement.clientHeight
            }
        }
    }

})(jQuery);

$('img.lazy').loadImg({
    callback : function(){
        $(this).removeAttr("data-original");
    }
});
