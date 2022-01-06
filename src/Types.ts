export interface ITicket {
    ticket: string;
    error: string;
}

export interface ICharacter {
    name: string;
    gender: string;
}

export interface IOfficialChannel {
    name: string;
    mode: string;
    characters: number;    
}

export interface IUnofficialChannel {
    name: string;
    characters: number;
    title: string;
    owner: string;
    moderators: string[]
}

export enum Permission {
    Unknown, Requested, Given
}

export enum ChannelMode {
    Chat, Ads, Both
}