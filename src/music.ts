// var zz1 = [.25,0,,.05,,.2]

var zz1 = [,0,,.1,,.2,,10,,,,,,.03,,,.16,.2,.1,1]
var zz3 = [,0,,.1,,.2,,,,,,,,.03,,,.16,.2,.1,1]
var zz4 = [,0,,.02,,,,15]

// thanks https://github.com/nicolas-van/sonant-x
// n: halfnote, 128 = A4, 129 = A#4, 130 = B4, ...
// +64 because of the MIDI conversion
function getNoteFrequency(n)
{
	return Math.pow(1.059463094, n - 128 + 64) * 440;
}

function startMusic() {
    var audioCtx = new AudioContext();

    const scriptNode = audioCtx.createScriptProcessor(4096 * 2, 1, 1);

    var sounds = [ ]
    var nextNoteTime = 0.1 // the audioProcessingEvent.playbackTime marks the end of the buffer, it is easier to fix it here

    var music_data = MUSIC_1
    var n = 0

    scriptNode.onaudioprocess = function(audioProcessingEvent) {
        var inputBuffer = audioProcessingEvent.inputBuffer;
        var outputBuffer = audioProcessingEvent.outputBuffer;

        for (var channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
            var inputData = inputBuffer.getChannelData(channel);
            var outputData = outputBuffer.getChannelData(channel);

            var now

            for (var sample = 0; sample < inputBuffer.length; sample++)
            {
                outputData[sample] = inputData[sample]

                now = audioProcessingEvent.playbackTime + sample / outputBuffer.sampleRate

                while (nextNoteTime <= now)
                {
                    zz1[0] = 0.3 * 0.25
                    zz1[2] = getNoteFrequency(music_data[1][n]) * 0.25
                    sounds.push({ data: zzfx(outputBuffer.sampleRate, ...zz1), pos: 0 })

                    zz1[0] = 0.4 * 0.25
                    zz1[2] = getNoteFrequency(music_data[1][n]) * 0.5
                    sounds.push({ data: zzfx(outputBuffer.sampleRate, ...zz1), pos: 0 })

                    zz4[0] = 0.5 * 0.25
                    zz4[2] = getNoteFrequency(music_data[1][n]) * 0.5
                    sounds.push({ data: zzfx(outputBuffer.sampleRate, ...zz4), pos: 0 })

                    zz3[0] = 0.7 * 0.25
                    zz3[2] = getNoteFrequency(music_data[1][n]) * 1.0
                    sounds.push({ data: zzfx(outputBuffer.sampleRate, ...zz3), pos: 0 })

                    n = (n + 1) % music_data[1].length

                    nextNoteTime += music_data[2][n] * music_data[0]
                }

                for (var i=sounds.length-1; i>=0; i--)
                {
                    if (sounds[i].pos < sounds[i].data.length)
                    {
                        outputData[sample] += sounds[i].data[sounds[i].pos++]
                    }
                }
            }
        }

        for (var i=sounds.length-1; i>=0; i--)
        {
            if (sounds[i].pos == sounds[i].data.length)
            {
                sounds.splice(i, 1)
            }
        }
    }

    scriptNode.connect(audioCtx.destination)
}
