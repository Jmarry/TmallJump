/** 
* @fileOverview 浏览器 窗口宽度 监控 公共通用方法
* @extends  KISSY.Base
* @creator 黄甲（旺旺：水木年华double）<huangjia2015@gmail.com>
* @depends  ks-core
* @version 1.0
* @update 2013-05-29
* @example
*   new MoreViewVersion({
*		aryRange: [480, 640, '750px', 768, '850px', 950, '990px', 1190, 1280],	// 监控宽度值 数组范围	
*		isRealTimeEvent: false	// 监控宽度值 数组范围	-- 默认 true 实时监控	
*	});
*/

KISSY.add('twoviewversion', function(S){
	var Event = S.Event,
		DOM = S.DOM,
		Anim = S.Anim,
		Ajax = S.io,
		UA = S.UA,
		win = window,
		doc = document,
		body = doc.body;
		
	var RESNO = UA.mobile ? 0 : 10,						  // 容差(滚动条||设计差等) 监控 范围值 		
		LaterTime = UA.mobile ? 0 : 300, 				  // 延迟执行时间0 -- 1毫秒延迟 for mobile
		RANGENO = [480, 640, '750px', 768, '850px', 950, '990px', 1190, 1280]; // 监控分辨率范围 
		
	function MoreViewVersion(config){	
		var _self = this;
		
		if( !(_self instanceof MoreViewVersion) ){
			return new MoreViewVersion(config);
		}
		
		MoreViewVersion.superclass.constructor.call(_self, config);	  	
		
		_self._init();	
	}
	
	S.extend(MoreViewVersion, S.Base);
	S.augment(MoreViewVersion, {		
		
		// 初始化操作
		_init: function(){
			var _self = this;
			
			// 判断引用数据
			_self._arguIf();
			
			// 初始化 宽度标示
			_self._numbCompar();
			
			// 窗口resize事件监控
			_self._eventnit();
		},

		// 数组参数 调用判断 + 数组参数处理
		_arguIf: function(){
			var _self = this;
			
			if(S.isArray( _self.get('aryRange') )){ 
				RANGENO = _self.get('aryRange');
			}else{
				console.log('未指定监控范围或者不是数组,系统将监控默认范围值！');
			}
			_self._setWindowsView();			
		},			
		
		// 处理参数
		_setWindowsView: function(){
			var _self = this;
			
			S.each(['_validAry', '_addRangeValue', 'sortAry'], function(str){
				RANGENO = _self[str](RANGENO);
			});	
		},		
		
		// 增加容差范围值
		_addRangeValue: function(ary){
			var _self = this,
				addNo = [];
			
			S.each(ary, function(val){
				addNo.push( val+RESNO );
			});
			
			return addNo;
		},
		
		// 排序数组 --- 大到小
		sortAry: function(ary){
			var _self = this;
			
			ary.sort(sortfn);
			
			function sortfn(a, b){
				return b-a;
			}
			return ary;
		},
		
		// 去重 + 数字  验证(支持带px 范围值字符串)----- 数值过滤+处理
		_validAry: function(ary){
			var _self = this,
				afterAry = [],
				ary = S.unique(ary);
				
			S.each(ary, function(val){
				var parseNum = parseInt(val, 10);

				if(S.isNumber(val)){
					afterAry.push(val);
				}else{
					if(S.isNumber(parseNum)){
						afterAry.push(parseNum);
					}
				}
			});			
			return afterAry;
		},
				
		// 数值 范围比对 -- 写入标志class
		_numbCompar: function(){
			var _self = this,
				compreValue = _self.oldViewWidth + RESNO,
				view = DOM.viewportWidth(), 
				aryEndIdx = RANGENO.length-1,
				thatWidth;
				
			// console.log('宽度标示值判断逻辑开始调用！');

			// 边界值前置判断：如果当前值 >= || <= 数组 最大/最小值  且 上次class为 最大/最小 值标示，则退出 
			if(view >= compreValue && compreValue === RANGENO[0] ){
				return;
			}else if(view <= compreValue && compreValue === RANGENO[aryEndIdx] ){
				return;
			}
						
			// 差值截取判断逻辑 
			S.each(RANGENO, function(val, index){					
				if( view < val && index === aryEndIdx ){ // 小于 数组任何值 (最小值下限)
					thatWidth = val;
					return false;
				}else if( view >= val ){  // 大于等于 数组 从大到小 某一值(向下兼容策略)
					thatWidth = val;
					return false;
				}
			});
			_self._writeBodyWth(thatWidth, _self.oldViewWidth);
		},
				
		// 事件初始化
		_eventnit: function(){
			var _self = this,
				oCompare = S.buffer(_self._numbCompar, LaterTime, _self);
			
			// 若取消 实时 监控，则直接退出
			if(_self.get('isRealTimeEvent') == false ){
				return;
			}
			//挂载 窗口大小 监控事件
			Event.on(win, 'resize', oCompare);
		},	
		
		// body写入 宽度标识  只要一个有值即可 --- 先移除 再写入 的顺序
		_writeBodyWth: function(newView, oldView){
			var _self = this,
				newView = newView - RESNO; // 当前宽度-容差值 = class设定标示宽度 ---- 将宽度值还原到 容差之前的值
			
			// 如果写入值 和 移除值一样 则不处理
			if(newView === oldView){
				return;
			}
			
			// 若有值则写入 标志class
			if(oldView){
				DOM.removeClass(body, 'w' + oldView);
			}
			
			if(newView){
				DOM.addClass(body, 'w' + newView);				
				// 标示宽度值 -- 控制台提示
				_self.oldViewWidth = newView;
				console.log('当前body宽度class标示：'+'w' + newView);
			}else{
				console.log('无效的宽度值！');
			}			
		}
	});
		
	return MoreViewVersion;
}, {requires:['core']});