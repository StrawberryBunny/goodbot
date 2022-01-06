export const SERVER_ADDRESS: string = "wss://chat.f-list.net/chat2:9799";
export const TEST_SERVER_ADDRESS: string = "wss://chat.f-list.net/chat2:8799";

export const BOT_NAME: string = "GoodBot";

export const CURRENCY_NAME: string = "fakebux";
export const CURRENCY_PRE: string = "";
export const CURRENCY_POST: string = "F";

export const STATUS_MESSAGE: string = "In development. That means frequent restarts and interruptions.";

export function ToCurrencyDisplay(amount: number): string {
    return "[color=pink][b]" + CURRENCY_PRE + amount + CURRENCY_POST + "[/b][/color]";
}

export const SPERM_SYNONYMS: string[] = [
    "cum", "nut", "spooge", "jizm", "cream", "nut butter", "baby batter", 
    "jizz", "ejaculate", "sperm", "spunk", "semen", "seed", "spluge", 
    "seminal fluid", "climax", "baby gravy", "jizzum", "jizz", "load",
    "pole milk", "protein shake", "shlong juice", "trouser gravy", "two-ball compound",
    "two-ball throat cream", "wad" ];

export function RandomSpermSynonym(): string {
    return SPERM_SYNONYMS[Math.floor(Math.random() * SPERM_SYNONYMS.length)];
}

export const PERM_PM: string = "PM";

export const PET_RESPONSES: string[] = [
    `/me jumps, borks and then runs around in a circle.`,
    `/me sits and wags tail.`,
    `/me is a good pupper, yes he is.`
];

export const ERRCODE_IDENTIFICATION_FAILED: number = 4;

export const PM_LINE_SEPARATOR: string = "[b][color=purple]----------------------------[/color][/b]";

// Messsages =====================================================================
export const MESSAGE_UNRECOGNISED_COMMAND: string = "Sorry. I'm only a simple bot. I don't understand what you're saying. Say [color=cyan]list[/color] for a list of available commands.";
export const MESSAGE_FIRST_SEEN: string = `Hi there! Thanks for using GoodBot. Some notes...
    [b]1.[/b]
        [color=gray]Your interactions with this bot may be visible to other users.[/color]
    [b]2.[/b]
        [color=gray]The bot can message you with updates regarding the available tools and games.
        In order to do this F-List requires that bots get permission.
        To grant me permission to message you say [color=cyan]grant[/color]
        You can revoke this at any time by saying [color=cyan]revoke[/color][/color]
    [b]3.[/b]
        [color=gray]For a full list of commands say [color=cyan]list[/color]
        Thank you for using GoodBot. Leave comments, suggestions and bug reports in the guestbook.[/color]
    [b]4.[/b]
        [color=gray]Arf~[/color]`;
export const MESSAGE_REJECT_INVITE_NO_PERM_NOT_OWNER: string = "Sorry, I can only join channels if the channel owner gives me permission. Say [color=cyan]invites[/color] for more information.";
export const MESSAGE_REJECT_ALLOW_INVITES_REQUEST: string = "Sorry, only channel owners can grant permission for the bot to join their channel.";
export const MESSAGE_REJECT_DENY_INVITES_REQUEST: string = "Sorry, only channel owners can revoke permission for the bot to join their channel.";
export const MESSAGE_ALLOW_INVITES_ACCEPTED: string = "Your channel operators may now invite me to join your channel. To revoke this say [color=cyan]invites deny <channel code>[/color]";
export const MESSAGE_DENY_INVITES_ACCEPTED: string = "Your channel operators may no longer invite me to join your channel. Only you can."

