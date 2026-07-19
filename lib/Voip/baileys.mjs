import cjs from "../index.js";
export const {
    default: makeWASocket,
    useMultiFileAuthState,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    Browsers,
    proto,
    jidNormalizedUser,
    jidEncode,
    jidDecode,
    generateMessageID,
    encodeSignedDeviceIdentity,
    decodeBinaryNode,
    getBinaryNodeChild,
    getAllBinaryNodeChildren,
    getCallStatusFromNode,
    encodeBinaryNode,
    parseAndInjectE2ESessions,
    encodeWAMessage,
    unpadRandomMax16,
} = cjs;
export default makeWASocket;
