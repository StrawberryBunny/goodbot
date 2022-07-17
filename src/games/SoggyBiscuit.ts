import { IReceivePacketRLL } from "../packets";
import BaseGame from "./BaseGame";

const START: string = "sbstart";
const JOIN: string = "sbjoin";
const GO: string = "sbgo";
const QUIT: string = "sbquit";

export default class SoggyBiscuit extends BaseGame {
    
    private inProgress: { [channel: string]: IInProgress } = {};

    constructor() {
        super("sb", true);
    }

    public ReceiveChannelMessage(channel: string, character: string, message: string): void {
        let split: string[] = message.split(" ");
        switch(split[0]) {
            case START:
                this.StartGame(channel, character);
                break;
            case JOIN:
                this.JoinGame(channel, character);
                break;
            case GO:
                this.GoGame(channel, character);
                break;
            case QUIT:
                this.QuitGame(channel, character);
                break;
        }
    }

    private IsGameInProgress(channel: string): boolean {
        return this.inProgress[channel] != null;
    }

    public ReceiveDiceRoll(channel: string, character: string, roll: IReceivePacketRLL): void {
        
    }

    public StartGame(channel: string, character: string): void {
        
    }

    public JoinGame(channel: string, character: string): void {

    }

    public GoGame(channel: string, character: string): void {

    }

    public QuitGame(channel: string, character: string): void {

    }

    public RollGame(channel: string, character: string, roll: IReceivePacketRLL): void {

    }
}

interface IInProgress {
    phase: number;
    round: number;
    starter: number;
    players: string[];
    scores: number[];
}