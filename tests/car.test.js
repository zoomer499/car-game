import { createCar, setRearLights } from '../src/main.js';
import * as THREE from 'three';

jest.mock('three');

describe('Car Tests', () => {
    let car;

    beforeEach(() => {
        car = createCar();
    });

    test('Car should be created with the correct structure', () => {
        expect(car).toBeDefined();
        expect(car.children.length).toBeGreaterThan(0);
    });

    test('Rear lights should turn ON when braking', () => {
        setRearLights(true);
        car.rearLights.forEach(light => {
            expect(light.material.emissive.getHex()).toBe(0xff0000);
        });
    });

    test('Rear lights should turn OFF when not braking', () => {
        setRearLights(false);
        car.rearLights.forEach(light => {
            expect(light.material.emissive.getHex()).toBe(0x000000);
        });
    });
});