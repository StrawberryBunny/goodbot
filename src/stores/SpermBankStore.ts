import * as fs from "fs";
import { peopleStore, clientStore, statsStore } from ".";
import * as Constants from "../constants";
import { PersonData } from "./PeopleStore";

export default class SpermBankStore {

    private donors: { [name: string]: Donation[] } = {};

    constructor() {
        this.Load();
    }

    private Load(): void {
        if(fs.existsSync("data/spermbank.json")){
            let str: string = fs.readFileSync("data/spermbank.json", "utf8");
            this.donors = JSON.parse(str);
        }
    }

    private Save(): void {
        fs.writeFileSync("data/spermbank.json", JSON.stringify(this.donors, null, 4), "utf8");
    }

    public Status() {
        let samples: number = 0;
        let keys: string[] = Object.keys(this.donors);
        for(let i = 0; i < keys.length; i++){
            samples += this.donors[keys[i]].length;
        }

        return {
            donors: Object.keys(this.donors).length,
            samples: samples
        }
    }

    public Donate(character: string, container: string): void {
        let pd: PersonData = peopleStore.GetPersonData(character.trim());
        if(this.donors[pd.name] == null || this.donors[pd.name] == undefined){
            this.donors[pd.name] = [];
        }

        // TODO add gender checkings

        this.donors[pd.name].push({
            donor: pd.name,
            container: container.toLowerCase().trim()
        });

        clientStore.SendPM(character, `/me scurries up and takes the ${container} of steaming ${Constants.RandomSpermSynonym()}. It thanks you for your donation with a bork.`);

        console.log(`${character} has donated to the spermbank.`);

        this.Save();

        statsStore.AddToStat("SpermBank Donations", 1, true);
    }

    public Retrieve(character: string): void {
        // Copy the donor list
        let newList: { [name: string]: Donation[] } = { ...this.donors };

        // And remove the requesting character from it.
        if(Object.keys(newList).includes(character)) {
            delete newList[character];
        }

        // If there are no other donors
        if(Object.keys(newList).length == 0) {
            clientStore.SendPM(character, "Sorry but there are no donations currently available. Encourage your friends to donate today!");
            return;
        }

        // Select a random donor
        let pickArray: string[] = Object.keys(newList);
        let donor: string = pickArray[Math.floor(Math.random() * pickArray.length)];

        // Select one of this donor's loads at random
        let index: number = Math.floor(Math.random() * this.donors[donor].length);
        let donation: Donation = this.donors[donor][index];

        // Remove
        this.donors[donor].splice(index, 1);

        // Inform the user
        clientStore.SendPM(character, `/me delivers a ${donation.container} of ${Constants.RandomSpermSynonym()} donated by [icon]${donor}[/icon]`);

        // Inform the donator
        peopleStore.AddMessage(donor, `[icon]${character}[/icon] has taken delivery of your ${donation.container} of ${Constants.RandomSpermSynonym()}. Please donate again soon.`);

        console.log(`${character} has taken ${donation.donor}'s donation.`);

        // Clean up
        if(this.donors[donor].length == 0){
            delete this.donors[donor];
        }

        // Save
        this.Save();

        statsStore.AddToStat("SpermBank Withdrawals.", 1, true);
    }
}

interface Donation {
    donor: string,
    container: string
}