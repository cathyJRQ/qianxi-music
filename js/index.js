FastClick.attach(document.body)

~async function () {
    let headerleftImg = document.querySelector('.headerleftImg'),
        Maskimage = document.querySelector('.Mask-image'),
        music = document.querySelector('.music'),
        Bejin = music.querySelector('.Bejin'),
        musicName = document.querySelector('.musicName'),
        musicText = music.querySelector('.musicText'),
        audioBox = document.querySelector("#audioBox"),
        loadingBox = document.querySelector('.loading-box'),
        animation = document.querySelector('.animation')

    let musicTextList = null,
        dish = null,
        playaudio = null,
        timer = null,
        matchNum = 0

    const format = function format(time) {
        let minutes = Math.floor(time / 60),
            seconds = Math.round(time - minutes * 60)
        minutes = minutes < 10 ? "0" + minutes : "" + minutes
        seconds = seconds < 10 ? "0" + seconds : "" + seconds
        return {
            minutes,
            seconds
        }
    }

    const playend = function playend() {
        animation.className = 'animation'
        dish.className = "dish"
        clearInterval(timer)
        playaudio.style.display = 'none'
        timer = null
        musicText.style.transform = "teanslateY(0)"
        matchNum = 0
        Bejin.className = 'Bejin'
    }

    const handle = function handle() {
        let ph = musicTextList[0].offsetHeight
        let { currentTime, duration } = audioBox
        if (isNaN(currentTime) || isNaN(duration)) return
        //播放结束
        if (currentTime >= duration) {
            playend()
            return
        }
        //控制歌词
        let { minutes: currentTimeMinutes, seconds: currentTimeSeconds } = format(currentTime)
        let matchs = musicTextList.filter(item => {
            let minutes = item.getAttribute('minutes'),
                secondes = Math.round(item.getAttribute('seconds'))
            if (secondes < 10) secondes = "0" + secondes
            console.log(secondes, currentTimeSeconds);
            return minutes == currentTimeMinutes && secondes == currentTimeSeconds
        })
        matchNum += matchs.length
        if (matchs.length > 0) {
            offset = (matchNum - 1) * ph
            musicText.style.transform = `translateY(${-offset}px)`
        }
        console.log(matchs);
    }

    //音乐控制
    Bejin.addEventListener("click", function () {
        if (audioBox.paused) {
            audioBox.play()
            dish.className = "dish move"
            playaudio.style.display = 'none'
            animation.className = 'animation movemin'
            handle()
            if (!timer) timer = setInterval(handle, 1000)
            return
        }
        audioBox.pause()
        animation.className = 'animation'
        playaudio.style.display = 'block'
        dish.className = "dish"
        clearTimeout(timer)
        timer = null
    })

    const bindLyric = function bindLyric(lyric, lyricCN) {
        let arr = [],
            arrCN = [],
            newarr = [],
            str = ''
        lyric.replace(/\[(\d+):(\d+\.\d+)\](.+)/g, (_, $1, $2, $3) => {
            arr.push({
                minutes: $1,
                seconds: $2,
                text: $3
            })
        })
        lyricCN.replace(/\[(\d+):(\d+\.\d+)\](.+)/g, (_, $1, $2, $3) => {
            arrCN.push({
                textCN: $3
            })
        })
        for (let i = 0; i < arr.length; i++) {
            newarr.push(arr[i])
            newarr.push(arrCN[i])
        }
        for (let i = 0; i < newarr.length; i += 2) {
            let { minutes, seconds, text } = newarr[i],
                { textCN } = newarr[i + 1]
            str += `<div minutes="${minutes}" seconds="${seconds}">
                        <p>${text}</p>
                        <p>${textCN}</p>
                    </div>`
        }
        musicText.innerHTML += str
        musicTextList = Array.from(musicText.querySelectorAll('div'))
    }

    const binding = function binding(data) {
        let { title, headerpic, pic, audio, lyric, lyricCN } = data
        headerleftImg.src = headerpic
        Maskimage.style.backgroundImage = `url(${pic})`
        Bejin.innerHTML = `<span class="Beginimg"></span>
                <div class="dishBox">
                    <img class="dish" src="${pic}" alt="">
                </div>
                <img class="playaudio" src="./img/下载.png" alt="">
                <img class="dishImgA" src="./img/needle-ab.png" alt="">
                <img class="dishImg" src="./img/d7e4e3a244701ee85fecb5d4f6b5bd57.png" alt="">`
        musicName.innerHTML = `<h3>${title}</h3>`
        audioBox.src = "./music/obj_w5rDlsOJwrLDjj7CmsOj_20039035960_1f9e_264e_ec16_8d0d06ba96c04eb36209a2c50af06e88 (1).m4a"
        dish = document.querySelector('.dish')
        playaudio = document.querySelector('.playaudio')
        bindLyric(lyric, lyricCN)
        loadingBox.style.display = "none"
    }

    try {
        let { code, data } = await API.queryLyric()
        if (+code === 0) {
            binding(data)
            return
        }
    } catch (_) {
        alert("网络繁忙,请稍后再试")
    }
}()