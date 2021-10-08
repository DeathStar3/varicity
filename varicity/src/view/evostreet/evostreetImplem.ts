import { ArcRotateCamera, Vector3, HemisphericLight, Scene } from "@babylonjs/core";
import { City3D } from "./3Delements/city3D";
import { SceneRenderer } from "../sceneRenderer";
import { Config } from "../../model/entitiesImplems/config.model";

export class EvostreetImplem extends SceneRenderer {

    buildScene() {
        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera("Camera", 2 * Math.PI / 3, Math.PI / 3, 100, Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.panningSensibility = 100;
        this.camera.wheelPrecision = 50;
        this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);

        this.render();
    }

    rerender(config: Config): EvostreetImplem {
        this.dispose();
        return new EvostreetImplem(config, this.entitiesList);
    }

    render() {
        const city = new City3D(this.config, this.scene, this.entitiesList);
        city.build();
        city.place();
        city.render();
    }
}