
function loadMore(obj, param){
	var defaduls = {
		callback : null
	}
	var opt = $.extend({}, defaduls, param);
	this.init(obj, opt);
	return this;
}

loadMore.prototype = {
	init : function(obj, opt){
		this.opt = opt;
		this.run = true;
		this.loadMore = null;
		this.data = opt.data == undefined ? {} : opt.data;
		this.index = 1;
		this.newDataUrl = opt.url;
		this.obj = obj;

		obj.after(this.Loading());
		this.bindUI();
		this.getScroll();
		//兼容手机版刷新后重新获取scrollTop的值
		$(window).on('load',function(){
			setTimeout(function(){
			//	$(window).trigger('scroll');
			})
		})


	},
	bindUI : function(){
		var _self = this;
		$(window).on('scroll',function(){
			this.getScroll();
		}.bind(this));
	},
	getScroll : function(){
		if(!this.run) return false;
		var tops= Math.max( document.body.scrollTop || document.documentElement.scrollTop );
		this.isLoad(tops);
	},
	isLoad : function(top){
		if(this.bottom(top)){
			this.loadAjax(this.newDataUrl);
		}
	},
	loadAjax : function(url){
		if(!url) {
			this.loadMore.remove();
			return;
		};
		var _self=this;
		$.ajax({
			type : "get",
			url :url,
			timeout : 10000,
			dataType : "json",
			data : _self.data,
			beforeSend:function(){
				$(window).off('scroll');
			},
			success:function(data){
				_self.success(data);
			},
			error:function(){
				_self.fail();
			}
		});
	},
	setClick : function(){
		var _self = this;
		this.$loadBtn.off('click').on('click',function(e){
			$(this).remove();
			_self.loadAjax(_self.newDataUrl);
		});
	},
	bottom : function(tops){
		var top = window.pageYOffset,
			footer = document.getElementById('footer'),
			bottom = footer ? (footer.offsetTop - 10) : this.obj.offset().top + this.obj.height(),
			height = Math.max(document.documentElement.clientHeight || document.body.clientHeight),
			documentTop = tops;

		if(documentTop + height >= bottom){
			this.run = false;
			return true;
		}
	},
	success : function(data){
		this.index++;
		var _self = this;
		setTimeout(function(){
			_self.opt.callback && _self.opt.callback.call(_self, data);
			!$(".loadMore").length && _self.obj.after(_self.loadMore);
			_self.run = true;
			//$(window).on("scroll");
			_self.bindUI();
			_self.getScroll();
		},500);

	},
	fail : function(){
		var _self=this;
		setTimeout(function(){
			_self.run = true;
		},500);
		this.$loadBtn = $('<span class="loadBtn" style="display:block; text-align:center; padding:10px 0; font-size:14px; color:#999;">点击重新加载</span>');
		if(!document.querySelector(".loadBtn")){
			this.obj.append(this.$loadBtn);
		}
		this.loadMore.remove();
		// _self.loadMore.html('加载超时，请重新加载...');
		this.$loadBtn.off('click').on('click',function(e){
			$(this).remove();
			_self.loadAjax(_self.newDataUrl);
		});
	},
	Loading :  function(){
		var loadHTML = $('<div class="loadDataMore"><a href="javascript:;">加载中...</a></div>');
		this.loadMore = loadHTML;
		return loadHTML;
	}
}
