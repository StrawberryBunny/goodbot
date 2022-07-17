import { IReceivePacketRLL } from "../packets";

export default class BaseGame {

    public prefix: string;
    public useDice: boolean;

    constructor(prefix: string, useDice: boolean) {
        this.prefix = prefix;
        this.useDice = useDice;
    }

    public ReceiveChannelMessage(channel: string, character: string, message: string): void {

    }

    public ReceiveDiceRoll(channel: string, character: string, roll: IReceivePacketRLL): void {
        
    }
}