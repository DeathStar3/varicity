import { Link3D } from '../3Dinterfaces/link3D.interface';
import { Config } from '../../../model/entitiesImplems/config.model';
import { Color3, Color4, MeshBuilder, Scene, Vector3 } from '@babylonjs/core';
import { Curve3, LinesMesh } from '@babylonjs/core';
import { Building3D } from './building3D';

export class Link3DImplem implements Link3D {
    scene: Scene;

    src: Building3D;
    dest: Building3D
    type: string;

    mesh: LinesMesh;

    force: boolean = false;

    curve: Curve3;

    config: Config

    constructor(src: Building3D, dest: Building3D, type: string, scene: Scene, config: Config) {
        this.src = src;
        this.dest = dest;
        this.type = type;
        this.scene = scene;
        this.config = config;
    }

    render(bool: boolean): void {
        if (!bool) {
            this.mesh.dispose();
            delete this.mesh;
            return;
        }
        this.curve = Curve3.CreateQuadraticBezier(this.src.top, this.src.top.add(new Vector3(0, (this.src.top.y + this.dest.top.y) / 2, 0)), this.dest.top, 25);

        let colors: Color4[] = [];
        let start = Color4.FromColor3(Color3.Red()); // default value
        let end = Color4.FromColor3(Color3.Black()); // darkens with distance

        if (this.config.link.colors) {
            for (let c of this.config.link.colors) {
                let done = false;
                if (c.name == this.type) {
                    start = Color4.FromColor3(Color3.FromHexString(c.color));
                    done = true;
                }
                if (done) break;
            }
        }

        for (let i = 0; i < this.curve.getPoints().length; i++) {
            colors.push(Color4.Lerp(start, end, i / this.curve.getPoints().length));
        }

        this.mesh = MeshBuilder.CreateLines("curve", { points: this.curve.getPoints(), colors: colors }, this.scene);
    }

    // render(config: Config): void {
    //     this.curve = Curve3.CreateQuadraticBezier(this.src.top, this.src.top.add(new Vector3(0, (this.src.top.y + this.dest.top.y) / 2, 0)), this.dest.top, 25);

    //     let colors: Color4[] = [];
    //     let start = Color4.FromColor3(Color3.Red()); // default value
    //     let end = Color4.FromColor3(Color3.Black()); // darkens with distance

    //     if (config.link.colors) {
    //         for (let c of config.link.colors) {
    //             let done = false;
    //             if (c.name == this.type) {
    //                 start = Color4.FromColor3(Color3.FromHexString(c.color));
    //                 done = true;
    //             }
    //             if(done) break;
    //         }
    //     }

    //     for (let i = 0; i < this.curve.getPoints().length; i++) {
    //             colors.push(Color4.Lerp(start, end, i/this.curve.getPoints().length));
    //     }

    //     this.mesh = MeshBuilder.CreateLines("curve", { points: this.curve.getPoints(), colors: colors }, this.scene);
    //     this.mesh.visibility = 0; // defaults at hidden

    //     // this.line = MeshBuilder.CreateLines("curve", {points: this.curve.getPoints()}, this.scene);
    //     // this.line.visibility = 0; // defaults at hidden
    //     // if(config.link.colors) {
    //     //     for(let c of config.link.colors) {
    //     //         if(c.name == this.type) {
    //     //             this.line.color = Color3.FromHexString(c.color);
    //     //             return;
    //     //         }
    //     //     }
    //     // }
    // }

    // hide(force?: boolean) {
    //     if(force) this.force = false;
    //     if(!this.force) this.line.visibility = 0;
    // }

    display(force?: boolean, show?:boolean) {
        if (force != undefined) this.force = force;
        // if (!this.force && this.mesh.visibility == 1) {
        if (!show && !this.force && this.mesh) {
            // this.mesh.visibility = 0;
            this.render(false);
        } else {
            if (show && ((force == undefined || this.force) && !this.mesh))
                this.render(true); // this.mesh.visibility = 1;
        }
        // this.line.visibility = 1;
    }
}