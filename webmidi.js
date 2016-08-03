// webmidi.js

var midi = { "inputs": [], "outputs": [] };
var midiInputIndex = 0;
var midiOutputIndex = 0;

// returns a Promise object representing a request for access to MIDI devices on the user's system.
// Promise<MIDIAccess> requestMIDIAccess (optional MIDIOptions options);
navigator.requestMIDIAccess({ sysex: false }).then(onMIDISuccess, onMIDIFailure);

function onMIDISuccess(/*MIDIAccess*/ midiAccess) {

    // List MIDI Input devices
    var it = midiAccess.inputs.values();
    for (var input = it.next(); !input.done; input = it.next()) {
        midi.inputs.push(input.value);
    }
    // Add a virtual MIDI Input Device
    midi.inputs.push((document.querySelector("#pckeyboard")).getInput());

    // Show MIDI input devices
    var listInput = document.querySelector("#midi-input");
    for (var i = 0; i < midi.inputs.length; i++) {
        listInput.appendChild(new Option(midi.inputs[i]["name"], i));

        // var input = midi.inputs[i];
        // $("#debug").append("[type:'" + input.type + "'] id:'" + input.id +
        //     "' manufacturer:'" + input.manufacturer + "' name:'" + input.name +
        //     "' version:'" + input.version + "'" + " Virtual:'" + input.virtual + "'" + "<br />");
    }

    // When the input device is changed
    listInput.addEventListener("change", function (event) {

        if (parseInt(event.target.value) >= 0) {
            // Clear last onmidimessage handler
            midi.inputs[midiInputIndex].onmidimessage = null;

            // Set new onmidimessage handler of MIDIInput interface 
            midiInputIndex = event.target.value;
            midi.inputs[midiInputIndex].onmidimessage = sendMIDIMessage;

            // When the vertual MIDI Input device is selected
            if (midi.inputs[midiInputIndex].virtual == true) {
                document.querySelector("#virtual-input").appendChild(document.querySelector("#pckeyboard").getElement());
            } else {
                document.querySelector("#virtual-input").innerHTML = ""
            }
        }

    });

    // List MIDI Output devices
    var it = midiAccess.outputs.values();
    for (var output = it.next(); !output.done; output = it.next()) {
        midi.outputs.push(output.value);
    }
    // Add a virtual MIDI Output device
    midi.outputs.push((document.querySelector("#wmlink")).getOutput());

    // Show MIDI output devices
    var listOutput = document.querySelector("#midi-output");
    for (var i = 0; i < midi.outputs.length; i++) {
        listOutput.appendChild(new Option(midi.outputs[i]["name"], i));

        // var output = midi.outputs[i];
        // $("#debug").append("[type:'" + output.type + "'] id:'" + output.id +
        //     "' manufacturer:'" + output.manufacturer + "' name:'" + output.name +
        //     "' version:'" + output.version + "'" + " Virtual:'" + output.virtual + "'" + "<br />");
    }

    // When the MIDI output devices is changed
    listOutput.addEventListener("change", function (event) {

        if (parseInt(event.target.value) >= 0) {
            midiOutputIndex = event.target.value;

            // When the vertual MIDI output device is selected
            if (midi.outputs[midiOutputIndex].virtual == true) {
                document.querySelector("#virtual-output").appendChild(document.querySelector("#wmlink").getElement());
            } else {
                document.querySelector("#virtual-output").innerHTML = ""
            }
        }

    });

    function sendMIDIMessage(/*MIDIMessageEvent*/ event) {

        var status = (event.data[0] & 0xf0);
        if (status == 0xb0 || status == 0x80 || status == 0x90) {
            $("#msg").empty();

            // Show MIDI message (Hex)
            for (var i = 0; i < event.data.length; i++) {
                $("#msg").append("0x" + ("00" + event.data[i].toString(16)).substr(-2) + " ");
            }
            $("#msg").append("<br />");

            // Show MIDI message (Bin)
            for (var i = 0; i < event.data.length; i++) {
                $("#msg").append(("0000000" + event.data[i].toString(2)).substr(-8) + " ");
            }
            $("#msg").append("<br />");
        }

        // Send MIDI message
        if (parseInt(midiOutputIndex) >= 0) {
            // void MIDIOutput.send(sequence<octet> data, optional double timestamp);
            //output.send(new Uint8Array([0x90, 0x45, 0x7f]));

            midi.outputs[midiOutputIndex].send(event.data, event.timestamp);
        }
    }

    $("#play").click(function () {
        // $("#debug").append("play clicked... <br />");

        var interval = 0.0;
        midi.outputs[midiOutputIndex].send([0x90, 0x3c, 0x40], interval); // C (ド) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x3c, 0x40], interval); // C (ド) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x3e, 0x40], interval); // D (レ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x3e, 0x40], interval); // D (レ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x40, 0x40], interval); // E (ミ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x40, 0x40], interval); // E (ミ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x41, 0x40], interval); // F (ファ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x41, 0x40], interval); // F (ファ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x43, 0x40], interval); // G (ソ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x43, 0x40], interval); // G (ソ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x45, 0x40], interval); // A (ラ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x45, 0x40], interval); // A (ラ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x47, 0x40], interval); // B (シ) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x47, 0x40], interval); // B (シ) - OFF

        midi.outputs[midiOutputIndex].send([0x90, 0x48, 0x40], interval); // C (ド) - ON
        interval += 500.0;
        midi.outputs[midiOutputIndex].send([0x80, 0x48, 0x40], interval); // C (ド) - OFF
    });
}

function onMIDIFailure(msg) {
    alert("[ERROR] " + msg);
}

