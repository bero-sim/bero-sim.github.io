// https://github.com/bero-sim/bero-sim.github.io/blob/main/smb.js
// ========================================================
// 1. グローバル設定と初期化
// ========================================================
let audioCtx = null;
let player = new WebAudioFontPlayer();
let currentMidiData = null;
let scheduledNotes = []; // 停止用に予約された音符のリスト
let isPlaying = false;
let startTime = 0;

// URLから引数（?gist=xxx）を抽出
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
        statusMessage.innerText = "ウェルカムチャイムモード";
        actionBtn.innerText = "♪ チャイム再生";
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

// ========================================================
// 4. MIDI再生・停止の制御ロジック（セキュリティ盾回避版）
// ========================================================
function toggleMidiPlay() {
    initAudio();

    // ★外部JSファイルを使わず、WebAudioFontPlayerが内部にデフォルトで持っている
    // 汎用サイン波プレセット（100%安全に存在するもの）を強制指定します
    const securePreset = player.preset; 

    if (isPlaying) {
        // 停止処理
        scheduledNotes.forEach(n => n.cancel());
        scheduledNotes = [];
        player.cancelQueue(audioCtx);
        actionBtn.innerText = "♪ 楽曲再生";
        actionBtn.classList.remove('active');
        statusMessage.innerText = "演奏を停止しました。";
        isPlaying = false;
    } else {
        // 再生処理
        actionBtn.innerText = "■ 演奏停止";
        actionBtn.classList.add('active');
        statusMessage.innerText = "特製ミュージックボックスで再生中...";
        isPlaying = true;
        
        startTime = audioCtx.currentTime + 0.3;

        currentMidiData.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteOnTime = startTime + note.time;
                const duration = note.duration;
                
                // 内部の安全な音源でタイムラインに予約
                let envelope = player.queueWaveTable(
                    audioCtx, 
                    audioCtx.destination, 
                    securePreset, 
                    noteOnTime, 
                    note.midi, 
                    duration, 
                    note.velocity
                );
                
                scheduledNotes.push(envelope);
            });
        });
    }
}

// ========================================================
// 5. 引数なし：ピンポーン（特製チャイム音）のシンセサイズ
// ========================================================
function playChime() {
    initAudio();
    
    actionBtn.classList.add('active');
    actionBtn.disabled = true;

    const now = audioCtx.currentTime;
    
    createChimeTone(659.25, now, 1.2); // ミ
    createChimeTone(523.25, now + 0.4, 1.8); // ド

    setTimeout(() => {
        actionBtn.classList.remove('active');
        actionBtn.disabled = false;
    }, 2200);
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
