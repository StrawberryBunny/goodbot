import * as Types from "../Types";
import * as Packets from "../packets";
import { channelStore, clientStore, peopleStore } from ".";
import { ShowErrorDialog } from "../ElectronUtils";
import { MESSAGE_ALLOW_INVITES_ACCEPTED, MESSAGE_DENY_INVITES_ACCEPTED, MESSAGE_REJECT_ALLOW_INVITES_REQUEST, MESSAGE_REJECT_DENY_INVITES_REQUEST } from "../constants";

interface IChangeInviteRequest {
    character: string,
    channel: string
}

export default class ChannelStore
{
    private unofficial: { [name: string]: Types.IUnofficialChannel } = {};
    private allowInvitesRequests: IChangeInviteRequest[] = [];
    private denyInvitesRequests: IChangeInviteRequest[] = [];

    public ReceiveList(p: Packets.IReceivePacketORS): void {
        let c: Types.IUnofficialChannel;
        for(let i = 0; i < p.channels.length; i++) {
            c = p.channels[i];
            this.unofficial[c.name] = c;
        }
        console.log(`Received ${p.channels.length} unofficial channels. New total: ${this.unofficial.length}.`);
    }

    public UpdateChannelTitle(channel: string, title: string): void {
        this.unofficial[channel].title = title;
    }

    public UpdateChannelModInformation(channel: string, oplist: string[]): void {
        if(oplist == null || oplist.length == 0) ShowErrorDialog("Error", `Received channel mod information for ${channel} with no mods.`);

        // Does the channel exist?
        if(this.unofficial[channel] == null) {
            this.unofficial[channel] = {
                name: channel,
                characters: 0,
                moderators: [],
                owner: null,
                title: ""
            };
        }

        // Update
        this.unofficial[channel].owner = oplist[0];
        this.unofficial[channel].moderators = oplist.length > 1 ? oplist : null;

        //console.log("Channel information updated for " + channel + ", modlist: " + oplist);

        // Check requests
        for(let i = this.allowInvitesRequests.length - 1; i >= 0; i--) {
            if(this.allowInvitesRequests[i].channel == channel) {
                let air: IChangeInviteRequest = this.allowInvitesRequests[i];
                this.allowInvitesRequests.splice(i, 1);

                // Is this user the owner?
                if(this.unofficial[air.channel].owner == air.character) {
                    // Grant
                    peopleStore.GrantPermission(air.character, air.channel.toLowerCase());
                    // PM
                    clientStore.SendPM(air.character, MESSAGE_ALLOW_INVITES_ACCEPTED);
                    continue;
                }

                // Reject
                clientStore.SendPM(air.character, MESSAGE_REJECT_ALLOW_INVITES_REQUEST);
            }
        }

        for(let i = this.denyInvitesRequests.length - 1; i >= 0; i--) {
            if(this.denyInvitesRequests[i].channel == channel) {
                let air: IChangeInviteRequest = this.denyInvitesRequests[i];
                this.denyInvitesRequests.splice(i, 1);

                // Is this user the owner?
                if(this.unofficial[air.character].owner == air.character) {
                    // Revoke
                    peopleStore.RemovePermission(air.character, air.channel.toLowerCase());
                    // PM
                    clientStore.SendPM(air.character, MESSAGE_DENY_INVITES_ACCEPTED);
                    continue;
                }

                // Reject
                clientStore.SendPM(air.character, MESSAGE_REJECT_DENY_INVITES_REQUEST);
            }
        }
    }

    public RequestAllowInvites(character: string, channel: string): void {
        this.allowInvitesRequests.push({
            channel: channel,
            character: character
        });
        clientStore.RequestChannelModInformation(channel);
    }

    public RequestDenyInvites(character: string, channel: string): void {
        this.denyInvitesRequests.push({
            channel: channel,
            character: character
        });
        clientStore.RequestChannelModInformation(channel);
    }

    public IsOwner(channel: string, character: string): boolean {
        if(this.unofficial[channel] == null) ShowErrorDialog("Error", `Trying to check owner of ${channel} with no channel information.`);
        if(this.unofficial[channel].owner == null || this.unofficial[channel].owner.length < 3) ShowErrorDialog("Error", `Trying to check owner of ${channel} with no owner information.`);
        return this.unofficial[channel].owner == character;
    }

    public IsOp(channel: string, character: string): boolean {
        if(this.unofficial[channel] == null) ShowErrorDialog("Error", `Trying to check ops of ${channel} with no channel information`);
        if(this.unofficial[channel].moderators == null) return false;
        return this.unofficial[channel].moderators.indexOf(character) != -1;
    }

    public IsOwnerOrOp(channel: string, character: string): boolean {
        return this.IsOwner(channel, character) || this.IsOp(channel, character);
    }

    public GetOwner(channel: string): string {
        if(this.unofficial[channel] == null) ShowErrorDialog("Error", `Trying to get owner of ${channel} with no channel information.`);
        if(this.unofficial[channel].owner == null || this.unofficial[channel].owner.length < 3) ShowErrorDialog("Error", `Trying to get owner of ${channel} with no owner information.`);
        return this.unofficial[channel].owner;
    }

    public GetTitle(channel: string): string {
        return this.unofficial[channel].title;
    }
}