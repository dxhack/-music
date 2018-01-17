/**
 * Created by Roger on 16/2/21.
 */
var ctx = {
    $playList: null,
    $listContent: null,
    playList: null,
    player: null,
    currentSong: null,
    $needle: null,
    currentIndex: 0,
    $curTime: null,
    $totTime: null,
    $processBtn: null,
    $processBar: null,
    $rdyBar: null,
    $curBar: null,
    $playBtn: null,
    $pauseBtn: null,
    canvas: null,
    backImage: null,
    interval: 0,
    processBtnState: 0,
    originX: 0,
    diskCovers: [],
    isPlaying: false,
    songUpdated: true,
    singleLoop: false//single loop
};




ctx.init = function () {
    ctx.initData();
    ctx.initState();
    ctx.initPlayList();
    ctx.updateSong();
    ctx.setInterval();
    ctx.initProcessBtn(ctx.$processBtn);
    ctx.updateCoverState(0);
};

ctx.initData = function () {
    ctx.currentIndex = +localStorage.getItem("currentSongIndex") || 0;
    ctx.currentIndex >= ctx.playList.length ? ctx.currentIndex = 0 : '';
    ctx.currentSong = ctx.playList[ctx.currentIndex];
    ctx.player = $('#player').get(0);
    ctx.$needle = $('#needle');
    ctx.$curTime = $('#currentTime');
    ctx.$totTime = $('#totalTime');
    ctx.$processBtn = $('#processBtn');
    ctx.$processBar = $('#process .process-bar');
    ctx.$rdyBar = $('#process .rdy');
    ctx.$curBar = $('#process .cur');
    ctx.$playBtn = $('#controls .play');
    ctx.$pauseBtn = $('#controls .pause');
    ctx.$playList = $('#playList');
    ctx.$listContent = $('#listContent');
    ctx.diskCovers = [$('.disk-cover:eq(0)'), $('.disk-cover:eq(1)'), $('.disk-cover:eq(2)')];
};

ctx.loop=function(){
    ctx.singleLoop=!ctx.singleLoop;
    $('#controls .loop-btn').toggleClass('active');
};
//初始化列表
ctx.initPlayList = function () {
    var $li;
    ctx.$listContent.html('');
    $('#playListCount').html(ctx.playList.length);
    $.each(ctx.playList, function (i, item) {
        $li = $('<li>').html(item.name).append($('<span>').html('   -' + formatArtists(item.artists)));
        $li.on('click touch', function () {
            if(ctx.currentIndex!==i){
                ctx.isPlaying = true;
                ctx.moveTo(i);
            }
        });
        ctx.$listContent.append($li);
    });
    ctx.validatePlayList();
    ctx.$playList.css('bottom', -ctx.$playList.height() + 'px');
};
//显示播放列表
ctx.showPlayList = function () {
    ctx.$playList.animate({bottom: '0px'}, 200);
};
//隐藏播放列表
ctx.hidePlayList = function () {
    ctx.$playList.animate({bottom: -ctx.$playList.height() + 'px'}, 200);
};
//有效日期的播放列表
ctx.validatePlayList = function () {
    ctx.$listContent.children('li.active').removeClass('active').children("div.song-play").remove();
    ctx.$listContent.children('li').eq(ctx.currentIndex).addClass('active')
        .prepend($('<div>').addClass('song-play'));
    ctx.$listContent.animate({
        scrollTop: (ctx.currentIndex + 1) * 41 - ctx.$listContent.height() / 2
    });
};
//开始
ctx.initState = function () {
    $('img').attr('draggable', false);
    ctx.player.addEventListener('ended', function(){
        if(ctx.singleLoop){
            ctx.moveTo(ctx.currentIndex);
        }else{
            ctx.next();
        }
    });
    ctx.player.addEventListener('canplay', ctx.readyToPlay);
    window.addEventListener('resize', ctx.updateCoverState);
    $("body").on('click touch', function (e) {
        if ($(e.target).parents('#playList').length === 0 && !$(e.target).hasClass('list-btn')) {
            ctx.hidePlayList();
        }
    });
};


//更新覆盖状态
ctx.updateCoverState = function (derection, preLoad) {
    var temp, speed = 800, defualtUrl = "../resource/images/placeholder_disk_play_song.png",
        preIndex = ctx.currentIndex - 1 < 0 ? ctx.playList.length - 1 : ctx.currentIndex - 1,
        nextIndex = ctx.currentIndex + 2 > ctx.playList.length ? 0 : ctx.currentIndex + 1,
        posLeft = -ctx.diskCovers[0].width() / 2,
        posCenter = '50%',
        posRight = ctx.diskCovers[0].parent().width() + ctx.diskCovers[0].width() / 2,
        //更新专辑IMGS
        updateAlbumImgs = function () {
            ctx.diskCovers[0].children('.album').attr('src', ctx.playList[preIndex].album.picUrl);
            ctx.diskCovers[1].children('.album').attr('src', ctx.playList[ctx.currentIndex].album.picUrl);
            ctx.diskCovers[2].children('.album').attr('src', ctx.playList[nextIndex].album.picUrl);
        },
        //动画结束
        animationEnd = function () {
            if (!ctx.songUpdated) {
                updateAlbumImgs();
                ctx.updateSong();
                ctx.songUpdated = true;
            }
        //专辑停止转动
        }, albumStopRotate = function () {
            ctx.changeAnimationState(ctx.diskCovers[0], 'paused');
            ctx.changeAnimationState(ctx.diskCovers[2], 'paused');
        };

    if (derection === 1) {
        ctx.songUpdated = false;
        temp = ctx.diskCovers[0];
        ctx.diskCovers[0] = ctx.diskCovers[1];
        ctx.diskCovers[1] = ctx.diskCovers[2];
        ctx.diskCovers[2] = temp;

        albumStopRotate();

        if (preLoad) {
            ctx.diskCovers[1].children('.album').attr('src', defualtUrl);
        }

        ctx.diskCovers[2].css('left', posRight);
        ctx.diskCovers[1].animate({left: posCenter}, speed, animationEnd);
        ctx.diskCovers[0].animate({left: posLeft}, speed, animationEnd);
    } else if (derection === -1) {
        ctx.songUpdated = false;
        temp = ctx.diskCovers[2];
        ctx.diskCovers[2] = ctx.diskCovers[1];
        ctx.diskCovers[1] = ctx.diskCovers[0];
        ctx.diskCovers[0] = temp;

        albumStopRotate();
        ctx.diskCovers[0].css('left', posLeft);
        ctx.diskCovers[1].animate({left: posCenter}, speed, animationEnd);
        ctx.diskCovers[2].animate({left: posRight}, speed, animationEnd);
    } else {
        ctx.songUpdated = true;
        ctx.diskCovers[0].css('left', posLeft).show();
        ctx.diskCovers[1].css('left', posCenter).show();
        ctx.diskCovers[2].css('left', posRight).show();
        updateAlbumImgs();
    }

};


//改变动画状态
ctx.changeAnimationState = function ($ele, state) {
    $ele.css({
        'animation-play-state': state,
        '-webkit-animation-play-state': state
    });
};


//更新的歌
ctx.updateSong = function () {
    // ctx.player.src = ctx.currentSong.mp3Url;
    // setTimeout(ctx.updatePic, 10);
    ctx.updateMusicInfo();
    // if (ctx.isPlaying) {
    //     setTimeout(ctx.play, 500);
    // }
    localStorage.setItem("currentSongIndex", ctx.currentIndex);
};


//更新的照片
ctx.updatePic = function () {
    $(".bg").css('background-image', 'url(' + ctx.currentSong.album.picUrl + ')');
};


//更新的音乐信息
ctx.updateMusicInfo = function () {
    $('#songName').html(ctx.currentSong.name);
    $('#artist').html(formatArtists(ctx.currentSong.artists));



        // $.post("http://192.168.31.28:8080",

        // JSON.stringify({
        //     songName:$("#songName").text(),
        //     zhuangtai:String(ctx.isPlaying)
        // }),


        // function(data){
        //     alert("成功:"+data);
        // });




        // $.ajax({
        //     type: 'POST',
        //     url: "http://192.168.31.28:8080",
        //     timeout : 300000,
        //     data: {"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},
        //     success: function(data){
        //         alert(data)
        //     },
        //     dataType: "jsonp"
        // });

        

     $.ajax({    
                type:"get",    //请求方式    
                async:true,    //是否异步    
                url:"http://192.168.31.28:8080",    
                dataType:"jsonp",    //跨域json请求一定是jsonp    
                jsonp: "callback",    //跨域请求的参数名，默认是callback        
                //jsonpCallback:"successCallback",    //自定义跨域参数值，回调函数名也是一样，默认为jQuery自动生成的字符串
                data:{"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},    //请求参数    
                beforeSend: function() {        
                    //请求前的处理    
                },    
                success: function(data) {        
                    //请求成功处理，和本地回调完全一样
                    alert("成功")    
                },    
                complete: function() {       
                 //请求完成的处理    s
                 // alert("完成")    

                },    
                error: function() {  
                  //请求出错处理
                    alert("请求错误")    

                }});
};



//播放
ctx.play = function () {
    // ctx.player.play();
    ctx.isPlaying = true;
    ctx.changeAnimationState(ctx.diskCovers[1], 'running');
    ctx.moveNeedle(true);
    ctx.$playBtn.hide();
    ctx.$pauseBtn.show();
	
	
	// $.post("http://192.168.31.28:8080",

 //        JSON.stringify({
 //            songName:$("#songName").text(),
 //            zhuangtai:String(ctx.isPlaying)
 //        }),


 //        function(data){
 //            alert("成功:"+data);
 //        });



  // $.ajax({
  //           type: 'POST',
  //           url: "http://192.168.31.28:8080",
  //           timeout : 300000,
  //           data: {"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},
  //           success: function(data){
  //               alert(data)
  //           },
  //           dataType: "jsonp"
  //       });





    $.ajax({    
                type:"get",    //请求方式    
                async:true,    //是否异步    
                url:"http://192.168.31.28:8080",    
                dataType:"jsonp",    //跨域json请求一定是jsonp    
                jsonp: "callback",    //跨域请求的参数名，默认是callback        
                //jsonpCallback:"successCallback",    //自定义跨域参数值，回调函数名也是一样，默认为jQuery自动生成的字符串
                data:{"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},    //请求参数    
                beforeSend: function() {        
                    //请求前的处理    
                },    
                success: function(data) {        
                    //请求成功处理，和本地回调完全一样
                    alert("成功")    
                },    
                complete: function() {       
                 //请求完成的处理    s
                 // alert("完成")    

                },    
                error: function() {  
                  //请求出错处理
                    alert("请求错误")    

                }});
		

};


//暂停

ctx.pause = function () {
    // ctx.player.pause();
    ctx.isPlaying = false;
    ctx.moveNeedle(false);
    ctx.changeAnimationState(ctx.diskCovers[1], 'paused');
    ctx.$playBtn.show();
    ctx.$pauseBtn.hide();
	
	
	// $.post("http://192.168.31.28:8080",

 //        JSON.stringify({
 //            songName:$("#songName").text(),
 //            zhuangtai:String(ctx.isPlaying)
 //        }),


 //        function(data){
 //            alert("成功:"+data);
 //        });



  // $.ajax({
  //           type: 'POST',
  //           url: "http://192.168.31.28:8080",
  //           timeout : 300000,
  //           data: {"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},
  //           success: function(data){
  //               alert(data)
  //           },
  //           dataType: "jsonp"
  //       });


 $.ajax({    
                type:"get",    //请求方式    
                async:true,    //是否异步    
                url:"http://192.168.31.28:8080",  
                dataType:"jsonp",    //跨域json请求一定是jsonp    
                jsonp: "callback",    //跨域请求的参数名，默认是callback        
                //jsonpCallback:"successCallback",    //自定义跨域参数值，回调函数名也是一样，默认为jQuery自动生成的字符串
                data:{"songName":$("#songName").text(),"zhuangtai":String(ctx.isPlaying)},    //请求参数    
                beforeSend: function() {        
                    //请求前的处理    
                },    
                success: function(data) {        
                    //请求成功处理，和本地回调完全一样
                    alert("响应成功")    
                },    
                complete: function() {       
                 //请求完成的处理
                 alert("请求完成")    

                },    
                error: function() {  
                  //请求出错处理
                    alert("请求错误")    

                }});
        
		

};

//动针
ctx.moveNeedle = function (play) {
    if (play) {
        ctx.$needle.removeClass("pause-needle").addClass("resume-needle");
    } else {
        ctx.$needle.removeClass("resume-needle").addClass("pause-needle");
    }
};

//预切换歌曲
ctx.preSwitchSong = function () {
    // ctx.songUpdated = false;
    ctx.currentSong = ctx.playList[ctx.currentIndex];
    // ctx.player.pause();
    ctx.moveNeedle(false);
    ctx.validatePlayList();
};


//移动
ctx.moveTo = function (index) {
    if (ctx.songUpdated) {
        ctx.currentIndex = index;
        ctx.preSwitchSong();
        setTimeout('ctx.updateCoverState(1,true)', ctx.isPlaying ? 400 : 0);
    }
};


//下一个
ctx.next = function () {
    if (ctx.songUpdated) {
        ctx.currentIndex = ctx.currentIndex < ctx.playList.length - 1 ? ctx.currentIndex + 1 : 0;
        ctx.preSwitchSong();
        setTimeout('ctx.updateCoverState(1)', ctx.isPlaying ? 400 : 0);
    }
};

//上一个
ctx.prev = function () {
    if (ctx.songUpdated) {
        ctx.currentIndex = ctx.currentIndex > 0 ? ctx.currentIndex - 1 : ctx.playList.length - 1;
        ctx.preSwitchSong();
        setTimeout('ctx.updateCoverState(-1)', ctx.isPlaying ? 400 : 0);
    }
};


//更新过程
ctx.updateProcess = function () {
    var buffer = ctx.player.buffered,
        bufferTime = buffer.length > 0 ? buffer.end(buffer.length - 1) : 0,
        duration = ctx.player.duration,
        currentTime = ctx.player.currentTime;
    ctx.$totTime.text(validateTime(duration / 60) + ":" + validateTime(duration % 60));
    ctx.$rdyBar.width(bufferTime / duration * 100 + '%');
    if (!ctx.processBtnState) {
        ctx.$curBar.width(currentTime / duration * 100 + '%');
        ctx.$curTime.text(validateTime(currentTime / 60) + ":" + validateTime(currentTime % 60));
    }
};


//设置间隔
ctx.setInterval = function () {
    if (!ctx.interval) {
        ctx.updateProcess();
        ctx.interval = setInterval(ctx.updateProcess, 1000);
    }
};


//清除间隔
ctx.clearInterval = function () {
    if (ctx.interval) {
        clearInterval(ctx.interval);
    }

};

//init进程按钮
ctx.initProcessBtn = function ($btn) {
    var moveFun = function (e) {
            var duration = ctx.player.duration,
                e = e.originalEvent,
                totalWidth = ctx.$processBar.width(), percent, moveX, newWidth;
            e.preventDefault();
            if (ctx.processBtnState) {
                moveX = (e.clientX || e.touches[0].clientX) - ctx.originX;
                newWidth = ctx.$curBar.width() + moveX;

                if (newWidth > totalWidth || newWidth < 0) {
                    ctx.processBtnState = 0;
                } else {
                    percent = newWidth / totalWidth;
                    ctx.$curBar.width(newWidth);
                    ctx.$curTime.text(validateTime(percent * duration / 60) + ":" + validateTime(percent * duration % 60));
                }
                ctx.originX = (e.clientX || e.touches[0].clientX);
            }
        },
        startFun = function (e) {
            e = e.originalEvent;
            ctx.processBtnState = 1;
            ctx.originX = (e.clientX || e.touches[0].clientX);
        },
        endFun = function () {
            if (ctx.processBtnState) {
                ctx.player.currentTime = ctx.$curBar.width() / ctx.$processBar.width() * ctx.player.duration;
                ctx.processBtnState = 0;
                ctx.updateProcess();
            }
        };
    $btn.on('mousedown', startFun);  
    $btn.on('touchstart', startFun);  
    $("body").on('mouseup', endFun);  
    $("body").on('touchend', endFun);  
    $("#process").on('mousemove', moveFun);  
    $("#process").on('touchmove', moveFun); 
}


//有效日期
function validateTime(number) {
    var value = (number > 10 ? number + '' : '0' + number).substring(0, 2);
    return isNaN(value) ? '00' : value;
}

function formatArtists(artists) {
    var names = [];
    $.each(artists, function (i, item) {
        names.push(item.name);
    });
    return names.join('/');
}

$(function () {
    var url = location.href.indexOf("localhost") !== -1 ? '../resource/play_list.json' : './playlist.php?id=2052094586';
    $.ajax({
        url: url,
        type: 'GET',
        dataType: 'json',
        success: function (data) {
            console.log(data);
            ctx.playList = data.result.tracks;
            ctx.init();
          	
        },
        error: function (msg) {
            alert(msg);
        },
    });
});



