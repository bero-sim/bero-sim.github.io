// https://github.com/bero-sim/bero-sim.github.io/blob/main/cwgk.js
// ========================================================
// 1. 暗号・ハッシュ・エンコード共通モジュール（Web Crypto API）
// ========================================================
const FIXED_IV = new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]); // 100年不変の固定IV

// 文字列からSHA-256ハッシュを計算（ArrayBuffer）
async function calcSha256(text) {
    const msgBuffer = new TextEncoder().encode(text);
    return await crypto.subtle.digest('SHA-256', msgBuffer);
}

// AES-GCM 鍵の暗号化
async function encryptText(plainText, keyString) {
    const hash = await calcSha256(keyString);
    const cryptoKey = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['encrypt']);
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: FIXED_IV }, cryptoKey, new TextEncoder().encode(plainText));
    return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // Base64化
}

// AES-GCM 鍵の復号（失敗時はnullを返す）
async function decryptText(cipherBase64, keyString) {
    try {
        const hash = await calcSha256(keyString);
        const cryptoKey = await crypto.subtle.importKey('raw', hash, { name: 'AES-GCM' }, false, ['decrypt']);
        const encryptedData = new Uint8Array(atob(cipherBase64).split('').map(c => c.charCodeAt(0)));
        const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: FIXED_IV }, cryptoKey, encryptedData);
        return new TextDecoder().decode(decrypted);
    } catch (e) {
        return null; // 復号失敗
    }
}

// Base64URL エンコード・デコード
const Base64URL = {
    encode: (str) => btoa(unescape(encodeURIComponent(str))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    decode: (str) => decodeURIComponent(escape(atob(str.replace(/-/g, '+').replace(/_/g, '/'))))
};

// ========================================================
// 2. 文字列正規化モジュール
// ========================================================
function normalizeText(text, type) {
    // NFKC正規化後に全角へ統一
    let n = text.normalize('NFKC');
    
    if (type === 'CW') {
        // 全角化
        n = n.replace(/[A-Za-z0-9]/g, s => String.fromCharCode(s.charCodeAt(0) + 0xFEE0));
        // 長音記号の完全一本化
        n = n.replace(/[ーｰ\-ー＿＿～~━─→←]/g, 'ー');
    } else if (type === 'GK') {
        // 半角化
        n = n.replace(/[Ａ-Ｚａ-ｚ０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0));
    }
    return n;
}

// ========================================================
// 3. 【解答ツール】ロジックエリア（cwgkp.index用）
// ========================================================
if (document.getElementById('maintenanceMode')) {
    const maintenanceMode = document.getElementById('maintenanceMode');
    const gameArea = document.getElementById('gameArea');
    const gameTypeTitle = document.getElementById('gameTypeTitle');
    const quizTitle = document.getElementById('quizTitle');
    const cwWrapper = document.getElementById('cwWrapper');
    const playGrid = document.getElementById('playGrid');
    const gkWrapper = document.getElementById('gkWrapper');
    const gkInput = document.getElementById('gkInput');
    const successArea = document.getElementById('successArea');
    const decryptedText = document.getElementById('decryptedText');

    let playConfig = null;

    window.addEventListener('DOMContentLoaded', async () => {
        const queryString = window.location.search.substring(1);
        if (!queryString) {
            maintenanceMode.classList.remove('hidden');
            return;
        }

        try {
            const decodedData = Base64URL.decode(queryString);
            const regex = /^(.+?)【(CW|GK)(\d+)x(\d+)\[(.+?)\]([\s\S]+?)】$/;
            const match = decodedData.match(regex);

            if (!match) throw new Error();

            const [_, title, type, cols, rows, qElements, cipherText] = match;
            playConfig = { title, type, cols: parseInt(cols,10), rows: parseInt(rows,10), qElements, cipherText };
            
            gameArea.classList.remove('hidden');
            quizTitle.innerText = playConfig.title;

            if (type === 'CW') {
                gameTypeTitle.innerText = "🧩 クロスワードパズル";
                cwWrapper.classList.remove('hidden');
                buildPlayerGrid(playConfig);
            } else {
                gameTypeTitle.innerText = "🔒 GateKeeper 資格確認";
                gkWrapper.classList.remove('hidden');
                initGkListener();
            }
        } catch (e) {
            maintenanceMode.classList.remove('hidden');
        }
    });

    // クロスワード解答画面の生成
    function buildPlayerGrid(config) {
        playGrid.innerHTML = "";
        playGrid.style.gridTemplateColumns = `repeat(${config.cols}, 50px)`;
        
        const chars = config.qElements.split('');
        chars.forEach((char, idx) => {
            if (char === '■') {
                const cell = document.createElement('div');
                cell.className = 'cell cell-block';
                cell.innerText = '■';
                playGrid.appendChild(cell);
            } else if (char === '？') {
                const input = document.createElement('input');
                input.type = 'text';
                input.className = 'cell cell-input';
                input.maxLength = 1;
                input.dataset.index = idx;
                
                // 入力時のリアルタイム正規化と自動復号チェック
                input.addEventListener('input', () => {
                    input.value = normalizeText(input.value, 'CW');
                    checkCwAnswer();
                });
                playGrid.appendChild(input);
            } else {
                const cell = document.createElement('div');
                cell.className = 'cell cell-fixed';
                cell.innerText = char;
                playGrid.appendChild(cell);
            }
        });
    }

    // クロスワードのリアルタイム答え合わせ
    async function checkCwAnswer() {
        const cells = playGrid.children;
        let currentString = "";
        
        for (let i = 0; i < cells.length; i++) {
            const cell = cells[i];
            if (cell.classList.contains('cell-block')) {
                currentString += '■';
            } else if (cell.classList.contains('cell-fixed')) {
                currentString += cell.innerText;
            } else {
                currentString += cell.value || ""; // 空欄ならそのまま
            }
        }

        // 全てのマスが埋まっていない場合は処理をスキップ
        if (currentString.length !== playConfig.qElements.length || currentString.includes(" ")) {
            return;
        }

        const normalizedAns = normalizeText(currentString, 'CW');
        const result = await decryptText(playConfig.cipherText, normalizedAns);

        if (result !== null) {
            // 現在選択されているセルからフォーカスを強制解除（これで候補選択ウィンドウが即座に消滅します）
            if (document.activeElement) {
                document.activeElement.blur();
            }
            
            showSuccess(result);
            
            // 全ての入力を固定化
            document.querySelectorAll('.cell-input').forEach(el => el.disabled = true);
        }        
    }

    // Gatekeeperのリアルタイム答え合わせ
    function initGkListener() {
        gkInput.addEventListener('input', async () => {
            const currentVal = gkInput.value.trim();
            const normalizedAns = normalizeText(currentVal, 'GK');
            gkInput.value = normalizedAns; // 画面の入力値をリアルタイム半角化

            const result = await decryptText(playConfig.cipherText, normalizedAns);
            if (result !== null) {
                showSuccess(result);
                gkInput.disabled = true;
            }
        });
    }

    function showSuccess(decrypted) {
        decryptedText.innerHTML = decrypted;
        successArea.classList.remove('hidden');
        successArea.scrollIntoView({ behavior: 'smooth' });
    }
}
