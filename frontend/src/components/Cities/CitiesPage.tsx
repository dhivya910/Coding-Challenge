import React, { useState, useEffect } from "react";
import TablePagination from "@mui/material/TablePagination";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
} from "@mui/material";

interface City {
  name: string;
  population: number;
  area: number;
}

interface CityResponse {
  paginatedCities: City[];
  totalPages: number;
}

type Order = "asc" | "desc";

const CityTable: React.FC = () => {
  const [cities, setCities] = useState<City[]>([]);
  const [totalPages, settotalPages] = useState<number>(0);
  const [page, setPage] = React.useState(1);
  const [rowsPerPage, setRowsPerPage] = React.useState(25);
  const [filteredCity, setFilteredCity] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [newCity, setNewCity] = useState("");
  const [newPopulation, setNewPopulation] = useState("");
  const [newArea, setNewArea] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [sortOrder, setsortOrder] = React.useState<Order>("desc");
  const [sortBy, setsortBy] = React.useState<keyof City>("population");
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = async () => {
    const response = await fetch(
      `http://localhost:5000/filter?contains=${searchTerm}`
    );
    if (response.ok) {
      const data = await response.json();
      setFilteredCity(data);
    } else {
      console.error("Failed to fetch data");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const requestSort = (
    property: keyof City
  ) => {
    const isAsc = sortBy === property && sortOrder === "asc";
    setsortOrder(isAsc ? "desc" : "asc");
    setsortBy(property);
  };

  const handleAddCity = () => {
    setOpenDialog(true);
    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("http://localhost:5000/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newCity,
          population: newPopulation,
          area: newArea,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to add city");
      }
      const data = await response.json();
      setSuccessMessage("City added successfully");
      setOpenDialog(false);
      setNewCity("");
    } catch (error) {
      console.error("Error adding city:", error);
    }
  };

  useEffect(() => {
    fetchCities(sortBy,sortOrder);
  }, [page, rowsPerPage, sortBy, sortOrder]);

  const fetchCities = (sortBy: string, sortOrder: string) => {
    fetch(`http://localhost:5000/?page=${page}&limit=${rowsPerPage}&sortBy=${sortBy}&sortOrder=${sortOrder}`)
      .then((response) => response.json())
      .then((data: CityResponse) => {
        setCities(data.paginatedCities);
        settotalPages(data.totalPages);
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const filteredCities = cities.filter((city) =>
    city.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center" }}>
        <h2 style={{ marginRight: "auto" }}>City Data</h2>
        <Button
          variant="outlined"
          sx={{
            height: "55px",
            padding: "10px",
            margin: "10px",
          }}
          onClick={handleAddCity}
        >
          Add City
        </Button>
        <TextField
          label="Search city"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyPress}
        />
      </div>
      {successMessage && <Alert severity="success">{successMessage}</Alert>}
      <table>
        <thead>
          <tr>
            <th>
              Name
              <IconButton onClick={() => requestSort("name")}>
                {sortBy === "name" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpward />
                  ) : (
                    <ArrowDownward />
                  ))}
              </IconButton>
            </th>
            <th>
              Population
              <IconButton onClick={() => requestSort("population")}>
                {sortBy === "population" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpward />
                  ) : (
                    <ArrowDownward />
                  ))}
              </IconButton>
            </th>
            <th>
              Area
              <IconButton onClick={() => requestSort("area")}>
                {sortBy === "area" &&
                  (sortOrder === "asc" ? (
                    <ArrowUpward />
                  ) : (
                    <ArrowDownward />
                  ))}
              </IconButton>
            </th>
            <th>
              Density
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredCities.map((city) => (
            <tr
              key={city.name}
              className={city.population > 1000000 ? "highlight" : ""}
            >
              <td>{city.name}</td>
              <td>{city.population}</td>
              <td>{city.area}</td>
              <td>{(city.population / city.area).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <TablePagination
          component="div"
          count={totalPages}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </table>
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Add City</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            required
            margin="dense"
            label="City Name"
            type="text"
            fullWidth
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            label="Population"
            type="text"
            fullWidth
            value={newPopulation}
            onChange={(e) => setNewPopulation(e.target.value)}
            variant="standard"
          />
          <TextField
            autoFocus
            required
            margin="dense"
            label="Area"
            type="text"
            fullWidth
            value={newArea}
            onChange={(e) => setNewArea(e.target.value)}
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} type="submit">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};
export default CityTable;
