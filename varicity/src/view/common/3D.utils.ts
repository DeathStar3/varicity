import { Matrix, Mesh, Quaternion, Vector3 } from "@babylonjs/core";

export abstract class D3Utils {
    static facePoint(rotatingObject: Mesh, pointToRotateTo: Vector3) {
        // a directional vector from one object to the other one
        const direction = pointToRotateTo.subtract(rotatingObject.position);

        if (!rotatingObject.rotationQuaternion) {
            rotatingObject.rotationQuaternion = Quaternion.Identity();
        }

        direction.normalize();

        let mat = Matrix.Zero();

        let upVec = Vector3.Up();

        let xaxis = Vector3.Cross(direction, upVec);
        let yaxis = Vector3.Cross(xaxis, direction);

        mat.addAtIndex(0, xaxis.x);
        mat.addAtIndex(1, xaxis.y);
        mat.addAtIndex(2, xaxis.z);

        mat.addAtIndex(4, direction.x);
        mat.addAtIndex(5, direction.y);
        mat.addAtIndex(6, direction.z);

        mat.addAtIndex(8, yaxis.x);
        mat.addAtIndex(9, yaxis.y);
        mat.addAtIndex(10, yaxis.z);

        Quaternion.FromRotationMatrixToRef(mat, rotatingObject.rotationQuaternion);
    }
}