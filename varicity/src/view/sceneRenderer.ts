import { Config } from './../model/entitiesImplems/config.model';
import { Scene, Engine, ArcRotateCamera, HemisphericLight, Vector3 } from "@babylonjs/core";
import { EntitiesList } from "../model/entitiesList";

export abstract class SceneRenderer {

    scene: Scene;
    engine: Engine;
    config: Config;
    camera: ArcRotateCamera;
    light: HemisphericLight;
    entitiesList: EntitiesList;

    canvas: HTMLCanvasElement;

    constructor(config: Config, entitiesList: EntitiesList) {
        // create the canvas html element and attach it to the webpage
        this.canvas = document.createElement("canvas");
        // this.canvas.style.width = "100%";
        // this.canvas.style.height = "100%";
        this.canvas.id = "gameCanvas";
        document.getElementById("main").appendChild(this.canvas);

        // initialize babylon scene and engine
        this.engine = new Engine(this.canvas, true);
        this.scene = new Scene(this.engine);

        this.camera = new ArcRotateCamera("Camera", 2 * Math.PI / 3, Math.PI / 3, 500, Vector3.Zero(), this.scene);
        this.camera.attachControl(this.canvas, true);
        this.camera.panningSensibility = 10;
        this.light = new HemisphericLight("light1", new Vector3(0, 1, 0), this.scene);
        this.entitiesList = entitiesList;

        this.config = config;
        // this.config = ConfigLoader.loadDataFile("config");

        // document.getElementById("reset_camera").addEventListener("click", () => {
        //     this.camera.position = Vector3.Zero();
        //     this.camera.radius = 500;
        //     this.camera.alpha = 2 * Math.PI / 3;
        //     this.camera.beta = Math.PI / 3;
        // });

        // hide/show the Inspector
        window.addEventListener("keydown", (ev) => {
            // Shift+Ctrl+Alt+I
            if (ev.shiftKey && ev.ctrlKey && ev.altKey && ev.keyCode === 73) {
                if (this.scene.debugLayer.isVisible()) {
                    this.scene.debugLayer.hide();
                } else {
                    this.scene.debugLayer.show();
                }
            }
        });

        // run the main render loop
        this.engine.runRenderLoop(() => {
            this.scene.render();
        });
    }

    dispose(): void {
        this.scene.dispose();
        this.engine.dispose();
        this.canvas.remove();
    }

    abstract rerender(config: Config): SceneRenderer; //{
        // this.config = config;
        // this.scene.dispose();
        // this.engine.dispose();
        // this.engine = new Engine(this.canvas, true);
        // this.scene = new Scene(this.engine);
        // this.buildScene();
    // }

    abstract buildScene(): void;

    abstract render(): void;
}