import { Raycaster, Vector2 } from 'three';

export function createRaycaster(scene) {
    const raycaster = new Raycaster();
    const pointer = new Vector2();

    function getIntersections(event, camera) {
        let clientX, clientY;
        if (event.changedTouches) {
            clientX = event.changedTouches[0].clientX;
            clientY = event.changedTouches[0].clientY;
        } else {
            clientX = event.clientX;
            clientY = event.clientY;
        }

        pointer.x = (clientX / window.innerWidth) * 2 - 1;
        pointer.y = -(clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        return raycaster.intersectObjects(scene.children, true);
    }

    return { getIntersections };
}

