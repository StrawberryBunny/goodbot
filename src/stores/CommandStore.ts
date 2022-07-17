import CommandNode from "../CommandNode";
import * as Constants from "../constants";
import { PaymentResult, PersonData } from "./PeopleStore";
import { channelStore, clientStore, peopleStore, spermBankStore, statsStore } from ".";

export default class CommandStore {

    private commandMap: { [name: string]: CommandNode } = {};
    
    constructor(){
        this.CreateCommands();
    }

    public GetCommand(keyword: string): CommandNode {
        return this.commandMap[keyword.toLowerCase()];
    }

    public GetHelp(keyword: string): string{
        return this.commandMap[keyword.toLowerCase()].Help();
    }

    public Process(person: PersonData, sender: string, args: string[]): boolean {
        // Fetch command
        let cn: CommandNode = this.commandMap[args[0].toLowerCase()];
        if(cn == null || cn == undefined){
            return false;
        }

        // Begin
        cn.Process(person, sender, args, 0);
        return true;
    }

    public GetCommandList(): string[] {
        let list: string[] = [];
        for(let command in this.commandMap){
            list.push(command);
        }
        return list;
    }

    private CreateCommands(): void {
        // List -----------------------------------
        let cn: CommandNode = new CommandNode("list",
            "Lists all available commands.",
            "Lists all available commands.",
            (pd: PersonData, sender: string, args: string[]) => {
                let msg: string = "Available commands:\nSay [color=cyan]help <command>[/color] for help on individual commands.\n\n";
                let keys: string[] = Object.keys(this.commandMap);
                for(let i = 0; i < keys.length; i++) {// command in this.commandMap){
                    let nmsg = "[color=cyan][b]" + keys[i] + "[/b][/color]:  ";
                    nmsg += `[color=gray]${this.commandMap[keys[i]].Description()}[/color]`;
                    if(i != keys.length - 1) nmsg += "\n";
                    msg += nmsg;
                }
                clientStore.SendPM(sender.trim(), msg);
            }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Help ---------------------------------------------------------------
        let helpMessage: string = `Use help command to get help for a specific command.\r
        Commands are shown as [command subcommand <option>]\r
        Not all commands require subcommands so just say the main command alone.\r
        Items in <brackets> are options where you can specify things like character names or items. Do not include brackets, just write the option as you normally would.`;

        cn = new CommandNode("help", 
        "Displays help messages for all the different commands.",
        helpMessage,
            (pd: PersonData, sender: string, args: string[]) => {
                if(args.length < 2 || args[1].length == 0){
                    clientStore.SendPM(sender, helpMessage);
                    return;
                }

                let cn: CommandNode = this.commandMap[args[1]];
                if(cn == null){
                    clientStore.SendPM(sender, "Could not find any command called " + args[1]);
                    return;
                }

                clientStore.SendPM(sender, cn.Help());
            }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Hi ---------------------------------------------------------------
        cn = new CommandNode("hi", 
        "Just says hi.",
        "This is just a command that responds to [color=cyan]hi[/color].", 
        (pd: PersonData, sender: string, args: string[]) => {
            clientStore.SendPM(sender, "Hi! I am a bot! Say [color=cyan]list[/color] for a list of commands.");
        }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Pet --------------------------------------------------
        cn = new CommandNode("pet", 
        "Pet the pupper!", 
        "Who's a good pupper?", 
        (pd: PersonData, sender: string, args: string[]) => {
            clientStore.SendPM(sender, Constants.PET_RESPONSES[Math.floor(Math.random() * Constants.PET_RESPONSES.length)]);
        }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // PM Permission ---------------------------------------------------
        cn = new CommandNode("grant",
        "Grants permission for GoodBot to send you unsolicited PMs.",
        "Using this command will grant GoodBot permission to message you.\r\nYou can revoke that permission by using the [color=cyan]revoke[/color] command.",
        (pd: PersonData, sender: string, args: string[]) => {
            if(peopleStore.CheckPermission(sender, Constants.PERM_PM)) {
                clientStore.SendPM(sender, "You have already granted GoodBot to send you unsolicited private messages.\r\nTo revoke this permission say [color=cyan]revoke[/color]");
                return;
            }
            else {
                peopleStore.GrantPermission(sender, Constants.PERM_PM);
                clientStore.SendPM(sender, "Thanks! I'll now message you with updates related to my tools & games.");
                return;
            }
        }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        cn = new CommandNode("revoke",
        "Revokes permission for GoodBot to send you unsolicited PMs.",
        "Using this command will stop GoodBot from messaging you with updates.\r\nYou can grant that permission again by using the [color=cyan]grant[/color] command.",
        (pd: PersonData, sender: string, args: string[]) => {
            if(!peopleStore.CheckPermission(sender, Constants.PERM_PM)) {
                clientStore.SendPM(sender, "GoodBot does not have permission to send you PMs. If there is a problem please [url=https://www.f-list.net/read_notes.php?send=GoodBot]send a note to the GoodBot profile.[/url]");
                return;
            }
            else {
                peopleStore.RemovePermission(sender, Constants.PERM_PM);
                clientStore.SendPM(sender, "Thank you. You will no longer received unsolicited PMs.\r\nMessages for you will be queued until the next time you choose to speak to me. Just say any old thing and I'll give you any messages I have.");
                return;
            }
        }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Invites ==================================================================
        cn = new CommandNode("invites", 
        `Allow or deny GoodBot from being invited to your channel.`,
        `Channel owners can use this command to allow or deny their channel operators from sending the bot invites to their channel.\r\n
        [b]This command is only usable by channel owners.[/b]\r
        [color=cyan]invites allow <channel code>[/color] Will allow your channel operators to invite the bot to the specified channel.\r
        [color=cyan]invites deny <channel code>[/color] Will disallow your channel operators from inviting the bot to the specified channel\r
        [i]To get your channel code say /code in your channel and it will be copied to your clipboard.[/i]`,
        (pd: PersonData, sender: string, args: string[]) => {
            clientStore.SendPM(sender, this.commandMap["invites"].Help());
        }, 
        [
            new CommandNode("allow", "desc", "help", (pd: PersonData, sender: string, args: string[]) => {
                if(args.length < 3) {
                    clientStore.SendPM(sender, "Sorry, you must provide a valid channel code for the channel. To get it type /code in your channel and it will be copied to your clipboard.");
                    return;
                }
                channelStore.RequestAllowInvites(sender, args[2]);
            }, null),
            new CommandNode("deny", "desc", "help", (pd: PersonData, sender: string, args: string[]) => {
                if(args.length < 3) {
                    clientStore.SendPM(sender, "Sorry, you must provide a valid channel code for the channel. To get it type /code in your channel and it will be copied to your clipboard.");
                    return;
                }
                channelStore.RequestDenyInvites(sender, args[2]);
            }, null),
        ]);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Sperm Bank -------------------------------------------------------
        cn = new CommandNode("spermbank", 
        "Deposit or withdraw samples from the bank!",
        `The bot can make quick runs to the local Sperm Bank for you. You may donate or retrieve a nice thick helping with the following commands.\r\n
        [color=cyan]spermbank status[/color] Will display the Sperm Bank's current stocks.\r
        [color=cyan]spermbank donate <container>[/color] Will donate a nice load from you to the Sperm Bank. Be sure to specify what kind of container you've splashed it in to.\r
        [color=cyan]spermbank withdraw[/color] Will retrieve a random donation from the Sperm Bank for you to do what you want with.`, 
        (pd: PersonData, sender: string, args: string[]) => {
            clientStore.SendPM(sender, this.commandMap["spermbank"].Help());
        }, 
        [
            new CommandNode("status", 
                "Information about the current stock.", 
                "Just say [color=cyan]spermbank status[/color]", 
                (pd: PersonData, sender: string, args: string[]) => {
                    let status = spermBankStore.Status();
                    clientStore.SendPM(sender, `The Sperm Bank currently contains ${status.samples} samples from ${status.donors} donors.`);
                }, null),
            new CommandNode("donate", 
                "Make a deposit.", 
                "[color=cyan]spermbank donate <container>[/color] Will donate a nice load from you to the Sperm Bank. Be sure to specify what kind of container you've splashed it in to.", 
                (pd: PersonData, sender: string, args: string[]) => {
                    if(args == null || args.length < 2 || args[2] == null || args[2].length < 1){
                        clientStore.SendPM(sender, "You must specify what container your donation is in. For example: donate condom, donate film canister, donate onahole");
                        return;
                    }

                    // build container
                    let container: string = "";
                    for(let i = 2; i < args.length; i++){
                        if(i != 2) container += " ";
                        container += args[i];
                    }

                    spermBankStore.Donate(sender, container);
                }, null),
            new CommandNode("withdraw", 
                `Withdraw a random specimin of ${Constants.RandomSpermSynonym()} from the bank.`,
                "[color=cyan]spermbank withdraw[/color] Will retrieve a random donation from the Sperm Bank for you to do what you want with.", 
                (pd: PersonData, sender: string, args: string[]) => {
                    spermBankStore.Retrieve(sender);
                }, null)
        ]);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Wallet --------------------------------------------------------
        cn = new CommandNode("wallet", 
        "Make and receive payments with fictional currency.",
        `Roleplay value only. Never involve real money. Check F-List's [url=https://wiki.f-list.net/Code_of_Conduct#Out-of-Character_Violations]rules for Out-of-Character violations[/url] for clarification.
        You can pay money to others or check your wallet with the following commands.

        [color=cyan]wallet status[/color] Will display the your account balance.
        [color=cyan]wallet pay <Amount> <User>[/color] Will transfer the amount to the user in question. The user will be informed only if they have given conset for GoodBot to send them private messages.`,  
        (pd: PersonData, sender: string, args: string[]) => {
            clientStore.SendPM(sender, this.commandMap["wallet"].Help());
        }, 
        [
            new CommandNode("status", "desc", "help", (pd: PersonData, sender: string, args: string[]) => {
                clientStore.SendPM(sender, `[b][color=pink]You current balance is: ${Constants.ToCurrencyDisplay(pd.wallet)}[/color][/b]`);
                return;
            }, null),
            new CommandNode("pay", "desc", "help", (pd: PersonData, sender: string, args: string[]) => {
                console.log("Args: " + args.length + ", " + args);
                if(args == null || args.length < 4 || args[2] == null || args[2].length < 1 || args[3] == null || args[3].length < 3){
                    clientStore.SendPM(sender, `You must include an amount and a name.

                    Format: [color=cyan]wallet pay <amount> <character name>[/color]
                    For example: [color=cyan]wallet pay 1000 Some Person[/color]`);
                    return;
                }

                // parse amount
                let amount: number = parseInt(args[2]);
                if(amount == NaN) {
                    clientStore.SendPM(sender, `You must include an amount and a name.

                    Format: [color=cyan]wallet pay <amount> <character name>[/color]
                    For example: [color=cyan]wallet pay 1000 Some Person[/color]`);
                    return;
                }

                // Build receiver
                let receiver: string = "";
                for(let i = 3; i < args.length; i++){
                    if(i != 3) receiver += " ";
                    receiver += args[i];
                }

                
                let pr: PaymentResult = peopleStore.Pay(sender, receiver, amount);
                switch(pr.err) {
                    case "rejectedneverseen":
                        clientStore.SendPM(sender, `Sorry but I can't transfer ${Constants.CURRENCY_NAME} to people who I've never interacted with before.`);
                        break;
                    case "rejectednotenoughfunds":
                        clientStore.SendPM(sender, `Sorry but you cannot afford that transaction. To see you current ${Constants.CURRENCY_NAME} say [color=cyan]wallet status[/color]`);
                        break;
                    case "rejectedinvalidamount":
                        clientStore.SendPM(sender, `Sorry but the amount specified was not valid. Please use [color=cyan]help wallet[/color] for more information.`);
                        break;
                    case "none":
                        clientStore.SendPM(sender, `Payment complete.`);
                        peopleStore.GetPersonData(sender).walletTransactions.push([ sender, receiver, amount.toString() ])
                        break;
                    default:
                        throw new Error("Unhandled payment result.");
                }
            }, null)
        ]);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Stats Command =============================================================
        cn = new CommandNode("stats", 
        `Lists various stats about ${Constants.BOT_NAME}`,
        `Just say [color=cyan]stats[/color]`, 
        (pd: PersonData, sender: string, args: string[]) => {
            let message: string = statsStore.CreateStatsMessage();
            clientStore.SendPM(sender, message);
        }, null);
        this.commandMap[cn.keyword.toLowerCase()] = cn;

        // Test Command =============================================================
        cn = new CommandNode("test1", 
        "Just a test command",
        "Just a test command", 
        (pd: PersonData, sender: string, args: string[]) => {
            //clientStore.SendRequestChannelOps("adh-5ebffa33f87bcf9c14bb");
        }, null);
        //this.commandMap[cn.keyword.toLowerCase()] = cn;
    }
}