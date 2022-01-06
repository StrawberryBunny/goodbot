import { IOfficialChannel, IUnofficialChannel } from "./Types";

// Globals
export interface IIdentity {
    identity: string;
}

// Send Packets ---------------------------------------

// This command requires chatop or higher.
// Request a character's account be banned from the server
export interface ISendPacketACB {
    character: string;
}

// This command is admin only
// Promotes a user to be a chatop (global moderator)
export interface ISendPacketAOP {
    character: string;
}

// This command requires chatop or higher.
// Requests a list of currently connected alts for a character's account
export interface ISendPacketAWC {
    character: string;
}

// This command is admin only
// Broadcasts a message to all connections.
export interface ISendPacketBRO {
    message: string;
}

// This command requires channel op or higher.
// Request the channel banlist
export interface ISendPacketCBL {
    channel: string;
}

// This command requires channel op or higher.
// Bans a character from a channel
export interface ISendPacketCBU {
    character: string;
    channel: string;
}

// Create a private, invite-only channel
export interface ISendPacketCCR {
    channel: string;
}

// This command requires channel op or higher.
// Changes a channel's description
export interface ISendPacketCDS {
    channel: string;
    description: string;
}

// This command requires channel op or higher.
// Send an invitation for a channel to a user.
export interface ISendPacketCIU {
    channel: string;
    character: string;
}

// This command requires channel op or higher.
// Kicks a user from a channel
export interface ISendPacketCKU {
    channel: string;
    character: string;
}

// This command requires channel op or higher.
// Request a character be promoted to channel operator (channel moderator)
export interface ISendPacketCOA {
    channel: string;
    character: string;
}

// Requests the list of channel ops (channel moderators);
export interface ISendPacketCOL {
    channel: string;
}

// This command requires channel op or higher.
// Demotes a channel operator (channel moderator) to a normal user.
export interface ISendPacketCOR {
    channel: string;
    character: string;
}

// This command is admin only
// Creates an official channel
export interface ISendPacketCRC {
    channel: string;
}

// This command requires channel op or higher. 
// Set a new channel owner
export interface ISendPacketCSO {
    character: string;
    channel: string;
}

// This command requires channel op or higher.
// Temporarily bans a user from the channel for 1-90 minutes. A channel timeout.
export interface ISendPacketCTU {
    channel: string;
    character: string;
    length: number;
}

// This command requires channel op or higher.
// Unbans a user from a channel
export interface ISendPacketCUB {
    channel: string;
    character: string;
}

// This command is admin only
// Demotes a chatop (global moderator)
export interface ISendPacketDOP {
    character: string;
}

// Search for characters fitting the user's selections. Kinks is requied, all other parameters are 
// optional
export interface ISendPacketFKS {
    kinks: number[];
    genders?: string[];
    orientations?: string[];
    languages?: string[];
    furryprefs?: string[];
    roles?: string[];
}

// This command is used to dientify with the server
export interface ISendPacketIDN {
    method: string;
    account: string;
    ticket: string;
    character: string;
    cname: string;
    cversion: string;
}

// A multi-faceted command to handle actions related to the ignore list. 
// The server does not actually handle much of the ignore process, as it is 
// the client's responsibility to block out messages it recieves from the server 
// if that character is on the user's ignore list.
export interface ISendPacketIGN {
    action: string; // add/delete/notify/action
    character?: string;
} 

// Sends a channel join Request
export interface ISendPacketJCH {
    channel: string;
}

// This command requires chat op or higher.
// Request a character to be kicked from the server
export interface ISendPacketKIK {
    character: string;
}

// Request a list of a user's kinks.
export interface ISendPacketKIN {
    character: string;
}

// Request to leave a channel
export interface ISendPacketLCH {
    channel: string;
}

// Sends a chat ad to all other users in a channel
export interface ISendPacketLRP {
    channel: string;
    message: string;
}

// Sends a message to all other users in a channel.
export interface ISendPacketMSG {
    channel: string;
    message: string;
}

// Sends a private message to another user.
export interface ISendPacketPRI {
    recipient: string;
    message: string;
}

// Requests some of the profile tags on a character, such as Top/Bottom position and Language Preference.
export interface ISendPacketPRO {
    character: string;
}

// Roll dice or spin the bottle.
export interface ISendPacketRLL {
    channel: string;
    dice: string;
}

// This command requires chatop or higher.
// Reload certain server config files.
export interface ISendPacketRLD {
    save: string;
}

// This command requires channel op or higher.
// Change room mode to accept chat, ads or both.
export interface ISendPacketRMO {
    channel: string;
    mode: string; // chat/ads/both
}

// This command requires channel op or higher.
// Sets a private room's status to closed or open
export interface ISendPacketRST {
    channel: string;
    status: string; // public/private
}

// This command is admin only
// Rewards a user, setting their status to 'crown' until they change it or log out.
export interface ISendPacketRWD {
    character: string;
}

// Alerts admins and chatops (global moderators) of an issue.
export interface ISendPacketSFC {
    action: string;
    report: string;
    character: string;
}

// Request a new status be set for your character.
export interface ISendPacketSTA {
    status: string;
    statusmsg: string;
}

// This command requires chat op or higher.
// Times out a user for a given amount of minutes.
export interface ISendPacketTMO {
    character: string;
    time: number;
    reason: string;
}

// "user x is typing/stopped typing/has entered text" for private messages
export interface ISendPacketTPN {
    character: string;
    status: string; // clear/paused/typing
}

// This command requires chat op or higher.
// Unbans a character's account from the server
export interface ISendPacketUBN {
    character: string;
}


// Receive Packets -----------------------------------

// Sends the client the current list of chatops
export interface IReceivePacketADL {
    ops: string[];
}

// The given character has been promoted to chatops
export interface IReceivePacketAOP {
    character: string;
}

// Incoming admin broadcast
export interface IReceivePacketBRO {
    message: string;
}

// Alerts the client that the channel's description has changed. This is sent
// whenever a client sends a JCH to the server
export interface IReceivePacketCDS {
    channel: string;
    description: string;
}

// Sends the client a list of all public channels
export interface IReceivePacketCHA {
    channels: IOfficialChannel[];    
}


// Invites a user to a channel
export interface IReceivePacketCIU {
    sender: string;
    title: string; // The display name for the channel.
    name: string; // The channel ID/name.
}

// This command requires channel op or higher
// Removes a user from a channel and prevents them from re-entering
export interface IReceivePacketCBU {
    operator: string;
    channel: string;
    character: string;
}

// This command requires channel op or higher
// Kicks a user from a channel
export interface IReceivePacketCKU {
    operator: string;
    channel: string;
    character: string;
}

// This command requires channel op or higher
// Promotes a user to channel operator
export interface IReceivePacketCOA {
    character: string;
    channel: string;
}

// Gives a list of channel ops. Sent in response to JCH
export interface IReceivePacketCOL {
    channel: string;
    oplist: string[];
}

// After connecting and identifying you will receive CON command, giving the number of connected
// users to the network
export interface IReceivePacketCON {
    count: number;
}

// This command requires channel op or higher.
// Removes a channel operator
export interface IReceivePacketCOR {
    character: string;
    channel: string;
}

// Sets the owner of the current channel to the character provided
export interface IReceivePacketCSO {
    character: string;
    channel: string;
}

// Temporarily bans a user from the channel for 1-90 minutes. A channel timeout.
export interface IReceivePacketCTU {
    operator: string;
    channel: string;
    length: number;
    character: string;
}

// The given character has been stripped of chatop status.
export interface IReceivePacketDOP {
    character: string;
}

// Indicates that the given error has occurred
export interface IReceivePacketERR {
    message: string;
    number: number;
}

// Sent by as a response to the client's FKS command, containing the results of the search
export interface IReceivePacketFKS {
    characters: string[];
    kinks: number[];
}

// Sent by the server to inform the client a given character went offline.
export interface IReceivePacketFLN {
    character: string;
}

// Server hello command. Tells which server version is running and who wrote it.
export interface IReceivePacketHLO {
    message: string;
}

// Initial channel data. Received in response to JCH, along with CDS.
export interface IReceivePacketICH {
    users: IIdentity[];
    channel: string;
    mode: string; // ads/chat/both
}


// Used to inform the client their identification is successful and handily sends their 
// character name along with it
export interface IReceivePacketIDN {
    character: string;
}

// Indicates the given user has joined the given channel. This may also be the client's character.
export interface IReceivePacketJCH {
    character: IIdentity;
    channel: string;    
    title: string;
}

// Kinks data in response to a KIN command
export interface IReceivePacketKID {
    type: string; // start,custom,end
    message: string;
    key: number;
    value: number;
}

// An indicator that the given character has left the channel. This may also be the client's character
export interface IReceivePacketLCH {
    channel: string;
    character: string;
}

// Sends an array of all the online characters and their gender, status and status message.
export interface IReceivePacketLIS {
    characters: string[][];
}

// A user connected
export interface IReceivePacketNLN {
    identity: string;
    gender: string;
    status: string; // online/away/etc
}

// Handles the ignore list
export interface IReceivePacketIGN {
    action: string; // init/add/delete
    character?: string;
    characters?: string[];
}

// Initial friends list (combination of bookmarks and friends)
export interface IReceivePacketFRL {
    characters: string[];
}

// Gives a list of open private rooms
export interface IReceivePacketORS {
    channels: IUnofficialChannel[];
}

// Profile data commands sent in response to a PRO client command
export interface IReceivePacketPRD {
    type: string; // start/info/select/end
    message: string;
    key: string;
    value: string;
}

// A private message is received from another user
export interface IReceivePacketPRI { 
    character: string;
    message: string; // Max length 50000 characters
}

// A message is received from a user in a channel
export interface IReceivePacketMSG {
    character: string;
    channel: string;
    message: string;
}

// A roleplay ad is received from a user in a channel
export interface IReceivePacketLRP {
    character: string;
    channel: string;
    message: string;
}

// Rolls dice or spins the bottle
export interface IReceivePacketRLL {
    channel: string;
    character: string;
    type: string;
    message: string;

    // Roll only
    results?: number[];        
    rolls?: string[];    
    endresult?: number;
}

// Change room mode to accept chat, ads or both
export interface IReceivePacketRMO {
    mode: string; // chat/ads/both
    channel: string;
}

// Real-time bridge. Indicates the user received a note or message, right at the very moment this is
// received
export interface IReceivePacketRTB {
    type: string;
    character: string;
}

// Alerts admins and chatops (global moderators) of an issue.
export interface IReceivePacketSFC {
    action: string; // report/confirm
    character: string;
    timestamp: string;

    moderator?: string;
    callid?: number;
    report?: string;
    logid?: number;
}

// A user changed their status
export interface IReceivePacketSTA {
    status: string;
    character: string;
    statusmsg: string;
}

// An informative autogenerated message from the server. This is also the way the 
// server responds to some commands, such as RST, CIU, CBL, COL, and CUB. The server 
// will sometimes send this in concert with a response command, such as with SFC, COA, and COR.
export interface IReceivePacketSYS {
    message: string;
    channel?: string;
}

// A user informs you of his typing status
export interface IReceivePacketTPN {
    character: string;
    status: string; // clear/paused/typing
}

// Informs the client of the server's self-tracked online time, and a few other bits of information
export interface IReceivePacketUPT {
    time: number;
    starttime: number;
    startstring: string;
    accepted: number;
    channels: number;
    users: number;
    maxusers: number;
}

// Variables the server sends to inform the client about server variables
export interface IReceivePacketVAR {
    variable: string;
    value: any; // variable === 'icon_blacklist' ? value:string[] : value:number;
}