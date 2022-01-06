import { app, dialog } from "electron";
import { clientStore, trayStore, userStore } from "./stores";
import * as Constants from "./constants";
const username = require("../account.json").username;
const pass = require("../account.json").pass;

app.on("ready", () => {
    trayStore.CreateTray();

    userStore.FetchTicket(username, pass).then(ticket => {
        trayStore.UpdateTray(true, false, false);
        clientStore.Connect(Constants.BOT_NAME, ticket.ticket);
    }).catch(err => {
        console.error("There was a problem fetching the ticket.\n " + JSON.stringify(err));
        dialog.showErrorBox("Error", "There was a problem fetching the ticket.\n " + JSON.stringify(err));
        app.quit();
    });
});