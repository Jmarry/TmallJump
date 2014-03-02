/**
 * Created with JetBrains WebStorm.
 * User: wb-wangyuefei
 * Date: 13-7-17
 * Time: 上午10:30
 * To change this template use File | Settings | File Templates.
 */
(function (S) {
    window.TTT={ImgStack:{},Math:{}};
    TTT.ImgStack.__loadImg=function(img,next){
        var image=new Image();
        image.onload=function(){
            img.Dom=image;
            next()
        };
        image.src=img.src;
    };
    TTT.ImgStack.load=function(images,fn,__index){
        __index=__index||0;
        if(images[__index]){
            TTT.ImgStack.__loadImg(images[__index],function(){
                TTT.ImgStack.load(images,fn,__index+1);
            })
        }
        fn(__index);
    };
    TTT.callByCurry=function(firstfn,secondfn){
        secondfn = secondfn || window;
        if(arguments.length > 2) {
            var args = Array.prototype.slice.call(arguments, 2);

            return function() {
                return firstfn.apply(secondfn, args);
            }
        } else {
            return function() {
                return firstfn.call(secondfn);
            }
        }
    };
    TTT.Math.random=function(min,max){
        return Math.floor((max-min+1)*Math.random())+min;
    }
})(KISSY);