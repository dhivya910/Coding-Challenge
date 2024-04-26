import { Request, Response } from "express";
import * as fs from "fs";
import express = require("express");

const app = express();

interface City {
  name: string;
  population: number;
  area: number;
}

const jsonData: Buffer = fs.readFileSync("./public/documents/cities.json");
const citiesFromJSON: City[] = JSON.parse(jsonData.toString());
const cities: City[] = citiesFromJSON;

app.use(express.json());
export default class UserController {
  //gets all the cities with the density field
  public getAllCities = async (req: Request, res: Response): Promise<any> => {
    try {
      const citiesWithDensity = cities.map((city) => ({
        ...city,
        density: city.population / city.area,
      }));

      //sort
      const sortBy: string = (req.query.sortBy as string) || "name";
      const sortOrder: string = (req.query.sortOrder as string) || "asc";

      let sortedCities: City[] = [...citiesWithDensity];
      if (sortOrder == "asc") {
        sortedCities.sort((a: City, b: City) => {
          if (a[sortBy] < b[sortBy]) {
            return -1;
          } else if (a[sortBy] > b[sortBy]) {
            return 1;
          } else {
            return 0;
          }
        });
      } else {
        sortedCities.sort((a: City, b: City) => {
          if (a[sortBy] > b[sortBy]) {
            return -1;
          } else if (a[sortBy] < b[sortBy]) {
            return 1;
          } else {
            return 0;
          }
        });
      }

      //pagination
      const page: number = parseInt(req.query.page as string) || 1;
      const limit: number = parseInt(req.query.limit as string) || 20;
      const startIndex: number = (page - 1) * limit;
      const endIndex: number = page * limit;
      const totalPages: number = cities.length;

      const paginatedCities: City[] = sortedCities.slice(
        startIndex,
        endIndex
      );
      res.json({ paginatedCities, totalPages });

    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  //creates a city
  public addCity = async (req: Request, res: Response): Promise<any> => {
    try {
      const { name, population, area } = req.body;
      if (!name || !population || !area) {
        return res.status(400).json({
          error: "Please provide name, population, and area for the city",
        });
      }

      const populationNumber = parseInt(population);
      const areaNumber = parseFloat(area);

      if (isNaN(populationNumber) || isNaN(areaNumber)) {
        return res
          .status(400)
          .json({ error: "Population and area must be numbers" });
      }

      const newCity = {
        name: name,
        population: populationNumber,
        area: areaNumber,
      };
      cities.push(newCity);
      res.status(201).json(newCity);
      
    } catch (e) {
      console.error(e);
      res.status(500).send({
        success: false,
        message: e.toString(),
      });
    }
  };

  //filter the cities using contains
  public getAllCitiesbyFilter = async (
    req: Request,
    res: Response
  ): Promise<any> => {
    const contains: string = (req.query.contains as string)
      ? req.query.contains.toString().toLowerCase()
      : "";
    const filteredCities: City[] = cities.filter((city: City) =>
      city.name.toLowerCase().includes(contains)
    );
    res.json(filteredCities);
  };
}
