import { PersonData } from "./stores/PeopleStore";

export default class CommandNode {

    public keyword: string;
    public action: any;
    public description: string;
    public help: string;
    public children: CommandNode[];

    constructor(keyword: string, description: string, help: string, cb: any, children: CommandNode[]){
        this.keyword = keyword;
        this.action = cb;
        this.description = description;
        this.help = help;
        this.children = children;
    }

    public Process(person: PersonData, sender: string, args: string[], iteration: number): void {
        // Do any of the args match our children
        if(this.children != null && this.children.length > iteration){
            for(let i = 0; i < this.children.length; i++){
                if(this.children[i].keyword == args[iteration + 1]){
                    this.children[i].Process(person, sender, args, iteration + 1);
                    return;
                }
            }
        }

        // Fire action
        this.action(person, sender, args);
    }

    public Help(): string {
        return this.help;
    }

    public Description(): string {
        return this.description;
    }
}