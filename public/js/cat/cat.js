/**
 * Created with JetBrains WebStorm.
 * User: wb-wangyuefei
 * Date: 13-7-17
 * Time: 下午5:24
 * To change this template use File | Settings | File Templates.
 */
(function(W,S){
    /**
     * @class 游戏对象
     * @param cfg
     * @constructor
     */
    var CatJump=function(cfg){
        /**
         * 图片列表
         * @type {Array}
         */
        this.Images=[];
        /**
         * 左键状态
         * @type {boolean}
         */
        this.keyDownLeft=false;
        /**
         * 右键状态
         * @type {boolean}
         */
        this.keyDownRight=false;
        /**
         * 移动端控制
         * @type {boolean}
         */
        this.phoneControl=false;
        /**
         * 初始化默认限制游戏时间
         * @type {number}
         */
        this.defaultTime=30;
        /**
         * 游戏开始时间
         * @type {number}
         */
        this.startTime=0;
        /**
         * 视口的初始化位置
         */
        this.viewportDefault = [0,45440];
        /**
         * 得分
         */
        this.score = 0;
        /**
         * 上一个云的Y轴坐标
         * @type {number}
         */
        this.lastCloudY=0;
        CatJump.superclass.constructor.call(this,cfg);
    };
    S.extend(CatJump,Tgame.Game);
    CatJump.prototype.__createLayer=function(){
        // 创建视口对象
        var viewportWidth= S.DOM.viewportWidth(),
            viewportHeight= S.DOM.viewportHeight(),
            viewport = new Tgame.Viewport({
                width : viewportWidth>400?400:viewportWidth,
                height : viewportHeight>600?600:viewportHeight
            }),skyLayer,catLayer,cloudLayer;
        // 创建游戏层
        skyLayer = new Tgame.Layer({
            viewport : viewport,
            distance : 20
        });
        skyLayer.setCanvas('canvasSkyLayer');
        catLayer = new Tgame.Layer({
            viewport : viewport
        });
        catLayer.setCanvas('canvasCatLayer');
        cloudLayer=new Tgame.Layer({
            viewport:viewport
        });
        cloudLayer.setCanvas('canvasCloudLayer');
        this.appendChild(skyLayer);
        this.appendChild(cloudLayer);
        this.appendChild(catLayer);
        this.viewport=viewport;
        this.skyLayer=skyLayer;
        this.catLayer=catLayer;
        this.cloudLayer=cloudLayer;
    };
    CatJump.prototype.__createOuter = function(){
        /*var ui = new UI(), CatJump = this;
         ui.init();

         ui.onretry = function() {
         //this.toBody();
         CatJump.stateInit();
         CatJump.start();
         };
         this.ui = ui;*/
    };
    CatJump.prototype.__createDesktop=function(){
        var sky=new Tgame.Bitmap({
            image : this.Images['sky'],
            width : this.Images['sky'].width,
            height : this.Images['sky'].height,
            swidth : this.viewport.width
        });
        this.viewportDefault[1]=((sky.height-this.viewport.height)*this.skyLayer.distance);
        this.skyLayer.appendChild(sky);
    };
    CatJump.prototype.__createCat=function(){
        var cat=new Cat();
        cat.game=this;
        this.cat=cat;
        this.catLayer.appendChild(cat);
    };

    //设置道具
    CatJump.prototype.__createProp = function(cloud) {
        if(!cloud.hasProp){ return;}
        if(TTT.Math.random(1, 6) == 1) {
            var prop = new Prop({'propImgs':cloud.game.Images});
            prop.init();
            prop.x = TTT.Math.random(cloud.x, cloud.x + 150 - prop.width);
            if(prop.name == 'prop_spring01'){
                prop.y = cloud.y - prop.height ;//  prop.height;
            } else{
                prop.y = cloud.y - prop.height / 4;//  prop.height;
            }
            //console.log(prop.name);
            cloud.prop = prop;
            this.cloudLayer.appendChild(prop);
        }
    };
    CatJump.prototype.init=function(){
        this.__createLayer();
        this.__createCat();
        this.__createDesktop();
        this.__createOuter();
        CatJump.superclass.init.call(this);
    };
    /**
     * 初始化状态
     */
    CatJump.prototype.stateInit = function() {
        // 移动视口到默认位置
        this.viewport.move(this.viewportDefault[0], this.viewportDefault[1], true);
        this.cat.reset();
        this.cat.x = this.viewport.width/2;
        this.cat.y = this.viewportDefault[1] + this.viewport.height-this.cat.height;
        this.cat.minTop = this.cat.y;
        //建云层
        this.__createDefaultCloud();
        // 重绘
        this.skyLayer.change();
        this.catLayer.change();
        this.cloudLayer.change();
        //this.effectLayer.change();
    };
    /**
     * @private
     * 控制云层
     *
     CatJump.prototype.__cloudControl = function() {
        var viewportY = this.viewport.y, lastCloudY = this.lastCloudY, space = TTT.Math.random(200, 300);
        if(lastCloudY - viewportY > space) {
            var childs = this.cloudLayer.getChilds(), child, viewportBottom = viewportY + 800;
            for(var i = 0, len = childs.length; i < len; i++) {
                child = childs[i];
                if(child && child.y > viewportBottom) {
                    child.destory();
                    i--;
                }
            }

            // 高度每增加500,提升1个高度的难度
            //this.lastStairY = lastStairY - (space + Math.max(~~(this.score / 500), 0));
            var cloud = new Cloud({
                y : this.lastCloudY
            });
            cloud.init();
            this.cloudLayer.appendChild(cloud);
            this.__createProp(cloud);
        }
    }*/
    CatJump.prototype.ViewportMove=function(){
        var cat=this.cat,viewport=this.viewport,catY=cat.y,cloudLayer,clouds,cloud,viewportY=this.viewportDefault[1]+(this.viewport.height)/2;
        if(catY<cat.lastY&&catY>0){
            if(catY<cat.minTop){
                catY<viewportY&&viewport.move(0,catY-(viewport.height/2),true);
                this.skyLayer.change();
                this.setScore(45970 - catY);
                cat.minTop=catY;
                this.__createCloud();
            }
        }else if(cat.animName=='Jump'){
            cloudLayer=this.cloudLayer;
            clouds=cloudLayer.getChilds();
            if(catY > viewport.y + viewport.height) {// 死亡
                console.log(catY);
                console.log(viewport.y+viewport.height);
                cat.dead();
            }else{
                for(var i= 0,len=clouds.length;i<len;i++){
                    cloud=clouds[i];
                    if(cloud&&cat.hitTest(cloud)){
                        // 与云层碰撞
                        if( cloud instanceof Prop) {
                            cloud.stepon(cat);
                        } else {
                            /*var cloud = new Cloud({
                             x : cat.x + (cat.direction == 'left' ? 45 : 35),
                             y : cloud.y - 16,
                             width : 64,
                             height : 16
                             });
                             var self = this;

                             cloud.onupdate = cloud.ondestory = function() {
                             self.effectLayer.change();
                             };
                             this.effectLayer.appendChild(cloud);
                             cloud.init();*/

                            /*var name = cloud.name;
                             if(name == 'stair_friable') {// 脆弱的云
                             cloud.anim.play();
                             } else if(name == 'stair_moveable') {// 会移动的云
                             cloud.anim.gotoAndPlay(1);
                             }*/

                            cat.JumpAgain();
                        }
                    }
                }
            }
        }
    };
    /**
     * 设置得分
     * @param {Number} score
     */
    CatJump.prototype.setScore = function(score) {
        this.score = score;
        //console.log(score);
    };
    CatJump.prototype.__createDefaultCloud=function(){
        var cloud;
        this.cloudLayer.destoryChilds();
        this.lastCloudY=this.viewportDefault[1]+(this.viewport.height-(this.cat.height*2.5));
        cloud=new Cloud({y:this.lastCloudY,game:this});
        cloud.init();
        this.cloudLayer.appendChild(cloud);
        //console.log(this.Images);
        this.__createProp(cloud);
    };
    CatJump.prototype.__createCloud=function(){
        var viewportY=this.viewport.y,lastCloudY=this.lastCloudY,tmpY=TTT.Math.random(200,300);
        if(lastCloudY-viewportY>tmpY){
            var childs=this.cloudLayer.getChilds(),child,viewBottom=viewportY+this.viewport.height;
            for(var i= 0,len=childs.length;i<len;i++){
                child=childs[i];
                if(child&&child.y>viewBottom){
                    child.destory();
                    i--;
                }
            }
            this.lastCloudY=lastCloudY-tmpY;
            var cloud=new Cloud({
                y:this.lastCloudY,
                game:this
            });
            cloud.init();
            this.cloudLayer.appendChild(cloud);
            this.__createProp(cloud);
            //console.log(this);
        }
    };
    CatJump.prototype.update=function(deltaTime){
        this.cloudLayer.change();
        CatJump.superclass.update.call(this,deltaTime);
    };
    /**
     * 游戏结束
     */
    CatJump.prototype.gameover = function() {
        this.stop();
//        alert('u are die');
    };
    /**
     * @Class 猫
     * @param cfg
     * @constructor
     */
    var Cat=function(cfg){
        /**
         * 游戏对象
         */
        this.game = null;
        /**
         * 方向 @format left|front|right
         * @type {string}
         */
        this.direction = 'front';

        /**
         * 当前正在播放的名称
         * @type {string}
         */
        this.animName = '';
        /**
         * 到达过的最高Y轴位置
         * @type {number}
         */
        this.minTop = 0;
        /**
         * @private
         * 气球高度
         */
        this.__balloonHeight = 0;
        /**
         * @private
         * 超人跳跃的高度
         */
        this.__superJumpHeight = 0;
        this.__swimHeight = 0;
        /**
         * 状态更新函数
         */
        //this.stateUpdate =new Function() ;
        /**
         * 惯性
         * @type {number}
         */
        this.inertia=0;
        Cat.superclass.constructor.call(this,cfg);
    };
    S.extend(Cat, Tgame.Sprite);
    Cat.prototype.init=function(){
        this.stateUpdate=this.Jump;
        Cat.superclass.init.call(this);
    };
    Cat.prototype.Jump=function(){
        if(this.animName!=='Jump'){
            this.speedY = -1;
            this.acceY = 1 / 600;
            this.width = 128;
            this.height = 128;
            this.setAnim('Jump');
        }
        this.parent.change();
        this.__keyControl();
        this.game.ViewportMove();
    };
    /**
     * 气球
     */
    Cat.prototype.balloon = function() {

        if(this.__balloonHeight > 1200) {
            this.__balloonHeight = 0;
            this.stateUpdate = this.Jump;
            return false;
        } else {
            this.__balloonHeight += (this.lastY - this.y);
        }

        if(this.animName != 'qiqiu') {
            this.setAnim('qiqiu');
            this.speedY = -0.3;
            this.acceY = 0;
            this.flipX = false;
            this.width = 128;
            this.height = 160;
        }
        this.__keyControl();

        this.parent.change();
        this.game.ViewportMove();
    };
    /**
     * 超人跳跃
     */
    Cat.prototype.superman = function() {

        if(this.__superJumpHeight > 1200) {
            this.__superJumpHeight = 0;
            this.stateUpdate = this.Jump;
            return false;
        } else {
            this.__superJumpHeight += (this.lastY - this.y);
        }

        if(this.animName != 'superman') {
            this.setAnim('superman');
            this.speedY = -0.8;//-0.8
            this.acceY = 0;//-1/600;
        }
        this.__keyControl(true);

        this.parent.change();
        this.game.ViewportMove();
    };
    /**
     * 游泳
     */
    Cat.prototype.swim = function() {

        if(this.__swimHeight > 1200) {
            this.__swimHeight = 0;
            this.stateUpdate = this.Jump;
            return false;
        } else {
            this.__swimHeight += (this.lastY - this.y);
        }

        if(this.animName != 'swim') {
            this.setAnim('swim');
            this.speedY = -0.2;//-0.8
            this.acceY = 0;//-1/600;
        }
        this.__keyControl(true);
        this.parent.change();
        this.game.ViewportMove();
    };
    /**
     * 死亡
     */
    Cat.prototype.dead = function() {
        this.stateUpdate = this.__dead;
        this.setAnim('dead');
        this.speedX = 0;
        this.speedY = 0.15;
        this.acceX = 0;
        this.acceY = 1 / 1000;
        this.flipX = false;
    };
    /**
     * @private
     * 死亡时状态控制
     */
    Cat.prototype.__dead = function() {
        var game = this.game;

        if(this.deadHeight > 0) {
            var diffY = this.y - this.lastY, viewport = game.viewport;

            if(this.deadViewportFixed) {
                //
            } else if(this.y >= viewport.y + 400) {
                viewport.move(0, diffY * 2);
                //game.layerChnage();
            } else {
                this.deadViewportFixed = true;
            }

            this.deadHeight -= diffY;
            this.parent.change();
        } else {
            game.gameover();
        }
    };
    Cat.prototype.JumpAgain=function(){
        if(this.speedY!==-1){
            this.animName='';
            this.Jump();
        }
    };
    Cat.prototype.reset=function(){
        this.width = 128;
        this.height = 128;
        this.flipX = false;
        this.speedX = 0;
        this.speedY = 0;
        this.acceX = 0;
        this.acceY = 0;
        this.setAnim('daiji');
        // 待机状态
        this.stateUpdate = function(){};
    };
    Cat.prototype.__keyControl=function(){
        var game=this.game;
        if(game.keyDownLeft){
            if(this.direction!='left'){
                this.direction='left';
            }
            this.speedX=-.25;
            this.inertia=this.speedX;
            this.__checkBorder();
        }else if(game.keyDownRight){
            if(this.direction!='right'){
                this.direction='right'
            }
            this.speedX=.25;
            this.inertia=this.speedX;//惯性
            this.__checkBorder();
        }else{
            if(this.inertia<0){
                this.inertia+=.005;
            }else if(this.inertia>0){
                this.inertia-=.005;
            }
            this.speedX=this.inertia;
        }
    };
    Cat.prototype.__checkBorder=function(){
        if(this.direction=='left'&&this.x<0){
            this.x=this.game.viewport.width
        }else if(this.direction=='right'&&this.x>this.game.viewport.width){
            this.x=0;
        }
    };
    Cat.prototype.update=function(deltaTime){
        Cat.superclass.update.call(this,deltaTime);
        this.stateUpdate(deltaTime);
    };
    Cat.prototype.setAnim=function(animName,donplay){
        this.animName=animName;
        //console.log(this.game.Images);
        var self = this;
        var anim=new Tgame.Animation({
            image:self.game.Images[animName],//['cat'],
            frames:self.getCatFrames(animName)/*[{
             x : 0,
             y : 0,
             collRect : [[55, 14, 17, 75]]
             }],
             loop:false
             collRect : [[20, 0, 88, 88]]
             }]//this.getCatFrames(animName)*/
        });
        var notLoopAnims = ['cat','daiji', 'Jump'];
        for(var i = 0, len = notLoopAnims.length; i < len; i++) {
            if(notLoopAnims[i] == animName) {
                anim.loop = false;
                break;
            }
        }
        anim.init();


        //console.log(anim);
        if(!donplay){
            //alert(animName);
            anim.play();
        }
        this.anim=anim;
    };
    Cat.prototype.getCatFrames=(function() {
        var frames = {
            cat:[{
                x : 0,
                y : 0
            }],
            Jump : [{
                x : 0,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }, {
                x : 128,
                y : 0,

                duration : 60,
                collRect : [[26, 21, 12, 12]]
            },{
                x : 256,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }, {
                x : 384,
                y : 0,

                duration : 60,
                collRect : [[26, 21, 12, 12]]
            },{
                x : 512,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }, {
                x : 640,
                y : 0,

                duration : 60,
                collRect : [[26, 21, 12, 12]]
            },{
                x : 768,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }, {
                x : 896,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            },{
                x : 1024,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }, {
                x : 1152,
                y : 0,
                duration : 60,
                collRect : [[26, 21, 12, 12]]
            }],
            daiji : [{
                x : 0,
                y : 0
            }],
            qiqiu : [{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }],
            swim : [{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 128,
                y : 0,
                duration : 30
            },{
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 896,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1024,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }, {
                x : 1152,
                y : 0,
                duration : 30
            }],
            superman : [{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            },{
                x : 0,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 128,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 256,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 384,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 512,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 640,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }, {
                x : 768,
                y : 0,
                duration : 30
            }]
        };

        /**
         * @param {String} animName
         */
        //var self = this;
        return function(animName) {
            //console.log(animName);
            return frames[animName];
        }
    })();
    var Cloud=function(opts){
        //填入Y轴坐标
        this.y=null;
        //游戏对象
        this.game=null;
        //是否加载道具
        this.hasProp = true;
        Cloud.superclass.constructor.call(this,opts);
    };
    S.extend(Cloud,Tgame.Sprite);
    Cloud.prototype.init=function(){

        var cloudTypes = ['cloud', 'cloud_small', 'cloud_moveable', 'cloud_stable_01', 'cloud_stable_02', 'cloud_stable_03', 'cloud_stable_04', 'cloud_stable_05'];
        var name = cloudTypes[TTT.Math.random(0, 7)];

        if(name == 'cloud_small'){
            this.width=77;
            this.height=46;
            this.hasProp = false;
        }else{
            this.width=157;//256
            this.height=92;//128
        }

        this.x=TTT.Math.random(0,this.game.viewport.width-(this.width/2));
        //移动的云
        if(name == 'cloud_moveable'){
            this.speedX = TTT.Math.random(10,20) / 100;
            if(TTT.Math.random(0,1)){
                this.speedX = -this.speedX;
            }
            this.update = this.__moveableUpdate;
        }


        var anim = new Tgame.Animation({
            image:this.game.Images[name],
            frames:this.getCloudFrames(name),
            loop:false
        });
        anim.init();
        this.anim=anim;
        Cloud.superclass.init.call(this);
    };
    /**
     * @private
     * 会移动的云状态更新
     */
    Cloud.prototype.__moveableUpdate = function(deltaTime) {
        if((this.x < 0 && this.speedX < 0) || (this.x > 322 && this.speedX > 0)) {
            this.speedX = -this.speedX;
        }

        // 道具随云层移动
        if(this.prop && this.lastX != 0) {
            this.prop.x += (this.x - this.lastX);
        }

        Cloud.superclass.update.call(this, deltaTime);
    };

    Cloud.prototype.getCloudFrames = (function(){
        var frames = {
            cloud_moveable : [{
                x : 0,
                y : 0,
                duration : 50,
                collRect : [[0, 0, 156, 90]]
            },{
                x : 256,
                y : 0,
                duration : 50,
                collRect : [[0, 0, 156, 90]]
            },{
                x : 0,
                y : 0,
                duration : 50,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_small:[{
                x : 0,
                y : 0,
                duration : 50,
                collRect : [[0, 0, 77, 47]]
            }],
            cloud : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_stable_01 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_stable_02 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_stable_03 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_stable_04 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }],
            cloud_stable_05 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 156, 90]]
            }]
        };

        /**
         * @param {String} animName
         */
        return function(animName) {
            return frames[animName];
        }
    })();
    var Prop = function(cfg) {

        /**
         * 道具名称
         */
        this.name = '';

        this.propImgs = null;

        /**
         * @private
         */
        this.__isStepon = false;

        Prop.superclass.constructor.call(this, cfg);
    }
    S.extend(Prop, Tgame.Sprite);

    /**
     * 初始化
     */
    Prop.prototype.init = function() {
        var propsTypes = ['prop_spring01','props_balloon','props_superman','props_swim'];
        var propsLists = {
            prop_spring01 : {
                width : 41,
                height : 14
            },
            props_balloon : {
                width : 54,
                height : 64
            },
            props_superman : {
                width : 79,
                height : 127
            },
            props_swim:{
                width: 91,
                height: 58
            }
        };
        var name = propsTypes[TTT.Math.random(0, 3)];
        var config = propsLists[name];
        this.width = config.width;
        this.height = config.height;

        // 创建道具动画
        var anim = new Tgame.Animation({
            image : this.propImgs[name],
            frames : this.getPropFrames(name),
            loop : false
        });
        anim.init();

        this.anim = anim;
        this.name = name;
        Prop.superclass.init.call(this);
    }
    /**
     * 踩上道具
     * @param {Donkey Object} donkey
     */
    Prop.prototype.stepon = function(cat) {
        if(this.__isStepon) {
            return false;
        }
        this.__isStepon = true;
        switch(this.name) {//加道具
            case 'prop_spring01':
                cat.Jump();
                cat.speedY = -3;
                cat.anim.speed = 0.2;
                break;
            case 'props_balloon':
                cat.stateUpdate = cat.balloon;
                break;
            case 'props_superman':
                cat.stateUpdate = cat.superman;
                break;
            case 'props_swim':
                cat.stateUpdate = cat.swim;
                break;
        }

        if(this.name == 'prop_spring01') {
            var anim = new Tgame.Animation({
                image : this.propImgs['prop_spring03'],
                frames : this.getPropFrames('prop_spring03'),
                loop : false
            });
            anim.init();
            this.anim = anim;
            this.height = 30;
            this.y -= 16;
        } else {
            this.destory();
        }
    };
    Prop.prototype.getPropFrames = (function() {

        var frames = {
            prop_spring01 : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 41, 14]]
            }],
            prop_spring03 : [{
                x : 0,
                y : 0
            }],
            props_balloon : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 54, 64]]
            }],
            props_superman : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 79, 127]]
            }],
            props_swim : [{
                x : 0,
                y : 0,
                collRect : [[0, 0, 91, 58]]
            }]
        };

        /**
         * @param {String} animName
         */
        return function(animName) {
            return frames[animName];
        }
    })();
    W.CatJump=CatJump;

})(window,KISSY);