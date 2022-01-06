import * as fs from "fs-extra";
import { clientStore } from ".";
import { ToCurrencyDisplay } from "../constants";

export const STAT_STATS_REQUESTED: string = "Stats Requested";
export const STAT_SPERMBANK_DONATIONS: string = "SpermBank Donations";
export const STAT_SPERMBANK_WITHDRAWALS: string = "SpermBank Withdrawals";
export const STAT_PAYMENTS_MADE: string = "Payments Made";
export const STAT_PAYMENTS_TOTAL: string = "Payments Total";

export default class StatsStore {
    
    private stats: {} = {};

    constructor() {
        this.Load();
    }

    public AddToStat(stat: string, amount: number, save: boolean): void 
    {
        if(this.stats[stat] == null) {
            this.stats[stat] = amount;
        }
        else {
            this.stats[stat] += amount;
        }
        if(save) this.Save();
    }

    public GetStat(stat: string): number {
        if(this.stats[stat] == null) return 0;
        return this.stats[stat];
    }

    private Load(): void {
        if(fs.existsSync("data/stats.json")){
            let str: string = fs.readFileSync("data/stats.json", "utf8");
            this.stats = JSON.parse(str);
        }
    }

    private Save(): void {
        fs.writeFileSync("data/stats.json", JSON.stringify(this.stats, null, 4), "utf8");
    }

    public CreateStatsMessage(): string {
        this.AddToStat(STAT_STATS_REQUESTED, 1, true);
        let uptime: number = new Date().getTime() - clientStore.connectionTime.getTime();
        let ts: string = timeConversion(uptime);
        let str: string = `GoodBot stats!        
        Uptime: ${ts}
        [color=yellow]${this.GetStat(STAT_SPERMBANK_DONATIONS)}[/color] donations and [color=yellow]${this.GetStat(STAT_SPERMBANK_WITHDRAWALS)}[/color] withdrawals at the sperm bank.
        [color=yellow]${this.stats[STAT_PAYMENTS_MADE]}[/color] total fictional payments made for a grand total ${ToCurrencyDisplay(this.GetStat(STAT_PAYMENTS_TOTAL))} transferred.
        Stats have been requested [color=yellow]${this.GetStat(STAT_STATS_REQUESTED)}[/color] times.`;
        return str;
    }
}

function timeConversion(duration: number) {
    const portions: string[] = [];
  
    const msInHour = 1000 * 60 * 60;
    const hours = Math.trunc(duration / msInHour);
    if (hours > 0) {
      portions.push(hours + 'h');
      duration = duration - (hours * msInHour);
    }
  
    const msInMinute = 1000 * 60;
    const minutes = Math.trunc(duration / msInMinute);
    if (minutes > 0) {
      portions.push(minutes + 'm');
      duration = duration - (minutes * msInMinute);
    }
  
    const seconds = Math.trunc(duration / 1000);
    if (seconds > 0) {
      portions.push(seconds + 's');
    }
  
    return portions.join(' ');
  }