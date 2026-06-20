// https://github.com/bero-sim/bero-sim.github.io/blob/main/smb.js
// ========================================================
// 1. グローバル設定と初期化
// ========================================================
const GITHUB_USER = "bero-sim"; // あなたのGitHubユーザー名
let audioCtx = null;
let player = new WebAudioFontPlayer();
let currentMidiData = null;
let scheduledNotes = []; // 停止用に予約された音符のリスト
let isPlaying = false;
let startTime = 0;

// WebAudioFontの楽器データ（グランドピアノ: 0000_J_Acoustic_Grand_Piano_SF2_file）
const pianoPreset = _tone_0000_J_Acoustic_Grand_Piano_SF2_file;

// URLから引数（?gist=xxx）を抽出
const urlParams = new URLSearchParams(window.location.search);
const gistId = urlParams.get('gist');

const statusMessage = document.getElementById('statusMessage');
const actionBtn = document.getElementById('actionBtn');

// 起動時のルーティング
window.addEventListener('DOMContentLoaded', async () => {
    if (gistId) {
        // パターンA: 引数あり（GistのMIDIを読み込んで楽曲再生）
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
        // パターンB: 引数なし（チャイムモード）
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
        
        // Gist内のファイル群から、拡張子が .mid のものを探索
        for (let fileName in gistData.files) {
            if (fileName.toLowerCase().endsWith('.mid')) {
                return gistData.files[fileName].raw_url; // 生データのURLを返す
            }
        }
    } catch (e) {
        console.error("Gist APIエラー:", e);
    }
    return null;
}

// ========================================================
// 3. MIDI再生・停止の制御ロジック
// ========================================================
function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        player.init(audioCtx);
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function toggleMidiPlay() {
    initAudio();

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
        statusMessage.innerText = "グランドピアノ音色で再生中...";
        isPlaying = true;
        
        startTime = audioCtx.currentTime + 0.5; // 少しバッファを持って開始

        // 全トラックの全音符をループしてWebAudioFontにスケジュール（予約）する
        currentMidiData.tracks.forEach(track => {
            track.notes.forEach(note => {
                const noteOnTime = startTime + note.time;
                const duration = note.duration;
                
                // WebAudioFontで音を鳴らすコマンドをWeb Audio APIのタイムラインに予約
                let envelope = player.queueWaveTable(
                    audioCtx, 
                    audioCtx.destination, 
                    pianoPreset, 
                    noteOnTime, 
                    note.midi, 
                    duration, 
                    note.velocity
                );
                
                // 途中で止めるためにエフェクトオブジェクトを配列に保管
                scheduledNotes.push(envelope);
            });
        });
    }
}

// ========================================================
// 4. 引数なし：ピンポーン（特製チャイム音）のシンセサイズ
// ========================================================
function playChime() {
    initAudio();
    
    actionBtn.classList.add('active');
    actionBtn.disabled = true;

    const now = audioCtx.currentTime;
    
    // 「ピン」の音（高い音：ミ / E5 = 659.25Hz）
    createChimeTone(659.25, now, 1.2);
    
    // 「ポーン」の音（低い音：ド / C5 = 523.25Hz）
    // 0.4秒遅れて発音
    createChimeTone(523.25, now + 0.4, 1.8);

    // チャイム終了後にボタンを元に戻す
    setTimeout(() => {
        actionBtn.classList.remove('active');
        actionBtn.disabled = false;
    }, 2200);
}

// 減衰する綺麗な電子音を作るサブ関数
function createChimeTone(freq, startTime, duration) {
    const osc = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    // サイン波をベースに、少し柔らかい矩形波を混ぜるとお寺の鐘や高級チャイムの響きになります
    osc.type = 'sine'; 
    osc.frequency.setValueAtTime(freq, startTime);
    
    // ボリュームの封筒（エンベロープ）設計：ピンポーンと綺麗に減衰する
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05); // アタック
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + duration); // ディケイ

    osc.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
}
