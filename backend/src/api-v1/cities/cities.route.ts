import { Router } from "express";
import Controller from "./cities.controller";

const cities: Router = Router();
const controller = new Controller();

// Retrieve all Cities
cities.get("/", controller.getAllCities);
// Add a city
cities.post("/", controller.addCity);
// Retrieve cities by filter
cities.get("/filter", controller.getAllCitiesbyFilter);

export default cities;
