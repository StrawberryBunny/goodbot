import * as fs from "fs-extra";
import { clientStore, peopleStore, statsStore } from ".";
import { PERM_PM } from "../constants";
import { IReceivePacketFLN, IReceivePacketNLN } from "../packets";
import * as Constants from "../constants";
import { STAT_PAYMENTS_MADE, STAT_PAYMENTS_TOTAL } from "./StatsStore";

export default class PeopleStore {

    private people: { [name: string]: PersonData } = {};

    constructor(){
        this.Load();
    }

    public Load(): void {
        if(fs.existsSync("data/people.json")){
            let str: string = fs.readFileSync("data/people.json", "utf8");
            this.people = JSON.parse(str);
        }
    }

    public Save(): void {
        fs.writeFileSync("data/people.json", JSON.stringify(this.people, null, 4), "utf8");
    }

    public HaveSeenPersonBefore(character: string): boolean {
        return this.people[character] != null && this.people[character] != undefined;
    }

    public GetPersonData(character: string): PersonData {
        return this.people[character];
    }

    public CreatePersonData(character: string, gender: string){
        return this.AddPerson(character, gender);
    }

    private AddPerson(character: string, gender: string): PersonData {
        this.people[character] = {
            name: character,
            commandState: 0,
            firstSeen: new Date().getTime(),
            gender: gender.trim(),
            wallet: 10000,
            permissions: {},
            messages: []
        };
        this.Save();
        console.log("New person seen: " + character);
        return this.people[character];
    }

    public UpdateCharacter(name: string, gender: string): void {
        if(this.HaveSeenPersonBefore(name)) {
            let pd: PersonData = this.GetPersonData(name);
            pd.gender = gender;
        }
    }

    public CheckPermission(character: string, permissionId: string): boolean {
        let pd: PersonData = this.people[character];
        if(pd == null || pd == undefined) return false;
        return pd.permissions[permissionId];
    }

    public GrantPermission(character: string, permissionId: string): void {
        this.people[character].permissions[permissionId] = true;
        this.Save();
    }

    public RemovePermission(character: string, permissionId: string): void {
        delete this.people[character].permissions[permissionId];
    }

    public AddMessage(character: string, message: string): void {
        if(!this.HaveSeenPersonBefore(character)) return;
        
        this.people[character].messages.push(message);

        // Is this person online right now?
        if(clientStore.IsOnline(character)) {
            // Has this character granted permission to PM them?
            if(peopleStore.CheckPermission(character, PERM_PM)) {
                // Send PM
                clientStore.SendPM(character, "");
                return;
            }
        }

        this.Save();
    }

    public RetreiveMessages(character: string): string {
        if(!this.HaveSeenPersonBefore(character)) return "";
        let pd: PersonData = this.GetPersonData(character);
        let final: string = "";
        if(pd.messages.length > 0) {
            final += `You have ${pd.messages.length} messages.\r\n`;
            for(let i = 0; i < pd.messages.length; i++) {
                final += `${i + 1}. ${pd.messages[i]}`;
                if(i != pd.messages.length - 1) {
                    final += "\r\n";
                }
            }
        }
        pd.messages = [];
        this.Save();
        return final;
    }

    public Pay(from: string, to: string, amount: number): PaymentResult {
        // Have we seen both people before?
        if(!this.HaveSeenPersonBefore(from)) {
            throw new Error("How is someone making payment when we've never seen them?");
        }

        if(!this.HaveSeenPersonBefore(to)) {
            // Reject
            return { err: "rejectedneverseen" };
        }

        // Valid amount?
        if(amount <= 0) {
            return { err: "rejectedinvalidamount" }
        }

        let sender: PersonData = this.GetPersonData(from);
        let receiver: PersonData = this.GetPersonData(to);

        if(sender.wallet < amount) {
            // Reject
            return { err: "rejectednotenoughfunds" };
        }

        // Do transaction
        sender.wallet -= amount;
        receiver.wallet += amount;

        // Complete
        this.AddMessage(from, `You have sent ${Constants.ToCurrencyDisplay(amount)} to [icon]${to}[/icon]. Your new balance is ${Constants.ToCurrencyDisplay(sender.wallet)}`);
        this.AddMessage(to, `[icon]${from}[/icon] has sent you ${Constants.ToCurrencyDisplay(amount)}. Your new balance is ${Constants.ToCurrencyDisplay(receiver.wallet)}`);

        // Log
        console.log(`${from} has sent ${amount} to ${to}`);

        statsStore.AddToStat(STAT_PAYMENTS_MADE, 1, false);
        statsStore.AddToStat(STAT_PAYMENTS_TOTAL, amount, true);

        // return
        return { err: "none" }
    }
}

export interface PersonData {
    name: string;
    commandState: number;
    firstSeen: number;
    gender: string;
    wallet: number;
    permissions: { [name: string]: boolean };
    messages: string[];
}

export interface PaymentResult {
    err: "rejectedneverseen" | "rejectednotenoughfunds" | "rejectedinvalidamount" | "none"
}