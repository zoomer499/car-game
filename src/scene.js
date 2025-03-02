import * as THREE from 'three';

export let scene, camera;

export function initScene() {
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 3, 6);
    camera.lookAt(0, 1, 0);
    camera.updateProjectionMatrix();

    const hemiLight = new THREE.HemisphereLight(0xaaaaaa, 0x444444, 0.6);
    scene.add(hemiLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);
}