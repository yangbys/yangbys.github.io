
var URL = {}; //接口链接
var Modal = {};

$body = $('body');

Modal = {
    //单纯提示文字
    toast : function(msg, param){
        var self = this;
        param = param || {};
        var $toast = $('<div class="modal toast ' + (param.className || '') + '">' + msg + '</div>').appendTo(document.body);
        var _top  = -$toast.outerHeight() / 2,
            _left = -$toast.outerWidth() / 2;
        $toast.css('margin', _top+'px 0 0 '+_left+'px');
        if(!$toast.hasClass('modal-in')){
            $toast[0].getClientRects();
            $toast.addClass('modal-in');
        }
        this.openModal($toast, param);

    },
    // 带有按钮的提示 或 关闭X按钮
    comfirm : function(param){
        this.closeModal();
        param = param || {};
        param = $.extend({}, {
            btnShow : true,
            closeMask : true,
            btn : []
        }, param);

        var self = this;
        var _body = document.body;
        var $modalMask = $('<div class="modal-overlay modal-overlay-visible"></div>').appendTo(_body);
        var $modal = $('<div class="modal comfirmModal"></div>');
        var html = ['<div class="modal-inner">',
                        param.title && ('<div class="modal-title">'+param.title+'</div>'),
                        ('<div class="modal-text">'+(param.content || "暂无提示")+'</div>')+'</div>',
                    param.btnShow ? ('<div class="modal-buttons"></div>') : ""].join('');
        $modal.html(html).appendTo(_body);
        if(!param.btnShow){
            $modal.addClass('modal-no-buttons');
        }

        var btn = [
            {
                title : '取消',
                className : '',
                cb : function(){
                    Utils.fire('comfirmClose');
                }
            },
            {
                title : '确定',
                className : 'modal-button-bold',
                cb : function(modal){
                    console.log('ok')
                }
            }
        ];

        var _btnLen = btn.length;

        if(param.btnShow){
            var _btn;
            for(var i=0,max=_btnLen; i<max; i++){
                param.btn[i] = $.extend({}, btn[i], param.btn[i]);
            };
        }

        if(param.btnShow){
            var $btn,newBtn;
            for(var k=0,len=_btnLen; k<len; k++){
                newBtn = param.btn[k];
                $btn = $('<span class="modal-button '+newBtn.className+'">'+newBtn.title+'</span>');
                ;(function(k){
                    $btn.off('click').on('click', function(){
                        self.btnCallBack(param.btn[k].cb);
                    });
                })(k)

                $('.modal-buttons').append($btn);
            }
        };

        var _top = $modal.outerHeight(true) / 2;
        $modal.css('margin-top',-_top);

        if(!$modal.hasClass('modal-in')){
            $modal[0].getClientRects();
            $modal.addClass('modal-in');
        };

        // 观察者
        Utils.on('comfirmClose',function(){
            self.closeModal();
        });

        if(param.closeMask){
            $('.modal-overlay').on('click',function(){
                Utils.fire('comfirmClose');
            });
        }

        this.openModal($modal,{isShow : 1});
        return $modal;
    },
    openModal : function($modal, param){
        param = param || {}
        var self = this;
        //上否一直显示在屏幕上
        if(!param.isShow){
            setTimeout(function() {
                $modal.removeClass('modal-in').addClass('modal-out');
                $modal.one('webkitTransitionEnd transitionend',function(){
                    $(this).remove();
                    param.callback && param.callback.call(self);
                })
            }, param.time || 1200);
        }
    },
    closeModal : function(){
        var $modal = $('.comfirmModal');
        var $overlay = $('.modal-overlay');
        $modal.removeClass('modal-in').addClass('modal-out');
        $modal.one('webkitTransitionEnd transitionend',function(){
            $(this).remove();
        });

        $overlay.removeClass('modal-overlay-visible');
        $overlay.one('webkitTransitionEnd transitionend',function(){
            $(this).remove();
        })
    },
    btnCallBack : function(cb){
        cb && cb.call(this, this);
    }
};

var Utils = {
    //uavigator userAgent
    browser : {
        ua : navigator.userAgent.toLowerCase(),
        ios : function(){
			return (/iPhone|iPad|iPod|iOS/i.test(this.ua));
		},
		android : function(){
			return (/Android/i.test(this.ua));
		},
        //来自于微信浏览器
		weixin : function(){
			return (/MicroMessenger/i.test(this.a));
		},
        //来自果盘商店
        gpShopApp : function(){
            return (!!window.SDK && /guopanGameStore/i.test(this.ua));
        }
    },
    //cookie
    cookie : {
    	get : function(name){
    		if(name){
    			var reg = new RegExp(name + "=([^;]*)"),
    				arr = document.cookie.match(reg);
    			return arr && arr[1];
    		}
    	},
    	set : function(name,value,Days,path) {
    		var exp = new Date();
            exp.setTime(exp.getTime() + (Days || 0)*24*60*60*1000);
            var str = name + "=" + value;
            Days && (str += ";expires=" + exp.toGMTString());
            str += ";path=" + (path || "/") + ";";
            document.cookie = str;
    	},
    	remove : function(name, value, date, path){
    		var d = new Date();
            d.setDate(d.getDate() + (date || 0));
            var str = name + "=" + value;
            date && (str += ";expires=" + d.toGMTString());
            str += ";path=" + (path || "/") + ";";
            document.cookie = str;
    	}
    },
    _div : $('<span>'),
    on : function(type, fn){
        this._div.on(type, function(){
            fn.apply(window, [].slice.call(arguments, 1));
        });
    },
    fire : function(type){
        this._div.trigger(type, [].slice.call(arguments, 1))
    },
    toast : function(title, param){
        return Modal.toast(title, param);
    },
    // loading style
    load : {
        showIndicator : function(){
            if ($('.preloader-modal')[0]) return;
           $body.append('<div class="preloader-overlay"></div><div class="preloader-modal"><span class="preloader preloader-white"></span></div>');
       },
       showPreloader : function(title){
            Utils.loadHide();
            this.showPreloader.modal = Modal.comfirm({
                title: title || '加载中...',
                content: '<div class="preloader"></div>',
                btnShow : false,
                closeMask : false
            });

            return this.showPreloader.modal;
       },
       wait : function(title) {
           this.hideWait();
           var w = '<div class="waitingMask"></div>\
                   <div id="waiting">\
                       <span class="imgLoading">\
                           <em class="loading-em"></em>\
                       </span>\
                       <span class="loading-color" id="div_waiting_msg">'+(title || "读取中")+'</span>\
                   </div>';
            $body.append(w);
            setTimeout(function(){
                $('#waiting').addClass('waitIn');
                $('.waitingMask').addClass('maskIn');
            },10);
       },
       hideWait : function(){
           var $wait = $('#waiting');
           var $mask = $('.waitingMask');
           $mask.remove();
           $wait.remove();
       },
       hideIndicator : function(modal){
           if($('.preloader-modal')[0]){
               $('.preloader-overlay, .preloader-modal').remove();
           }
       },
       hidePreloader : function(modal){
           var _modal = $(modal);
           var _mask = $('.modal-overlay');
           if(_modal.hasClass('modal-in')){
               _modal.removeClass('modal-in').addClass('modal-out');
               _mask.removeClass('modal-overlay-visible');
               _modal.one('webkitTransitionEnd transitionend',function(){
                   _mask.remove();
                  $(this).remove();
               });
           }
       }
    },
    //单菊花
    loading : function(){
        return this.load.showIndicator();
    },
    // 带文字菊花
    showLoader : function(title){
        return this.load.showPreloader(title);
    },
    //隐藏 菊花
    loadHide : function(){
        return this.load.hideIndicator();
    },
    //隐藏 带文字菊花
    loaderHide : function(){
        return this.load.hidePreloader(this.load.showPreloader.modal);
    },
    waiting : function(title){
        return this.load.wait(title);
    },
    waitHide : function(){
        return this.load.hideWait();
    },
    addLoad : function(title){
        return '<div class="inLoading"><span></span>'+(title || "数据加载中...")+'</div>';
    },
    addLoadHide : function(){
        return $(".inLoading").fadeOut(10,function(){$(this).remove()});
    },
    loadgif : function(title){
        return '<div class="inLoading"><span></span>'+(title || "数据加载中...")+'</div>';
    },
    hideLoadgif : function(){
        return $(".inLoading").fadeOut(10,function(){$(this).remove()});
    },
    // 数据获取
    ajax : function(url, method, params, fn){
        if(!url) return false;
        var def = $.Deferred();
        var opt = {
                url : url,
                type : method || 'GET',
                dataType : 'json',
                data : params || {},
                timeout : 20000,
                success : function(res){
                    def.resolve(res);
                },
                fail : function(){
                    def.reject({});
                }
            }
        $.ajax(opt);
        return def;
    },
    get : function(url, param){
        return this.ajax(url, 'GET', param);
    },
    post : function(url, param){
        return this.ajax(url, 'POST', param);
    },
    getID : function(o){
        return (o.indexOf('#') > -1 || o.indexOf('.') > -1) ? document.querySelector(o) : document.getElementById(o);
    },
    isShow : function(o, stutas){
        return o.style.display =  stutas ? 'block' : 'none';
    }
};

$(function(){
    //fastClick 与 scrollTimer有冲突
	if(!Utils.getID(".driveFrom") && !Utils.getID(".member")) {
		window.fastClick = FastClick.attach(document.body);
	}
});
