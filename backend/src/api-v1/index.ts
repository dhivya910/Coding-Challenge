import { Router } from "express";
import cities from "./cities/cities.route";

const router: Router = Router();

router.use("/", cities);

export default router;
