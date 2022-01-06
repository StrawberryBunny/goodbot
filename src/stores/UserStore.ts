import Axios from "axios";
import * as Types from "../Types";

export default class UserStore {

    public ticket:Types.ITicket;
    public logInTime: Date;

    public FetchTicket(username: string, password: string): Promise<Types.ITicket> {
        return new Promise((resolve, reject) => {
            Axios.post(`https://www.f-list.net/json/getApiTicket.php?account=${username}&password=${password}&no_characters=true&no_friends=true&no_bookmarks=true`)
                .then(response => {
                    this.ticket = response.data as Types.ITicket;
                    resolve(this.ticket);
                })
                .catch(err => {
                    console.error("Could not post for ticket: " + JSON.stringify(err));
                    reject(err);
                });
        });
    }
}