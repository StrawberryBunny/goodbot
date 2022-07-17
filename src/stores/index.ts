import UserStore from "./UserStore";
import PeopleStore from "./PeopleStore";
import ClientStore from "./ClientStore";
import CommandStore from "./CommandStore";
import SpermBankStore from "./SpermBankStore";
import TrayStore from "./TrayStore";
import ChannelStore from "./ChannelStore";
import StatsStore from "./StatsStore";
import SoggyBiscuitStore from "./SoggyBiscuitStore";

export const userStore: UserStore = new UserStore();
export const peopleStore: PeopleStore = new PeopleStore();
export const clientStore: ClientStore = new ClientStore();
export const commandStore: CommandStore = new CommandStore();
export const spermBankStore: SpermBankStore = new SpermBankStore();
export const trayStore: TrayStore = new TrayStore();
export const channelStore: ChannelStore = new ChannelStore();
export const statsStore: StatsStore = new StatsStore();
export const soggyBiscuitStore: SoggyBiscuitStore = new SoggyBiscuitStore();