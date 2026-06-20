// https://github.com/bero-sim/bero-sim.github.io/blob/main/smb.js
// ========================================================
// 1. グローバル設定と初期化
// ========================================================
let audioCtx = null;
let currentMidiData = null;
let scheduledOscillators = []; // 停止用にオシレーターを記憶する配列
let isPlaying = false;
let startTime = 0;
let stopTimeoutId = null; // 自動停止タイマーのID

const urlParams = new URLSearchParams(window.location.search);
const gistId = urlParams.get('gist');

const statusMessage = document.getElementById('statusMessage');
const actionBtn = document.getElementById('actionBtn');

// 起動時のルーティング
window.addEventListener('DOMContentLoaded', async () => {
    if (gistId) {
        statusMessage.innerText = "Gistから楽曲データを取得中...";
        const midiUrl = await fetchMidiUrlFromGist(gistId);
        
        if (midiUrl) {
            try {
                const response = await fetch(midiUrl);
                const arrayBuffer = await response.arrayBuffer();
                currentMidiData = new Midi(arrayBuffer); // Tone.js/Midi で解析
                
                statusMessage.innerText = "楽曲の準備が完了しました。";
                actionBtn.innerText = "♪ 楽曲再生";
                actionBtn.disabled = false;
                actionBtn.addEventListener('click', toggleMidiPlay);
            } catch (e) {
                statusMessage.innerText = "MIDIデータの解析に失敗しました。";
            }
        } else {
            statusMessage.innerText = "指定されたGistにMIDIファイルが見つかりません。";
        }
    } else {
        statusMessage.innerText = "ウェルカム スタート号砲 モード";
        actionBtn.innerText = "♪ スタート号砲💥再生";
        actionBtn.disabled = false;
        actionBtn.addEventListener('click', playChime);
    }
});

// ========================================================
// 2. Gist API経由でMIDIのRAW URLを自動ハントする関数
// ========================================================
async function fetchMidiUrlFromGist(id) {
    try {
        const response = await fetch(`https://api.github.com/gists/${id}`);
        const gistData = await response.json();
        
        for (let fileName in gistData.files) {
            if (fileName.toLowerCase().endsWith('.mid')) {
                return gistData.files[fileName].raw_url;
            }
        }
    } catch (e) {
        console.error("Gist APIエラー:", e);
    }
    return null;
}

// ========================================================
// 3. Web Audio API 初期化・再開制御
// ========================================================
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

// MIDIのノート番号（例: 60）を物理周波数（Hz）に変換する関数式式
function midiNoteToFrequency(note) {
    return 440 * Math.pow(2, (note - 69) / 12);
}

// ========================================================
// 4. 純粋なWeb Audio APIのみによるMIDI再生・停止ロジック（防弾仕様）
// ========================================================
function toggleMidiPlay() {
    initAudio();

    if (isPlaying) {
        // 演奏停止の処理
        stopAllMidiNotes();
    } else {
        // 演奏開始の処理
        actionBtn.innerText = "■ 演奏停止";
        actionBtn.classList.add('active');
        statusMessage.innerText = "純製ピュアオルゴール音色で再生中...";
        isPlaying = true;
        
        startTime = audioCtx.currentTime + 0.3;
        let maxDuration = 0;

        // MIDIデータをループ処理
        currentMidiData.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteOnTime = startTime + note.time;
                const duration = note.duration;
                const frequency = midiNoteToFrequency(note.midi);
                
                // 演奏終了タイミングを計算
                if (note.time + duration > maxDuration) {
                    maxDuration = note.time + duration;
                }

                // ブラウザ標準のシンセ回路をその場で生成
                const osc = audioCtx.createOscillator();
                const gainNode = audioCtx.createGain();
                
                // オルゴールらしい、澄んだ優しく減衰するサイン波
                osc.type = 'sine';
                osc.frequency.setValueAtTime(frequency, noteOnTime);
                
                // 音量封筒（エンベロープ）: ポーンと鳴って滑らかに消えていく
                gainNode.gain.setValueAtTime(0, noteOnTime);
                gainNode.gain.linearRampToValueAtTime(note.velocity * 0.15, noteOnTime + 0.01); // アタック
                gainNode.gain.exponentialRampToValueAtTime(0.0001, noteOnTime + duration); // ディケイ
                
                osc.connect(gainNode);
                gainNode.connect(audioCtx.destination);
                
                osc.start(noteOnTime);
                osc.stop(noteOnTime + duration);
                
                // 途中で止める時のためにオシレーターを記憶
                scheduledOscillators.push(osc);
            });
        });

        // 曲が最後まで鳴り終わったら自動的にボタンを元の状態に戻すタイマー
        stopTimeoutId = setTimeout(() => {
            if (isPlaying) stopAllMidiNotes();
        }, (maxDuration + 1) * 1000);
    }
}

function stopAllMidiNotes() {
    if (stopTimeoutId) clearTimeout(stopTimeoutId);
    
    // スケジュールされているすべての音の回路を物理的に停止・消去
    scheduledOscillators.forEach(osc => {
        try { osc.stop(); } catch(e) {}
    });
    scheduledOscillators = [];
    
    actionBtn.innerText = "♪ 楽曲再生";
    actionBtn.classList.remove('active');
    statusMessage.innerText = "演奏を停止しました。";
    isPlaying = false;
}

// ========================================================
// 5. 引数なし：特製サウンド（チャイム or 号砲）のシンセサイズ
// ========================================================
function playChime() {
    initAudio();
    
    actionBtn.classList.add('active');
    actionBtn.disabled = true;

    // ★ 鳴らしたい音を選べます：号砲なら「playGunshot()」、チャイムなら「playClassicChime()」
    playGunshot(); 

    // 音が完全に鳴り終わるまでボタンを無効化（1.5秒後に復帰）
    setTimeout(() => {
        actionBtn.classList.remove('active');
        actionBtn.disabled = false;
    }, 1500);
}

// ---- 👇 新機能：物理計算による「スタート号砲（ピストル音）」 ----
function playGunshot() {
    const now = audioCtx.currentTime;

    // 1. ノイズを生成するためのバッファ（メモリ上の音声データ空間）を作成（0.5秒分）
    const bufferSize = audioCtx.sampleRate * 0.5;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // 乱数（-1から1）を敷き詰めて「ホワイトノイズ（生破裂音の元）」を作る
    for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
    }

    // 2. オーディオノード（回路）の生成
    const noiseNode = audioCtx.createBufferSource();
    noiseNode.buffer = buffer;

    const filterNode = audioCtx.createBiquadFilter();
    const gainNode = audioCtx.createGain();

    // 3. フィルター設定（高音をカットして「ドンッ」という重低音の塊にする）
    filterNode.type = 'lowpass';
    filterNode.frequency.setValueAtTime(1000, now); // 発音時は1000Hz（少し高めの破裂音）
    filterNode.frequency.exponentialRampToValueAtTime(100, now + 0.15); // 一瞬で100Hz（腹に響く重低音）へ変化

    // 4. 音量封筒（エンベロープ）設計：ピストルの爆発的なアタックと残響
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.8, now + 0.002); // 0.002秒でマックス（爆発的な鋭さ）
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.4); // 0.4秒かけて滑らかに消えていく（余韻）

    // 5. 回路の接続
    noiseNode.connect(filterNode);
    filterNode.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    // 6. 着火！
    noiseNode.start(now);
    noiseNode.stop(now + 0.4);
}

// ---- 👇 以前成功した「ピンポーン」のチャイム音（いつでも戻せるように保管） ----
function playClassicChime() {
    const now = audioCtx.currentTime;
    createChimeTone(659.25, now, 1.2);    // ミ
    createChimeTone(523.25, now + 0.4, 1.8); // ド
}

function createChimeTone(freq, startTime, duration) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(freq, startTime);
    
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}
