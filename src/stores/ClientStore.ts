import WebSocket from "ws";
import * as Packets from "../packets";
import { BOT_NAME, MESSAGE_FIRST_SEEN, MESSAGE_REJECT_INVITE_NO_PERM_NOT_OWNER, MESSAGE_UNRECOGNISED_COMMAND, PM_LINE_SEPARATOR, SERVER_ADDRESS, STATUS_MESSAGE } from "../constants";
import { channelStore, commandStore, peopleStore, trayStore } from ".";
import { app, dialog } from "electron";
import { PersonData } from "./PeopleStore";
const username = require("../../account.json").username;

interface IJoinChannelRequest {
    channel: string,
    requester: string
}

export default class ClientStore
{
    private socket: WebSocket;
    private sendBuffer: string[] = [];
    private bufferTimerInterval: NodeJS.Timer = null;
    private characters: string[] = [];
    private connectedCount: number;
    public connectionTime: Date;

    private inviteRequests: Packets.IReceivePacketCIU[] = [];
    private joinChannelRequests: IJoinChannelRequest[] = [];

    public Connect(character: string, ticket: string): void {
        console.log("Connecting to chat server.");

        this.socket = new WebSocket(SERVER_ADDRESS);

        this.socket.on("open", () => {
            trayStore.UpdateTray(true, true, false);
            console.log("WebSocket opened. Identifying.");
            let packet = {
                method: "ticket",
                account: username,
                ticket: ticket,
                character: character,
                cname: "goodbot",
                cversion: "0.0.0"
            };
            this.socket.send(`IDN ${JSON.stringify(packet)}`);
        });

        this.socket.on("close", () => {
            console.log("WebSocket was closed.");
            trayStore.UpdateTray(true, false, false);
            dialog.showErrorBox("Error", "WebSocket was closed.");
            app.quit();
        });

        this.socket.on("error", err => {
            console.error(`WebSocket error: ${err}`);
        });

        this.socket.on("message", this.OnMessageHandler.bind(this));
    }

    private OnMessageHandler(data: any): void {
        let dataStr: string = data.toString();
        let messageId: string = dataStr.substring(0, 3).toUpperCase();
        let obj: Object;

        if(dataStr.length > 3) {
            obj = JSON.parse(dataStr.substring(3));
        }

        switch(messageId) {
            case "ADL":
                // Ops list, do nothing.
                // Received on identify
                break;
            case "CDS":
                // Channel descriptions, do nothing
                break;
            case "CIU":
                this.ReceiveInviteCIU(obj as Packets.IReceivePacketCIU);
                break;
            case "COL":
                // Comes in response to JCH
                //console.log(dataStr);
                let col: Packets.IReceivePacketCOL = obj as Packets.IReceivePacketCOL;
                this.ReceiveChannelModInformationCOL(col.channel, col.oplist);
                break;
            case "CON":
                this.ReceiveConnectedCountCON(obj as Packets.IReceivePacketCON);
                break;
            case "FLN":
                this.ReceiveWentOfflineFLN(obj as Packets.IReceivePacketFLN);
                break;
            case "FRL":
                // Friends list. Do nothing.
                // Received on identify
                break;
            case "IDN":
                this.ReceiveIdentifiedSuccessfullyIDN();
                break;
            case "IGN":
                // Ignore list. Do nothing.
                // Received on identify
                break;
            case "JCH":
                //console.log(dataStr);
                // Someone joined a channel
                this.ReceiveCharacterJoinedChannelJCH(obj as Packets.IReceivePacketJCH);
                break;
            case "LIS":
                this.ReceiveCharListLIS(obj as Packets.IReceivePacketLIS);
                // Received on identify
                break;
            case "NLN":
                this.ReceiveCameOnlineNLN(obj as Packets.IReceivePacketNLN);
                break;
            case "PIN":
                this.socket.send("PIN");
                break;
            case "PRI":
                this.ReceivePRI(obj as Packets.IReceivePacketPRI);
                break;
            case "STA":
                // Status updates, do nothing
                break;
            case "SYS":
                this.ReceiveSYS(obj as Packets.IReceivePacketSYS);
                break;
            case "TPN":
                // Typing updates, do nothing
                break;
            case "VAR":
                this.ReceiveVAR(obj as Packets.IReceivePacketVAR);
                // Received on identify
            default:
                console.log(dataStr);
        }
    }

    private SendMessage(messageId: string, packet: Object): void {
        let message: string = `${messageId} ${JSON.stringify(packet)}`;
        this.sendBuffer.push(message);
    }

    // Interface ====================================================
    public SendPM(character: string, message: string): void {
        // Include any messages that are waiting
        let msgs: string = peopleStore.RetreiveMessages(character);
        if(msgs.length > 0) {
            let msg: string = `
            ${PM_LINE_SEPARATOR}
            ${msgs}
            ${PM_LINE_SEPARATOR}\n`

            let p: Packets.ISendPacketPRI = {
                recipient: character,
                message: msg
            };
            this.SendMessage("PRI", p);
        }

        let p: Packets.ISendPacketPRI = {
            recipient: character,
            message: message
        };
        this.SendMessage("PRI", p);
    }

    public SendChannelMessage(channel: string, message: string): void {
        let p: Packets.ISendPacketMSG = {
            channel: channel,
            message: message
        };
        this.SendMessage("MSG", p);
    }

    public IsOnline(character: string): boolean {
        return this.characters.indexOf(character) != -1;
    }

    public JoinChannel(channel: string, requester: string): void {
        let p: Packets.ISendPacketJCH = {
            channel: channel
        };
        this.joinChannelRequests.push({
            channel: channel,
            requester: requester
        });
        this.SendMessage("JCH", p);
    }

    public RequestChannelModInformation(channel: string): void {
        //console.log("Requesting channel mod info for " + channel);
        let col: Packets.ISendPacketCOL = {
            channel: channel
        };
        this.SendMessage("COL", col);
    }

    // Buffer ========================================================
    private StartBufferTimer(): void {
        this.StopBufferTimer();
        this.bufferTimerInterval = setInterval(this.BufferTick.bind(this), 1010);
    }

    private StopBufferTimer(): void {
        if(this.bufferTimerInterval != null) {
            clearInterval(this.bufferTimerInterval);
        }
    }

    private BufferTick(): void {
        if(this.sendBuffer.length > 0) {
            let msg: string = this.sendBuffer[0];
            this.sendBuffer.splice(0, 1);
            this.socket.send(msg);
        }
    }

    // Receivers =====================================================
    private ReceiveInviteCIU(p: Packets.IReceivePacketCIU): void {
        this.inviteRequests.push(p);
        this.RequestChannelModInformation(p.name);
    }

    private ReceiveChannelModInformationCOL(channel: string, oplist: string[]): void {
        // Update channel
        channelStore.UpdateChannelModInformation(channel, oplist);

        // Check requests
        for(let i = this.inviteRequests.length - 1; i >= 0; i--) {
            if(channel == this.inviteRequests[i].name) {
                let ir: Packets.IReceivePacketCIU = this.inviteRequests[i];
                this.inviteRequests.splice(i, 1);

                // Is the person who sent the invite the owner of the channel?
                if(channelStore.IsOwner(ir.name, ir.sender)) {
                    // Join the channel
                    this.JoinChannel(ir.name, ir.sender);
                    continue;
                }

                // Has the owner given permission for chanops to invite?
                let owner: string = channelStore.GetOwner(ir.name);
                if(peopleStore.CheckPermission(owner, ir.name.toLowerCase())) {
                    // Join the channel
                    this.JoinChannel(ir.name, ir.sender);
                    continue;
                }
                
                // Reject
                this.SendPM(ir.sender, MESSAGE_REJECT_INVITE_NO_PERM_NOT_OWNER);
            }
        }
    }

    private ReceiveConnectedCountCON(p: Packets.IReceivePacketCON): void {
        this.connectedCount = p.count;
        console.log(`Users online: ${this.connectedCount}`);
    }

    private ReceiveWentOfflineFLN(p: Packets.IReceivePacketFLN): void {
        delete this.characters[p.character];
    }
    
    private ReceiveIdentifiedSuccessfullyIDN(): void {
        console.log("Identified successfully.");
        trayStore.UpdateTray(true, true, true);
        this.StartBufferTimer();
    }

    private ReceiveCharacterJoinedChannelJCH(p: Packets.IReceivePacketJCH): void {
        channelStore.UpdateChannelTitle(p.channel, p.title);

        if(p.character.identity == BOT_NAME) {
            for(let i = this.joinChannelRequests.length - 1; i >=0; i--) {
                if(this.joinChannelRequests[i].channel == p.channel) {
                    let jcr: IJoinChannelRequest = this.joinChannelRequests[i];
                    this.joinChannelRequests.splice(i, 1);
                    this.SendPM(jcr.requester, `I have joined [session=${channelStore.GetTitle(jcr.channel)}]${jcr.channel}[/session] at your request.`);
                    console.log(`Joined ${channelStore.GetTitle(jcr.channel)} at ${jcr.requester}'s request.`);
                }
            }
        }
    }

    private ReceiveCharListLIS(p: Packets.IReceivePacketLIS): void {
        for(let i = 0; i < p.characters.length; i++) {
            this.characters.push(p.characters[i][0]);
            peopleStore.UpdateCharacter(p.characters[i][0], p.characters[i][1]);            
        }
        console.log(`Received ${this.characters.length} initial characters out of ${this.connectedCount}`);

        if(this.characters.length >= this.connectedCount) {
            console.log(`All characters received. ${this.characters.length}/${this.connectedCount}`);
            
            // Do final log on things

            // Set status
            let stap: Packets.ISendPacketSTA = {
                status: "online",
                statusmsg: STATUS_MESSAGE
            };
            this.SendMessage("STA", stap);

            // Record time
            this.connectionTime = new Date();

            // Joined at 
            console.log("Finished connecting at " + new Date().toUTCString());
        }
    }
    
    private ReceiveCameOnlineNLN(p: Packets.IReceivePacketNLN): void {
        this.characters.push(p.identity);
        peopleStore.UpdateCharacter(p.identity, p.gender);
    }

    private ReceivePRI(p: Packets.IReceivePacketPRI): void {
        if(p.message != null && p.message.length == 0) return;

        // Get person data
        let pd: PersonData;
        let firstSeen: boolean = false;
        if(peopleStore.HaveSeenPersonBefore(p.character)) {
            pd = peopleStore.GetPersonData(p.character);
        }
        else {
            pd = peopleStore.CreatePersonData(p.character, "none");
            firstSeen = true;
        }

        // Split command
        let spl: string[] = p.message.split(" ");
        let command: string = spl[0];

        // First time seen?
        if(firstSeen) {
            peopleStore.AddMessage(p.character, MESSAGE_FIRST_SEEN);
        }

        // Process command
        let result: boolean = commandStore.Process(pd, p.character, spl);
        if(!result) {
            console.log(`Unrecognised command. ${p.character}: ${p.message}`);
            this.SendPM(p.character, MESSAGE_UNRECOGNISED_COMMAND);
        }
    }

    private ReceiveSYS(p: Packets.IReceivePacketSYS): void {
        let test: string = "Channel moderators for";
        if(p.message.substring(0, test.length) == test) {
            let index: number = p.message.indexOf(": ");
            let listStr: string = p.message.substring(index + 2);
            let split: string[] = listStr.split(", ");
            //console.log(`Received SYS mod information for ${p.channel}: ${listStr}, ${split}`);
            //this.ReceiveChannelModInformationCOL(p.channel, split); Turned off becuase it seems to be suplurflous
        }
    }

    private ReceiveVAR(p: Packets.IReceivePacketVAR): void {

    }
}