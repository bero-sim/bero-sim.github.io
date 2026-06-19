// https://github.com/bero-sim/bero-sim.github.io/blob/main/script.js
// ========================================================
// 1. メニュー構造の定義（ここ１箇所で管理！）
// ========================================================
const LOGO_TEXT = "@bero_sim"; // ウインドウ末尾に付く文字

const MENU_DATA = [
    { name: "ﾎｰﾑ", url: "#home", title: "駅伝データ可視化動画伝承プロジェクト" },
    { 
        name: "統合", url: null, // 親メニューで遷移なし
        children: [
            { name: "統合年表", url: "https://gist.github.com/bero-sim/4e6a3e968b29dfe388aae176e036b6e5", title: "統合歴史年表" },

        ]
    },
    { 
        name: "地区", url: null, // 親メニューで遷移なし
        children: [
            { name: "男＊駅伝", url: "https://gist.github.com/bero-sim/1be17c40eb5178dee3b1571e9e21337d", title: "男＊駅伝年表" },
            { name: "女＊駅伝", url: "https://gist.github.com/bero-sim/b23c4902cce17924b7834336c9a04290", title: "女＊駅伝年表" },
        ]
    },
    { 
        name: "ﾁｰﾑ", url: null, // 親メニューで遷移なし
        children: [
            { name: "クイーン＊駅伝", url: "https://gist.github.com/bero-sim/73c3d0a10e21c097a42001aa3628bd17", title: "クイーン＊駅伝年表" },
            { name: "プリンセ＊駅伝", url: "https://gist.github.com/bero-sim/b9f36a52b034483f10db9cba3519a40a", title: "プリンセ＊駅伝年表" },
            { name: "奥球＊女＊駅伝", url: "https://gist.github.com/bero-sim/1889e4951e6b89a24c379daaeea1dec0", title: "奥球＊女＊駅伝年表" },
        ]
    },
    { 
        name: "学校", url: null, // 親メニューで遷移なし
        children: [
            { name: "🔽大＊対抗", url: null, title: null },
            { name: "出＊全日本大＊駅伝", url: "https://gist.github.com/bero-sim/53c8ea5c83e745d505a5730abd93de2f", title: "出＊全日本大＊駅伝年表" },
            { name: "全日本大＊駅伝", url: "https://gist.github.com/bero-sim/cf6613c1183aaa715cf76a16b327091b", title: "全日本大＊駅伝年表" },
            { name: "The駅伝(箱＊)", url: "https://gist.github.com/bero-sim/b3ecaf661a772396cc512a0d441d6289", title: "The駅伝(箱＊)年表" },
            { name: "全日本大＊女子選抜駅伝", url: "https://gist.github.com/bero-sim/61295200173a6dfe3439bf1507faa07d", title: "全日本大＊女子選抜駅伝年表" },
            { name: "全国大＊男女混合駅伝", url: "https://gist.github.com/bero-sim/ee3db2956a6bf0a898b398ac1175f9fa", title: "全国大＊男女混合駅伝年表" },
            { name: "国立四大＊駅伝", url: "https://gist.github.com/bero-sim/dbb69d4d975aee0c47f9bf815dddb60f", title: "国立四大＊駅伝年表" },
            { name: "🔽＊専対抗", url: null, title: null },
            { name: "西日本高＊駅伝", url: "https://gist.github.com/bero-sim/2d1fdca4434258072ff7ab89a91619e1", title: "西日本高＊駅伝年表" },
            { name: "🔽高＊対抗", url: null, title: null },
            { name: "男子 全国高＊駅伝", url: "https://gist.github.com/bero-sim/5b34fc99905ad65bd57a6189ad938e18", title: "男子 全国高＊駅伝年表" },
            { name: "女子 全国高＊駅伝", url: "https://gist.github.com/bero-sim/14308e7c2dd6d506c49d6c586da94544", title: "女子 全国高＊駅伝年表" },
            { name: "🔽中＊対抗", url: null, title: null },
            { name: "全国中＊駅伝", url: "https://gist.github.com/bero-sim/c7bff3c0b76199e6cf8c2f7e7291bfbc", title: "全国中＊駅伝年表" },
        ]
    },
    { 
        name: "海外", url: null, // 親メニューで遷移なし
        children: [
            { name: "U＊駅伝", url: "https://gist.github.com/bero-sim/6a76ff7477e62f58289d3aae03b02915", title: "U＊駅伝年表" },
            { name: "BATAVIERE＊RACE", url: "https://gist.github.com/bero-sim/aeedfe89d819673f9c7532844a4f8dfd", title: "BATAVIERE＊RACE年表" },
        ]
    },
     { 
        name: "関連", url: null, // 親メニューで遷移なし
        children: [
            { name: "🔽説明書", url: null, title: null },
            { name: "📱📺🖥️🎴🖼️🔤", url: "https://gist.github.com/bero-sim/e802e415805682cf3f4d8ecd62d7a363", title: "📱📺🖥️🎴🖼️🔤" },
            { name: "動画概要", url: "https://note.com/bero_sim/n/n238f140dfbed", title: "動画概要" },
            { name: "動画見方", url: "https://note.com/bero_sim/n/n29a89958c038", title: "動画見方" },
            { name: "概要仕様書", url: "https://note.com/bero_sim/n/n786455a456b3", title: "概要仕様書" },
            { name: "完全仕様書", url: "https://note.com/bero_sim/n/n9fcfd1c50a3f", title: "完全仕様書" },
            { name: "参考文献", url: "https://gist.github.com/bero-sim/b7917477c81acc6ad2dbdc53421f97b2", title: "参考文献" },
            { name: "🔽その他", url: null, title: null },
            { name: "お名前の削除依頼", url: "https://docs.google.com/forms/d/e/1FAIpQLScucArjtlsNT0F5964tsDaCvhUJQoGwpte1ehuRk4ndzuy-SA/viewform", title: "📱📺🖥️🎴🖼️🔤" },
        ]
    },
     { 
        name: "継承", url: null, // 親メニューで遷移なし
        children: [
            { name: "双対ﾀｽｷﾘﾚｰ", url: "#section1", title: "双対タスキリレー" }, // 近日公開
            { name: "obfuscator", url: "https://github.com/bero-sim/obfuscator", title: "外部URL" }, // 別タブ送り
        ]
    },
     { 
        name: "SNS", url: null, // 親メニューで遷移なし
        children: [
            { name: "GitHub", url: "https://bero-sim.github.io/", title: "外部URL" }, // 別タブ送り
            { name: "Youtubeﾁｬﾝﾈﾙ", url: "https://www.youtube.com/@bero-sim", title: "外部URL" }, // 別タブ送り
            { name: "X(旧Twitter)", url: "https://x.com/bero_sim", title: "外部URL" }, // 別タブ送り
            { name: "tumblr-blog", url: "https://www.tumblr.com/bero-sim/", title: "外部URL" }, // 別タブ送り
            { name: "note", url: "https://note.com/bero_sim", title: "外部URL" }, // 別タブ送り
            { name: "instagram", url: "https://www.instagram.com/bero.sim/", title: "外部URL" }, // 別タブ送り
        ]
    }
];

// ========================================================
// 2. メニューの動的生成ロジック
// ========================================================
function initMenu() {
    const pcMenu = document.getElementById('navMenu');
    const mobileMenu = document.getElementById('mobileMenu');

    MENU_DATA.forEach(item => {
        // PC用
        const el = createMenuItem(item, false);
        pcMenu.appendChild(el);

        // スマホ用
        const mobEl = createMenuItem(item, true);
        mobileMenu.appendChild(mobEl);
    });

    // ハンバーガーメニューの開閉制御
    document.getElementById('hamburgerBtn').addEventListener('click', () => {
        mobileMenu.classList.toggle('open');
    });
}

function createMenuItem(item, isMobile) {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerText = item.name;
    div.dataset.name = item.name;

    if (item.url) {
        // クリックイベント
        div.addEventListener('click', (e) => {
            e.stopPropagation();
            handleMenuClick(item);
            if (isMobile) document.getElementById('mobileMenu').classList.remove('open');
        });
    }

    // 子階層（ドロップダウン）がある場合
    if (item.children && !isMobile) {
        const dropdown = document.createElement('div');
        dropdown.className = 'dropdown-content';
        item.children.forEach(child => {
            const childEl = createMenuItem(child, false);
            dropdown.appendChild(childEl);
        });
        div.appendChild(dropdown);
    } else if (item.children && isMobile) {
        // スマホ時は階層を平坦化して追加
        item.children.forEach(child => {
            const childEl = createMenuItem(child, true);
            childEl.style.paddingLeft = "45px";
            childEl.innerText = `└ ${child.name}`;
            document.getElementById('mobileMenu').appendChild(childEl);
        });
    }

    return div;
}

// ========================================================
// 3. メニュークリック時の挙動制御（SPAの肝）
// ========================================================
function handleMenuClick(item) {
    if (!item.url) return;

    // パターン1: ページ内リンク形式（#xxx）
    if (item.url.startsWith('#')) {
        window.location.hash = encodeURIComponent(item.name);
        return;
    }

    // パターン2: Gistの埋め込みURL（Gistの生URLまたは.jsに対応）
    if (item.url.includes('gist.github.com')) {
        window.location.hash = encodeURIComponent(item.name);
        return;
    }

    // パターン3: それ以外（外部URLは別タブで開く）
    window.open(item.url, '_blank');
}

// ========================================================
// 4. ルーティング処理（URL（ハッシュ）を監視して表示を切り替える）
// ========================================================
function router() {
    // URLの末尾（#以降）を取得してデコード
    const hash = decodeURIComponent(window.location.hash.replace('#', ''));
    const contentBody = document.getElementById('contentBody');
    
    // 全メニューから現在のハッシュ（メニュー名）に合致する要素を探索
    let currentItem = null;
    const findItem = (items) => {
        for (let item of items) {
            if (item.name === hash) { currentItem = item; break; }
            if (item.children) findItem(item.children);
        }
    };
    findItem(MENU_DATA);

    // デフォルト（ホームまたはハッシュ空欄時）の処理
    if (!hash || !currentItem) {
        contentBody.innerHTML = "<h2>駅伝データ可視化動画伝承プロジェクトへようこそ</h2><p>メニューから駅伝大会を選択してください。</p>";
        document.title = `ホーム | ${LOGO_TEXT}`;
        updateActiveMenu('');
        return;
    }

    // ウィンドウタイトルとアクティブ状態の更新
    document.title = `${currentItem.title} | ${LOGO_TEXT}`;
    updateActiveMenu(currentItem.name);

    // コンテンツの描画分岐
    if (currentItem.url.startsWith('#')) {
        // 「近日公開予定」の表示
        contentBody.innerHTML = `<div class="coming-soon">近日公開予定</div>`;
    } else if (currentItem.url.includes('gist.github.com')) {
        // Gistをiframe等を使わず、美しく動的にインライン表示
        contentBody.innerHTML = `<p style="color:#888;">Gistデータを読み込み中...</p>`;
        
        // Gist IDを抽出
        const matches = currentItem.url.match(/gist\.github\.com\/[^\/]+\/([a-f0-9]+)/);
        if (matches && matches[1]) {
            const gistId = matches[1];
            // JSONPを利用してGistのHTML/CSSデータを安全に取得・展開
            const callbackName = `gist_callback_${gistId}`;
            window[callbackName] = function(gistData) {
                // Gistの専用スタイルシートを適用
                if (!document.getElementById(`gist-css-${gistId}`)) {
                    const link = document.createElement('link');
                    link.id = `gist-css-${gistId}`;
                    link.rel = 'stylesheet';
                    link.href = gistData.stylesheet;
                    document.head.appendChild(link);
                }
                contentBody.innerHTML = gistData.div;
                delete window[callbackName];
            };

            const script = document.createElement('script');
            script.src = `https://gist.github.com/${gistId}.json?callback=${callbackName}`;
            document.head.appendChild(script);
        } else {
            contentBody.innerHTML = `<p style="color:red;">Gist URLの解析に失敗しました。</p>`;
        }
    }
}

// アクティブなメニューボタンの色（青）を更新する処理
function updateActiveMenu(name) {
    document.querySelectorAll('.menu-item').forEach(el => {
        if (el.dataset.name === name) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

// 起動およびブラウザの「戻る・進む」イベントへの一元フック
window.addEventListener('DOMContentLoaded', () => {
    initMenu();
    router();
});
window.addEventListener('hashchange', router);
