import { ApplicationModule } from "./modules/application.module";

const application = new ApplicationModule().init().start();

export default {
    fetch: application.fetch,
    port: 8080
}

