/**
 * Created with JetBrains WebStorm.
 * User: wb-wangyuefei
 * Date: 13-7-17
 * Time: 下午4:01
 * To change this template use File | Settings | File Templates.
 */
(function(W,S){
    var Component,Viewport,DisplayObject,Animation,Bitmap,Sprite,DisplayObjectContainer,Layer,Game;
    var customFn=function(){};
    Component = function(cfg) {
        /**
         * 初始化状态
         */
        this.initialized = false;

        /**
         * read only
         * 父容器组件
         */
        this.parent = null;

        // 扩展属性
        S.mix(this, cfg);
    };
    /**
     * 事件定义
     * oninit 初始化
     * ondestory 销毁
     */
    Component.prototype.oninit = customFn;
    Component.prototype.ondestory =customFn;
    /**
     * 组件初始化
     */
    Component.prototype.init = function() {
        this.initialized = true;
        this.oninit();
    };
    /**
     * 组件销毁
     */
    Component.prototype.destory = function() {
        if(this.parent) {
            this.parent.removeChild(this);
            this.parent = null;
        }

        this.ondestory();
        this.oninit = this.ondestory = null;
    };
    Viewport = function(cfg) {

        /**
         * 视口x轴位置
         */
        this.x = 0;
        /**
         * 视口y轴位置
         */
        this.y = 0;
        /**
         * 视口宽度
         */
        this.width = 0;
        /**
         * 视口高度
         */
        this.height = 0;
        /**
         * @private
         * 视口上一次x轴位置
         */
        this.__lastX = 0;
        /**
         * @private
         * 视口上一次y轴位置
         */
        this.__lastY = 0;
        Viewport.superclass.constructor.call(this,cfg);
    };
    S.extend(Viewport, Component);
    /**
     * 移动视口
     * @param {Number} x
     * @param {Number} y
     * @param {Boolean} absolute 绝对位置
     */
    Viewport.prototype.move = function(x, y, absolute) {
        this.__lastX = this.x;
        this.__lastY = this.y;

        if(absolute) {
            this.x = x;
            this.y = y;
        } else {
            this.x += x;
            this.y += y;
        }
    };
    DisplayObject = function(cfg) {

        /**
         * 绘制时的x轴位置
         */
        this.x = 0;
        /**
         * 绘制时的y轴位置
         */
        this.y = 0;
        /**
         * 宽度
         */
        this.width = 0;
        /**
         * 高度
         */
        this.height = 0;
        /**
         * 透明度
         */
        this.alpha = 1;
        /**
         * 旋转角度
         */
        this.rotation = 0;
        /**
         * 水平翻转
         */
        this.flipX = false;
        /**
         * 垂直翻转
         */
        this.flipY = false;
        /**
         * 水平缩放
         */
        this.scaleX = 1;
        /**
         * 垂直缩放
         */
        this.scaleY = 1;
        /**
         * read only
         * 显示状态
         */
        this.visible = true;

        DisplayObject.superclass.constructor.call(this, cfg);
    }
    S.extend(DisplayObject, Component);

    /**
     * 事件定义
     * onshow 显示
     * onhide 隐藏
     * onupdate 状态更新
     * onrender 渲染
     * ondraw 在画布上绘制
     */
    DisplayObject.prototype.onshow = customFn;
    DisplayObject.prototype.onhide = customFn;
    DisplayObject.prototype.onupdate = customFn;
    DisplayObject.prototype.onrender = customFn;
    DisplayObject.prototype.ondraw = customFn;

    /**
     * 显示组件
     */
    DisplayObject.prototype.show = function() {
        this.visible = true;
        this.onshow();
    };
    /**
     * 隐藏组件
     */
    DisplayObject.prototype.hide = function() {
        this.visible = false;
        this.onhide();
    };
    /**
     * 更新状态
     * @param {Number} deltaTime
     */
    DisplayObject.prototype.update = function(deltaTime) {
        if(this.onupdate) {
            this.onupdate();
        }
    };
    /**
     * @private
     * 变形处理
     */
    DisplayObject.prototype.__transform = function(context) {
        context.translate(this.x, this.y);
        // 透明度
        if(this.alpha < 1) {
            context.globalAlpha = this.alpha;
        }

        // 旋转
        if(this.rotation % 360 > 0) {
            var offset = [this.width / 2, this.height / 2];
            context.translate(offset[0], offset[1]);
            context.rotate(this.rotation % 360 / 180 * Math.PI);
            context.translate(-offset[0], -offset[1]);
        }

        // 翻转
        if(this.flipX || this.flipY) {
            context.translate(this.flipX ? this.width : 0, this.flipY ? this.height : 0);
            context.scale(this.flipX ? -1 : 1, this.flipY ? -1 : 1);
        }

        // 缩放
        if(this.scaleX != 1 || this.scaleY != 1) {
            context.scale(this.scaleX, this.scaleY);
        }
    }
    /**
     * 渲染组件
     * @param {Context Object} context
     */
    DisplayObject.prototype.render = function(context) {
        if(!this.visible || this.alpha <= 0) {
            return false;
        }

        // 保存当前画布状态
        context.save();
        // 变形渲染帧
        this.__transform(context);
        this.draw(context);
        // 恢复画布状态
        context.restore();

        this.onrender();
    }
    /**
     * 在画布上绘制组件
     * @param {Context Object} context
     */
    DisplayObject.prototype.draw = function(context) {
        this.ondraw();
    };
    /**
     * 组件销毁方法
     */
    DisplayObject.prototype.destory = function() {
        this.onshow = this.onhide = this.onupdate = this.onrender = this.ondraw = null;
        DisplayObject.superclass.destory.call(this);
    };
    Animation = function(cfg) {

        /**
         * 动画图片
         */
        this.image = null;
        /**
         * 帧列表
         * @format {
         *     x: 0,
         *     y: 0,
         *     duration: 0,
         *     collRect: [[left, top, width, height]]
         * }
         */
        this.frames = [];
        /**
         * 循环播放
         */
        this.loop = true;
        /**
         * 播放倍速
         */
        this.speed = 1;
        /**
         * @read only
         * 播放状态
         */
        this.playing = false;
        /**
         * @read only
         * 正在播放的帧索引(第一帧从0开始)
         */
        this.currentFrameIndex = 0;
        /**
         * @read only
         * 正在播放的帧对象
         */
        this.currentFrame = null;
        /**
         * @private
         * 当前帧已播放时间(ms)
         */
        this.__framePlayedDuration = 0;

        Animation.superclass.constructor.call(this, cfg);
    }
    S.extend(Animation, Component);

    /**
     * 事件定义
     * onplay 开始播放动画
     * onstop 停止播放动画
     * onend 动画播放完毕
     */
    Animation.prototype.onplay = customFn;
    Animation.prototype.onstop = customFn;
    Animation.prototype.onend = customFn;

    /**
     * @private
     * 跳转到指定的帧
     * @param {Number} index
     */
    Animation.prototype.__gotoFrame = function(index) {
        if(this.frames[index]) {
            var self = this;
            this.currentFrameIndex = index;
            this.currentFrame = this.frames[index];
            this.__framePlayedDuration = 0;
        }
    };
    /**
     * @private
     * 跳转到下一帧
     */
    Animation.prototype.__nextFrame = function() {
        if(this.currentFrameIndex < this.frames.length - 1) {
            this.__gotoFrame(this.currentFrameIndex + 1);
        } else if(this.loop) {
            this.__gotoFrame(0);
        } else {
            this.stop();
            this.onend();
        }
    };
    /**
     * 初始化
     */
    Animation.prototype.init = function() {
        this.__gotoFrame(0);
        Animation.superclass.init.call(this);
    };
    /**
     * 播放动画
     */
    Animation.prototype.play = function() {
        this.playing = true;
        this.onplay();
    };
    /**
     * 停止播放
     */
    Animation.prototype.stop = function() {
        this.playing = false;
        this.onstop();
    };
    /**
     * 跳转到指定帧并开始播放
     * @param {Number} index
     */
    Animation.prototype.gotoAndPlay = function(index) {
        this.__gotoFrame(index);
        this.play();
    };
    /**
     * 跳转到指定帧并停止播放
     * @param {Number} index
     */
    Animation.prototype.gotoAndStop = function(index) {
        this.__gotoFrame(index);
        this.stop();
    };
    /**
     * 更新动画的状态
     * @param {Number} deltaTime
     */
    Animation.prototype.update = function(deltaTime) {
        if(!this.playing) {
        } else if(this.__framePlayedDuration >= 5) {
            //this.__framePlayedDuration >= this.currentFrame.duration
            this.__nextFrame();
        } else {
            this.__framePlayedDuration += deltaTime * this.speed;
        }
    };
    /**
     * 销毁对象
     */
    Animation.prototype.destory = function() {
        this.image = this.frames = this.currentFrame = this.onplay = this.onstop = this.onend = null;
        Animation.superclass.destory.call(this);
    };
    Bitmap = function(cfg) {
        /**
         * 图片对象
         */
        this.image = null;
        /**
         * 重复绘制
         */
        this.repeat = false;
        /**
         * 可伸缩的宽度
         * @type {Number}
         */
        this.swidth = 0;
        /**
         * 可伸缩的高度
         * @type {Number}
         */
        this.sheight = 0;
        /**
         * @private
         */
        this.__pattern = null;

        Bitmap.superclass.constructor.call(this, cfg);
        this.__init();
    };
    S.extend(Bitmap, DisplayObject);
    Bitmap.prototype.__init=function(){
        this.swidth=this.swidth?this.swidth:this.width;
        this.sheight=this.sheight?this.sheight:this.height;
    };

    /**
     * 绘制图片
     * @param {Context Object} context
     */
    Bitmap.prototype.draw = function(context) {
        if(this.repeat) {
            if(!this.__pattern) {
                this.__pattern = context.createPattern(this.image, 'repeat');
            }
            context.fillStyle = this.__pattern;
            context.fillRect(0, 0, this.width, this.height);
        } else {
            context.drawImage(this.image, 0, 0, this.width, this.height, 0, 0, this.swidth, this.sheight);
        }
        Bitmap.superclass.draw.call(this);
    };
    /**
     * 销毁图像对象
     */
    Bitmap.prototype.destory = function() {
        this.image = null;
        Bitmap.superclass.destory.call(this);
    };
    Sprite = function(cfg) {

        /**
         * 当前动画
         */
        this.anim = null;
        /**
         * 水平移动速度
         */
        this.speedX = 0;
        /**
         * 垂直移动速度
         */
        this.speedY = 0;
        /**
         * 水平加速度
         */
        this.acceX = 0;
        /**
         * 垂直加速度
         */
        this.acceY = 0;
        /**
         * read only
         * 上一水平坐标
         */
        this.lastX = 0;
        /**
         * read only
         * 上一垂直坐标
         */
        this.lastY = 0;
        /**
         * read only
         * 上一水平移动速度
         */
        this.lastSpeedX = 0;
        /**
         * read only
         * 上一垂直移动速度
         */
        this.lastSpeedY = 0;

        Sprite.superclass.constructor.call(this, cfg);
    }
    S.extend(Sprite, DisplayObject);

    /**
     * @private
     * 获取精灵当前帧碰撞区域
     */
    Sprite.prototype.__getCollRect = function() {
        if(this.anim && this.anim.currentFrame) {
            return this.anim.currentFrame.collRect;
        }
    }
    /**
     * 碰撞检测
     * @param {Sprite Object} sprite2
     */
    Sprite.prototype.hitTest = function(sprite2) {
        var collRect1 = this.__getCollRect(), collRect2 = sprite2.__getCollRect(), coll1, coll2, result = false;

        if(collRect1 && collRect2) {
            var i1, len1 = collRect1.length, i2, len2 = collRect2.length;

            for( i1 = 0; i1 < len1; i1++) {
                coll1 = collRect1[i1];

                for( i2 = 0; i2 < len2; i2++) {
                    coll2 = collRect2[i2];
                    if(Math.abs((this.x + coll1[0] + coll1[2] / 2) - (sprite2.x + coll2[0] + coll2[2] / 2)) < (coll1[2] + coll2[2]) / 2 && Math.abs((this.y + coll1[1] + coll1[3] / 2) - (sprite2.y + coll2[1] + coll2[3] / 2)) < (coll1[3] + coll2[3]) / 2) {
                        result = true;
                        break;
                    }
                }
            }
        }
        sprite2 = collRect1 = collRect2 = coll1 = coll2 = null;
        return result;
    }
    /**
     * 更新精灵状态
     * @param {Number} deltaTime
     */
    Sprite.prototype.update = function(deltaTime) {
        this.lastSpeedX = this.speedX;
        this.lastSpeedY = this.speedY;
        this.lastX = this.x;
        this.lastY = this.y;

        // 计算移动速度
        this.speedX = this.lastSpeedX + this.acceX * deltaTime;
        this.speedY = this.lastSpeedY + this.acceY * deltaTime;
        // 计算精灵位置
        this.x += Math.round((this.lastSpeedX + this.speedX) * deltaTime / 2);
        this.y += Math.round((this.lastSpeedY + this.speedY) * deltaTime / 2);

        // 更新当前动画帧状态
        if(this.anim) {
            this.anim.update(deltaTime);
        }
        Sprite.superclass.update.call(this);
    }
    /**
     * 绘制精灵
     * @param {Context Object} context
     */
    Sprite.prototype.draw = function(context) {
        var anim = this.anim;
        if(anim && anim.currentFrame) {
            var frame = anim.currentFrame;
            context.drawImage(anim.image, frame.x, frame.y, this.width, this.height, 0, 0, this.width, this.height);
            Sprite.superclass.draw.call(this);

            // test
            /*
             if(frame.collRect) {
             var collRect = frame.collRect, coll;

             context.fillStyle = '#ff0000';
             context.globalAlpha = 0.5;

             for(var i = 0, len = collRect.length; i < len; i++) {
             coll = collRect[i];
             context.fillRect(coll[0], coll[1], coll[2], coll[3]);
             }
             }
             */

        }
    }
    /**
     * 销毁精灵
     */
    Sprite.prototype.destory = function() {
        if(this.anim) {
            this.anim.destory();
            this.anim = null;
        }
        Sprite.superclass.destory.call(this);
    }

    /*******************************************容器组件基类***************************************************/
    DisplayObjectContainer = function(cfg) {

        /**
         * 子组件列表
         */
        this.__childs = [];

        DisplayObjectContainer.superclass.constructor.call(this, cfg);
    };
    S.extend(DisplayObjectContainer, DisplayObject);

    /**
     * 初始化
     */
    DisplayObjectContainer.prototype.init = function() {
        var childs = this.__childs, child;

        for(var i = 0, len = childs.length; i < len; i++) {
            child = childs[i];
            if(!child.initialized) {
                child.init();
            }
        }
        DisplayObjectContainer.superclass.init.call(this);
    };
    /**
     * 在组件列表最后插入组件
     * @param {DisplayObject} child
     */
    DisplayObjectContainer.prototype.appendChild = function(child) {
        this.addChildAt(child, this.__childs.length);
    };
    /**
     * 在组件列表前面插入组件
     * @param {DisplayObject} child
     */
    DisplayObjectContainer.prototype.prependChild = function(child) {
        this.addChildAt(child, 0);
    };
    /**
     * 在组件列表指定位置插入组件
     * @param {DisplayObject} child
     * @param {Number} index
     */
    DisplayObjectContainer.prototype.addChildAt = function(child, index) {
        child.parent = this;
        this.__childs.splice(index, 0, child);
    };
    /**
     * 从组件列表中移除组件
     * @param {DisplayObject} child
     */
    DisplayObjectContainer.prototype.removeChild = function(child) {
        var childs = this.__childs;

        for(var i = 0, len = childs.length; i < len; i++) {
            if(childs[i] == child) {
                this.removeChildAt(i);
                break;
            }
        }
    };
    /**
     * 从组件列表中移除指定位置的组件
     * @param {Number} index
     */
    DisplayObjectContainer.prototype.removeChildAt = function(index) {
        var child = this.__childs.splice(index, 1);

        if(child) {
            child.parent = null;
        }
    };
    /**
     * 移除所有组件
     * @param {Number} index
     */
    DisplayObjectContainer.prototype.removeAll = function() {
        this.__childs.length = 0;
    };
    /**
     * 获取指定位置的组件
     * @param {Number} index
     */
    DisplayObjectContainer.prototype.getChildAt = function(index) {
        return this.__childs[index];
    };
    /**
     * 获取所有子组件
     */
    DisplayObjectContainer.prototype.getChilds = function() {
        return this.__childs;
    };
    /**
     * 更新组件状态
     * @param {Number} deltaTime
     */
    DisplayObjectContainer.prototype.update = function(deltaTime) {
        var childs = this.__childs;
        for(var i = 0, len = childs.length; i < len; i++) {
            if(childs[i]) {
                childs[i].update(deltaTime);
            }
        }
        DisplayObjectContainer.superclass.update.call(this);
    };
    /**
     * 绘制组件
     * @param {Context Object} context
     */
    DisplayObjectContainer.prototype.draw = function(context) {
        var childs = this.__childs;
        for(var i = 0, len = childs.length; i < len; i++) {
            childs[i].render(context);
        }
        DisplayObjectContainer.superclass.draw.call(this);
    };
    /**
     * 销毁所有子组件
     */
    DisplayObjectContainer.prototype.destoryChilds = function() {
        var childs = this.__childs;

        for(var i = 0, len = childs.length; i < len; i++) {
            childs[0].destory();
        }
    };
    /**
     * 销毁组件
     */
    DisplayObjectContainer.prototype.destory = function() {
        this.destoryChilds();
        this.__childs = null;
        DisplayObjectContainer.superclass.destory.call(this);
    };
    /*******************************************分层组件***************************************************/
    Layer = function(cfg) {

        /**
         * 游戏对象
         */
        this.viewport = null;
        /**
         * 场景离视口的距离
         */
        this.distance = 1;
        /**
         * @private
         * 分层画布对象
         */
        this.__canvas = null;
        /**
         * @private
         * 2d绘图上下文
         */
        this.__context = null;
        /**
         * @private
         * 分层状态是否改变
         */
        this.__change = true;

        Layer.superclass.constructor.call(this, cfg);
    };
    S.extend(Layer, DisplayObjectContainer);

    /**
     * 初始化分层
     */
    Layer.prototype.init = function() {
        var childs = this.__childs, child;

        for(var i = 0, len = childs.length; i < len; i++) {
            child = childs[i];

            child.x /= this.distance;
            child.y /= this.distance;

            if(!child.initialized) {
                child.init();
            }
        }

        DisplayObject.prototype.init.call(this);
    };
    /**
     * 设置画布
     */
    Layer.prototype.setCanvas = function(canvas) {
        if( typeof canvas === 'string') {
            canvas = document.getElementById(canvas);
        }
        if(canvas && canvas.getContext) {
            canvas.width=this.viewport.width;
            canvas.height=this.viewport.height;
            this.__canvas = canvas;
            this.__context = canvas.getContext('2d');
        }
    };
    /**
     * 清空画布
     */
    Layer.prototype.clear = function() {
        if(this.__change) {
            this.__context.clearRect(0, 0, this.__canvas.width, this.__canvas.height);
        }
    };
    /**
     * 改变分层状态
     */
    Layer.prototype.change = function() {
        this.__change = true;
    };
    /**
     * render
     */
    Layer.prototype.render = function() {
        if(this.__change) {
            Layer.superclass.render.call(this, this.__context);
            this.__change = false;
        }
    };
    /**
     * 绘制层内组件
     * @param {Context Object} context
     */
    Layer.prototype.draw = function(context) {
        var childs = this.__childs, child = null, viewport = this.viewport;
        var vx = viewport.x / this.distance, vy = viewport.y / this.distance, vw = viewport.width, vh = viewport.height;
        var cx = cy = cw = ch = 0;

        for(var i = 0, len = childs.length; i < len; i++) {
            child = childs[i];
            cx = child.x;
            cy = child.y;
            cw = child.width;
            ch = child.height;

            if(Math.abs((cx + cw / 2) - (vx + vw / 2)) < (cw + vw) / 2 && Math.abs((cy + ch / 2) - (vy + vh / 2)) < (ch + vh) / 2) {
                child.x = cx - vx;
                child.y = cy - vy;
                child.render(context);

                child.x = cx;
                child.y = cy;
            }
        }
        DisplayObject.prototype.draw.call(this);
    };
    /**
     * destory
     */
    Layer.prototype.destory = function() {
        this.viewport = this.__canvas = this.__context = null;
        Layer.superclass.destory.call(this);
    };
    /*******************************************游戏基类***************************************************/
    Game = function(cfg) {

        /**
         * 游戏视口对象
         */
        this.viewport = null;
        /**
         * read only
         * 帧频
         */
        this.FPS = 30;
        /**
         * read only
         * 运行状态
         */
        this.playing = false;
        /**
         * @private
         * 休眠时间
         */
        this.__sleep = 1000 / this.FPS;
        /**
         * @private
         * 上一帧执行完毕的时间
         */
        this.__lastTime = 0;
        /**
         * @private
         * 定时器句柄
         */
        this.__timeout = null;

        Game.superclass.constructor.call(this, cfg);
    };
    S.extend(Game, DisplayObjectContainer);

    /**
     * 事件定义
     * onstart 开始游戏
     * onstop 停止游戏
     */
    Game.prototype.onstart = customFn;
    Game.prototype.onstop = customFn;

    /**
     * 设置帧频
     * @param {Number} fps
     */
    Game.prototype.setFPS = function(fps) {
        this.FPS = fps;
        this.__sleep = 1000 / fps;
    };
    /**
     * 开始游戏
     */
    Game.prototype.start = function() {
        if(!this.playing) {
            this.playing = true;
            this.__lastTime = new Date().getTime();
            this.__run();
            this.onstart();
        }
    };
    /**
     * 游戏暂停
     */
    Game.prototype.stop = function() {
        if(this.playing) {
            this.playing = false;
            clearTimeout(this.__timeout);
            this.onstop();
        }
    };
    /**
     * 渲染游戏
     */
    Game.prototype.render = function() {
        var childs = this.__childs, child;

        for(var i = 0, len = childs.length; i < len; i++) {
            childs[i].render();
        }
        this.onrender();
    };
    /**
     * 清空画布
     */
    Game.prototype.clear = function() {
        var childs = this.__childs, child;

        for(var i = 0, len = childs.length; i < len; i++) {
            childs[i].clear();
        }
    };
    /**
     * @private
     * 运行时方法
     */
    Game.prototype.__run = function() {
        var now = 0,run=Game.__run;
        this.__timeout = setTimeout(TTT.callByCurry(this.__run,this), this.__sleep);
        now = new Date().getTime();
        this.update(now - this.__lastTime);
        this.clear();
        this.render();
        this.__lastTime = now;
    };
    /**
     * destory
     */
    Game.prototype.destory = function() {
        this.stop();
        Game.superclass.destory.call(this);
    };
    //UI
    window.Tgame={
        Component:Component,
        Viewport:Viewport,
        DisplayObject:DisplayObject,
        Animation:Animation,
        Bitmap:Bitmap,
        Sprite:Sprite,
        DisplayObjectContainer:DisplayObjectContainer,
        Layer:Layer,
        Game:Game
    }
})(window,KISSY);