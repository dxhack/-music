﻿(function ($) {
    // Settings
    var repeat = 0,
		shuffle = 'false',
		continous = false,
		autoplay = false,
		flag=0;
		playlist = [
		{
            id:'5A5Aa000',
		    title: '别走1',
		    artist: '未知',
		    cover: 'img/1.jpg',
		    mp3: "mp3/biezou.mp3",
		    ogg: ''
		},
        {
            id: '5A5Ab000',
            title: '别走2',
            artist: '未知',
            cover: 'img/special.png',
            mp3: "mp3/biezou.mp3",
            ogg: ''
        },
        {
            id: '5A5Ac000',
            title: '英文歌',
            artist: '英文',
            cover: 'img/special.png',
            mp3: "mp3/MUSIC1005051622027270.mp3",
            ogg: ''
        }, ];

    // Load playlist
    for (var i = 0; i < playlist.length; i++) {
        var item = playlist[i];
        $('#playlist').append('<li data-id="' + item .id+ '">   <img src="' + item.cover + '" />  <div class="songName">' + item.title + '</div>  <div class="artist">' + item.artist + '</div></li>');
    }

    var time = new Date(),
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		trigger = false,
		audio, timeout, isPlaying, playCounts;

    var play = function () {
        audio.play();

        $('.playback').addClass('playing');
        $('.cover').addClass('active');
        $('.cover.paused').removeClass('paused');
        timeout = setInterval(updateProgress, 500);
        isPlaying = true;
    }

    var pause = function () {
        audio.pause();
        $('.playback').removeClass('playing');
        $('.cover').addClass('paused');
        clearInterval(updateProgress);
        isPlaying = false;
       
    }

    // Update progress
    var setProgress = function (value) {
        var currentSec = parseInt(value % 60) < 10 ? '0' + parseInt(value % 60) : parseInt(value % 60),
			ratio = value / audio.duration * 100;

        $('.timer').html(parseInt(value / 60) + ':' + currentSec);
        $('.progress .pace').css('width', ratio + '%');
        $('.progress .slider a').css('left', ratio + '%');
    }

    var updateProgress = function () {

        setProgress(audio.currentTime);
    }

    // Progress slider
    $('.progress .slider').slider({
        step: 0.1, slide: function (event, ui) {
            $(this).addClass('enable');
            setProgress(audio.duration * ui.value / 100);
            clearInterval(timeout);
        }, stop: function (event, ui) {
            audio.currentTime = audio.duration * ui.value / 100;
            $(this).removeClass('enable');
            timeout = setInterval(updateProgress, 500);
        }
    });

    // Volume slider
    //var setVolume = function (value) {
    //    audio.volume = localStorage.volume = value;
    //    $('.volume .pace').css('width', value * 100 + '%');
    //    $('.volume .slider a').css('left', value * 100 + '%');
    //}

    var volume = localStorage.volume || 0.5;
    $('.volume .slider').slider({
        //max: 1, min: 0, step: 0.01, value: volume, slide: function (event, ui) {
        //    setVolume(ui.value);
        //    $(this).addClass('enable');
        //    $('.mute').removeClass('enable');
        //}, stop: function () {
        //    $(this).removeClass('enable');
        //}
    }).children('.pace').css('width', volume * 100 + '%');

    //$('.mute').click(function () {
    //    if ($(this).hasClass('enable')) {
    //        setVolume($(this).data('volume'));
    //        $(this).removeClass('enable');
    //    } else {
    //        $(this).data('volume', audio.volume).addClass('enable');
    //        setVolume(0);
    //    }
    //});

    // Switch track
    var switchTrack = function (i) {
        if (i < 0) {
            track = currentTrack = playlist.length - 1;
        } else if (i >= playlist.length) {
            track = currentTrack = 0;
        } else {
            track = i;
        }

        $('audio').remove();
        loadMusic(track);
        if (isPlaying == true) play();
    }

    // 随机播放歌曲
    var shufflePlay = function () {
        var time = new Date(),
			lastTrack = currentTrack;
        currentTrack = time.getTime() % playlist.length;
        if (lastTrack == currentTrack)++currentTrack;
        switchTrack(currentTrack);
    }

    //播放结束
    var ended = function () {
        pause();
        audio.currentTime = 0;
        //  playCounts++;
        //if (continous == true) isPlaying = true;
        //if (repeat == 1) {
        //    play();
        //} else {
        //    if (shuffle === 'true') {
        //        shufflePlay();
        //    } else {
        //        if (repeat == 2) {
        //            switchTrack(++currentTrack);
        //        } else {
        //            if (currentTrack < playlist.length) switchTrack(++currentTrack);
        //        }
        //    }
        //}
    }

    var beforeLoad = function () {
        var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
        $('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) + '%');
        var allTime = audio.duration;
        timeChange(allTime, "allTime");
    }

    // Fire when track loaded completely
    var afterLoad = function () {
        if (autoplay == true) play();
    }

    // Load track
    var loadMusic = function (i) {

        var item = playlist[i],
			newaudio = $('<audio>').html('<source src="' + item.mp3 + '"><source src="' + item.ogg + '">').appendTo('#player');

        $('.cover').html('<img src="' + item.cover + '" alt="' + item.title + '">');
        $('.tag').html('<strong>' + item.title + '</strong><span class="artist">' + item.artist + '</span> <input type="hidden" value="' + item.id+ '" id="msiId" />');
       $('#playlist li').removeClass('playing').eq(i).addClass('playing');
        audio = newaudio[0];
        //  audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
        audio.addEventListener('progress', beforeLoad, false);
        audio.addEventListener('durationchange', beforeLoad, false);
        audio.addEventListener('canplay', afterLoad, false);
        audio.addEventListener('ended', ended, false);

    }

    //  loadMusic(currentTrack);//初始化加载歌曲
    $('.playback').on('click', function () {
        if ($(this).hasClass('playing')) {
            pause();
            flag=0;
            alert(flag);
        } else {
            play();
            flag=1;
             alert(flag);
        }
          $.post("connect1.php",{  test1:flag },function(data,status) { alert("数据：" + data + "\n状态：" + status); });  //这一条和下面一条都是回执函数，如果需要显示一下已经开灯或者已经关灯的弹出框，使用下面的设置。如果不需要就把回调函数的内容清空alert("数据：" + data + "\n状态：" + status);这一段程序是用来测试
    });
    //$('.rewind').on('click', function () {
    //    if (shuffle === 'true') {
    //        shufflePlay();
    //    } else {
    //        switchTrack(--currentTrack);
    //    }
    //});
    $('.rewind').on('click', function () {
        if ((audio.currentTime - 5) >= 0) {
            audio.currentTime = audio.currentTime - 5;
            setProgress(audio.currentTime);
            
         $.post("fastslow.php",{ goback:"0" },function(data,status) { alert("数据：" + data + "\n状态：" + status); });  //这一条和下面一条都是回执函数，如果需要显示一下已经开灯或者已经关灯的弹出框，使用下面的设置。如果不需要就把回调函数的内容清空alert("数据：" + data + "\n状态：" + status);这一段程序是用来测试    
            
            
        }
        else {
            setProgress(0);
        }
    });
    //$('.fastforward').on('click', function () {
    //    if (shuffle === 'true') {
    //        shufflePlay();
    //    } else {
    //        switchTrack(++currentTrack);
    //    }
    //});
    //快进
    $(".fastforward").on('click', function () {
        if ((audio.currentTime + 5) <= audio.duration) {
            audio.currentTime = audio.currentTime + 5;

            setProgress(audio.currentTime);
            
         $.post("fastslow.php",{ goback:"1" },function(data,status) { alert("数据：" + data + "\n状态：" + status); });     
            
        }
        else {
            setProgress(audio.duration);
        }
    })
      $('#playlist li').each(function (i) {
        var _i = i;
        $(this).on('click', function () {
        	    
        	 //   alert(" this is a test");
              switchTrack(_i);
              $(" .container > div").removeClass("active");
              var musicId = $(this).attr("data-id");
            //TODO 获取歌曲id musicId;
             
            $.post("connect.php",{ keyvalue:musicId ,  test1:flag },function(data,status) { alert("数据：" + data + "\n状态：" + status); });  //这一条和下面一条都是回执函数，如果需要显示一下已经开灯或者已经关灯的弹出框，使用下面的设置。如果不需要就把回调函数的内容清空alert("数据：" + data + "\n状态：" + status);这一段程序是用来测试
             
        });
    });
    $(".selected").on('click', function () {
         $(" .container > div").removeClass("active");
    });
    //if (shuffle === 'true') $('.shuffle').addClass('enable');
    //if (repeat == 1) {
    //    $('.repeat').addClass('once');
    //} else if (repeat == 2) {
    //    $('.repeat').addClass('all');
    //}

    //$('.repeat').on('click', function () {
    //    if ($(this).hasClass('once')) {
    //        repeat = localStorage.repeat = 2;
    //        $(this).removeClass('once').addClass('all');
    //    } else if ($(this).hasClass('all')) {
    //        repeat = localStorage.repeat = 0;
    //        $(this).removeClass('all');
    //    } else {
    //        repeat = localStorage.repeat = 1;
    //        $(this).addClass('once');
    //    }
    //});

    //$('.shuffle').on('click', function () {
    //    if ($(this).hasClass('enable')) {
    //        shuffle = localStorage.shuffle = 'false';
    //        $(this).removeClass('enable');
    //    } else {
    //        shuffle = localStorage.shuffle = 'true';
    //        $(this).addClass('enable');
    //    }
    //});

})(jQuery);
//播放时间
function timeChange(time, timePlace) {//默认获取的时间是时间戳改成我们常见的时间格式
    var timePlace = document.getElementById(timePlace);
    //分钟
    var minute = time / 60;
    var minutes = parseInt(minute);
    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    //秒
    var second = time % 60;
    seconds = parseInt(second);
    if (seconds < 10) {
        seconds = "0" + seconds;
    }
    var allTime = "" + minutes + "" + ":" + "" + seconds + ""
    timePlace.innerHTML = allTime;
}