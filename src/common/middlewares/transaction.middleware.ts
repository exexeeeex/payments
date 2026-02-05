import { NextFunction, Response } from "express";
import { AppDataSource } from "../config";
import { CustomRequest } from "../types/express";

declare global {
	namespace Express {
		interface Request {
			transactionManager?: any;
			queryRunner?: any;
		}
	}
}

export const transactionMiddleware = async (
	req: CustomRequest,
	res: Response,
	next: NextFunction,
) => {
	const queryRunner = AppDataSource.createQueryRunner();

	try {
		await queryRunner.connect();
		await queryRunner.startTransaction("SERIALIZABLE");

		req.queryRunner = queryRunner;
		req.transactionManager = queryRunner.manager;

		const originalJson = res.json;
		const originalSend = res.send;

		res.send = function (body: any) {
			if (res.statusCode >= 200 && res.statusCode < 300) {
				queryRunner
					.commitTransaction()
					.then(() => queryRunner.release())
					.catch((err) => {
						console.error("Ошибка записи транзакции:", err);
						queryRunner.release();
					});
			} else {
				queryRunner
					.rollbackTransaction()
					.then(() => queryRunner.release())
					.catch((err) => {
						console.error("Ошибка отката транзакции:", err);
						queryRunner.release();
					});
			}

			return originalSend.call(this, body);
		};

		res.json = function (body: any) {
			if (res.statusCode >= 200 && res.statusCode < 300) {
				queryRunner
					.commitTransaction()
					.then(() => queryRunner.release())
					.catch((err) => {
						console.error("Ошибка записи транзакции:", err);
						queryRunner.release();
					});
			} else {
				queryRunner
					.rollbackTransaction()
					.then(() => queryRunner.release())
					.catch((err) => {
						console.error("Ошибка отката транзакции:", err);
						queryRunner.release();
					});
			}

			return originalJson.call(this, body);
		};

		next();
	} catch (error) {
		if (queryRunner && !queryRunner.isReleased) {
			await queryRunner.rollbackTransaction();
			await queryRunner.release();
		}
		next(error);
	}
};
export type { Request };
