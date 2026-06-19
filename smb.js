const params = new URLSearchParams(location.search);

const gistId = params.get("gist");

const playBtn = document.getElementById("playBtn");
const unknown = document.getElementById("unknown");
const status = document.getElementById("status");

let midiUrl = null;

if (!gistId) {

    unknown.style.display = "block";

} else {

    unknown.style.display = "none";
    playBtn.hidden = false;
}

const AudioContextClass =
    window.AudioContext || window.webkitAudioContext;

const audioContext =
    new AudioContextClass();

const player =
    new WebAudioFontPlayer();

const presetCache = {};

async function findMidiFile(gistId){

    const response =
        await fetch(
            `https://api.github.com/gists/${gistId}`
        );

    if(!response.ok){
        throw new Error("Gist not found");
    }

    const gist = await response.json();

    for(const name in gist.files){

        if(
            name.toLowerCase().endsWith(".mid") ||
            name.toLowerCase().endsWith(".midi")
        ){
            return gist.files[name].raw_url;
        }
    }

    throw new Error("MIDI file not found");
}

async function loadPreset(program){

    if(presetCache[program]){
        return presetCache[program];
    }

    const index =
        String(program)
            .padStart(3,"0");

    const variable =
        `_tone_${index}_FluidR3_GM_sf2_file`;

    const url =
`https://surikov.github.io/webaudiofontdata/sound/${index}_FluidR3_GM_sf2_file.js`;

    await new Promise((resolve,reject)=>{

        const script =
            document.createElement("script");

        script.src = url;

        script.onload = resolve;
        script.onerror = reject;

        document.body.appendChild(script);
    });

    const preset = window[variable];

    if(!preset){
        throw new Error(
            `Preset ${program} not found`
        );
    }

    player.adjustPreset(
        audioContext,
        preset
    );

    presetCache[program] = preset;

    return preset;
}

async function playMidi(midi){

    const startTime =
        audioContext.currentTime + 0.1;

    const promises = [];

    for(const track of midi.tracks){

        const program =
            track.instrument.number || 0;

        promises.push(
            loadPreset(program)
        );
    }

    await Promise.all(promises);

    for(const track of midi.tracks){

        const preset =
            presetCache[
                track.instrument.number || 0
            ];

        for(const note of track.notes){

            player.queueWaveTable(
                audioContext,
                audioContext.destination,
                preset,

                startTime + note.time,

                note.midi,

                note.duration,

                note.velocity
            );
        }
    }
}

playBtn.addEventListener(
    "click",
    async ()=>{

        try{

            playBtn.disabled = true;

            status.textContent =
                "Loading MIDI...";

            if(!midiUrl){

                midiUrl =
                    await findMidiFile(gistId);
            }

            const midiBuffer =
                await fetch(midiUrl)
                    .then(r=>r.arrayBuffer());

            const midi =
                new Midi(midiBuffer);

            await audioContext.resume();

            status.textContent =
                "Loading Instruments...";

            await playMidi(midi);

            status.textContent =
                "Playing";

        }
        catch(err){

            console.error(err);

            status.textContent =
                err.message;

            playBtn.disabled = false;
        }
    }
);
