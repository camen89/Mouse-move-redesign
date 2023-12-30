// script.js
$(document).ready(function(){
    const screenWidth = $(window).width();
    const screenHeight = $(window).height();
    const buttons = [];
    let mouseMovements = [];
    let highlightedButtonIndex = null;
    let isFirstButtonClicked = false;
    let clickCount = 0;
    let isMouseTrailAnimated = false;

    // スタート画面を表示
    $('#start-screen').show();

    // スタートボタンがクリックされたらゲームを開始
    $('#start-button').click(function(){
        $('#start-screen').hide();
        startGame();
    });

    // ページのロード直後にマウスデータの収集開始
    $(document).mousemove(function(e){
        mouseMovements.push({
            x: e.clientX,
            y: e.clientY,
            timestamp: new Date().getTime()
        });
    });

    function startGame() {
        // 最初にランダムなボタンを5秒後に光らせる
        setTimeout(function(){
            highlightedButtonIndex = Math.floor(Math.random() * 10);

            // ランダムな色を生成
            const randomColor = getRandomColor();
            $('.random-button').eq(highlightedButtonIndex).css('background-color', randomColor).addClass('highlight').on("click", function (){
                $('.highlight').css('background-color', 'black');
            });;
        }, 3000);
    }

    // ボタンクリック時の処理
    $(document).on('click', '.random-button', function(){
        // 10回クリックしたら光らせるのを停止し、ボタンを消す
        if (clickCount >= 10) {
            if (!isMouseTrailAnimated) {
                isMouseTrailAnimated = true;
                animateAlpha(mouseMovements);
                removeButtons();
            }
            return;
        }

        // 光っているボタン以外はクリックできないようにする
        if (!$(this).hasClass('highlight') && !$(this).hasClass('highlight2')) {
            return;
        }

        clickCount++;

        if (!isFirstButtonClicked){
            isFirstButtonClicked = true;

            // 最初のボタンがクリックされた3秒後に次のボタンを光らせる
            setTimeout(function(){
                $('.random-button').eq(highlightedButtonIndex).removeClass('highlight');

                highlightedButtonIndex = Math.floor(Math.random() * 10);

                // ランダムな色を生成
                const randomColor = getRandomColor();

                // 10回クリックしていない場合のみ光らせる
                if (clickCount < 10) {
                    $('.random-button').eq(highlightedButtonIndex).css('background-color', randomColor).addClass('highlight2').on("click", function (){
                        $('.highlight2').css('background-color', 'black');
                    });
                }
            }, 3000);
        } else {
            // 二個目のボタンがクリックされた3秒後に三個目のボタンを光らせる
            setTimeout(function(){
                $('.random-button').eq(highlightedButtonIndex).removeClass('highlight2');

                highlightedButtonIndex = Math.floor(Math.random() * 10);

                // ランダムな色を生成
                const randomColor = getRandomColor();

                // 10回クリックしてない場合のみ光らせる
                if (clickCount < 10) {
                    $('.random-button').eq(highlightedButtonIndex).css('background-color', randomColor).addClass('highlight2').on("click", function (){
                        $('.highlight2').css('background-color', 'black');
                    });
                }
            }, 3000);
        }

        // ハイライトボタンのリセット、グラフィックの描画、マウスデータのリセット
        const buttonColor = $(this).css('background-color');
        $(this).removeClass('highlight');
        drawMouseGraphic(mouseMovements, buttonColor);
        mouseMovements = [];

        // 10回クリックしたら全てのマウスの軌跡の不透明度を0から0.6に変更
        if (clickCount === 10) {
            animateAlphaAll();
        }
    });

    // Enter キーが押されたら画面を PNG 画像として保存
    $(document).keypress(function(e){
        if(e.which === 13) {
            saveScreenshot();
        }
    });

    for (let i = 0; i < 10; i ++){
        createRandomButton();
    }

    function createRandomButton(){
        let randomLeft, randomTop;
        do{
            randomLeft = Math.random() * (screenWidth - 100);
            randomTop = Math.random() * (screenHeight - 40);
        } while(isOverlapping(randomLeft, randomTop));

        const $button = $('<button>', {
            class: 'random-button',
            text: 'button',
            css: {
                left: randomLeft + 'px',
                top: randomTop + 'px'
            }
        });

        buttons.push({
            left: randomLeft,
            top: randomTop,
            width: 100,
            height: 40
        });

        $('body').append($button);
    }

    function isOverlapping(left, top){
        for (const button of buttons){
            if (
                left < button.left + button.width &&
                left + 100 > button.left &&
                top < button.top + button.height &&
                top + 40 > button.top
            ){
                return true;
            }
        }
        return false;
    }

    function drawMouseGraphic(mouseData, color){
        const canvas = document.createElement('canvas');
        canvas.width = screenWidth;
        canvas.height = screenHeight;
        const context = canvas.getContext('2d');

        context.strokeStyle = color;
        context.lineWidth = 2;
        context.globalAlpha = 0; // 初期不透明度を0%に設定
        context.beginPath();

        for (let i = 0; i < mouseData.length; i ++){
            const point = mouseData[i];
            if (i === 0) {
                context.moveTo(point.x, point.y);
            } else {
                context.lineTo(point.x, point.y);
            }
        }

        context.stroke();

        // canvasをbodyに追加
        $('body').append(canvas);
    }

    function getRandomColor(){
        // ランダムなRGB値を生成
        const randomR = Math.floor(Math.random() * 256);
        const randomG = Math.floor(Math.random() * 256);
        const randomB = Math.floor(Math.random() * 256);

        // RGB値を結合してcssの色形式に変換
        return `rgba(${randomR}, ${randomG}, ${randomB}, 1)`;
    }

    // マウス軌跡の不透明度をアニメーションで変更
    function animateAlpha(mouseData) {
        const canvas = document.querySelector('canvas');
        const context = canvas.getContext('2d');

        let alpha = 0;
        const duration = 3000; // アニメーションの時間（ミリ秒）

        const intervalId = setInterval(function () {
            alpha += 0.006; // 変更: 不透明度を0.01から0.006に変更
            context.clearRect(0, 0, context.canvas.width, context.canvas.height);
            context.globalAlpha = alpha;

            for (let i = 0; i < mouseData.length; i ++) {
                const point = mouseData[i];
                if (i === 0) {
                    context.moveTo(point.x, point.y);
                } else {
                    context.lineTo(point.x, point.y);
                }
            }

            context.stroke();

            if (alpha >= 0.6) { // 変更: 不透明度が1ではなく0.6で停止
                clearInterval(intervalId);
            }
        }, duration / 100);
    }

    // 全てのマウス軌跡の不透明度をアニメーションで変更
    function animateAlphaAll() {
        const canvases = document.querySelectorAll('canvas');

        canvases.forEach(canvas => {
            const context = canvas.getContext('2d');
            let alpha = 0;
            const duration = 3000; // アニメーションの時間（ミリ秒）

            const intervalId = setInterval(function () {
                alpha += 0.006; // 変更: 不透明度を0.01から0.006に変更
                context.clearRect(0, 0, context.canvas.width, context.canvas.height);
                context.globalAlpha = alpha;

                for (let i = 0; i < mouseMovements.length; i ++) {
                    const point = mouseMovements[i];
                    if (i === 0) {
                        context.moveTo(point.x, point.y);
                    } else {
                        context.lineTo(point.x, point.y);
                    }
                }

                context.stroke();

                if (alpha >= 0.6) { // 変更: 不透明度が1ではなく0.6で停止
                    clearInterval(intervalId);
                }
            }, duration / 100);
        });
    }

    // ボタンを消す
    function removeButtons() {
        $('.random-button').remove();
    }

    // 画面を PNG 画像として保存
function saveScreenshot() {
    // アニメーションが完了するのを待つPromiseを作成
    const waitForAnimations = new Promise((resolve) => {
        // アニメーションがある場合、アニメーションが完了するまで待つ
        if (isMouseTrailAnimated) {
            setTimeout(resolve, 3000); // アニメーションの実際の所要時間に合わせて調整してください
        } else {
            resolve();
        }
    });

    // アニメーションが完了したらスクリーンショットを取得
    waitForAnimations.then(() => {
        // 新しいcanvasを作成してスクリーンショットを取得
        const screenshotCanvas = document.createElement('canvas');
        screenshotCanvas.width = screenWidth;
        screenshotCanvas.height = screenHeight;
        const screenshotContext = screenshotCanvas.getContext('2d');

        // 背景を透明に設定
        screenshotContext.clearRect(0, 0, screenshotCanvas.width, screenshotCanvas.height);

        // 既存のキャンバスからデータをコピー
        const existingCanvases = document.querySelectorAll('canvas');
        existingCanvases.forEach((existingCanvas) => {
            screenshotContext.drawImage(existingCanvas, 0, 0);
        });

        // 画像をダウンロードするためのリンク要素を作成
        const link = document.createElement('a');
        document.body.appendChild(link);
        link.download = 'screenshot.png';
        
        // 背景を透明にするためにDataURLのプレフィックスを削除
        const dataURL = screenshotCanvas.toDataURL('image/png; charset=utf-8').replace(/^data:image\/[^;]/, 'data:application/octet-stream');
        
        link.href = dataURL;
        link.click();
        document.body.removeChild(link);
    });
}

});
