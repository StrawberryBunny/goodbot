import * as fs from "fs-extra";

export default class StatsStore {
    
    private stats: {} = {};

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

    private Load(): void {
        if(fs.existsSync("data/spermbank.json")){
            let str: string = fs.readFileSync("data/spermbank.json", "utf8");
            this.stats = JSON.parse(str);
        }
    }

    private Save(): void {
        fs.writeFileSync("data/stats.json", JSON.stringify(this.stats, null, 4), "utf8");
    }
}