// https://github.com/bero-sim/bero-sim.github.io/blob/main/smb.js
const params = new URLSearchParams(location.search);

const gistId = params.get("gist");

const playBtn = document.getElementById("playBtn");
const unknown = document.getElementById("unknown");
const status = document.getElementById("status");

if (!gistId) {
    unknown.style.display = "block";
} else {
    unknown.style.display = "none";
    playBtn.hidden = false;
}

let midiUrl = null;

async function findMidiFile(gistId) {

    const response =
        await fetch(`https://api.github.com/gists/${gistId}`);

    if (!response.ok) {
        throw new Error("Gist not found");
    }

    const gist = await response.json();

    const files = gist.files;

    for (const name in files) {

        if (
            name.toLowerCase().endsWith(".mid") ||
            name.toLowerCase().endsWith(".midi")
        ) {
            return files[name].raw_url;
        }
    }

    throw new Error("MIDI file not found");
}

playBtn.addEventListener("click", async () => {

    try {

        playBtn.disabled = true;
        status.textContent = "Loading...";

        if (!midiUrl) {
            midiUrl = await findMidiFile(gistId);
        }

        const midiArray =
            await fetch(midiUrl).then(r => r.arrayBuffer());

        const midi = new Midi(midiArray);

        await Tone.start();

        const synths = [];

        midi.tracks.forEach(track => {

            const synth = new Tone.PolySynth(
                Tone.Synth
            ).toDestination();

            synths.push(synth);

            track.notes.forEach(note => {

                synth.triggerAttackRelease(
                    note.name,
                    note.duration,
                    note.time,
                    note.velocity
                );

            });

        });

        status.textContent = "Playing";

    } catch(err) {

        console.error(err);

        status.textContent =
            "Error : " + err.message;

        playBtn.disabled = false;
    }
});
