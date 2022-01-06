import { app, Tray, Menu } from "electron";
import * as path from "path";

export default class TrayStore {

    private tray: Tray = null;

    public CreateTray(): void
    {
        let menu: Menu = Menu.buildFromTemplate([
            {
                label: "Quit",
                click: () => {
                    app.quit();
                }
            }
        ]);

        let fullPath: string = path.join(__dirname, "..", "..", `icons/black/icon16.ico`);
        this.tray = new Tray(fullPath);
        this.tray.setToolTip("GoodBot");
        this.tray.setContextMenu(menu);
    }

    public UpdateTray(gotTicket: boolean, connected: boolean, identified: boolean): void
    {
        this.tray.setImage(path.join(__dirname, "..", "..", `icons/${identified ? 'green' : connected ? 'blue' : gotTicket ? 'red' : 'blue'}/icon16.ico`));
    }
}