"use strict";
const CallState = Object.freeze({
    Idle: 0,
    Calling: 1,
    PreacceptReceived: 2,
    ReceivedCall: 3,
    AcceptSent: 4,
    AcceptReceived: 5,
    Active: 6,
    ActiveElsewhere: 7,
    Ending: 13,
});
let _module = null;
async function getVoipModule() {
    if (!_module) _module = await import("./dist/index.mjs");
    return _module;
}
async function createVoipClient(config) {
    const mod = await getVoipModule();
    const client = new mod.VoipClient(config);
    await client.connect();
    return client;
}
exports.CallState = CallState;
exports.createVoipClient = createVoipClient;
exports.getVoipModule = getVoipModule;
