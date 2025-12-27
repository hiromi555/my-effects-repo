
/*ターゲットがビューポート内に入っているかどうかを判定するための関数を返す*/
export function setupScrollObserver(targetClass) {
    const target = document.querySelector(targetClass);
    if (!target) {
        console.error(`ターゲット要素が見つかりません: ${targetClass}`);
        return null;
    }
    let isIntersecting = true;
    const observerCallback = function(entries) {
        entries.forEach(entry => {
            isIntersecting = entry.isIntersecting;
            if (isIntersecting) {
              document.body.classList.remove('effect-hidden');
            } else {
              document.body.classList.add('effect-hidden');
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback);
    observer.observe(target);
    return () => isIntersecting;
}

/**
effect6より使用
display: none ではレンダリング自体が完全に停止しているわけではなく、
バックグラウンドで描画が続いている可能性があるため、次のような状況ではリソースの無駄遣いにつながる可能性
があるため、改善
window.requestAnimationFrame(tick) や tick() の手動呼び出しは不要になります。
window.requestAnimationFrame(tick) はブラウザのリクエストアニメーションフレームループに tick を追加しますが、renderer.setAnimationLoop(tick) は同じようにレンダリングループを自動的に実行します。これにより、フレームごとの更新が自動で呼び出されるため、手動で tick() を呼ぶ必要がなくなります。
setAnimationLoop を使っている場合、tick() は startRendering() 内で自動的に繰り返し実行され、stopRendering() を呼んだ際にループが停止します。
 */

export function setupScrollObserver2(targetClass, startRendering, stopRendering) {
    const target = document.querySelector(targetClass);
    if (!target) {
        console.error(`ターゲット要素が見つかりません: ${targetClass}`);
        return null;
    }
    const observerCallback = function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                document.body.classList.remove('effect-hidden');
                startRendering();  // レンダリング開始
            } else {
                document.body.classList.add('effect-hidden');
                stopRendering();   // レンダリング停止
            }
        });
    };
    const observer = new IntersectionObserver(observerCallback);
    observer.observe(target);
}
