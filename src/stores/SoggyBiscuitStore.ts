import { channelStore, clientStore, statsStore } from ".";
import { RandomSpermSynonym } from "../constants";
import { IReceivePacketRLL } from "../packets";
import { STAT_GAME_SOGGY_STARTED } from "./StatsStore";

export default class SoggyBiscuitStore {

    private inProgress: { [channel: string]: ISoggyBiscuitGame } = {};

    constructor() {
        clientStore.RegisterMessageForwarder("!sbstart", (channel, character, message) => {
            this.StartSoggyBiscuit(channel, character);
        });
        clientStore.RegisterMessageForwarder("!sbjoin", (channel, character, message) => {
            this.JoinGame(channel, character);
        });
        clientStore.RegisterMessageForwarder("!sbquit", (channel, character, message) => {
            this.CancelGame(channel, character);
        });
        clientStore.RegisterMessageForwarder("!sbproceed", (channel, character, message) => {
            this.ProceedGame(channel, character);
        });
    }

    public StartSoggyBiscuit(channel: string, requester: string): void {
        // Is a game already in progress?
        if(this.IsGameInProgress(channel)) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${requester}[/user]. A game of Soggy Biscuit is already in progress. Please wait for it to end.`);
            return;
        }

        // Start
        clientStore.SendChannelMessage(channel, `[user]${requester}[/user] has started a game of Soggy Biscuit!
        Players roll 1d20 each round.
        The aim is to reach a total of 100 to achieve orgasm, spraying your juices all over the biscuit.
        The last player has to eat the biscuit with all the other player's toppings all over it so make sure you cum quick!
        Join the game by saying [color=cyan]!sbjoin[/color].
        [user]${requester}[/user] can start the game by saying [color=cyan]!sbproceed[/color].
        [user]${requester}[/user], channel owners and channel operators can quit the game at any time by saying [color=cyan]!sbquit[/color].`);

        this.inProgress[channel] = {
            requester: requester,
            channel: channel,
            started: new Date().getTime(),
            phase: 0,
            round: 0,
            characters: [],
            scores: [],
            timer: null
        };
    }

    public CancelGame(channel: string, requester: string): void {
        if(!this.IsGameInProgress(channel)) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${requester}[/user], there is currently no game in progress to cancel.`);
            return;
        }

        let g: ISoggyBiscuitGame = this.inProgress[channel];

        // Is the requester the person who started the game?
        if(requester == g.requester || channelStore.IsOwner(channel, requester) || channelStore.IsOp(channel, requester)) {
            // clear timer
            if(this.inProgress[channel].timer != null) clearTimeout(this.inProgress[channel].timer);

            // Delete game in progress
            delete this.inProgress[channel];
            
            // inform
            clientStore.SendChannelMessage(channel, `The current game of Soggy Biscuit has been cancelled by [user]${requester}[/user]`);
        }
        else {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${requester}[/user], only the person who started the game, channel owners and channel operators can cancel a game in progress.`);
        }
    }

    public JoinGame(channel: string, character: string): void {
        if(!this.IsGameInProgress(channel)) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${character}[/user], there is no game currently running. Say [color=cyan]!sbstart[/color] to start a game.`);
            return;
        }

        let g: ISoggyBiscuitGame = this.inProgress[channel];
        if(g.phase != 0) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${character}[/user], you can only join a game in the starting phase.`);
            return;
        }
        g.characters.push(character);
        g.scores.push(0);
        clientStore.SendChannelMessage(channel, `[user]${character}[/user] has joined the game. ${g.characters.length} players.`);
    }

    public ProceedGame(channel: string, character: string): void {
        if(!this.IsGameInProgress(channel)) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${character}[/user], there is no game currently running. Say [color=cyan]!sbstart[/color] to start a game.`);
            return;
        }

        let g: ISoggyBiscuitGame = this.inProgress[channel];

        if(character != g.requester && !channelStore.IsOwner(channel, character) && !channelStore.IsOp(channel, character)) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${character}[/user], only the person who started the game, channel owners and channel operators can start the game.`);
            return;
        }
        
        if(g.characters.length < 2) {
            clientStore.SendChannelMessage(channel, `Sorry, [user]${character}[/user], there must be at least 2 people to play a game of Soggy Biscuit.`);
            return;
        }

        g.phase++;

        clientStore.SendChannelMessage(channel, `A game of Soggy Biscuit is starting with ${g.characters.length} players.`);

        statsStore.AddToStat(STAT_GAME_SOGGY_STARTED, 1, true);

        this.StartNextRound(channel);
    }

    public StartNextRound(channel: string): void {
        let g: ISoggyBiscuitGame = this.inProgress[channel];

        clientStore.SendChannelMessage(channel, `Round ${g.round + 1}, FIGHT!
        All players have 30 seconds to roll 1d20.`);

        g.timer = setTimeout(() => {
            // Find players who have reached 100
            let achieved: string[] = [];
            let achievedStr: string = "";
            for(let i = g.characters.length - 1; i >= 0; i--) {
                if(g.scores[i] >= 100) {
                    achieved.push(g.characters[i]);
                    g.characters.splice(i, 1);
                    g.scores.splice(i, 1);
                    achievedStr += g.characters[i];
                    if(i > 1) achievedStr += ", ";
                    if(i == 1) achievedStr += " and ";
                }
            }

            
            

            // How many players left?
            if(g.characters.length == 0) {
                clientStore.SendChannelMessage(channel, achievedStr + ` all blow their ${RandomSpermSynonym()} all over the biscuit at the same time. There is no loser this time.`);
            }

            // End the round
            clientStore.SendChannelMessage(channel, `End of Round ${g.round + 1}.
            ${achieved.join(", ")} all shoot their ${RandomSpermSynonym()} all over the biscuit and are out.`);

        }, 30000);
    }

    public IsGameInProgress(channel: string): boolean {
        return Object.keys(this.inProgress).indexOf(channel) != -1;
    }

    public LeftChannel(channel: string): void {
        if(Object.keys(this.inProgress).indexOf(channel) != -1) {
            // A game in progress was interrupted by us leaving the channel.
            delete this.inProgress[channel];
        }
    }

    public DiceRoll(channel: string, character: string, roll: IReceivePacketRLL): void {
        if(!this.IsGameInProgress(channel)) return;

        let g: ISoggyBiscuitGame = this.inProgress[channel];

        // If we're still in phase one
        if(g.phase == 0) return;

        let index: number = g.characters.indexOf(character);

        // If this roller is not in the game
        if(index == -1) {
            // Don't inform, could just be someone randomly rolling dice
            return;
        }

        // Is the roll a 1d20 as reqiured by tge game?
        if(roll.type != "roll") {
            return;
        }
        if(roll.rolls.length != 1 || roll.rolls[0] != "1d20") {
            return;
        }

        if(roll.endresult == null || roll.endresult == undefined || roll.endresult == NaN) {
            clientStore.SendChannelMessage(channel, `Sorry! GoodBot encountered a problem understanding dice rolls and the game must be cancelled.`);
            clientStore.SendChannelMessage(channel, `/me whimpers apologetically.`);
            console.error("Could not get dice roll for Soggy Biscuit.. " + JSON.stringify(roll));
            delete this.inProgress[channel]
            return;
        }
        
        g.scores[index] += roll.endresult;
    }
}

interface ISoggyBiscuitGame {
    requester: string;
    channel: string;
    started: number;
    phase: number;
    round: number;
    characters: string[];
    scores: number[];
    timer: NodeJS.Timer;
}