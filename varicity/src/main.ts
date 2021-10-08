import { UIController } from './controller/ui/ui.controller';
import { ConfigLoader } from './controller/parser/configLoader';
import { FilesLoader } from './controller/parser/filesLoader';

class Main {

    constructor() {
        let keys = FilesLoader.getAllFilenames();

        let config = ConfigLoader.loadDataFile("config");

        UIController.initSearchbar();
        UIController.createConfig(config);
        UIController.createDoc();
        UIController.createProjectSelector(keys);
        UIController.createLogs();
    }
}
new Main();