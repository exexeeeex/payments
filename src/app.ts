import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { AppDataSource } from "./common/config";
import { type Request, type Response } from "express";
import { router } from "./api/routes";
import { transactionMiddleware } from "./common/middlewares/transaction.middleware";

const env = process.env.NODE_ENV || "development";

dotenv.config();
dotenv.config({ path: `.env.${env}` });

class App {
	public app: express.Application;

	constructor() {
		this.app = express();
		this.initializeDatabase();
		this.initializeMiddlewares();
		this.initializqRoutes();
	}

	private async initializeDatabase(): Promise<void> {
		try {
			await AppDataSource.initialize();

			if (process.env.RUN_MIGRATIONS === "true")
				await AppDataSource.runMigrations();
		} catch (error) {
			console.error(error);
			process.exit(1);
		}
	}

	private initializeMiddlewares(): void {
		this.app.use(helmet());
		this.app.use(transactionMiddleware);

		this.app.use(
			cors({
				origin: "*",
				methods: ["GET", "POST", "PUT", "DELETE"],
				allowedHeaders: ["Content-Type", "Authorization", "Webhook-Signature"],
			}),
		);

		const limiter = rateLimit({
			windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000"),
			max: parseInt(process.env.RATE_LIMIT_MAX || "100"),
		});

		this.app.use("/api/", limiter);

		this.app.use(express.json({ limit: "10mb" }));
		this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
	}

	private initializqRoutes(): void {
		this.app.use(router);

		this.app.get("/health", (req: Request, res: Response) => {
			res.json({
				status: "health",
				timestamp: new Date().toString(),
			});
		});
	}

	public start(): void {
		const port = process.env.PORT || "5000";

		this.app.listen(port, () => {
			console.log("Server started");
		});
	}
}

const app = new App();
app.start();
