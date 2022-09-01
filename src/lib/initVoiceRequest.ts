import { RequestHandlers } from "./types";

export default function initVoiceRequest(
    recorder: any,
    conversationState: object,
    handlers: RequestHandlers
) {
    // @ts-ignore (2339)
    const voiceRequest = new window.Houndify.VoiceRequest({
        //Your Houndify Client ID
        clientId: "4UZ4b3UN6ByczZr9xVYrgw==",

        authURL: "/houndifyAuth",

        //REQUEST INFO JSON
        //See https://houndify.com/reference/RequestInfo
        requestInfo: {
            UserID: "test_user",
            //See https://www.latlong.net/ for your own coordinates
            Latitude: 37.388309,
            Longitude: -121.973968,
        },

        //Pass the current ConversationState stored from previous queries
        //See https://www.houndify.com/docs#conversation-state
        conversationState: conversationState,

        //Sample rate of input audio
        sampleRate: recorder.sampleRate,

        //Enable Voice Activity Detection
        //Default: true
        enableVAD: true,

        //Partial transcript, response and error handlers
        onTranscriptionUpdate: handlers.onTranscriptionUpdate,
        onResponse: function (response: any, info: any) {
            recorder.stop();
            handlers.onResponse(response, info);
        },
        onError: function (err: any, info: any) {
            recorder.stop();
            handlers.onError(err, info);
        },
    });

    return voiceRequest;
}
