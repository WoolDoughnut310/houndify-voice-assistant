export interface RequestHandlers {
    onResponse(response: any, info: any): void;
    onTranscriptionUpdate(transcript: any): void;
    onError(err: any, info: any): void;
}
