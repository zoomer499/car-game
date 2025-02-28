import { jest } from '@jest/globals';
jest.mock("three");
import { createCar } from "../src/main.js";
import * as THREE from "three";

describe("Car", () => {
  it("should be created with correct structure", () => {
    const car = createCar();
    expect(car.children.length).toBeGreaterThan(0);
  });

  it("should have rear lights", () => {
    const car = createCar();
    expect(car.rearLights.length).toBe(2);
  });
});